# House of Venus - Backend & Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Database Architecture](#database-architecture)
3. [Supabase Edge Functions](#supabase-edge-functions)
4. [Stripe Integration](#stripe-integration)
5. [Furgonetka Shipping Integration](#furgonetka-shipping-integration)
6. [Email System](#email-system)
7. [Authentication & Authorization](#authentication--authorization)
8. [Secrets Configuration](#secrets-configuration)
9. [CRON Jobs](#cron-jobs)
10. [API Endpoints Reference](#api-endpoints-reference)

---

## 1. Overview

House of Venus is a luxury e-commerce platform combining fashion with astrology. The backend handles:
- Product catalog management with zodiac sign associations
- User authentication and profile management (including Venus sign calculations)
- Order processing via Stripe
- Automated shipping via Furgonetka API
- Email notifications via Resend
- Venus calculator and astrological matching system

### Technology Stack
- **Database**: PostgreSQL (via Supabase)
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Payment**: Stripe Checkout + Webhooks
- **Shipping**: Furgonetka API (Polish courier aggregator)
- **Email**: Resend API
- **Auth**: Supabase Auth (JWT-based)

---

## 2. Database Architecture

### 2.1 Core Tables

#### `profiles`
User profile data, extends Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,
  venus_sign TEXT, -- User's Venus sign from calculator
  sun_sign TEXT,
  rising_sign TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_place TEXT,
  birth_coordinates JSONB, -- {lat, lng} from calculator
  role TEXT DEFAULT 'user', -- 'user' | 'admin'
  preferred_language TEXT DEFAULT 'en', -- 'en' | 'pl'
  profile_image_url TEXT,
  cover_image_url TEXT,
  public_profile BOOLEAN DEFAULT true,
  referral_code TEXT UNIQUE, -- For referral program
  referral_source_id UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Columns:**
- `venus_sign`: Calculated by Venus calculator, determines product recommendations
- `referral_code`: Auto-generated 8-character code for user referrals
- `referral_source_id`: Tracks who referred this user

**Triggers:**
- `handle_new_user()`: Auto-creates profile when new user signs up
- `update_updated_at_column()`: Updates `updated_at` on any change
- `auto_generate_referral_code()`: Generates unique referral code on insert

**RLS Policies:**
- Users can SELECT/UPDATE their own profile
- Admins can SELECT/UPDATE all profiles
- Profile visibility controlled by `public_profile` flag

---

#### `products`
Main product catalog for fashion items.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_pl TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_pl TEXT NOT NULL,
  short_description_en TEXT,
  short_description_pl TEXT,
  
  -- Categorization
  category TEXT NOT NULL, -- 'clothing' | 'accessories' | 'shoes' | 'jewelry'
  subcategory TEXT, -- 'dresses' | 'tops' | 'bags' | 'earrings' etc.
  style_keywords_en TEXT[], -- ['vintage', 'romantic', 'edgy']
  style_keywords_pl TEXT[],
  
  -- Pricing
  price_pln NUMERIC(10,2) NOT NULL,
  price_eur NUMERIC(10,2) NOT NULL,
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  
  -- Shipping
  weight_kg NUMERIC(5,2) DEFAULT 0.3, -- Actual product weight
  packaging_category TEXT DEFAULT 'standard', -- 'standard' | 'shoes' | 'large' | 'small'
  
  -- Zodiac Associations
  venus_signs TEXT[], -- Recommended Venus signs ['aries', 'leo', 'sagittarius']
  sun_signs TEXT[], -- Compatible sun signs
  rising_signs TEXT[], -- Compatible rising signs
  elemental_affinity TEXT, -- 'fire' | 'earth' | 'air' | 'water'
  
  -- Media
  main_image_url TEXT,
  gallery_images TEXT[], -- Additional product images
  video_url TEXT, -- Optional product video
  
  -- Product Details (Fashion-specific)
  fabric_details_en TEXT, -- "100% Silk, Italian Import"
  fabric_details_pl TEXT,
  care_instructions_en TEXT, -- "Dry clean only"
  care_instructions_pl TEXT,
  model_info_en TEXT, -- "Model wears size S, height 175cm"
  model_info_pl TEXT,
  available_sizes TEXT[], -- ['XS', 'S', 'M', 'L', 'XL']
  available_colors TEXT[], -- ['Black', 'Ivory', 'Copper']
  
  -- SEO & Marketing
  featured_on_homepage BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- **Zodiac Matching**: Products tagged with compatible Venus/sun/rising signs
- **Packaging Categories**: Determines default parcel dimensions for shipping
  - `standard`: 30x20x10cm (clothing, accessories)
  - `shoes`: 35x25x15cm
  - `large`: 50x40x20cm (coats, dresses)
  - `small`: 20x15x10cm (jewelry, small accessories)
- **Weight Override**: `weight_kg` overrides category defaults if specified
- **Multilingual**: All text fields have `_en` and `_pl` versions

**RLS Policies:**
- Anyone can SELECT active products (`is_active = true`)
- Admins can manage all products (INSERT/UPDATE/DELETE)

---

#### `collections`
Product collections (e.g., "Fire Signs Collection", "Autumn Lookbook").

```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_pl TEXT NOT NULL,
  description_en TEXT,
  description_pl TEXT,
  
  -- Visual
  image_url TEXT, -- Collection hero image
  gradient_classes TEXT, -- Tailwind classes for collection card
  icon_name TEXT, -- Lucide icon name
  
  -- Associations
  venus_signs TEXT[], -- Collections can be sign-specific
  featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Junction Table: `product_collections`**

```sql
CREATE TABLE product_collections (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, collection_id)
);
```

---

#### `orders`
Order records created by Stripe webhook after successful payment.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- Sequential: 'HOV-A000-0001'
  
  -- User
  user_id UUID REFERENCES profiles(user_id), -- NULL for guest checkout
  email TEXT NOT NULL,
  
  -- Status Management
  status TEXT DEFAULT 'pending', -- 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status TEXT DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
  shipping_status TEXT, -- 'pending' | 'awaiting_shipping' | 'shipped' | 'in_transit' | 'delivered'
  has_issue BOOLEAN DEFAULT false, -- Flag for problematic orders
  
  -- Pricing (all in PLN and EUR for dual currency support)
  total_amount_pln NUMERIC(10,2) NOT NULL,
  total_amount_eur NUMERIC(10,2) NOT NULL,
  subtotal_pln NUMERIC(10,2) NOT NULL,
  shipping_cost_pln NUMERIC(10,2) DEFAULT 0,
  discount_amount_pln NUMERIC(10,2) DEFAULT 0,
  coupon_codes TEXT[], -- Applied coupon codes
  currency TEXT DEFAULT 'PLN', -- Primary currency used
  
  -- Stripe Integration
  stripe_checkout_session_id TEXT UNIQUE, -- For idempotency
  stripe_payment_intent_id TEXT,
  
  -- Shipping Address (JSONB for flexibility)
  shipping_address JSONB, -- {name, email, phone, street, streetNumber, apartmentNumber, city, postalCode, country}
  
  -- Furgonetka Integration
  shipping_service_id TEXT, -- Furgonetka service ID selected at checkout
  carrier_name TEXT, -- 'InPost' | 'DPD' | 'DHL' etc.
  parcel_weight NUMERIC(5,2), -- Saved from checkout
  parcel_dimensions JSONB, -- {length, width, height} saved from checkout
  furgonetka_package_id TEXT, -- Furgonetka's tracking ID
  tracking_number TEXT,
  tracking_url TEXT,
  shipping_label_url TEXT, -- PDF label for printing
  
  -- Delivery Tracking
  estimated_delivery_date DATE,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  tracking_email_sent BOOLEAN DEFAULT false,
  delivered_email_sent BOOLEAN DEFAULT false,
  
  -- Admin Notes
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Order Number Format:**
- Pattern: `HOV-LNNN-NNNN` (e.g., `HOV-A000-0001`)
- `L` = Letter block (A-Z)
- `NNN-NNNN` = Sequential number (000-0001 to 999-9999)
- Generated by `generate_order_number()` trigger

**Critical Fields:**
- `stripe_checkout_session_id`: Ensures webhook idempotency (no duplicate orders)
- `parcel_weight` & `parcel_dimensions`: Preserved from checkout for accurate Furgonetka shipment
- `has_issue`: Quick filter for problematic orders in admin dashboard

**Status Workflow:**
1. **Payment**: `pending` → `paid` (via Stripe webhook)
2. **Order**: `pending` → `processing` (admin confirms) → `shipped` → `delivered`
3. **Shipping**: `pending` → `awaiting_shipping` (label created) → `shipped` → `in_transit` → `delivered`

**RLS Policies:**
- Users can SELECT their own orders (`user_id = auth.uid()` OR `email = user.email`)
- Admins can manage all orders

---

#### `order_items`
Line items for each order.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  
  -- Product Snapshot (preserves product state at order time)
  product_snapshot JSONB NOT NULL, -- {name_en, name_pl, price_pln, price_eur, image_url, size, color}
  
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_pln NUMERIC(10,2) NOT NULL,
  unit_price_eur NUMERIC(10,2) NOT NULL,
  total_price_pln NUMERIC(10,2) NOT NULL,
  total_price_eur NUMERIC(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why Product Snapshot?**
- Products can be edited/deleted after order
- Snapshot preserves exact product details at purchase time
- Includes selected size/color variants

---

#### `coupons`
Discount coupon codes.

```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- 'WELCOME10', 'VENUS20'
  
  -- Discount Type (either percent_off OR amount_off, not both)
  percent_off NUMERIC(5,2), -- 10.00 = 10% off
  amount_off_pln NUMERIC(10,2),
  amount_off_eur NUMERIC(10,2),
  
  -- Restrictions
  active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  max_redemptions INTEGER, -- Total usage limit
  per_user_limit INTEGER DEFAULT 1, -- Per-user usage limit
  current_redemptions INTEGER DEFAULT 0, -- Current usage count
  referral_only BOOLEAN DEFAULT false, -- Only for referred users
  
  -- Descriptions
  description_en TEXT,
  description_pl TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Coupon Validation Logic:**
1. Check if `active = true`
2. Check if current date is between `valid_from` and `valid_to`
3. Check if `current_redemptions < max_redemptions`
4. Check user's redemption count < `per_user_limit`
5. If `referral_only = true`, check user has `referral_source_id`

**Discount Application:**
- Discounts apply ONLY to product subtotal, NOT shipping
- Applied proportionally across all cart items in Stripe session

---

#### `coupon_redemptions`
Tracks coupon usage per user.

```sql
CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id),
  user_id UUID REFERENCES profiles(user_id),
  order_id UUID REFERENCES orders(id),
  
  amount_saved_pln NUMERIC(10,2),
  amount_saved_eur NUMERIC(10,2),
  
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### `cart_items`
Persistent cart storage for logged-in users.

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  selected_size TEXT, -- Optional variant
  selected_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policy:**
- Users can only manage their own cart items (`user_id = auth.uid()`)

---

#### `wishlist_items`
User wishlist functionality.

```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

---

#### `reviews`
Product reviews with star ratings.

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(user_id),
  order_id UUID REFERENCES orders(id), -- Verified purchase
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  
  -- Admin moderation
  is_approved BOOLEAN DEFAULT true,
  moderation_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Verified Purchase:**
- `verified_purchase = true` if `order_id` is provided
- Only users who purchased product can leave review

---

#### `newsletter_subscribers`
Newsletter subscription list with Venus sign segmentation.

```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  venus_sign TEXT, -- Optional for targeted campaigns
  language TEXT DEFAULT 'en',
  is_subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  confirmation_token TEXT UNIQUE, -- For double opt-in
  confirmed_at TIMESTAMPTZ
);
```

---

#### `notifications`
In-app notification system.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'order' | 'tracking' | 'referral' | 'message' | 'general'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  actor_id UUID REFERENCES profiles(user_id), -- Who triggered notification
  reference_id TEXT, -- Order ID, Product ID, etc.
  metadata JSONB, -- Additional context
  action_url TEXT, -- Link to relevant page
  
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### `referrals`
Referral program tracking.

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(user_id), -- User who shared code
  referee_id UUID REFERENCES profiles(user_id), -- New user who used code
  
  status TEXT DEFAULT 'pending', -- 'pending' | 'completed' | 'cancelled'
  reward_points INTEGER DEFAULT 0,
  
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Reward Logic:**
- Referee must complete first order for referral to be `completed`
- Referrer receives loyalty points (e.g., 200 points)
- Both users may receive discount coupon

---

#### `loyalty_points`
Loyalty program point balance.

```sql
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(user_id),
  points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze', -- 'bronze' | 'silver' | 'gold' | 'platinum'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Point Earning:**
- Order completion: 10 points per 1 PLN spent
- Review submission: 50 points
- Referral completion: 200 points
- Birthday bonus: 500 points

**Tier Thresholds:**
- Bronze: 0-999 lifetime points
- Silver: 1000-4999 points
- Gold: 5000-9999 points
- Platinum: 10000+ points

---

### 2.2 Configuration Tables

#### `site_settings`
Key-value store for site-wide settings.

```sql
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Common Keys:**
- `shipping_free_threshold_pln`: Free shipping above this amount (e.g., 200)
- `shipping_flat_rate_pln`: Flat rate shipping cost (e.g., 15.99)
- `sender_email`: From address for transactional emails
- `support_email`: Customer support contact
- `maintenance_mode`: Enable/disable site maintenance
- `featured_collection_id`: ID of collection to feature on homepage

---

#### `general_settings`
Single-row table for global UI settings.

```sql
CREATE TABLE general_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_mode BOOLEAN DEFAULT false,
  enable_registration BOOLEAN DEFAULT true,
  enable_notifications BOOLEAN DEFAULT true,
  enable_admin_notifications BOOLEAN DEFAULT true,
  newsletter_enabled BOOLEAN DEFAULT true,
  show_floating_plus BOOLEAN DEFAULT true, -- Floating action button
  show_live_chat BOOLEAN DEFAULT true, -- Live chat widget
  gradient_overlay_intensity INTEGER DEFAULT 20, -- 0-100
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(user_id)
);
```

---

#### `header_settings`
Header/navigation configuration.

```sql
CREATE TABLE header_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Logo Configuration
  logo_url TEXT DEFAULT '/logo.png',
  logo_height TEXT DEFAULT 'h-12',
  logo_transparent_bg BOOLEAN DEFAULT true,
  logo_animation JSONB, -- {enabled, speed, hover_scale, glow_intensity}
  
  -- Mobile/Tablet Overrides
  mobile_logo_url TEXT,
  mobile_logo_height TEXT,
  tablet_logo_url TEXT,
  tablet_logo_height TEXT,
  
  -- Navigation Items
  navigation_items JSONB, -- [{url, label_en, label_pl, order, is_active}]
  
  -- UI Toggles
  show_search BOOLEAN DEFAULT true,
  show_cart BOOLEAN DEFAULT true,
  show_wishlist BOOLEAN DEFAULT true,
  show_language_toggle BOOLEAN DEFAULT true,
  sticky_header BOOLEAN DEFAULT true,
  transparent_on_scroll BOOLEAN DEFAULT false,
  
  -- Icon Configurations
  desktop_config JSONB, -- {show_admin_icon, show_notification_bell, icon_sizes}
  mobile_config JSONB,
  tablet_config JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(user_id)
);
```

---

#### `footer_contact_info`
Footer contact information.

```sql
CREATE TABLE footer_contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_legal_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  nip TEXT NOT NULL, -- Polish tax ID
  regon TEXT NOT NULL, -- Polish business registry number
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  languages TEXT NOT NULL,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(user_id)
);
```

---

#### `furgonetka_tokens`
Stores OAuth tokens for Furgonetka API.

```sql
CREATE TABLE furgonetka_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Token Lifecycle:**
- Tokens expire after 3600 seconds (1 hour)
- `get-furgonetka-token` function checks `expires_at` and refreshes if needed
- Only one token row should exist at a time

---

### 2.3 Database Functions & Triggers

#### `generate_order_number()`
Generates sequential order numbers in format `HOV-LNNN-NNNN`.

```sql
CREATE SEQUENCE order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_num INTEGER;
  letter_block CHAR(1);
  numeric_part TEXT;
BEGIN
  IF NEW.order_number IS NULL THEN
    seq_num := nextval('order_number_seq');
    
    -- Calculate letter block (A-Z based on sequence / 10000)
    letter_block := CHR(65 + ((seq_num - 1) / 10000));
    
    -- Format numeric part with leading zeros
    numeric_part := LPAD(((seq_num - 1) % 10000)::TEXT, 7, '0');
    numeric_part := SUBSTRING(numeric_part FROM 1 FOR 3) || '-' || SUBSTRING(numeric_part FROM 4);
    
    NEW.order_number := 'HOV-' || letter_block || numeric_part;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();
```

**Example Sequence:**
- 1 → `HOV-A000-0001`
- 9999 → `HOV-A999-9999`
- 10000 → `HOV-B000-0000`
- 19999 → `HOV-B999-9999`

---

#### `handle_new_user()`
Auto-creates profile when user signs up.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  referral_source_id_value UUID := NULL;
BEGIN
  -- Extract referral_source_id from signup metadata
  IF NEW.raw_user_meta_data ? 'referral_source_id' THEN
    referral_source_id_value := (NEW.raw_user_meta_data->>'referral_source_id')::UUID;
  END IF;

  INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    username,
    preferred_language,
    referral_source_id
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    referral_source_id_value
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
```

---

#### `auto_generate_referral_code()`
Generates unique 8-character referral code.

```sql
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- No similar chars (0,O,I,1)
  code TEXT := '';
  i INTEGER;
  is_unique BOOLEAN := false;
  attempts INTEGER := 0;
BEGIN
  WHILE NOT is_unique AND attempts < 20 LOOP
    code := '';
    FOR i IN 1..8 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    
    SELECT NOT EXISTS (
      SELECT 1 FROM profiles WHERE referral_code = code
    ) INTO is_unique;
    
    attempts := attempts + 1;
  END LOOP;
  
  IF NOT is_unique THEN
    code := code || substr(md5(now()::TEXT || random()::TEXT), 1, 4);
  END IF;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := generate_unique_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION auto_generate_referral_code();
```

---

#### `update_updated_at_column()`
Generic trigger to auto-update `updated_at` timestamps.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that need auto-update
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ... repeat for other tables
```

---

## 3. Supabase Edge Functions

All edge functions are deployed to Supabase and run on Deno runtime. They are located in `/supabase/functions/` directory.

### 3.1 Authentication Flow

#### User Registration
1. Frontend calls `supabase.auth.signUp({ email, password, options: { data: { first_name, last_name, referral_code } } })`
2. Supabase Auth creates user in `auth.users`
3. `handle_new_user()` trigger creates profile in `profiles` table
4. If `referral_code` provided, creates entry in `referrals` table

#### Login
1. Frontend calls `supabase.auth.signInWithPassword({ email, password })`
2. Returns JWT token
3. Frontend stores token in localStorage
4. All subsequent API calls include token in `Authorization: Bearer <token>` header

---

## 4. Stripe Integration

### 4.1 Payment Flow Overview

```
User Cart → Checkout Page → create-checkout function → Stripe Checkout Session
                                                              ↓
                                            User completes payment
                                                              ↓
                                            Stripe webhook fires
                                                              ↓
                              stripe-webhook function → Creates Order + Order Items
                                                              ↓
                                            Sends confirmation email
```

---

### 4.2 `create-checkout` Edge Function

**Path:** `/supabase/functions/create-checkout/index.ts`  
**Auth:** Public (`verify_jwt = false`)  
**Method:** `POST`

#### Request Body
```typescript
{
  cartItems: Array<{
    product: Product;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }>;
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    street: string;
    streetNumber: string;
    apartmentNumber?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  shippingServiceId: string; // Furgonetka service ID
  shippingCost: number; // In PLN (decimal)
  carrierName: string; // 'InPost', 'DPD', etc.
  couponCodes?: string[]; // Array of coupon codes
  parcelWeight: number; // In kg
  parcelDimensions: {
    length: number; // In cm
    width: number;
    height: number;
  };
}
```

#### Logic Flow

1. **Validate Cart Items**
   - Fetch products from database
   - Verify stock availability
   - Calculate subtotal

2. **Calculate Shipping & Discounts**
   ```typescript
   const subtotalPLN = cartItems.reduce((sum, item) => 
     sum + (item.product.price_pln * item.quantity), 0
   );
   
   let discountPLN = 0;
   if (couponCodes && couponCodes.length > 0) {
     // Validate coupons via validate-coupon logic
     discountPLN = calculateCouponDiscount(couponCodes, subtotalPLN);
   }
   
   const totalPLN = subtotalPLN + shippingCost - discountPLN;
   ```

3. **Save to `checkout_sessions` Table**
   ```typescript
   const { data: session } = await supabase
     .from('checkout_sessions')
     .insert({
       user_id: user?.id,
       user_email: user?.email || shippingAddress.email,
       cart_items: cartItems.map(item => ({
         product_id: item.product.id,
         product_snapshot: {
           name_en: item.product.name_en,
           name_pl: item.product.name_pl,
           price_pln: item.product.price_pln,
           price_eur: item.product.price_eur,
           image_url: item.product.main_image_url,
           size: item.selectedSize,
           color: item.selectedColor
         },
         quantity: item.quantity
       })),
       shipping_address: shippingAddress,
       shipping_service_id: shippingServiceId,
       shipping_cost_pln: shippingCost,
       carrier_name: carrierName,
       coupon_codes: couponCodes,
       parcel_weight: parcelWeight,
       parcel_dimensions: parcelDimensions,
       subtotal_pln: subtotalPLN,
       discount_pln: discountPLN,
       total_pln: totalPLN
     })
     .select()
     .single();
   ```

4. **Create Stripe Line Items**
   ```typescript
   const lineItems = cartItems.map(item => {
     const unitPriceGrosze = Math.round(item.product.price_pln * 100);
     
     // Apply proportional discount if coupons exist
     const discountFactor = discountPLN > 0 
       ? (subtotalPLN - discountPLN) / subtotalPLN 
       : 1;
     
     const discountedPriceGrosze = Math.max(
       1, 
       Math.round(unitPriceGrosze * discountFactor)
     );
     
     return {
       price_data: {
         currency: 'pln',
         product_data: {
           name: item.product.name_en,
           description: item.selectedSize 
             ? `Size: ${item.selectedSize}` 
             : undefined,
           images: [item.product.main_image_url]
         },
         unit_amount: discountedPriceGrosze
       },
       quantity: item.quantity
     };
   });
   
   // Add shipping as separate line item (NO discount applied)
   if (shippingCost > 0) {
     lineItems.push({
       price_data: {
         currency: 'pln',
         product_data: {
           name: 'Shipping',
           description: carrierName
         },
         unit_amount: Math.round(shippingCost * 100)
       },
       quantity: 1
     });
   }
   ```

5. **Create Stripe Checkout Session**
   ```typescript
   const stripeSession = await stripe.checkout.sessions.create({
     customer_email: user?.email || shippingAddress.email,
     line_items: lineItems,
     mode: 'payment',
     success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
     cancel_url: `${origin}/checkout`,
     metadata: {
       checkout_session_id: session.id,
       user_id: user?.id || '',
       user_email: user?.email || shippingAddress.email
     },
     payment_intent_data: {
       metadata: {
         checkout_session_id: session.id
       }
     }
   });
   ```

6. **Return Checkout URL**
   ```typescript
   return new Response(
     JSON.stringify({ url: stripeSession.url }),
     { headers: corsHeaders, status: 200 }
   );
   ```

#### Important Notes

- **Currency:** All amounts in database are in PLN (decimal numbers)
- **Stripe Currency:** Stripe requires grosze (PLN * 100)
- **Coupon Discount:** Applied proportionally to PRODUCT line items only
- **Shipping:** NEVER discounted, always full price
- **Idempotency:** `checkout_session_id` saved in Stripe metadata ensures webhook idempotency

---

### 4.3 `stripe-webhook` Edge Function

**Path:** `/supabase/functions/stripe-webhook/index.ts`  
**Auth:** Public (validates Stripe signature)  
**Method:** `POST`

#### Webhook Configuration

**Stripe Dashboard Setup:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select event: `checkout.session.completed`
4. Copy signing secret → Save as `STRIPE_WEBHOOK_SECRET` in Supabase

#### Logic Flow

1. **Validate Stripe Signature**
   ```typescript
   const signature = req.headers.get('stripe-signature');
   if (!signature) throw new Error('Missing stripe-signature header');
   
   const event = stripe.webhooks.constructEvent(
     await req.text(),
     signature,
     STRIPE_WEBHOOK_SECRET
   );
   
   if (event.type !== 'checkout.session.completed') {
     return new Response(JSON.stringify({ received: true }), { status: 200 });
   }
   ```

2. **Extract Checkout Session Data**
   ```typescript
   const stripeSession = event.data.object as Stripe.Checkout.Session;
   const checkoutSessionId = stripeSession.metadata?.checkout_session_id;
   
   if (!checkoutSessionId) {
     console.error('Missing checkout_session_id in metadata');
     return new Response(
       JSON.stringify({ received: true, error: 'Missing session ID' }),
       { status: 200 }
     );
   }
   ```

3. **Idempotency Check**
   ```typescript
   const { data: existingOrder } = await supabase
     .from('orders')
     .select('id')
     .eq('stripe_checkout_session_id', stripeSession.id)
     .single();
   
   if (existingOrder) {
     console.log('Order already exists, skipping creation');
     return new Response(
       JSON.stringify({ received: true }),
       { status: 200 }
     );
   }
   ```

4. **Fetch Checkout Session Data**
   ```typescript
   const { data: checkoutData } = await supabase
     .from('checkout_sessions')
     .select('*')
     .eq('id', checkoutSessionId)
     .single();
   
   if (!checkoutData) {
     throw new Error('Checkout session not found');
   }
   ```

5. **Calculate Order Totals**
   ```typescript
   // Helper function to extract price from cart item
   function getItemPricePLN(item: any): number {
     const price = item.price_pln ?? item.product_snapshot?.price_pln ?? 0;
     return Number(price) || 0;
   }
   
   const subtotalPLN = checkoutData.cart_items.reduce((sum, item) => {
     return sum + (getItemPricePLN(item) * item.quantity);
   }, 0);
   
   const shippingCostPLN = Number(checkoutData.shipping_cost_pln) || 0;
   const discountPLN = Number(checkoutData.discount_pln) || 0;
   const totalPLN = subtotalPLN + shippingCostPLN - discountPLN;
   
   // Validate totals
   if (!Number.isFinite(totalPLN) || totalPLN <= 0) {
     console.error('Invalid totalPLN:', totalPLN);
     return new Response(
       JSON.stringify({ received: true, error: 'Invalid cart totals' }),
       { status: 200 }
     );
   }
   ```

6. **Generate Order Number**
   ```typescript
   // Order number generated by database trigger
   // Format: HOV-A000-0001
   ```

7. **Create Order**
   ```typescript
   const { data: order, error: orderError } = await supabase
     .from('orders')
     .insert({
       user_id: checkoutData.user_id,
       email: checkoutData.user_email,
       status: 'pending', // Awaiting admin confirmation
       payment_status: 'paid',
       shipping_status: 'pending',
       
       total_amount_pln: totalPLN,
       total_amount_eur: totalPLN / 4.3, // Approximate conversion
       subtotal_pln: subtotalPLN,
       shipping_cost_pln: shippingCostPLN,
       discount_amount_pln: discountPLN,
       coupon_codes: checkoutData.coupon_codes,
       currency: 'PLN',
       
       stripe_checkout_session_id: stripeSession.id,
       stripe_payment_intent_id: stripeSession.payment_intent,
       
       shipping_address: checkoutData.shipping_address,
       shipping_service_id: checkoutData.shipping_service_id,
       carrier_name: checkoutData.carrier_name,
       parcel_weight: checkoutData.parcel_weight,
       parcel_dimensions: checkoutData.parcel_dimensions
     })
     .select()
     .single();
   ```

8. **Create Order Items**
   ```typescript
   const orderItems = checkoutData.cart_items.map(item => ({
     order_id: order.id,
     product_id: item.product_id,
     product_snapshot: item.product_snapshot,
     quantity: item.quantity,
     unit_price_pln: getItemPricePLN(item),
     unit_price_eur: getItemPricePLN(item) / 4.3,
     total_price_pln: getItemPricePLN(item) * item.quantity,
     total_price_eur: (getItemPricePLN(item) * item.quantity) / 4.3
   }));
   
   await supabase.from('order_items').insert(orderItems);
   ```

9. **Save Shipping Address**
   ```typescript
   await supabase.from('shipping_addresses').insert({
     order_id: order.id,
     ...checkoutData.shipping_address
   });
   ```

10. **Process Coupon Redemptions**
    ```typescript
    if (checkoutData.coupon_codes && checkoutData.coupon_codes.length > 0) {
      for (const code of checkoutData.coupon_codes) {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('id')
          .eq('code', code.toUpperCase())
          .single();
        
        if (coupon) {
          await supabase.from('coupon_redemptions').insert({
            coupon_id: coupon.id,
            user_id: checkoutData.user_id,
            order_id: order.id,
            amount_saved_pln: discountPLN,
            amount_saved_eur: discountPLN / 4.3
          });
          
          await supabase
            .from('coupons')
            .update({ current_redemptions: supabase.sql`current_redemptions + 1` })
            .eq('id', coupon.id);
        }
      }
    }
    ```

11. **Update Product Stock**
    ```typescript
    for (const item of checkoutData.cart_items) {
      await supabase
        .from('products')
        .update({ 
          stock_quantity: supabase.sql`stock_quantity - ${item.quantity}` 
        })
        .eq('id', item.product_id);
    }
    ```

12. **Send Order Confirmation Email**
    ```typescript
    await supabase.functions.invoke('send-order-confirmation', {
      body: {
        orderId: order.id,
        orderNumber: order.order_number,
        userEmail: order.email,
        preferredLanguage: checkoutData.user_language || 'en'
      }
    });
    ```

13. **Create Referral Reward (if applicable)**
    ```typescript
    if (checkoutData.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_source_id')
        .eq('user_id', checkoutData.user_id)
        .single();
      
      if (profile?.referral_source_id) {
        // Check if this is first order
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', checkoutData.user_id)
          .eq('payment_status', 'paid');
        
        if (count === 1) {
          // Complete referral
          await supabase.functions.invoke('confirm-referral', {
            body: {
              referrerId: profile.referral_source_id,
              refereeId: checkoutData.user_id
            }
          });
        }
      }
    }
    ```

#### Response
```typescript
return new Response(
  JSON.stringify({ received: true }),
  { headers: corsHeaders, status: 200 }
);
```

---

## 5. Furgonetka Shipping Integration

Furgonetka is a Polish courier aggregator that provides access to multiple shipping providers (InPost, DPD, DHL, UPS, etc.) through a single API.

### 5.1 Authentication

#### OAuth 2.0 Flow
Furgonetka uses OAuth 2.0 with password grant type.

**Credentials Required:**
- `FURGONETKA_CLIENT_ID`
- `FURGONETKA_CLIENT_SECRET`
- `FURGONETKA_EMAIL`
- `FURGONETKA_PASSWORD`
- `FURGONETKA_API_URL` (e.g., `https://api-pl.furgonetka.pl`)

---

### 5.2 `get-furgonetka-token` Edge Function

**Path:** `/supabase/functions/get-furgonetka-token/index.ts`  
**Auth:** Public  
**Method:** `POST`

#### Logic Flow

1. **Check Existing Token**
   ```typescript
   const { data: existingToken } = await supabase
     .from('furgonetka_tokens')
     .select('*')
     .order('created_at', { ascending: false })
     .limit(1)
     .single();
   
   const tokenStillValid = existingToken &&
     existingToken.refresh_token &&
     new Date(existingToken.expires_at) > new Date();
   
   if (tokenStillValid) {
     return new Response(
       JSON.stringify({ access_token: existingToken.access_token }),
       { headers: corsHeaders }
     );
   }
   ```

2. **Request New Token**
   ```typescript
   const basic = btoa(`${clientId}:${clientSecret}`);
   const url = `${apiBaseUrl}/oauth/token`;
   
   const body = new URLSearchParams({
     grant_type: 'password',
     scope: 'api',
     username: email,
     password: password
   });
   
   const tokenResponse = await fetch(url, {
     method: 'POST',
     headers: {
       'Authorization': `Basic ${basic}`,
       'Content-Type': 'application/x-www-form-urlencoded'
     },
     body
   });
   
   if (!tokenResponse.ok) {
     const errorText = await tokenResponse.text();
     throw new Error(`Furgonetka auth failed: ${tokenResponse.status} ${errorText}`);
   }
   
   const tokenData = await tokenResponse.json();
   ```

3. **Save Token to Database**
   ```typescript
   const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
   
   // Delete old tokens
   await supabase
     .from('furgonetka_tokens')
     .delete()
     .neq('id', '00000000-0000-0000-0000-000000000000');
   
   // Insert new token
   await supabase.from('furgonetka_tokens').insert({
     access_token: tokenData.access_token,
     refresh_token: tokenData.refresh_token ?? '',
     expires_at: expiresAt.toISOString()
   });
   
   return new Response(
     JSON.stringify({ access_token: tokenData.access_token }),
     { headers: corsHeaders }
   );
   ```

---

### 5.3 `calculate-shipping-price` Edge Function

**Path:** `/supabase/functions/calculate-shipping-price/index.ts`  
**Auth:** Public  
**Method:** `POST`

#### Request Body
```typescript
{
  parcel: {
    weight: 1.2, // in kg
    dimensions: {
      length: 30, // in cm
      width: 20,
      height: 10
    }
  },
  receiver: {
    name: "John Doe",
    phone: "123456789",
    email: "john@example.com",
    address: {
      street: "Main St",
      streetNumber: "10",
      apartmentNumber: "5",
      city: "Warsaw",
      postalCode: "00-001",
      country: "PL"
    }
  }
}
```

#### Logic Flow

1. **Get Furgonetka Token**
   ```typescript
   const { data: tokenData } = await supabase.functions.invoke('get-furgonetka-token');
   const accessToken = tokenData.access_token;
   ```

2. **Normalize Receiver Address**
   ```typescript
   // Convert country to ISO-2 code
   const countryCode = receiver.address.country.length === 2
     ? receiver.address.country.toUpperCase()
     : convertCountryNameToCode(receiver.address.country);
   
   // Format Polish postal code to NN-NNN
   let normalizedPostcode = receiver.address.postalCode;
   if (countryCode === 'PL') {
     const digits = normalizedPostcode.replace(/\D/g, '');
     if (digits.length === 5) {
       normalizedPostcode = `${digits.slice(0, 2)}-${digits.slice(2)}`;
     }
   }
   
   // Normalize city name
   let normalizedCity = receiver.address.city.trim();
   if (countryCode === 'PL' && /^warsaw$/i.test(normalizedCity)) {
     normalizedCity = 'Warszawa';
   }
   
   // Normalize phone number (9 digits for PL)
   let normalizedPhone = receiver.phone.replace(/\D/g, '');
   if (countryCode === 'PL') {
     if (normalizedPhone.startsWith('48')) {
       normalizedPhone = normalizedPhone.slice(-9);
     } else if (normalizedPhone.length !== 9) {
       normalizedPhone = normalizedPhone.slice(-9);
     }
   }
   
   // Validate PL phone
   if (countryCode === 'PL' && normalizedPhone.length !== 9) {
     throw new Error('Invalid phone number for PL. Must be exactly 9 digits.');
   }
   ```

3. **Prepare API Request**
   ```typescript
   const sender = {
     name: "House of Venus",
     street: "Example Street 10",
     city: "Warsaw",
     postcode: "00-001",
     country_code: "PL",
     email: "orders@houseofvenus.com",
     phone: "123456789"
   };
   
   const receiverNormalized = {
     name: receiver.name,
     street: `${receiver.address.street} ${receiver.address.streetNumber}`,
     city: normalizedCity,
     postcode: normalizedPostcode,
     country_code: countryCode,
     email: receiver.email,
     phone: normalizedPhone
   };
   
   const payload = {
     pickup: sender,
     sender: sender,
     receiver: receiverNormalized,
     parcels: [{
       weight: parcel.weight,
       length: parcel.dimensions.length,
       width: parcel.dimensions.width,
       height: parcel.dimensions.height,
       depth: parcel.dimensions.length, // Furgonetka requires depth field
       description: 'Fashion item' // Max 20 characters
     }]
   };
   ```

4. **Call Furgonetka API**
   ```typescript
   const response = await fetch(`${apiBaseUrl}/calculate-price`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json',
       'Accept': 'application/vnd.furgonetka.v1+json',
       'X-Language': 'en_GB'
     },
     body: JSON.stringify(payload)
   });
   
   if (!response.ok) {
     const errorText = await response.text();
     throw new Error(`Furgonetka calculate-price failed: ${response.status} ${errorText}`);
   }
   
   const result = await response.json();
   ```

5. **Transform Response**
   ```typescript
   const services = result.services || result || [];
   
   const transformedServices = services.map(service => ({
     serviceId: service.id || service.service_id,
     name: service.service || service.name,
     carrier: service.carrier,
     price: parseFloat(service.price || service.gross_price || 0),
     currency: 'PLN',
     estimatedDeliveryDays: service.delivery_time || 2
   }));
   
   return new Response(
     JSON.stringify({ services: transformedServices }),
     { headers: corsHeaders }
   );
   ```

---

### 5.4 `create-furgonetka-shipment` Edge Function

**Path:** `/supabase/functions/create-furgonetka-shipment/index.ts`  
**Auth:** Admin only  
**Method:** `POST`

#### Request Body
```typescript
{
  orderId: "uuid-of-order",
  dimensions?: { // Optional manual override
    width: 30,
    height: 20,
    length: 10
  },
  weight?: 1.5 // Optional manual override in kg
}
```

#### Logic Flow

1. **Admin Verification**
   ```typescript
   const authHeader = req.headers.get('Authorization');
   const token = authHeader.replace('Bearer ', '');
   const { data: { user } } = await supabase.auth.getUser(token);
   
   const { data: profile } = await supabase
     .from('profiles')
     .select('role')
     .eq('user_id', user.id)
     .single();
   
   if (profile?.role !== 'admin') {
     throw new Error('Admin access required');
   }
   ```

2. **Fetch Order Details**
   ```typescript
   const { data: order } = await supabase
     .from('orders')
     .select('*')
     .eq('id', orderId)
     .single();
   
   if (!order) throw new Error('Order not found');
   
   const { data: orderUserProfile } = await supabase
     .from('profiles')
     .select('email, first_name, last_name')
     .eq('user_id', order.user_id)
     .single();
   ```

3. **Use Saved Parcel Data or Override**
   ```typescript
   const weight = Math.max(0.1, Number(overrideWeight ?? order.parcel_weight ?? 1));
   const dimensions = {
     width: Number(overrideDimensions?.width ?? order.parcel_dimensions?.width ?? 10),
     height: Number(overrideDimensions?.height ?? order.parcel_dimensions?.height ?? 10),
     length: Number(overrideDimensions?.length ?? order.parcel_dimensions?.length ?? 10)
   };
   ```

4. **Get Furgonetka Token**
   ```typescript
   const { data: tokenData } = await supabase.functions.invoke('get-furgonetka-token');
   const accessToken = tokenData.access_token;
   ```

5. **Prepare Sender & Receiver**
   ```typescript
   const sender = {
     name: "House of Venus",
     street: "Example Street 10",
     city: "Warsaw",
     postcode: "00-001",
     country_code: "PL",
     email: "orders@houseofvenus.com",
     phone: "123456789"
   };
   
   const shippingAddress = order.shipping_address || {};
   
   // Apply same normalization as calculate-shipping-price
   const receiver = {
     name: shippingAddress.name || 'Customer',
     street: `${shippingAddress.street} ${shippingAddress.streetNumber}`,
     city: normalizeCity(shippingAddress.city || ''),
     postcode: normalizedPostcode,
     country_code: countryCode,
     email: shippingAddress.email || orderUserProfile?.email || '',
     phone: normalizedPhone
   };
   ```

6. **Verify Service ID**
   ```typescript
   let validServiceId = order.shipping_service_id;
   
   // Check if service_id is still valid
   const servicesResponse = await fetch(`${apiBaseUrl}/account/services`, {
     method: 'GET',
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Accept': 'application/vnd.furgonetka.v1+json',
       'X-Language': 'en_GB'
     }
   });
   
   if (servicesResponse.ok) {
     const servicesData = await servicesResponse.json();
     const availableServices = servicesData.services || servicesData || [];
     
     const serviceExists = availableServices.some(s =>
       (s.id || s.service_id) === validServiceId
     );
     
     if (!serviceExists && availableServices.length > 0) {
       console.warn(`Service ${validServiceId} not found. Using fallback.`);
       
       // Try to find service from same carrier
       let fallbackService = availableServices.find(s => {
         const serviceName = (s.service || s.name || '').toLowerCase();
         const carrierLower = (order.carrier_name || '').toLowerCase();
         return serviceName.includes(carrierLower);
       });
       
       if (!fallbackService) {
         fallbackService = availableServices[0];
       }
       
       validServiceId = fallbackService.id || fallbackService.service_id;
       
       // Update order with new service_id
       await supabase
         .from('orders')
         .update({ shipping_service_id: validServiceId })
         .eq('id', orderId);
     }
   }
   ```

7. **Validate Package**
   ```typescript
   const packagePayload = {
     pickup: sender,
     sender: sender,
     receiver: receiver,
     parcels: [{
       weight: weight,
       length: dimensions.length,
       width: dimensions.width,
       height: dimensions.height,
       depth: dimensions.length,
       description: 'Fashion item'.slice(0, 20) // Max 20 chars
     }],
     type: 'package'
   };
   
   const validateResp = await fetch(`${apiBaseUrl}/packages/validate`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json',
       'Accept': 'application/vnd.furgonetka.v1+json',
       'X-Language': 'en_GB'
     },
     body: JSON.stringify({
       service_id: validServiceId,
       ...packagePayload // Flatten payload at top level
     })
   });
   
   const validateJson = await validateResp.json();
   
   if (!validateResp.ok || (validateJson.errors && validateJson.errors.length)) {
     console.error('Package validation failed:', validateJson);
     return new Response(
       JSON.stringify({
         ok: false,
         source: 'validation',
         error: 'Package validation failed',
         errors: validateJson.errors || []
       }),
       { status: 200, headers: corsHeaders }
     );
   }
   ```

8. **Create Package**
   ```typescript
   const createBody = {
     service_id: validServiceId,
     pickup: packagePayload.pickup,
     sender: packagePayload.sender,
     receiver: packagePayload.receiver,
     parcels: packagePayload.parcels,
     type: 'package',
     user_reference_number: orderId,
     cod: false
   };
   
   const shipmentResponse = await fetch(`${apiBaseUrl}/packages`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json',
       'Accept': 'application/vnd.furgonetka.v1+json',
       'X-Language': 'en_GB'
     },
     body: JSON.stringify(createBody)
   });
   
   if (!shipmentResponse.ok) {
     const rawText = await shipmentResponse.text();
     console.error('Furgonetka create error:', shipmentResponse.status, rawText);
     return new Response(
       JSON.stringify({
         ok: false,
         source: 'create',
         error: `Failed to create shipment: ${shipmentResponse.status}`,
         errors: [{ message: rawText }]
       }),
       { status: 200, headers: corsHeaders }
     );
   }
   
   const shipmentResult = await shipmentResponse.json();
   ```

9. **Update Order**
   ```typescript
   await supabase.from('orders').update({
     furgonetka_package_id: shipmentResult.id || shipmentResult.package_id,
     tracking_number: shipmentResult.tracking_number || shipmentResult.waybill,
     carrier: shipmentResult.carrier || 'Furgonetka',
     shipping_status: 'created',
     shipping_label_url: shipmentResult.label_url || shipmentResult.waybill_url,
     updated_at: new Date().toISOString()
   }).eq('id', orderId);
   ```

10. **Immediate Tracking Sync**
    ```typescript
    await supabase.functions.invoke('sync-furgonetka-tracking', {
      body: { orderId: orderId },
      headers: {
        Authorization: req.headers.get('Authorization') || ''
      }
    });
    ```

11. **Send Order Preparation Email**
    ```typescript
    const { data: orderForEmail } = await supabase
      .from('orders')
      .select('*, profiles(email, first_name, preferred_language)')
      .eq('id', orderId)
      .single();
    
    if (orderForEmail?.profiles?.email) {
      await supabase.functions.invoke('send-order-preparation-email', {
        body: {
          orderId: orderForEmail.id,
          orderNumber: orderForEmail.order_number,
          userEmail: orderForEmail.profiles.email,
          preferredLanguage: orderForEmail.profiles.preferred_language || 'en',
          userName: orderForEmail.profiles.first_name || ''
        }
      });
    }
    ```

12. **Return Success**
    ```typescript
    return new Response(
      JSON.stringify({
        success: true,
        packageId: shipmentResult.id || shipmentResult.package_id,
        trackingNumber: shipmentResult.tracking_number || shipmentResult.waybill,
        labelUrl: shipmentResult.label_url || shipmentResult.waybill_url
      }),
      { headers: corsHeaders }
    );
    ```

---

### 5.5 `sync-furgonetka-tracking` Edge Function

**Path:** `/supabase/functions/sync-furgonetka-tracking/index.ts`  
**Auth:** Public  
**Method:** `POST`

#### Request Body
```typescript
{
  orderId: "uuid-of-order"
}
```

#### Logic Flow

1. **Fetch Order**
   ```typescript
   const { data: order } = await supabase
     .from('orders')
     .select('*')
     .eq('id', orderId)
     .single();
   
   if (!order?.furgonetka_package_id) {
     return new Response(
       JSON.stringify({ error: 'No Furgonetka package ID found' }),
       { status: 400, headers: corsHeaders }
     );
   }
   ```

2. **Get Furgonetka Token**
   ```typescript
   const { data: tokenData } = await supabase.functions.invoke('get-furgonetka-token');
   const accessToken = tokenData.access_token;
   ```

3. **Fetch Tracking Status**
   ```typescript
   const trackingResponse = await fetch(
     `${apiBaseUrl}/packages/${order.furgonetka_package_id}/tracking`,
     {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${accessToken}`,
         'Accept': 'application/vnd.furgonetka.v1+json',
         'X-Language': 'en_GB'
       }
     }
   );
   
   if (!trackingResponse.ok) {
     const errorText = await trackingResponse.text();
     throw new Error(`Failed to fetch tracking: ${trackingResponse.status} ${errorText}`);
   }
   
   const trackingData = await trackingResponse.json();
   ```

4. **Map Furgonetka Status to Internal Status**
   ```typescript
   function mapFurgonetkaStatus(furgonetkaStatus: string): string {
     const statusMap: Record<string, string> = {
       'registered': 'awaiting_shipping',
       'accepted_by_courier': 'shipped',
       'in_transit': 'in_transit',
       'out_for_delivery': 'in_transit',
       'delivered': 'delivered',
       'delivery_failed': 'in_transit',
       'returned': 'cancelled'
     };
     
     return statusMap[furgonetkaStatus] || order.shipping_status;
   }
   
   const newStatus = mapFurgonetkaStatus(trackingData.status);
   ```

5. **Update Order**
   ```typescript
   const updateData: any = {
     shipping_status: newStatus,
     updated_at: new Date().toISOString()
   };
   
   if (newStatus === 'delivered' && !order.delivered_at) {
     updateData.delivered_at = new Date().toISOString();
     updateData.status = 'delivered';
   }
   
   if (trackingData.tracking_number && !order.tracking_number) {
     updateData.tracking_number = trackingData.tracking_number;
   }
   
   if (trackingData.tracking_url && !order.tracking_url) {
     updateData.tracking_url = trackingData.tracking_url;
   }
   
   await supabase
     .from('orders')
     .update(updateData)
     .eq('id', orderId);
   ```

6. **Send Tracking Email (if status changed to in_transit)**
   ```typescript
   if (newStatus === 'in_transit' && !order.tracking_email_sent) {
     const { data: orderWithProfile } = await supabase
       .from('orders')
       .select('*, profiles(email, first_name, preferred_language)')
       .eq('id', orderId)
       .single();
     
     if (orderWithProfile?.profiles?.email) {
       await supabase.functions.invoke('send-tracking-available-email', {
         body: {
           orderId: orderWithProfile.id,
           orderNumber: orderWithProfile.order_number,
           trackingNumber: orderWithProfile.tracking_number,
           trackingUrl: orderWithProfile.tracking_url,
           userEmail: orderWithProfile.profiles.email,
           userName: orderWithProfile.profiles.first_name,
           preferredLanguage: orderWithProfile.profiles.preferred_language || 'en'
         }
       });
       
       await supabase
         .from('orders')
         .update({ tracking_email_sent: true })
         .eq('id', orderId);
     }
   }
   ```

7. **Send Delivery Confirmation Email (if delivered)**
   ```typescript
   if (newStatus === 'delivered' && !order.delivered_email_sent) {
     const { data: orderWithProfile } = await supabase
       .from('orders')
       .select('*, profiles(email, first_name, preferred_language)')
       .eq('id', orderId)
       .single();
     
     if (orderWithProfile?.profiles?.email) {
       await supabase.functions.invoke('send-delivery-confirmation-email', {
         body: {
           orderId: orderWithProfile.id,
           orderNumber: orderWithProfile.order_number,
           userEmail: orderWithProfile.profiles.email,
           userName: orderWithProfile.profiles.first_name,
           preferredLanguage: orderWithProfile.profiles.preferred_language || 'en'
         }
       });
       
       await supabase
         .from('orders')
         .update({ delivered_email_sent: true })
         .eq('id', orderId);
     }
   }
   ```

8. **Return Updated Status**
   ```typescript
   return new Response(
     JSON.stringify({
       success: true,
       previousStatus: order.shipping_status,
       newStatus: newStatus,
       trackingData: trackingData
     }),
     { headers: corsHeaders }
   );
   ```

---

### 5.6 `auto-sync-tracking` CRON Job

**Path:** `/supabase/functions/auto-sync-tracking/index.ts`  
**Auth:** Public (validates CRON secret)  
**Method:** `POST`  
**Trigger:** CRON every 1 hour

#### Logic Flow

1. **Validate CRON Secret**
   ```typescript
   const authHeader = req.headers.get('Authorization');
   const cronSecret = Deno.env.get('CRON_SECRET');
   
   if (!authHeader || !authHeader.includes(cronSecret)) {
     return new Response(
       JSON.stringify({ error: 'Unauthorized' }),
       { status: 401, headers: corsHeaders }
     );
   }
   ```

2. **Fetch Pending Orders**
   ```typescript
   const { data: orders } = await supabase
     .from('orders')
     .select('id, order_number, shipping_status')
     .not('furgonetka_package_id', 'is', null)
     .in('shipping_status', ['awaiting_shipping', 'shipped', 'in_transit']);
   ```

3. **Sync Each Order**
   ```typescript
   const results = [];
   
   for (const order of orders || []) {
     try {
       const { data } = await supabase.functions.invoke('sync-furgonetka-tracking', {
         body: { orderId: order.id }
       });
       
       results.push({
         orderId: order.id,
         orderNumber: order.order_number,
         success: true,
         data: data
       });
     } catch (error) {
       console.error(`Failed to sync order ${order.order_number}:`, error);
       results.push({
         orderId: order.id,
         orderNumber: order.order_number,
         success: false,
         error: error.message
       });
     }
   }
   ```

4. **Return Summary**
   ```typescript
   return new Response(
     JSON.stringify({
       success: true,
       ordersProcessed: orders?.length || 0,
       results: results
     }),
     { headers: corsHeaders }
   );
   ```

#### CRON Setup (PostgreSQL)

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule auto-sync every hour
SELECT cron.schedule(
  'auto-sync-tracking-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/auto-sync-tracking',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  ) AS request_id;
  $$
);
```

---

### 5.7 `furgonetka-webhook` Edge Function

**Path:** `/supabase/functions/furgonetka-webhook/index.ts`  
**Auth:** Public (validates webhook secret)  
**Method:** `POST`

#### Webhook Configuration

**Furgonetka Dashboard Setup:**
1. Go to Furgonetka Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/furgonetka-webhook`
3. Select events: `package.status_changed`
4. Copy webhook secret → Save as `FURGONETKA_WEBHOOK_SECRET` in Supabase

#### Request Body (Example)
```typescript
{
  "package_id": "FGN12345678",
  "status": "in_transit",
  "tracking_number": "12345678901234",
  "tracking_url": "https://tracking.furgonetka.pl/...",
  "estimated_delivery": "2024-01-20"
}
```

#### Logic Flow

1. **Validate Webhook Secret**
   ```typescript
   const authHeader = req.headers.get('Authorization');
   const webhookSecret = Deno.env.get('FURGONETKA_WEBHOOK_SECRET');
   
   if (!authHeader || !authHeader.includes(webhookSecret)) {
     return new Response(
       JSON.stringify({ error: 'Unauthorized' }),
       { status: 401, headers: corsHeaders }
     );
   }
   ```

2. **Parse Webhook Payload**
   ```typescript
   const payload = await req.json();
   const { package_id, status, tracking_number, tracking_url, estimated_delivery } = payload;
   ```

3. **Find Order by Package ID**
   ```typescript
   const { data: order } = await supabase
     .from('orders')
     .select('*')
     .eq('furgonetka_package_id', package_id)
     .single();
   
   if (!order) {
     console.warn(`Order not found for package_id: ${package_id}`);
     return new Response(
       JSON.stringify({ received: true }),
       { status: 200, headers: corsHeaders }
     );
   }
   ```

4. **Update Order with Webhook Data**
   ```typescript
   const newStatus = mapFurgonetkaStatus(status);
   
   const updateData: any = {
     shipping_status: newStatus,
     updated_at: new Date().toISOString()
   };
   
   if (tracking_number) updateData.tracking_number = tracking_number;
   if (tracking_url) updateData.tracking_url = tracking_url;
   if (estimated_delivery) updateData.estimated_delivery_date = estimated_delivery;
   
   if (newStatus === 'delivered') {
     updateData.delivered_at = new Date().toISOString();
     updateData.status = 'delivered';
   }
   
   await supabase.from('orders').update(updateData).eq('id', order.id);
   ```

5. **Trigger Email Notifications (same logic as sync-furgonetka-tracking)**

6. **Acknowledge Webhook**
   ```typescript
   return new Response(
     JSON.stringify({ received: true }),
     { status: 200, headers: corsHeaders }
     );
   ```

---

## 6. Email System

All transactional emails are sent via **Resend API**.

### 6.1 Email Configuration

**Secret Required:** `RESEND_API_KEY`

**Sender Email:** Configured in `site_settings` table with key `sender_email` (e.g., `orders@houseofvenus.com`)

---

### 6.2 Email Templates

All email templates are React components using `@react-email/components`.

**Template Location:** `/supabase/functions/_templates/`

#### Base Template Structure
```typescript
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text
} from '@react-email/components';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  orderItems: OrderItem[];
  total: number;
  shippingAddress: Address;
  language: 'en' | 'pl';
}

export const OrderConfirmationEmail = ({
  orderNumber,
  orderItems,
  total,
  shippingAddress,
  language
}: OrderConfirmationEmailProps) => {
  const translations = {
    en: {
      title: 'Order Confirmation',
      subtitle: `Thank you for your order #${orderNumber}`,
      // ... more translations
    },
    pl: {
      title: 'Potwierdzenie zamówienia',
      subtitle: `Dziękujemy za zamówienie #${orderNumber}`,
      // ... more translations
    }
  };
  
  const t = translations[language];
  
  return (
    <Html>
      <Head />
      <Preview>{t.subtitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://houseofvenus.com/logo.png"
            alt="House of Venus"
            style={logo}
          />
          <Heading style={heading}>{t.title}</Heading>
          <Text style={text}>{t.subtitle}</Text>
          
          {/* Order details */}
          <Section style={orderSection}>
            {orderItems.map(item => (
              <div key={item.id}>
                <Img src={item.image} alt={item.name} style={productImage} />
                <Text>{item.name}</Text>
                <Text>{item.quantity} x {item.price} PLN</Text>
              </div>
            ))}
          </Section>
          
          <Text style={total}>
            {t.total}: {total} PLN
          </Text>
          
          {/* Shipping address */}
          <Section style={addressSection}>
            <Heading as="h3">{t.shippingAddress}</Heading>
            <Text>{shippingAddress.name}</Text>
            <Text>{shippingAddress.street}</Text>
            <Text>{shippingAddress.city}, {shippingAddress.postalCode}</Text>
          </Section>
          
          <Link href="https://houseofvenus.com/dashboard" style={button}>
            {t.viewOrder}
          </Link>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif'
};

// ... more styles
```

---

### 6.3 Email Edge Functions

#### `send-order-confirmation`

**Path:** `/supabase/functions/send-order-confirmation/index.ts`  
**Trigger:** Called by `stripe-webhook` after order creation

**Request Body:**
```typescript
{
  orderId: "uuid",
  orderNumber: "HOV-A000-0001",
  userEmail: "customer@example.com",
  preferredLanguage: "en"
}
```

**Logic:**
```typescript
async function sendOrderConfirmation(req: Request) {
  const { orderId, orderNumber, userEmail, preferredLanguage } = await req.json();
  
  // Fetch complete order data
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*, product_snapshot),
      shipping_addresses(*)
    `)
    .eq('id', orderId)
    .single();
  
  // Render email template
  const emailHtml = render(
    <OrderConfirmationEmail
      orderNumber={orderNumber}
      orderItems={order.order_items}
      total={order.total_amount_pln}
      shippingAddress={order.shipping_addresses}
      language={preferredLanguage}
    />
  );
  
  // Send via Resend
  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: senderEmail,
      to: [userEmail],
      subject: preferredLanguage === 'pl' 
        ? `Potwierdzenie zamówienia ${orderNumber}`
        : `Order Confirmation ${orderNumber}`,
      html: emailHtml
    })
  });
  
  if (!resendResponse.ok) {
    throw new Error(`Resend API error: ${await resendResponse.text()}`);
  }
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: corsHeaders }
  );
}
```

---

#### `send-order-preparation-email`

**Trigger:** Called by `create-furgonetka-shipment` after label creation

**Logic:** Similar to confirmation email, but indicates order is being prepared for shipping.

---

#### `send-tracking-available-email`

**Trigger:** Called by `sync-furgonetka-tracking` when status changes to `in_transit`

**Template Includes:**
- Tracking number
- Tracking URL button
- Estimated delivery date

---

#### `send-delivery-confirmation-email`

**Trigger:** Called by `sync-furgonetka-tracking` when status changes to `delivered`

**Template Includes:**
- Delivery confirmation
- Request for review
- Loyalty points earned

---

#### `send-newsletter`

**Path:** `/supabase/functions/send-newsletter/index.ts`  
**Auth:** Admin only  
**Method:** `POST`

**Request Body:**
```typescript
{
  subject_en: "New Collection Launch!",
  subject_pl: "Premiera Nowej Kolekcji!",
  content_en: "<html>...</html>",
  content_pl: "<html>...</html>",
  filter?: {
    venus_signs?: ["aries", "leo"],
    language?: "en",
    is_subscribed?: true
  }
}
```

**Logic:**
```typescript
async function sendNewsletter(req: Request) {
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser(token);
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  const { subject_en, subject_pl, content_en, content_pl, filter } = await req.json();
  
  // Fetch subscribers with filters
  let query = supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('is_subscribed', true);
  
  if (filter?.venus_signs) {
    query = query.in('venus_sign', filter.venus_signs);
  }
  
  if (filter?.language) {
    query = query.eq('language', filter.language);
  }
  
  const { data: subscribers } = await query;
  
  // Send emails in batches
  const batchSize = 50;
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(subscriber => {
        const subject = subscriber.language === 'pl' ? subject_pl : subject_en;
        const content = subscriber.language === 'pl' ? content_pl : content_en;
        
        return fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: senderEmail,
            to: [subscriber.email],
            subject: subject,
            html: content
          })
        });
      })
    );
    
    // Rate limit: wait 1 second between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return new Response(
    JSON.stringify({ 
      success: true,
      emailsSent: subscribers.length
    }),
    { headers: corsHeaders }
  );
}
```

---

## 7. Authentication & Authorization

### 7.1 Row Level Security (RLS) Policies

All tables have RLS enabled by default. Here are key policy patterns:

#### User-Owned Data
```sql
-- Users can only view/edit their own data
CREATE POLICY "Users manage own profile"
ON profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own cart"
ON cart_items
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### Public Read, User Write
```sql
-- Anyone can view active products
CREATE POLICY "Public read active products"
ON products
FOR SELECT
USING (is_active = true);

-- Only admins can modify products
CREATE POLICY "Admins manage products"
ON products
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

#### Order Access
```sql
-- Users can view their own orders (by user_id OR email for guest checkout)
CREATE POLICY "Users view own orders"
ON orders
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can manage all orders
CREATE POLICY "Admins manage all orders"
ON orders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

---

### 7.2 Admin Role Management

#### Granting Admin Role
```sql
-- Update user profile to admin
UPDATE profiles
SET role = 'admin'
WHERE user_id = 'user-uuid-here';
```

#### Admin Check Helper Function
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 8. Secrets Configuration

All secrets are stored in Supabase Edge Function Secrets.

### 8.1 Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Public anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin access) | `eyJhbGci...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` or `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `RESEND_API_KEY` | Resend email API key | `re_...` |
| `FURGONETKA_API_URL` | Furgonetka API base URL | `https://api-pl.furgonetka.pl` |
| `FURGONETKA_CLIENT_ID` | Furgonetka OAuth client ID | (from Furgonetka dashboard) |
| `FURGONETKA_CLIENT_SECRET` | Furgonetka OAuth client secret | (from Furgonetka dashboard) |
| `FURGONETKA_EMAIL` | Furgonetka account email | `your@email.com` |
| `FURGONETKA_PASSWORD` | Furgonetka account password | `yourpassword` |
| `FURGONETKA_WEBHOOK_SECRET` | Furgonetka webhook secret | (custom string) |
| `GEOAPIFY_API_KEY` | Geoapify geocoding API key | (for address autocomplete) |
| `TENOR_API_KEY` | Tenor GIF API key | (optional, for chat GIFs) |
| `CRON_SECRET` | Secret for CRON job authentication | (custom string) |

---

### 8.2 Setting Secrets

**Via Supabase Dashboard:**
1. Go to Project Settings → Edge Functions
2. Add secret key-value pairs
3. Deploy edge functions to apply

**Via Supabase CLI:**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set RESEND_API_KEY=re_xxx
# ... repeat for all secrets
```

---

## 9. CRON Jobs

### 9.1 Auto-Sync Tracking

**Frequency:** Every hour  
**Function:** `auto-sync-tracking`  
**Purpose:** Synchronizes tracking status for all pending shipments

**SQL Setup:**
```sql
SELECT cron.schedule(
  'auto-sync-tracking-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/auto-sync-tracking',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  ) AS request_id;
  $$
);
```

---

### 9.2 Abandoned Cart Reminders

**Frequency:** Daily at 10 AM  
**Function:** `send-cart-reminders`  
**Purpose:** Sends reminder emails to users with abandoned carts (>24 hours old)

**SQL Setup:**
```sql
SELECT cron.schedule(
  'cart-reminders-daily',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-cart-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  ) AS request_id;
  $$
);
```

---

### 9.3 Stock Alert Notifications

**Frequency:** Every 6 hours  
**Function:** `check-low-stock`  
**Purpose:** Notifies admins of low stock products

**SQL Setup:**
```sql
SELECT cron.schedule(
  'low-stock-check',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/check-low-stock',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  ) AS request_id;
  $$
);
```

---

## 10. API Endpoints Reference

### 10.1 Public Endpoints (No Auth Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/create-checkout` | POST | Creates Stripe checkout session |
| `/stripe-webhook` | POST | Handles Stripe webhook events |
| `/calculate-shipping-price` | POST | Calculates available shipping options |
| `/get-furgonetka-token` | POST | Gets Furgonetka OAuth token |
| `/places-autocomplete` | POST | Address autocomplete via Geoapify |
| `/detect-country` | GET | Detects user country by IP |

---

### 10.2 Authenticated Endpoints (User Auth Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/get-exchange-rates` | GET | Gets current PLN↔EUR exchange rates |

---

### 10.3 Admin-Only Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/create-furgonetka-shipment` | POST | Creates shipping label |
| `/sync-furgonetka-tracking` | POST | Manual tracking sync |
| `/send-newsletter` | POST | Sends newsletter campaign |
| `/admin-reset-orders` | POST | Resets order numbers (dangerous) |

---

### 10.4 Webhook Endpoints

| Endpoint | Method | Description | Secret Header |
|----------|--------|-------------|---------------|
| `/stripe-webhook` | POST | Stripe payment events | `stripe-signature` |
| `/furgonetka-webhook` | POST | Furgonetka tracking events | `Authorization: Bearer {secret}` |

---

### 10.5 CRON Endpoints

| Endpoint | Method | Description | Auth Header |
|----------|--------|-------------|-------------|
| `/auto-sync-tracking` | POST | Hourly tracking sync | `Authorization: Bearer {CRON_SECRET}` |
| `/send-cart-reminders` | POST | Daily cart reminders | `Authorization: Bearer {CRON_SECRET}` |
| `/check-low-stock` | POST | Stock alert check | `Authorization: Bearer {CRON_SECRET}` |

---

## End of Backend Documentation

This document covers all backend/database/API aspects of House of Venus. For frontend implementation details, see `FRONTEND_STRUCTURE_DOCUMENTATION.md`.
