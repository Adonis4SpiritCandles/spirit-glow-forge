# EMAIL TEMPLATES AUDIT — Spirit Candles Transactional Emails

**Document Version:** 1.0  
**Generated:** 2025-11-13  
**Project:** spirit-glow-forge  
**Email Provider:** Resend (resend.com)

---

## Executive Summary

This document audits all **transactional and marketing emails** sent by the Spirit Candles platform. All emails are **bilingual (EN/PL)** with templates rendered server-side in Edge Functions. The platform uses **Resend API** for delivery with HTML email templates.

**Key Metrics:**
- **Total Email Types:** 15 transactional + 1 marketing + 4 newsletter = 20 email types
- **Languages:** English (EN) + Polish (PL)
- **Provider:** Resend (npm:resend@4.0.0 in Deno)
- **From Address:** `Spirit Candles <onboarding@resend.dev>` (TODO: migrate to custom domain)
- **Reply-To:** `m5moffice@proton.me`

**Email Categories:**
1. **Order Emails** (7): Confirmation, preparation, tracking, delivery, cancellation
2. **User Emails** (3): Welcome, referral invites, milestone
3. **Admin Emails** (2): New order, delivery notification
4. **Newsletter** (4): Subscribe confirm, welcome, campaign, unsubscribe
5. **Other** (4): Contact form, custom candle request, cart reminder, password reset

**Localization Strategy:**
- All email templates have bilingual variants (EN/PL)
- User's `preferred_language` field determines email language
- Fallback to English if language not specified
- Subject lines and body content fully translated

---

## Table of Contents

