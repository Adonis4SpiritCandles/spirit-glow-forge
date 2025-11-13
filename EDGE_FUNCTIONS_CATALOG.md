# EDGE FUNCTIONS CATALOG — Spirit Candles Serverless Backend

**Document Version:** 1.0  
**Generated:** 2025-11-13  
**Project:** spirit-glow-forge  
**Runtime:** Deno (Supabase Edge Functions)

---

## Executive Summary

This document catalogs all **36 Edge Functions** running on Supabase's Deno runtime. These serverless functions handle payment processing (Stripe), shipping (Furgonetka), transactional emails (Resend), and various automation tasks. All functions follow CORS-enabled patterns, implement proper error handling, and log activity for debugging.

**Key Metrics:**
- **Total Functions:** 36 Edge Functions
- **Categories:** Payments (2), Shipping (5), Emails (15), Newsletter (4), Referrals (4), Admin (3), Utilities (3)
- **External APIs:** Stripe, Furgonetka, Resend, Google Places, Tenor
- **Authentication:** User (18), Admin (8), Public (6), Internal/Webhook (4)

**Common Patterns:**
1. **CORS Preflight:** All functions handle `OPTIONS` requests
2. **Authentication:** Bearer token verification for user/admin functions
3. **Error Handling:** Try-catch blocks with descriptive error messages
4. **Logging:** Console.log for debugging and audit trail
5. **Input Validation:** Server-side validation (email format, required fields)

---

## Table of Contents