1. [Order Lifecycle Emails](#1-order-lifecycle-emails)
2. [User Account Emails](#2-user-account-emails)
3. [Admin Notification Emails](#3-admin-notification-emails)
4. [Newsletter Emails](#4-newsletter-emails)
5. [Other Emails](#5-other-emails)
6. [Email Template Structure](#6-email-template-structure)
7. [Localization Audit](#7-localization-audit)
8. [Gaps & Recommendations](#8-gaps--recommendations)

---

## 1. Order Lifecycle Emails

### 1.1 Order Confirmation

**Edge Function:** `send-order-confirmation`  
**Trigger:** After successful Stripe payment (via `stripe-webhook`)  
**Recipient:** Customer  
**Language:** User's `preferred_language` (EN/PL)

**Subject:**
- EN: `Order Confirmation SPIRIT-#####`
- PL: `Potwierdzenie zamówienia SPIRIT-#####`

**Content:**
- Order number (`SPIRIT-#####`)
- Order items table (product name, quantity, price)
- Subtotal, shipping cost, discount (if any), total (PLN/EUR)
- Shipping address
- Carrier name
- Message: "We are processing your order and you will receive a shipping notification with tracking number shortly."

**Parameters:**
```typescript
{
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

**HTML Template Features:**
- Responsive design (mobile-friendly)
- Spirit Candles logo header
- Order summary table
- Shipping address box with light background
- Footer with company info

**Localization Points:**
- ✅ Subject line
- ✅ Header text ("Thank You for Your Order!")
- ✅ Table headers (Product, Quantity, Price, Subtotal, Shipping, Discount, Total)
- ✅ Shipping address label
- ✅ Footer text

---

### 1.2 Order Accepted (Admin Manual Action)

**Edge Function:** `send-order-accepted`  
**Trigger:** Admin manually accepts order  
**Recipient:** Customer  
**Language:** User's `preferred_language`

**Subject:**
- EN: `Your order is being prepared`
- PL: `Twoje zamówienie jest przygotowywane`

**Content:**
- Order number
- Message: "Your order has been accepted and is now being prepared for shipping."

**Parameters:**
```typescript
{
  orderId: string;
  orderNumber: number;
  userEmail: string;
  preferredLanguage: 'en' | 'pl';
}
```

---

### 1.3 Order Preparation

**Edge Function:** `send-order-preparation-email`  
**Trigger:** After shipment created (via `create-furgonetka-shipment`)  
**Recipient:** Customer  
**Language:** User's `preferred_language`

**Subject:**
- EN: `Your order is being prepared for shipping`
- PL: `Twoje zamówienie jest przygotowywane do wysyłki`

**Content:**
- Order number
- Message: "We are preparing your order for shipping. You'll receive a tracking number soon."

---

### 1.4 Tracking Available

**Edge Function:** `send-tracking-available`  
**Trigger:** Shipment status changes to 'in_transit' (via `sync-furgonetka-tracking`)  
**Recipient:** Customer  
**Language:** User's `preferred_language`

**Subject:**
- EN: `Track your Spirit Candles package`
- PL: `Śledź swoją paczkę Spirit Candles`

**Content:**
- Order number
- Tracking number
- Carrier name
- Tracking link (if available)

**Parameters:**
```typescript
{
  orderId: string;
  orderNumber: number;
  userEmail: string;
  preferredLanguage: 'en' | 'pl';
  trackingNumber: string;
  carrierName: string;
  trackingUrl?: string;
}
```

**HTML Template Features:**
- Prominent tracking number display
- CTA button: "Track Package"
- Carrier logo (if available)

---

### 1.5 Delivery Confirmation

**Edge Function:** `send-delivery-confirmation`  
**Trigger:** Shipment status = 'delivered' (via `sync-furgonetka-tracking`)  
**Recipient:** Customer  
**Language:** User's `preferred_language`

**Subject:**
- EN: `Your order has been delivered`
- PL: `Twoje zamówienie zostało dostarczone`

**Content:**
- Order number
- Message: "Your order has been successfully delivered."
- CTA: "Leave a review" (link to product review page)

**Parameters:**
```typescript
{
  orderId: string;
  orderNumber: number;
  userEmail: string;
  preferredLanguage: 'en' | 'pl';
  deliveredAt?: string;
}
```

**HTML Template Features:**
- Celebratory design (gold accents)
- CTA button: "Write a Review"

---

### 1.6 Order Cancelled

**Edge Function:** `send-order-cancelled`  
**Trigger:** Admin cancels order  
**Recipient:** Customer  
**Language:** User's `preferred_language`

**Subject:**
- EN: `Your order has been cancelled`
- PL: `Twoje zamówienie zostało anulowane`

**Content:**
- Order number
- Reason for cancellation (if provided)
- Refund info: "Your payment will be refunded within 5-7 business days."

**Parameters:**
```typescript
{
  orderId: string;
  orderNumber: number;
  userEmail: string;
  preferredLanguage: 'en' | 'pl';
  reason?: string;
}
```

---

### 1.7 Order Status Update (Generic)

**Edge Function:** `send-status-update`  
**Trigger:** Custom status change  
**Recipient:** Customer  
**Language:** User's `preferred_language`

**Subject:**
- EN: `Order #{orderNumber} status update`
- PL: `Aktualizacja statusu zamówienia #{orderNumber}`

**Content:**
- Order number
- New status
- Custom message

---

## 2. User Account Emails

### 2.1 Registration Welcome

**Edge Function:** `send-registration-welcome`  
**Trigger:** User completes signup (triggered by auth webhook or manual call)  
**Recipient:** New user  
**Language:** User's `preferred_language` (from signup form)

**Subject:**
- EN: `Welcome to Spirit Candles`
- PL: `Witamy w Spirit Candles`

**Content:**
- Welcome message: "Welcome to Spirit Candles! We're excited to have you join our community."
- Account benefits:
  - Earn loyalty points on every purchase
  - Get exclusive discounts and early access to new products
  - Track your orders easily
- CTA: "Start Shopping"

**Parameters:**
```typescript
{
  userEmail: string;
  userName: string;
  preferredLanguage: 'en' | 'pl';
}
```

**HTML Template Features:**
- Warm, welcoming design
- Benefits list with icons
- CTA button to homepage or shop

---

### 2.2 Referral Invitation

**Edge Function:** `send-referral-emails`  
**Trigger:** User sends referral invites  
**Recipient:** Invited friends (emails provided by user)  
**Language:** User's `preferred_language` (referrer's language)

**Subject:**
- EN: `{userName} invited you to Spirit Candles`
- PL: `{userName} zaprasza Cię do Spirit Candles`

**Content:**
- Personalized message: "{userName} thinks you'll love our luxury soy candles!"
- Referral incentive: "Sign up and get 10% off your first order with code {couponCode}"
- Referral link
- Optional custom message from referrer

**Parameters:**
```typescript
{
  referralCode: string;
  referrerName: string;
  emails: string[];
  message?: string;
  preferredLanguage: 'en' | 'pl';
}
```

**HTML Template Features:**
- Social proof (referrer's name)
- Prominent coupon code display
- CTA button: "Claim Your Discount"

---

### 2.3 Referral Milestone

**Edge Function:** `send-referral-milestone`  
**Trigger:** User reaches referral milestone (3, 5, 10 referrals)  
**Recipient:** Referrer  
**Language:** User's `preferred_language`

**Subject:**
- EN: `You earned referral rewards!`
- PL: `Zdobyłeś nagrody za polecenie!`

**Content:**
- Milestone achieved: "Congratulations! You've referred {count} friends."
- Reward earned: "You earned {reward}!"
  - 3 referrals: Referral Master badge
  - 5 referrals: 500 bonus points
  - 10 referrals: VIP10 coupon (15% off)

**Parameters:**
```typescript
{
  userEmail: string;
  userName: string;
  preferredLanguage: 'en' | 'pl';
  milestone: number;
  rewardType: 'badge' | 'points' | 'coupon';
  rewardValue: string;
}
```

**HTML Template Features:**
- Celebration design (confetti or gold accents)
- Reward card with icon
- CTA: "View Your Rewards"

---

## 3. Admin Notification Emails

### 3.1 New Order Notification

**Edge Function:** `send-admin-order-notification`  
**Trigger:** After successful payment (via `stripe-webhook`)  
**Recipient:** Admin (`m5moffice@proton.me`)  
**Language:** English only

**Subject:** `🎉 New Order: SPIRIT-#{orderNumber}`

**Content:**
- Order number
- Customer email
- Order total (PLN/EUR)
- Link to order details in admin dashboard
- Timestamp

**Parameters:**
```typescript
{
  orderId: string;
  orderNumber: number;
  userEmail: string;
  totalPLN: number;
  totalEUR: number;
}
```

**HTML Template Features:**
- Concise, admin-focused design
- Key info at a glance
- Direct link to admin dashboard

---

### 3.2 Delivery Notification

**Edge Function:** `send-admin-delivered-notification`  
**Trigger:** Shipment status = 'delivered'  
**Recipient:** Admin  
**Language:** English only

**Subject:** `✅ Order Delivered: SPIRIT-#{orderNumber}`

**Content:**
- Order number
- Customer email
- Delivery timestamp
- Link to order details

---

## 4. Newsletter Emails

### 4.1 Newsletter Subscription Confirmation (Double Opt-In)

**Edge Function:** `newsletter-subscribe`  
**Trigger:** User subscribes via newsletter form  
**Recipient:** Subscriber  
**Language:** User's `language` (from subscription form)

**Subject:**
- EN: `Confirm your newsletter subscription 📧`
- PL: `Potwierdź subskrypcję newslettera 📧`

**Content:**
- Welcome message: "Thank you for your interest in our newsletter!"
- Confirmation CTA: "Click the button below to confirm your subscription and receive 10% off your first order."
- Confirmation link (with token)
- Note: "If you didn't request this email, you can safely ignore it."

**Parameters:**
```typescript
{
  email: string;
  name?: string;
  language: 'en' | 'pl';
  confirmUrl: string;
}
```

**HTML Template:**
Inline in `newsletter-subscribe/index.ts` (lines 96-136)

**Localization Points:**
- ✅ Subject line
- ✅ Welcome message
- ✅ Button text ("Confirm Subscription")
- ✅ Footer note

---

### 4.2 Newsletter Welcome (After Confirmation)

**Edge Function:** `send-welcome-newsletter`  
**Trigger:** User confirms subscription (via `newsletter-confirm`)  
**Recipient:** Confirmed subscriber  
**Language:** User's `language`

**Subject:**
- EN: `✨ Welcome to Spirit Candles Newsletter!`
- PL: `✨ Witamy w Newsletterze Spirit Candles!`

**Content:**
- Welcome message
- First-order coupon: "Here's your 10% off code: WELCOME10"
- Featured products
- Social media links

**Parameters:**
```typescript
{
  email: string;
  name?: string;
  language: 'en' | 'pl';
  couponCode: string;
}
```

---

### 4.3 Marketing Campaign

**Edge Function:** `send-campaign-email`  
**Trigger:** Admin sends campaign  
**Recipient:** Customer segment (all, VIP, inactive)  
**Language:** User's `preferred_language`

**Subject:** Dynamic (admin-defined)

**Content:** Dynamic template from `email_templates` table

**Parameters:**
```typescript
{
  campaignId: string;
  segment: string;
  subject_en: string;
  subject_pl: string;
  template: string;
  recipients: string[];
}
```

---

### 4.4 Newsletter Unsubscribe Confirmation

**Edge Function:** `newsletter-unsubscribe`  
**Trigger:** User clicks unsubscribe link  
**Recipient:** Unsubscribed user  
**Language:** User's `language`

**Subject:**
- EN: `You've been unsubscribed`
- PL: `Zostałeś wypisany`

**Content:**
- Confirmation: "You've been unsubscribed from our newsletter."
- Feedback request: "We'd love to know why you unsubscribed." (optional survey link)

---

## 5. Other Emails

### 5.1 Contact Form Notification

**Edge Function:** `contact-form`  
**Trigger:** User submits contact form  
**Recipient:** Admin (`m5moffice@proton.me`)  
**Language:** English only

**Subject:** `📧 New Contact Form Submission`

**Content:**
- Sender name
- Sender email
- Message text
- Timestamp
- Link to contact_messages in admin dashboard

**Parameters:**
```typescript
{
  name: string;
  email: string;
  message: string;
}
```

---

### 5.2 Custom Candle Request

**Edge Function:** `send-custom-request`  
**Trigger:** User submits custom candle request form  
**Recipient:** Admin  
**Language:** English only

**Subject:** `🕯️ New Custom Candle Request`

**Content:**
- Customer name, email, phone
- Custom options (scent, size, color, label text)
- Message

**Parameters:**
```typescript
{
  name: string;
  email: string;
  phone?: string;
  message: string;
  customOptions: object;
}
```

---

### 5.3 Abandoned Cart Reminder

**Edge Function:** `send-cart-reminder`  
**Trigger:** Cron job (checks carts > 24 hours old)  
**Recipient:** Customer with abandoned cart  
**Language:** User's `preferred_language`

**Subject:**
- EN: `You left items in your cart 🛒`
- PL: `Zostawiłeś produkty w koszyku 🛒`

**Content:**
- Message: "We noticed you left some items in your cart. Complete your purchase now!"
- Cart items preview (images + names)
- CTA: "Complete Your Purchase"
- Optional: Limited-time discount incentive

**Parameters:**
```typescript
{
  userEmail: string;
  userName: string;
  preferredLanguage: 'en' | 'pl';
  cartItems: Array<{
    name: string;
    image_url: string;
    price: number;
  }>;
}
```

**Cron Schedule:** Daily (checks at midnight)

---

### 5.4 Password Reset (Future Feature)

**Note:** Not currently implemented, but planned.

**Subject:**
- EN: `Reset your password`
- PL: `Zresetuj hasło`

**Content:**
- Message: "You requested a password reset. Click the link below to create a new password."
- Reset link (with token)
- Expiration: "This link expires in 1 hour."

---

## 6. Email Template Structure

### 6.1 Standard Template Layout

All email templates follow this structure:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* Inline styles for email client compatibility */
    </style>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #ffffff;">
    <!-- Header with Logo -->
    <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px; text-align: center;">
      <img src="https://spirit-candle.com/ImageFiles/spirit-logo-BluOP5mb.png" 
           alt="Spirit Candles" 
           style="max-width: 180px; height: auto;" />
    </div>
    
    <!-- Main Content -->
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <!-- Dynamic content here -->
    </div>

    <!-- Footer -->
    <div style="background: #f5f5f5; padding: 30px 20px; text-align: center; margin-top: 40px;">
      <p style="color: #666; font-size: 14px; margin: 0;">
        Spirit Candles | Grzybowska 2/31, 00-131 Warszawa
      </p>
      <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
        m5moffice@proton.me
      </p>
    </div>
  </body>
</html>
```

### 6.2 Design Tokens

**Colors:**
- Primary (Gold): `#d4af37`
- Background (Black): `#000000`
- Text (Dark): `#333333`
- Text (Light): `#666666`
- Text (Muted): `#999999`
- Background (Light): `#f5f5f5`
- Border: `#e0e0e0`

**Typography:**
- Headings: `font-family: 'Playfair Display', serif; color: #d4af37;`
- Body: `font-family: Arial, sans-serif; color: #333;`
- Font sizes: 28px (h1), 20px (h2), 16px (body), 14px (footer), 12px (legal)

**Buttons:**
- Style: `background: #d4af37; color: #fff; padding: 15px 40px; border-radius: 5px; text-decoration: none; font-weight: bold;`

---

## 7. Localization Audit

### 7.1 Localization Coverage

| Email Type | Subject | Body | Footer | Status |
|------------|---------|------|--------|--------|
| Order Confirmation | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Order Accepted | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Order Preparation | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Tracking Available | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Delivery Confirmation | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Order Cancelled | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Status Update | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Registration Welcome | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Referral Invitation | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Referral Milestone | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Newsletter Confirm | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Newsletter Welcome | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Campaign Email | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Newsletter Unsubscribe | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Cart Reminder | ✅ EN/PL | ✅ EN/PL | ✅ EN/PL | ✅ Complete |
| Admin New Order | ❌ EN only | ❌ EN only | ❌ EN only | ✅ OK (admin) |
| Admin Delivered | ❌ EN only | ❌ EN only | ❌ EN only | ✅ OK (admin) |
| Contact Form | ❌ EN only | ❌ EN only | ❌ EN only | ✅ OK (admin) |
| Custom Request | ❌ EN only | ❌ EN only | ❌ EN only | ✅ OK (admin) |

**Summary:**
- ✅ All customer-facing emails are fully bilingual (EN/PL)
- ✅ Admin emails are English-only (appropriate)
- ✅ 100% localization coverage for user emails

### 7.2 Translation Quality

**Sample Translations:**

| English | Polish | Quality |
|---------|--------|---------|
| "Order Confirmation" | "Potwierdzenie zamówienia" | ✅ Accurate |
| "Thank You for Your Order!" | "Dziękujemy za Twoje zamówienie!" | ✅ Accurate |
| "Track your package" | "Śledź swoją paczkę" | ✅ Accurate |
| "Your order has been delivered" | "Twoje zamówienie zostało dostarczone" | ✅ Accurate |
| "Welcome to Spirit Candles" | "Witamy w Spirit Candles" | ✅ Accurate |
| "Confirm your newsletter subscription" | "Potwierdź subskrypcję newslettera" | ✅ Accurate |

---

## 8. Gaps & Recommendations

### 8.1 Email Delivery Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **From address: `onboarding@resend.dev`** | Medium | Migrate to custom domain (e.g., `hello@spirit-candle.com`) for better deliverability and brand trust |
| **No DMARC/SPF/DKIM verification** | Medium | Set up email authentication (Resend provides DKIM; configure SPF/DMARC in DNS) |
| **No unsubscribe link in marketing emails** | High | Add unsubscribe link to all campaign emails (required by GDPR/CAN-SPAM) |

### 8.2 Template Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **Templates inline in Edge Functions** | Medium | Extract templates to separate files or database (`email_templates` table) for easier management |
| **No template preview/testing tool** | Low | Build admin preview tool to test email templates before sending |
| **No A/B testing** | Low | Implement A/B testing for campaign emails (test subject lines, CTAs) |

### 8.3 Missing Emails

| Email Type | Priority | Use Case |
|------------|----------|----------|
| **Password Reset** | P1 | User forgot password |
| **Email Verification** | P2 | User changes email address |
| **Low Stock Alert (Admin)** | P2 | Admin notified when product stock < 5 |
| **Back-in-Stock Alert (User)** | P2 | User notified when wishlist item back in stock |
| **Price Drop Alert (User)** | P3 | User notified when wishlist item price drops |
| **Birthday Email** | P3 | User receives birthday discount |
| **Inactive User Re-Engagement** | P3 | User hasn't purchased in 6+ months |

### 8.4 Accessibility Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **No alt text on some images** | Medium | Add alt text to all `<img>` tags for screen readers |
| **Low contrast in some text** | Low | Ensure WCAG AA contrast ratio (4.5:1 for body text) |
| **No plain-text fallback** | Low | Provide plain-text version for all HTML emails (Resend supports multipart) |

### 8.5 Analytics Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **No email open tracking** | Medium | Enable Resend email tracking (open rates, click rates) |
| **No click tracking** | Medium | Add UTM parameters to all links in emails for Google Analytics tracking |
| **No bounce/complaint tracking** | High | Monitor bounce rates and spam complaints; implement auto-unsubscribe for hard bounces |

---

## Conclusion

The Spirit Candles email system is **well-implemented, bilingual, and comprehensive**. All customer-facing emails are fully translated (EN/PL) with professional HTML templates. The use of Resend API ensures reliable delivery with modern features (templating, analytics, webhook events).

**Key Strengths:**
- ✅ 100% bilingual coverage for customer emails (EN/PL)
- ✅ Professional HTML templates with brand design
- ✅ Comprehensive email lifecycle (order → delivery → review)
- ✅ Automated triggers (payment, shipment, cron jobs)

**Recommended Next Steps:**
1. **Migrate to custom domain** (`hello@spirit-candle.com`) for better deliverability
2. **Extract templates to database** for easier management by admins
3. **Add unsubscribe links** to all marketing emails (GDPR compliance)
4. **Enable email analytics** (open rates, click rates, bounces)
5. **Implement missing email types** (password reset, back-in-stock alerts)
6. **Add plain-text fallbacks** for accessibility

---

**Document End**