1. [Payments & Checkout](#1-payments--checkout)
2. [Shipping & Furgonetka](#2-shipping--furgonetka)
3. [Transactional Emails](#3-transactional-emails)
4. [Newsletter](#4-newsletter)
5. [Referrals](#5-referrals)
6. [Admin Utilities](#6-admin-utilities)
7. [General Utilities](#7-general-utilities)
8. [Function Call Patterns](#8-function-call-patterns)
9. [Error Handling Standards](#9-error-handling-standards)
10. [Security Considerations](#10-security-considerations)

---

## 1. Payments & Checkout

### 1.1 Function: `create-checkout`

**Purpose:** Creates Stripe checkout session with line items, shipping cost, and optional multi-coupon discount.

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/create-checkout`

**Method:** POST

**Authentication:** Required (Bearer token - authenticated user)

**Request Headers:**
```
Authorization: Bearer <supabase_user_jwt>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateCheckoutRequest {
  cartItems: Array<{
    product: {
      id: string;
      name_en: string;
      name_pl: string;
      description_en: string;
      description_pl: string;
      price_pln: number;
      price_eur: number;
    };
    quantity: number;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    streetNumber?: string;
    apartmentNumber?: string;
    city: string;
    postalCode: string;
    country: string;
    email?: string;
    phone?: string;
  };
  serviceId: number; // Furgonetka service ID
  shippingCost: number; // in PLN
  carrierName: string; // e.g., 'DHL', 'GLS'
  couponCode?: string; // single coupon (deprecated)
  couponCodes?: string[]; // multi-coupon support
}
```

**Response (Success):**
```typescript
{
  url: string; // Stripe checkout URL
}
```

**Response (Error):**
```typescript
{
  error: string;
}
```

**External APIs:**
- Stripe Checkout API

**Business Logic:**
1. Validates user authentication
2. Maps cart items to Stripe line items (uses priceMap or dynamic price creation)
3. Validates coupon codes (multi-coupon support):
   - Checks `active`, `valid_from`, `valid_to`, `max_redemptions`, `per_user_limit`
   - For `referral_only` coupons, checks `profiles.referral_source_id`
4. Calculates discount (percent_off or amount_off_pln) and applies proportionally to products
5. Creates Stripe checkout session with metadata (user_id, shipping_address, service_id, shipping_cost, carrier_name, coupon_code, discount_amount)
6. Returns Stripe checkout URL

**Frontend Call-Sites:**
- `src/pages/Checkout.tsx` — "Pay with Stripe" button

---

### 1.2 Function: `stripe-webhook`

**Purpose:** Handles Stripe `checkout.session.completed` webhook; creates order, sends emails, clears cart.

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/stripe-webhook`

**Method:** POST

**Authentication:** Webhook signature verification (Stripe-Signature header)

**Request Headers:**
```
Stripe-Signature: t=...,v1=...
Content-Type: application/json
```

**Request Body:** Stripe event payload (JSON)

**Response:**
```typescript
{ received: true }
```

**External APIs:**
- Stripe API (list line items)
- Supabase Edge Functions (`send-order-confirmation`, `send-admin-order-notification`)

**Business Logic:**
1. Verifies Stripe webhook signature
2. Extracts metadata from checkout session (user_id, shipping_address, service_id, shipping_cost, carrier_name, coupon_code, discount)
3. Fetches user's cart items from DB
4. Creates order in `orders` table (status: 'paid', shipping_status: 'pending')
5. Creates `order_items` records
6. Records `coupon_redemptions` (if coupon used) and increments `coupons.redemptions_count`
7. Decrements `products.stock_quantity` for purchased products
8. Sends order confirmation email to customer
9. Sends admin notification email
10. Clears user's `cart_items`

**Webhook URL:** Configured in Stripe dashboard

**Idempotency:** Stripe event IDs prevent duplicate processing

---

## 2. Shipping & Furgonetka

### 2.1 Function: `calculate-shipping-price`

**Purpose:** Fetches shipping rates from Furgonetka for given receiver address and parcels.

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/calculate-shipping-price`

**Method:** POST

**Authentication:** Public (no auth required, rate-limiting recommended)

**Request Body:**
```typescript
interface CalculateShippingRequest {
  receiver: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string; // ISO-2 code or full name (e.g., 'Poland', 'PL')
    email?: string;
    phone?: string;
  };
  parcels: Array<{
    weight: number; // in kg
    length: number; // in cm
    width: number; // in cm
    height: number; // in cm
  }>;
}
```

**Response (Success):**
```typescript
{
  services: Array<{
    service_id: number;
    carrier_name: string;
    service_name: string;
    price_netto: number; // in PLN
    price_brutto: number; // in PLN (with VAT)
    delivery_time: string; // e.g., '1-2 days'
  }>;
}
```

**Response (Error):**
```typescript
{
  error: string;
  preValidationErrors?: Array<{
    path: string;
    message: string;
    code: string;
  }>;
}
```

**External APIs:**
- Furgonetka `/packages/validate` (soft validation)
- Furgonetka `/account/services` (fetch available services)
- Furgonetka `/services/pricing` (calculate prices)

**Business Logic:**
1. Validates input (receiver address, parcels)
2. Fetches Furgonetka OAuth token via `get-furgonetka-token` function
3. Normalizes country code (e.g., 'Poland' → 'PL')
4. Normalizes postcode for PL (NN-NNN format)
5. Validates package (soft validation, logs errors but continues)
6. Fetches active account services (DHL, GLS, DPD, etc.)
7. Calculates pricing for each service
8. Returns array of services with prices

**Frontend Call-Sites:**
- `src/pages/Checkout.tsx` — `ShippingOptions` component

---

### 2.2 Function: `create-furgonetka-shipment`

**Purpose:** Creates Furgonetka shipment (package + label) and updates order with tracking info.

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/create-furgonetka-shipment`

**Method:** POST

**Authentication:** Required (Bearer token - Admin only)

**Request Body:**
```typescript
interface CreateShipmentRequest {
  orderId: string; // UUID
  dimensions?: {
    width: number;
    height: number;
    length: number;
  };
  weight?: number; // in kg
}
```

**Response (Success):**
```typescript
{
  success: true;
  packageId: string;
  trackingNumber: string;
  labelUrl: string; // PDF label URL
}
```

**Response (Error):**
```typescript
{
  ok: false;
  source: 'validation' | 'create';
  error: string;
  errors: Array<{
    message: string;
  }>;
}
```

**External APIs:**
- Furgonetka `/packages/validate`
- Furgonetka `/packages` (create shipment)
- Supabase Edge Function (`sync-furgonetka-tracking`, `send-order-preparation-email`)

**Business Logic:**
1. Verifies admin authentication
2. Fetches order from DB (with service_id, shipping_address)
3. Validates input (weight, dimensions) with defaults if not provided
4. Fetches Furgonetka OAuth token
5. Normalizes shipping address (country code, postcode, city, phone)
6. Validates phone number for PL (9 digits without country code)
7. **Validates** package with Furgonetka API (returns errors if validation fails)
8. **Creates** shipment with Furgonetka API
9. Updates order with `furgonetka_package_id`, `tracking_number`, `carrier`, `shipping_status='created'`, `shipping_label_url`
10. Calls `sync-furgonetka-tracking` immediately (don't wait for cron)
11. Sends order preparation email to customer

**Frontend Call-Sites:**
- `src/components/AdminOrderDetailsModal.tsx` — "Create Shipment" button

---

### 2.3 Function: `sync-furgonetka-tracking`

**Purpose:** Syncs tracking status from Furgonetka for a specific order (or all active orders if called by cron).

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/sync-furgonetka-tracking`

**Method:** POST

**Authentication:** Optional (Bearer token for manual sync, cron for auto-sync)

**Request Body:**
```typescript
interface SyncTrackingRequest {
  orderId?: string; // If provided, sync specific order; otherwise sync all active
}
```

**Response:**
```typescript
{
  success: true;
  updated: number; // Number of orders updated
}
```

**External APIs:**
- Furgonetka `/packages/{package_id}` (fetch tracking status)

**Business Logic:**
1. Fetches Furgonetka OAuth token
2. Queries orders with `furgonetka_package_id IS NOT NULL` and `shipping_status NOT IN ('delivered', 'cancelled')`
3. For each order, fetches package status from Furgonetka
4. Updates `orders.shipping_status` based on Furgonetka status
5. If status changed to 'in_transit', sends `send-tracking-available` email
6. If status changed to 'delivered', sends `send-delivery-confirmation` email

**Cron Schedule:** Every hour (Supabase cron or external scheduler)

---

### 2.4 Function: `auto-sync-tracking`

**Purpose:** Cron job wrapper for `sync-furgonetka-tracking` (syncs all active orders automatically).

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/auto-sync-tracking`

**Method:** POST

**Authentication:** Cron (no auth)

**Request Body:** None

**Response:**
```typescript
{ success: true }
```

**Cron Schedule:** Every 1 hour

---

### 2.5 Function: `furgonetka-webhook`

**Purpose:** Receives tracking status updates from Furgonetka webhook (push notifications).

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/furgonetka-webhook`

**Method:** POST

**Authentication:** Webhook signature (TODO: verify signature if Furgonetka API supports)

**Request Body:** Furgonetka webhook payload (JSON)

**Response:**
```typescript
{ received: true }
```

**Business Logic:**
1. Extracts `package_id` and `status` from webhook payload
2. Finds order by `furgonetka_package_id`
3. Updates `orders.shipping_status`
4. Sends status update emails if needed

---

### 2.6 Function: `get-furgonetka-token`

**Purpose:** Internal function to fetch Furgonetka OAuth token (cached for 1 hour).

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/get-furgonetka-token`

**Method:** GET

**Authentication:** Internal only (called by other Edge Functions)

**Response:**
```typescript
{
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}
```

**External APIs:**
- Furgonetka OAuth `/auth/token` (client_credentials grant)

**Caching:** Token cached in memory with expiration check

---

## 3. Transactional Emails

All email functions use **Resend** API and support **bilingual templates (EN/PL)**.

### 3.1 Function: `send-order-confirmation`

**Purpose:** Sends order confirmation email to customer (after payment).

**Authentication:** Internal (called by `stripe-webhook`)

**Request Body:**
```typescript
interface OrderConfirmationRequest {
  orderId: string;
  orderNumber: number;
  userEmail: string;
  preferredLanguage: 'en' | 'pl';
  orderItems: Array<{
    product_name_en: string;
    product_name_pl: string;
    quantity: number;
    price_pln: number;
    price_eur: number;
  }>;
  subtotalPLN: number;
  subtotalEUR: number;
  shippingCostPLN: number;
  shippingCostEUR: number;
  discountPLN?: number;
  discountEUR?: number;
  couponCode?: string;
  totalPLN: number;
  totalEUR: number;
  carrierName?: string;
  shippingAddress?: object;
}
```

**Email Content:**
- Order number (`SPIRIT-#####`)
- Order items table
- Subtotal, shipping cost, discount, total
- Shipping address
- Carrier name

**From:** `Spirit Candles <onboarding@resend.dev>` (TODO: use custom domain)

**Subject (EN):** `Order Confirmation SPIRIT-#####`  
**Subject (PL):** `Potwierdzenie zamówienia SPIRIT-#####`

---

### 3.2 Function: `send-order-accepted`

**Purpose:** Sends "order accepted" email when admin manually accepts order.

**Authentication:** Internal

**Email Content:**
- Order number
- Message: "Your order is being prepared"

---

### 3.3 Function: `send-order-preparation-email`

**Purpose:** Sends "order is being prepared" email (after shipment created).

**Authentication:** Internal (called by `create-furgonetka-shipment`)

**Email Content:**
- Order number
- Message: "Your order is being prepared for shipping"

---

### 3.4 Function: `send-tracking-available`

**Purpose:** Sends tracking number email when shipment status changes to 'in_transit'.

**Authentication:** Internal (called by `sync-furgonetka-tracking`)

**Request Body:**
```typescript
{
  orderId: string;
  orderNumber: number;
  userEmail: string;
  preferredLanguage: 'en' | 'pl';
  trackingNumber: string;
  carrierName: string;
}
```

**Email Content:**
- Order number
- Tracking number
- Carrier name
- Link to carrier tracking page (if available)

---

### 3.5 Function: `send-delivery-confirmation`

**Purpose:** Sends delivery confirmation email when shipment status = 'delivered'.

**Authentication:** Internal (called by `sync-furgonetka-tracking`)

**Email Content:**
- Order number
- Message: "Your order has been delivered"
- CTA: "Leave a review"

---

### 3.6 Function: `send-order-cancelled`

**Purpose:** Sends order cancellation email.

**Authentication:** Internal

**Email Content:**
- Order number
- Reason for cancellation
- Refund info

---

### 3.7 Function: `send-status-update`

**Purpose:** Generic order status update email (for custom status changes).

**Authentication:** Internal

---

### 3.8 Function: `send-admin-order-notification`

**Purpose:** Sends new order notification to admin email.

**Authentication:** Internal (called by `stripe-webhook`)

**Request Body:**
```typescript
{
  orderId: string;
  orderNumber: number;
  userEmail: string;
  totalPLN: number;
  totalEUR: number;
}
```

**Email Content:**
- New order alert
- Order number
- Customer email
- Order total

**To:** `m5moffice@proton.me` (admin email)

---

### 3.9 Function: `send-admin-delivered-notification`

**Purpose:** Sends delivery notification to admin.

**Authentication:** Internal

---

### 3.10 Function: `send-registration-welcome`

**Purpose:** Sends welcome email after user signup.

**Authentication:** Internal (triggered by auth webhook or manual call)

**Request Body:**
```typescript
{
  userEmail: string;
  userName: string;
  preferredLanguage: 'en' | 'pl';
}
```

**Email Content:**
- Welcome message
- Account benefits
- CTA: "Start Shopping"

---

### 3.11 Function: `send-referral-emails`

**Purpose:** Sends referral invitation emails.

**Authentication:** Required (Bearer token - user)

**Request Body:**
```typescript
{
  referralCode: string;
  emails: string[];
  message?: string;
  preferredLanguage: 'en' | 'pl';
}
```

**Email Content:**
- Personalized invitation
- Referral link
- Incentive (e.g., "Get 10% off your first order")

---

### 3.12 Function: `send-referral-milestone`

**Purpose:** Sends referral milestone email (e.g., "You've referred 5 friends!").

**Authentication:** Internal

**Email Content:**
- Milestone achieved
- Reward earned (points, badge, coupon)

---

### 3.13 Function: `send-campaign-email`

**Purpose:** Sends marketing campaign emails to customer segments.

**Authentication:** Required (Bearer token - Admin)

**Request Body:**
```typescript
{
  campaignId: string;
  segment: string; // 'all', 'vip', 'inactive'
  subject_en: string;
  subject_pl: string;
  template: string;
}
```

**Email Content:** Dynamic template from `email_templates`

---

### 3.14 Function: `send-cart-reminder`

**Purpose:** Sends abandoned cart reminder email (cron job).

**Authentication:** Cron

**Email Content:**
- "You left items in your cart"
- Cart items preview
- CTA: "Complete your purchase"

**Cron Schedule:** Daily (checks for carts > 24 hours old)

---

### 3.15 Function: `send-custom-request`

**Purpose:** Sends custom candle request email to admin.

**Authentication:** Public

**Request Body:**
```typescript
{
  name: string;
  email: string;
  phone?: string;
  message: string;
  customOptions: object;
}
```

**Email Content:** Custom candle request details

**To:** `m5moffice@proton.me`

---

## 4. Newsletter

### 4.1 Function: `newsletter-subscribe`

**Purpose:** Subscribes email to newsletter (double opt-in).

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/newsletter-subscribe`

**Method:** POST

**Authentication:** Public

**Request Body:**
```typescript
{
  email: string;
  name?: string;
  language?: 'en' | 'pl';
  source?: 'footer' | 'signup' | 'contact' | 'admin';
  consent: boolean;
  consent_text?: string;
  ip?: string;
  ua?: string;
}
```

**Response (Success):**
```typescript
{
  success: true;
  message: 'Check your email to confirm your subscription!'
}
```

**Business Logic:**
1. Validates email format, consent, language, source
2. Sanitizes input (trim, lowercase, remove HTML)
3. Generates double opt-in token (UUID)
4. Inserts/updates `newsletter_subscribers` (status: 'pending')
5. Sends confirmation email via Resend with confirmation link
6. Returns success message

**Email Content:**
- Confirmation link (includes token)
- Incentive: "Confirm and get 10% off your first order"

**Frontend Call-Sites:**
- `src/components/homepage/NewsletterSignup.tsx`
- `src/components/Footer.tsx`

---

### 4.2 Function: `newsletter-confirm`

**Purpose:** Confirms newsletter subscription (double opt-in).

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/newsletter-confirm?token=<token>`

**Method:** GET

**Authentication:** Public (token in query string)

**Response:** Redirects to homepage with success message

**Business Logic:**
1. Validates token
2. Updates `newsletter_subscribers` (status: 'confirmed', confirmed: true)
3. Sends welcome email via `send-welcome-newsletter`

---

### 4.3 Function: `newsletter-unsubscribe`

**Purpose:** Unsubscribes email from newsletter.

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/newsletter-unsubscribe?email=<email>`

**Method:** GET

**Authentication:** Public

**Response:** Confirmation message

**Business Logic:**
1. Updates `newsletter_subscribers` (status: 'unsubscribed')

---

### 4.4 Function: `send-welcome-newsletter`

**Purpose:** Sends welcome email to confirmed newsletter subscriber.

**Authentication:** Internal (called by `newsletter-confirm`)

**Email Content:**
- Welcome message
- First-order coupon code (e.g., 'WELCOME10')
- Featured products

---

## 5. Referrals

### 5.1 Function: `generate-referral-code`

**Purpose:** Generates unique referral code for user.

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/generate-referral-code`

**Method:** POST

**Authentication:** Required (Bearer token - user)

**Request Body:** None

**Response:**
```typescript
{
  code: string; // e.g., 'XYZ123AB' (8 alphanumeric chars)
  existed: boolean; // true if code already existed
}
```

**Business Logic:**
1. Checks if user already has `referral_short_code`
2. Generates unique 8-character code (alphanumeric, no ambiguous chars)
3. Updates `profiles.referral_short_code`
4. Returns code

**Frontend Call-Sites:**
- `src/components/gamification/ReferralDashboard.tsx`
- `src/pages/LoyaltyProgram.tsx`

---

### 5.2 Function: `confirm-referral`

**Purpose:** Confirms referral when referred user signs up (awards points/coupon).

**Authentication:** Internal (triggered on user signup)

**Request Body:**
```typescript
{
  refereeId: string; // New user ID
  referralCode: string; // Referral code used
}
```

**Business Logic:**
1. Finds referrer by `referral_short_code`
2. Updates `profiles.referral_source_id` for referee
3. Creates `referrals` record (status: 'completed')
4. Awards points to referrer
5. Creates REFERRAL10 coupon for referee (via `create-referral10-coupon`)
6. Sends referral success email to referrer

---

### 5.3 Function: `create-referral10-coupon`

**Purpose:** Creates unique REFERRAL10 coupon for new referred user.

**Authentication:** Internal

**Request Body:**
```typescript
{
  userId: string;
}
```

**Business Logic:**
1. Creates coupon code (e.g., 'REFERRAL10-ABC123')
2. Inserts into `coupons` table (percent_off: 10, referral_only: true, per_user_limit: 1)

---

### 5.4 Function: `process-referral-rewards`

**Purpose:** Processes milestone referral rewards (cron job).

**Authentication:** Cron

**Business Logic:**
1. Queries users with referral counts matching `referral_rewards.referrals_count`
2. Awards badges, points, or coupons based on milestone
3. Sends referral milestone email

**Cron Schedule:** Daily

---

## 6. Admin Utilities

### 6.1 Function: `admin-reset-orders`

**Purpose:** Resets demo/test orders (dev environment only).

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/admin-reset-orders`

**Method:** POST

**Authentication:** Required (Bearer token - Admin)

**Request Body:** None

**Response:**
```typescript
{ success: true, deleted: number }
```

**Business Logic:**
1. Verifies admin role
2. Deletes all orders (CASCADE deletes order_items, coupon_redemptions)
3. Resets product stock quantities
4. Returns count of deleted orders

**⚠️ WARNING:** Only use in development/staging environments

---

### 6.2 Function: `generate-sitemap`

**Purpose:** Generates XML sitemap for SEO (cron job).

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/generate-sitemap`

**Method:** GET

**Authentication:** Public

**Response:** XML sitemap

**Business Logic:**
1. Queries all public routes (pages, products, collections)
2. Generates XML sitemap with lastmod, priority, changefreq
3. Stores sitemap in Supabase Storage (optional)

**Cron Schedule:** Daily

**Frontend Call-Sites:**
- Served at `/sitemap.xml`

---

### 6.3 Function: `places-autocomplete`

**Purpose:** Autocompletes addresses using Google Places API.

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/places-autocomplete?input=<query>`

**Method:** GET

**Authentication:** Public (rate-limiting recommended)

**Response:**
```typescript
{
  predictions: Array<{
    description: string;
    place_id: string;
  }>;
}
```

**External APIs:**
- Google Places API

**Frontend Call-Sites:**
- `src/components/ShippingAddressForm.tsx` — Address autocomplete input

---

## 7. General Utilities

### 7.1 Function: `contact-form`

**Purpose:** Handles contact form submissions.

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/contact-form`

**Method:** POST

**Authentication:** Public

**Request Body:**
```typescript
{
  name: string;
  email: string;
  message: string;
}
```

**Response:**
```typescript
{ success: true }
```

**Business Logic:**
1. Validates input (name, email, message required)
2. Inserts into `contact_messages` table (status: 'new')
3. Sends notification email to admin

---

### 7.2 Function: `get-tenor-key`

**Purpose:** Returns Tenor GIF API key for frontend.

**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/get-tenor-key`

**Method:** GET

**Authentication:** Required (Bearer token - user)

**Response:**
```typescript
{
  apiKey: string;
}
```

**Frontend Call-Sites:**
- `src/components/profile/GifPicker.tsx`

---

## 8. Function Call Patterns

### 8.1 Frontend → Edge Function

**Example:** Calling `create-checkout` from frontend

```typescript
// src/pages/Checkout.tsx
const { data, error } = await supabase.functions.invoke('create-checkout', {
  body: {
    cartItems: cart.items,
    shippingAddress: formData,
    serviceId: selectedService.service_id,
    shippingCost: selectedService.price_brutto,
    carrierName: selectedService.carrier_name,
    couponCodes: appliedCoupons.map(c => c.code),
  },
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});

if (error) {
  toast({ title: 'Error', description: error.message, variant: 'destructive' });
  return;
}

// Redirect to Stripe checkout
window.location.href = data.url;
```

### 8.2 Edge Function → Edge Function

**Example:** `stripe-webhook` calling `send-order-confirmation`

```typescript
// supabase/functions/stripe-webhook/index.ts
await supabaseClient.functions.invoke('send-order-confirmation', {
  body: {
    orderId: order.id,
    orderNumber: order.order_number,
    userEmail: userProfile?.email,
    preferredLanguage: userProfile?.preferred_language || 'en',
    orderItems: orderItemsWithNames,
    subtotalPLN: totalPLN,
    // ...
  }
});
```

### 8.3 Webhook → Edge Function

**Example:** Stripe webhook calling `stripe-webhook`

```bash
# Stripe sends POST request to:
https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/stripe-webhook

# With headers:
Stripe-Signature: t=...,v1=...
Content-Type: application/json

# And body:
{
  "type": "checkout.session.completed",
  "data": { ... }
}
```

### 8.4 Cron Job → Edge Function

**Example:** Hourly cron calling `auto-sync-tracking`

```bash
# Supabase cron config (pg_cron extension):
SELECT cron.schedule(
  'auto-sync-tracking',
  '0 * * * *', -- Every hour
  $$ SELECT net.http_post(
    url:='https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/auto-sync-tracking',
    headers:='{"Content-Type": "application/json"}'::jsonb,
    body:='{}'::jsonb
  ) $$
);
```

---

## 9. Error Handling Standards

### 9.1 Standard Error Response Format

All Edge Functions return consistent error format:

```typescript
{
  error: string; // Human-readable error message
  details?: any; // Optional detailed error info (dev only)
}
```

**HTTP Status Codes:**
- `200` — Success
- `400` — Bad Request (validation error)
- `401` — Unauthorized (missing/invalid auth)
- `403` — Forbidden (insufficient permissions)
- `404` — Not Found (resource doesn't exist)
- `500` — Internal Server Error (unexpected error)

### 9.2 Error Logging

All errors are logged to console with context:

```typescript
console.error('[Function Name] Error:', error);
```

### 9.3 User-Facing Error Messages

Errors are translated to user-friendly messages on frontend:

```typescript
// src/pages/Checkout.tsx
if (error) {
  let message = error.message;
  if (error.message.includes('No user_id')) {
    message = t('checkoutError_notAuthenticated');
  } else if (error.message.includes('coupon')) {
    message = t('checkoutError_invalidCoupon');
  }
  toast({ title: t('error'), description: message, variant: 'destructive' });
}
```

---

## 10. Security Considerations

### 10.1 Authentication Patterns

**User Authentication:**
```typescript
const authHeader = req.headers.get('Authorization');
const token = authHeader.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(token);
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}
```

**Admin Authorization:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('user_id', user.id)
  .single();

if (profile?.role !== 'admin') {
  return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
}
```

**Webhook Signature Verification (Stripe):**
```typescript
const signature = req.headers.get('stripe-signature');
const body = await req.text();
const event = await stripe.webhooks.constructEventAsync(
  body,
  signature,
  webhookSecret
);
```

### 10.2 Input Validation

All user input must be validated:

```typescript
// Email validation
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
if (!emailRegex.test(email)) {
  throw new Error('Invalid email format');
}

// Length validation
if (name && name.length > 100) {
  throw new Error('Name must be less than 100 characters');
}

// Enum validation
if (!['en', 'pl'].includes(language)) {
  throw new Error('Invalid language. Must be "en" or "pl"');
}

// Sanitization
const sanitizedEmail = email.trim().toLowerCase();
const sanitizedName = name?.trim().replace(/<[^>]*>/g, '') || null;
```

### 10.3 Rate Limiting

**⚠️ WARNING:** No rate limiting currently implemented on public Edge Functions.

**Recommendation:** Implement rate limiting using:
- Supabase Edge Functions rate limit headers (if available)
- Cloudflare rate limiting (if using Cloudflare)
- Application-level rate limiting (e.g., Redis-based)

**Priority Functions for Rate Limiting:**
- `newsletter-subscribe`
- `contact-form`
- `calculate-shipping-price`
- `places-autocomplete`

### 10.4 Secrets Management

All secrets stored as Supabase project secrets (not in code):

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `FURGONETKA_CLIENT_ID`
- `FURGONETKA_CLIENT_SECRET`
- `GOOGLE_PLACES_API_KEY`
- `TENOR_API_KEY`

**Access secrets in Edge Functions:**
```typescript
const apiKey = Deno.env.get('RESEND_API_KEY');
```

---

## 11. Testing Recommendations

### 11.1 Unit Tests (Deno Test)

Create tests for each Edge Function:

```typescript
// supabase/functions/create-checkout/index.test.ts
import { assertEquals } from 'https://deno.land/std@0.190.0/testing/asserts.ts';

Deno.test('create-checkout: validates input', async () => {
  const req = new Request('http://localhost:54321/functions/v1/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartItems: [] }), // Invalid: empty cart
  });

  const res = await handler(req);
  assertEquals(res.status, 400);
});
```

### 11.2 Integration Tests

Test end-to-end flows:

1. **Checkout flow:** Create checkout → Stripe payment → Webhook → Order created → Emails sent
2. **Shipment flow:** Create shipment → Sync tracking → Email sent
3. **Referral flow:** Generate code → Refer friend → Signup → Coupon created → Emails sent

### 11.3 Manual Testing Checklist

- [ ] Test each Edge Function with valid input
- [ ] Test with invalid input (expect 400 errors)
- [ ] Test without authentication (expect 401 errors)
- [ ] Test with non-admin user on admin functions (expect 403 errors)
- [ ] Verify emails sent in correct language (EN/PL)
- [ ] Verify webhook signatures validated
- [ ] Check logs for errors

---

## Conclusion

The Spirit Candles Edge Functions provide a **robust, secure, and scalable serverless backend** for the e-commerce platform. All functions follow consistent patterns (CORS, auth, error handling, logging) and integrate seamlessly with Stripe, Furgonetka, and Resend.

**Key Strengths:**
- ✅ Comprehensive coverage (payments, shipping, emails, newsletters, referrals)
- ✅ Bilingual support (EN/PL) across all email templates
- ✅ Proper authentication and authorization checks
- ✅ Input validation and sanitization
- ✅ Descriptive error messages

**Recommended Next Steps:**
1. Implement rate limiting on public functions
2. Add unit tests for all functions (Deno test framework)
3. Verify Furgonetka webhook signature
4. Set up monitoring/alerting for function errors (Sentry or similar)
5. Migrate email sending to custom domain (instead of `onboarding@resend.dev`)

---

**Document End**

