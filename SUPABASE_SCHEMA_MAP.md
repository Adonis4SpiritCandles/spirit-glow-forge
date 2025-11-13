# SUPABASE SCHEMA MAP — Spirit Candles Database

**Document Version:** 1.0  
**Generated:** 2025-11-13  
**Project:** spirit-glow-forge  
**Database:** Supabase PostgreSQL (fhtuqmdlgzmpsbflxhra)

---

## Executive Summary

This document maps the complete database schema for the Spirit Candles e-commerce platform. The schema consists of **40+ tables** organized into logical domains (products, orders, users, coupons, social, gamification, site settings). All tables have **Row Level Security (RLS)** enabled with granular policies enforcing user/admin access control.

**Key Metrics:**
- **Tables:** 40+ tables
- **Migrations:** 85 SQL migration files
- **RLS Policies:** 188 policies across all tables
- **Functions:** 78 PL/pgSQL functions (triggers + RPC)
- **Triggers:** 44 triggers (auto-update timestamps, notifications)
- **Indexes:** 50+ indexes for performance

**Database Design Principles:**
1. **RLS First:** Every table has RLS enabled; policies enforce access control
2. **Soft Deletes:** No CASCADE deletes on user data; SET NULL or soft delete flags
3. **Audit Fields:** All tables have `created_at` and `updated_at` timestamps
4. **Bilingual:** Product names, descriptions, email templates stored in both EN/PL
5. **Relational Integrity:** Foreign keys enforce data consistency

---

## Table of Contents

1. [Products & Catalog](#1-products--catalog)
2. [Orders & Checkout](#2-orders--checkout)
3. [Users & Authentication](#3-users--authentication)
4. [Coupons & Discounts](#4-coupons--discounts)
5. [Reviews & Ratings](#5-reviews--ratings)
6. [Wishlist](#6-wishlist)
7. [Social Features](#7-social-features)
8. [Gamification](#8-gamification)
9. [Newsletter & Contact](#9-newsletter--contact)
10. [Site Settings](#10-site-settings)
11. [Email Marketing](#11-email-marketing)
12. [Chat](#12-chat)
13. [RPC Functions](#13-rpc-functions)
14. [Triggers](#14-triggers)
15. [Indexes](#15-indexes)
16. [Gaps & Recommendations](#16-gaps--recommendations)

---

## 1. Products & Catalog

### 1.1 Table: `products`

**Purpose:** Stores product catalog with bilingual names/descriptions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Product ID |
| `name_en` | TEXT | NOT NULL | Product name (English) |
| `name_pl` | TEXT | NOT NULL | Product name (Polish) |
| `description_en` | TEXT | | Product description (English) |
| `description_pl` | TEXT | | Product description (Polish) |
| `price_pln` | INTEGER | NOT NULL | Price in PLN (grosze, e.g., 5000 = 50.00 PLN) |
| `price_eur` | INTEGER | NOT NULL | Price in EUR (cents, e.g., 1200 = 12.00 EUR) |
| `image_url` | TEXT | | Main product image URL |
| `category` | TEXT | NOT NULL | Category (e.g., 'floral', 'woody', 'citrus') |
| `size` | TEXT | NOT NULL | Size (e.g., '250g', '400g') |
| `stock_quantity` | INTEGER | DEFAULT 0 | Current stock level |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**RLS Policies:**
- `SELECT`: Public (everyone can view products)
- `INSERT/UPDATE/DELETE`: Admins only

**Indexes:**
- `idx_products_category` on `category`
- `idx_products_stock` on `stock_quantity`

**Relationships:**
- Referenced by: `cart_items`, `order_items`, `wishlist`, `reviews`, `product_collections`

---

### 1.2 Table: `categories`

**Purpose:** Product category management with bilingual names.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Category ID |
| `name_en` | TEXT | NOT NULL, UNIQUE | Category name (English) |
| `name_pl` | TEXT | NOT NULL, UNIQUE | Category name (Polish) |
| `description_en` | TEXT | | Category description (English) |
| `description_pl` | TEXT | | Category description (Polish) |
| `slug` | TEXT | UNIQUE | URL slug (e.g., 'floral-candles') |
| `image_url` | TEXT | | Category banner image |
| `display_order` | INTEGER | DEFAULT 0 | Sort order in UI |
| `is_active` | BOOLEAN | DEFAULT true | Active/inactive flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public (if `is_active = true`)
- `INSERT/UPDATE/DELETE`: Admins only

---

### 1.3 Table: `collections`

**Purpose:** Product collections (e.g., "Summer Scents", "Best Sellers").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Collection ID |
| `name_en` | TEXT | NOT NULL | Collection name (English) |
| `name_pl` | TEXT | NOT NULL | Collection name (Polish) |
| `description_en` | TEXT | | Collection description (English) |
| `description_pl` | TEXT | | Collection description (Polish) |
| `slug` | TEXT | UNIQUE | URL slug (e.g., 'summer-scents') |
| `gradient_start` | TEXT | | Gradient color (start) |
| `gradient_end` | TEXT | | Gradient color (end) |
| `banner_image_url` | TEXT | | Banner image URL |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `is_active` | BOOLEAN | DEFAULT true | Active/inactive flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public (if `is_active = true`)
- `INSERT/UPDATE/DELETE`: Admins only

---

### 1.4 Table: `product_collections`

**Purpose:** Many-to-many junction table for products ↔ collections.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Junction ID |
| `product_id` | UUID | FK → products(id) | Product reference |
| `collection_id` | UUID | FK → collections(id) | Collection reference |
| `display_order` | INTEGER | DEFAULT 0 | Sort order within collection |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**Unique Constraint:** `UNIQUE(product_id, collection_id)`

**RLS Policies:**
- `SELECT`: Public
- `INSERT/UPDATE/DELETE`: Admins only

---

## 2. Orders & Checkout

### 2.1 Table: `orders`

**Purpose:** Customer orders with shipping, payment, and tracking info.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Order ID |
| `order_number` | SERIAL | UNIQUE | Human-readable order number (e.g., 12345) |
| `user_id` | UUID | FK → auth.users(id) | Customer user ID |
| `status` | TEXT | DEFAULT 'pending' | Order status ('pending', 'paid', 'cancelled', 'completed') |
| `shipping_status` | TEXT | DEFAULT 'pending' | Shipping status ('pending', 'created', 'in_transit', 'delivered') |
| `total_pln` | NUMERIC(10,2) | NOT NULL | Total amount in PLN (after discount + shipping) |
| `total_eur` | NUMERIC(10,2) | NOT NULL | Total amount in EUR |
| `shipping_cost_pln` | NUMERIC(10,2) | DEFAULT 0 | Shipping cost in PLN |
| `shipping_cost_eur` | NUMERIC(10,2) | DEFAULT 0 | Shipping cost in EUR |
| `discount_pln` | NUMERIC(10,2) | DEFAULT 0 | Discount applied in PLN |
| `discount_eur` | NUMERIC(10,2) | DEFAULT 0 | Discount applied in EUR |
| `coupon_code` | TEXT | | Coupon code used (if any) |
| `carrier_name` | TEXT | | Carrier name (e.g., 'DHL', 'GLS', 'DPD') |
| `tracking_number` | TEXT | | Shipment tracking number |
| `furgonetka_package_id` | TEXT | | Furgonetka package ID |
| `shipping_label_url` | TEXT | | Shipping label PDF URL |
| `shipping_address` | JSONB | | Shipping address (full object) |
| `service_id` | INTEGER | | Furgonetka service ID |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Order placed timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**RLS Policies:**
- `SELECT`: User can view own orders; admins can view all
- `INSERT`: Authenticated users can create orders
- `UPDATE`: Admins only (status, shipping, tracking)

**Indexes:**
- `idx_orders_user` on `user_id`
- `idx_orders_status` on `status`
- `idx_orders_shipping_status` on `shipping_status`
- `idx_orders_tracking` on `tracking_number`

**Relationships:**
- Referenced by: `order_items`, `coupon_redemptions`, `points_history`

---

### 2.2 Table: `order_items`

**Purpose:** Line items for each order (product + quantity + price snapshot).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Line item ID |
| `order_id` | UUID | FK → orders(id) ON DELETE CASCADE | Order reference |
| `product_id` | UUID | FK → products(id) | Product reference |
| `quantity` | INTEGER | NOT NULL | Quantity purchased |
| `price_pln` | INTEGER | NOT NULL | Unit price in PLN (snapshot at purchase time) |
| `price_eur` | INTEGER | NOT NULL | Unit price in EUR (snapshot at purchase time) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: User can view items for own orders; admins can view all
- `INSERT`: Authenticated users (via webhook only)

**Indexes:**
- `idx_order_items_order` on `order_id`
- `idx_order_items_product` on `product_id`

---

### 2.3 Table: `cart_items`

**Purpose:** Persistent shopping cart for authenticated users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Cart item ID |
| `user_id` | UUID | FK → auth.users(id) ON DELETE CASCADE | User reference |
| `product_id` | UUID | FK → products(id) | Product reference |
| `quantity` | INTEGER | DEFAULT 1 | Quantity in cart |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Added to cart timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Unique Constraint:** `UNIQUE(user_id, product_id)`

**RLS Policies:**
- All operations: User can manage own cart items only

**Indexes:**
- `idx_cart_items_user` on `user_id`

**Realtime:** Subscribed by frontend for live cart updates

---

## 3. Users & Authentication

### 3.1 Table: `auth.users`

**Purpose:** Managed by Supabase Auth (email/password, OAuth).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | User ID (primary key) |
| `email` | TEXT | User email (unique) |
| `encrypted_password` | TEXT | Hashed password |
| `email_confirmed_at` | TIMESTAMPTZ | Email confirmation timestamp |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Note:** Managed by Supabase Auth; not directly modified by application.

---

### 3.2 Table: `profiles`

**Purpose:** Extended user profile data (role, points, referral, bio, avatar).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Profile ID |
| `user_id` | UUID | UNIQUE, FK → auth.users(id) | User reference |
| `email` | TEXT | NOT NULL | Email (denormalized for convenience) |
| `username` | TEXT | UNIQUE | Unique username (optional) |
| `first_name` | TEXT | | First name |
| `last_name` | TEXT | | Last name |
| `role` | TEXT | DEFAULT 'user' | Role ('user' or 'admin') |
| `points` | INTEGER | DEFAULT 0 | Loyalty points balance |
| `referral_code` | TEXT | UNIQUE | User's referral code (e.g., 'JOHN123') |
| `referral_source_id` | UUID | FK → profiles(user_id) | Referrer user ID (if referred) |
| `referral_short_code` | TEXT | UNIQUE | Short referral code (e.g., 'JN3X') |
| `avatar_url` | TEXT | | Avatar image URL (Supabase Storage) |
| `profile_image_url` | TEXT | | Profile image URL |
| `cover_image_url` | TEXT | | Cover image URL |
| `bio` | TEXT | | User bio (max 500 chars) |
| `public_profile` | BOOLEAN | DEFAULT false | Public profile flag (for social features) |
| `preferred_language` | TEXT | DEFAULT 'en' | Preferred language ('en' or 'pl') |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: User can view own profile; admins can view all; public profiles visible to everyone
- `INSERT`: User can create own profile (triggered on signup)
- `UPDATE`: User can update own profile; admins can update any

**Indexes:**
- `idx_profiles_username` on `username`
- `idx_profiles_referral_code` on `referral_code`
- `idx_profiles_referral_short_code` on `referral_short_code`

**Triggers:**
- `handle_new_user()`: Auto-create profile when user signs up

**Relationships:**
- Referenced by: `orders`, `cart_items`, `reviews`, `wishlist`, `profile_comments`, `profile_follows`

---

## 4. Coupons & Discounts

### 4.1 Table: `coupons`

**Purpose:** Discount codes with validation rules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Coupon ID |
| `code` | TEXT | UNIQUE, NOT NULL | Coupon code (e.g., 'WELCOME10', 'REFERRAL10') |
| `percent_off` | NUMERIC(5,2) | | Percentage discount (e.g., 10.00 = 10%) |
| `amount_off_pln` | NUMERIC(10,2) | | Fixed discount in PLN |
| `amount_off_eur` | NUMERIC(10,2) | | Fixed discount in EUR |
| `valid_from` | TIMESTAMPTZ | | Validity start date |
| `valid_to` | TIMESTAMPTZ | | Validity end date |
| `max_redemptions` | INTEGER | | Max total redemptions (null = unlimited) |
| `redemptions_count` | INTEGER | DEFAULT 0 | Current redemption count |
| `per_user_limit` | INTEGER | | Max redemptions per user |
| `referral_only` | BOOLEAN | DEFAULT false | Only for referred users |
| `active` | BOOLEAN | DEFAULT true | Active/inactive flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**Validation Logic (in Edge Function):**
- Check `active = true`
- Check `valid_from <= NOW() <= valid_to`
- Check `redemptions_count < max_redemptions`
- Check user-specific limit in `coupon_redemptions`
- If `referral_only = true`, check `profiles.referral_source_id IS NOT NULL`

**RLS Policies:**
- `SELECT`: Public (to validate codes)
- `INSERT/UPDATE/DELETE`: Admins only

**Indexes:**
- `idx_coupons_code` on `code`

---

### 4.2 Table: `coupon_redemptions`

**Purpose:** Track coupon usage per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Redemption ID |
| `coupon_id` | UUID | FK → coupons(id) ON DELETE CASCADE | Coupon reference |
| `user_id` | UUID | NOT NULL | User reference |
| `order_id` | UUID | FK → orders(id) ON DELETE SET NULL | Order reference |
| `redeemed_at` | TIMESTAMPTZ | DEFAULT now() | Redemption timestamp |
| `amount_saved_pln` | NUMERIC(10,2) | | Amount saved in PLN |
| `amount_saved_eur` | NUMERIC(10,2) | | Amount saved in EUR |

**Unique Constraint:** `UNIQUE(coupon_id, user_id)` (one redemption per user per coupon)

**RLS Policies:**
- `SELECT`: User can view own redemptions; admins can view all
- `INSERT`: System only (via webhook)

**Indexes:**
- `idx_coupon_redemptions_user` on `user_id`
- `idx_coupon_redemptions_coupon` on `coupon_id`

---

## 5. Reviews & Ratings

### 5.1 Table: `reviews`

**Purpose:** Product reviews with star ratings and bilingual comments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Review ID |
| `user_id` | UUID | FK → profiles(user_id) | Reviewer user ID |
| `product_id` | UUID | FK → products(id) | Product reference |
| `rating` | INTEGER | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Star rating (1-5) |
| `comment_en` | TEXT | | Review comment (English) |
| `comment_pl` | TEXT | | Review comment (Polish) |
| `verified_purchase` | BOOLEAN | DEFAULT false | Verified purchase flag |
| `is_visible` | BOOLEAN | DEFAULT true | Visibility flag (admin moderation) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public (if `is_visible = true`)
- `INSERT/UPDATE/DELETE`: User can manage own reviews

**Indexes:**
- `idx_reviews_product` on `product_id`
- `idx_reviews_user` on `user_id`

---

### 5.2 Table: `testimonials`

**Purpose:** Homepage customer testimonials (curated by admins).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Testimonial ID |
| `name` | TEXT | NOT NULL | Customer name |
| `text_en` | TEXT | NOT NULL | Testimonial text (English) |
| `text_pl` | TEXT | NOT NULL | Testimonial text (Polish) |
| `rating` | INTEGER | CHECK (rating >= 1 AND rating <= 5) | Star rating |
| `featured` | BOOLEAN | DEFAULT false | Featured on homepage |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public
- `INSERT/UPDATE/DELETE`: Admins only

---

## 6. Wishlist

### 6.1 Table: `wishlist`

**Purpose:** User wishlist with price/stock alerts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Wishlist item ID |
| `user_id` | UUID | FK → profiles(user_id) ON DELETE CASCADE | User reference |
| `product_id` | UUID | FK → products(id) | Product reference |
| `collection` | TEXT | DEFAULT 'default' | Wishlist collection/category |
| `price_alert_enabled` | BOOLEAN | DEFAULT false | Price drop alert enabled |
| `stock_alert_enabled` | BOOLEAN | DEFAULT false | Back-in-stock alert enabled |
| `added_at` | TIMESTAMPTZ | DEFAULT now() | |

**Unique Constraint:** `UNIQUE(user_id, product_id)`

**RLS Policies:**
- All operations: User can manage own wishlist only

**Indexes:**
- `idx_wishlist_user` on `user_id`

**Realtime:** Subscribed by frontend for live wishlist updates

---

### 6.2 Table: `shared_wishlists` (or `wishlist_shares`)

**Purpose:** Shareable wishlist tokens for public sharing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Share ID |
| `user_id` | UUID | FK → profiles(user_id) ON DELETE CASCADE | User reference |
| `share_token` | TEXT | UNIQUE, NOT NULL | Share token (e.g., 'abc123xyz') |
| `name` | TEXT | | Wishlist name |
| `is_public` | BOOLEAN | DEFAULT false | Public visibility flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: User can view own shares; public shares visible to everyone
- `INSERT/UPDATE/DELETE`: User can manage own shares

**Indexes:**
- `idx_shared_wishlists_token` on `share_token`

---

## 7. Social Features

### 7.1 Table: `profile_follows`

**Purpose:** User follow relationships (follower ↔ following).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Follow ID |
| `follower_id` | UUID | FK → profiles(user_id) | Follower user ID |
| `following_id` | UUID | FK → profiles(user_id) | Following user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**Unique Constraint:** `UNIQUE(follower_id, following_id)`

**RLS Policies:**
- `SELECT`: Public
- `INSERT/DELETE`: User can follow/unfollow anyone

**Triggers:**
- `notify_follow()`: Insert notification on follow
- `notify_unfollow()`: Insert notification on unfollow

**Realtime:** Replica identity FULL, published to supabase_realtime

---

### 7.2 Table: `profile_comments`

**Purpose:** Comments on user profiles (public profiles only).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Comment ID |
| `profile_user_id` | UUID | FK → profiles(user_id) | Profile owner user ID |
| `commenter_id` | UUID | FK → profiles(user_id) | Commenter user ID |
| `comment` | TEXT | NOT NULL | Comment text |
| `gif_url` | TEXT | | GIF URL (Tenor integration) |
| `is_visible` | BOOLEAN | DEFAULT true | Visibility flag (moderation) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public (if `is_visible = true` and profile is public)
- `INSERT`: Authenticated users
- `UPDATE/DELETE`: Comment author or profile owner

**Indexes:**
- `idx_profile_comments_profile` on `profile_user_id`
- `idx_profile_comments_commenter` on `commenter_id`

---

### 7.3 Table: `profile_comment_reactions`

**Purpose:** Reactions to profile comments (like, fire, heart, celebrate).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Reaction ID |
| `comment_id` | UUID | FK → profile_comments(id) ON DELETE CASCADE | Comment reference |
| `user_id` | UUID | FK → profiles(user_id) | User who reacted |
| `reaction` | TEXT | CHECK (reaction IN ('like', 'fire', 'heart', 'celebrate')) | Reaction type |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**Unique Constraint:** `UNIQUE(comment_id, user_id, reaction)`

**RLS Policies:**
- `SELECT`: Public
- `INSERT/DELETE`: Authenticated users

**Triggers:**
- `notify_comment_reaction()`: Insert notification on reaction

**Realtime:** Replica identity FULL, published to supabase_realtime

---

### 7.4 Table: `profile_notifications`

**Purpose:** User notifications (follows, comments, reactions, badges).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Notification ID |
| `user_id` | UUID | FK → profiles(user_id) ON DELETE CASCADE | Notification recipient |
| `actor_id` | UUID | FK → profiles(user_id) | Actor who triggered notification |
| `type` | TEXT | NOT NULL | Notification type ('follow', 'unfollow', 'comment', 'reaction', 'badge') |
| `profile_user_id` | UUID | FK → profiles(user_id) | Related profile user ID |
| `comment_id` | UUID | FK → profile_comments(id) | Related comment ID (if applicable) |
| `read` | BOOLEAN | DEFAULT false | Read/unread flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT/UPDATE`: User can view/mark own notifications as read
- `INSERT`: System only (via triggers)

**Indexes:**
- `idx_profile_notifications_user` on `user_id`
- `idx_profile_notifications_read` on `read`

**Realtime:** Replica identity FULL, subscribed by frontend

---

## 8. Gamification

### 8.1 Table: `badges`

**Purpose:** Achievement badges (e.g., "First Order", "Super Reviewer").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Badge ID |
| `badge_id` | TEXT | UNIQUE | Badge identifier (e.g., 'first_order') |
| `name_en` | TEXT | NOT NULL | Badge name (English) |
| `name_pl` | TEXT | NOT NULL | Badge name (Polish) |
| `description_en` | TEXT | | Badge description (English) |
| `description_pl` | TEXT | | Badge description (Polish) |
| `icon` | TEXT | | Badge icon URL |
| `criteria` | TEXT | | Criteria for earning (e.g., 'Place 1 order') |
| `is_active` | BOOLEAN | DEFAULT true | Active/inactive flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public
- `INSERT/UPDATE/DELETE`: Admins only

---

### 8.2 Table: `user_badges`

**Purpose:** Badges earned by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | User badge ID |
| `user_id` | UUID | FK → profiles(user_id) ON DELETE CASCADE | User reference |
| `badge_id` | TEXT | NOT NULL | Badge identifier |
| `earned_at` | TIMESTAMPTZ | DEFAULT now() | |

**Unique Constraint:** `UNIQUE(user_id, badge_id)`

**RLS Policies:**
- `SELECT`: User can view own badges; public profiles visible to everyone
- `INSERT`: System only

**Indexes:**
- `idx_badges_user` on `user_id`

---

### 8.3 Table: `points_history`

**Purpose:** Loyalty points transaction log.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Transaction ID |
| `user_id` | UUID | FK → profiles(user_id) ON DELETE CASCADE | User reference |
| `points_change` | INTEGER | NOT NULL | Points added/subtracted (can be negative) |
| `reason` | TEXT | NOT NULL | Reason (e.g., 'Order completed', 'Badge earned') |
| `order_id` | UUID | FK → orders(id) | Related order (if applicable) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: User can view own history; admins can view all
- `INSERT`: System only

**Indexes:**
- `idx_points_history_user` on `user_id`

---

### 8.4 Table: `referrals` (or `referral_rewards`)

**Purpose:** Referral tracking (referrer → referee).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Referral ID |
| `referrer_id` | UUID | FK → profiles(user_id) ON DELETE CASCADE | Referrer user ID |
| `referee_email` | TEXT | NOT NULL | Referee email |
| `referee_id` | UUID | FK → profiles(user_id) ON DELETE SET NULL | Referee user ID (once registered) |
| `status` | TEXT | DEFAULT 'pending' | Status ('pending', 'completed') |
| `reward_points` | INTEGER | DEFAULT 200 | Points reward for referrer |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: User can view own referrals
- `INSERT`: User can create referrals

**Indexes:**
- `idx_referrals_referrer` on `referrer_id`
- `idx_referrals_status` on `status`

---

### 8.5 Table: `referral_rewards`

**Purpose:** Milestone rewards for referrals (e.g., 3 referrals → badge).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Reward ID |
| `referrals_count` | INTEGER | NOT NULL | Referral milestone (e.g., 3, 5, 10) |
| `reward_type` | TEXT | CHECK (reward_type IN ('points', 'badge', 'coupon')) | Reward type |
| `reward_value` | TEXT | NOT NULL | Reward value (e.g., '500', 'VIP10') |
| `description_en` | TEXT | | Description (English) |
| `description_pl` | TEXT | | Description (Polish) |
| `is_active` | BOOLEAN | DEFAULT true | Active/inactive flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public (if `is_active = true`)
- `INSERT/UPDATE/DELETE`: Admins only

---

### 8.6 Table: `badge_rewards`

**Purpose:** Rewards tied to specific badges (e.g., earning "First Order" badge gives 50 points).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Reward ID |
| `badge_id` | TEXT | UNIQUE, NOT NULL | Badge identifier |
| `reward_type` | TEXT | CHECK (reward_type IN ('points', 'coupon', 'discount')) | Reward type |
| `reward_value` | TEXT | NOT NULL | Reward value |
| `description_en` | TEXT | | Description (English) |
| `description_pl` | TEXT | | Description (Polish) |
| `is_active` | BOOLEAN | DEFAULT true | Active/inactive flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public (if `is_active = true`)
- `INSERT/UPDATE/DELETE`: Admins only

---

## 9. Newsletter & Contact

### 9.1 Table: `newsletter_subscribers`

**Purpose:** Newsletter email subscribers (double opt-in).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Subscriber ID |
| `email` | TEXT | UNIQUE, NOT NULL | Subscriber email |
| `subscribed_at` | TIMESTAMPTZ | DEFAULT now() | Subscription timestamp |
| `confirmed` | BOOLEAN | DEFAULT false | Email confirmed flag |
| `preferred_language` | TEXT | DEFAULT 'en' | Preferred language ('en' or 'pl') |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Admins only
- `INSERT`: Public (for signup form)

**Indexes:**
- `idx_newsletter_email` on `email`

---

### 9.2 Table: `contact_messages`

**Purpose:** Contact form submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Message ID |
| `name` | TEXT | NOT NULL | Sender name |
| `email` | TEXT | NOT NULL | Sender email |
| `message` | TEXT | NOT NULL | Message text |
| `status` | TEXT | DEFAULT 'new' | Status ('new', 'in_progress', 'resolved') |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Admins only
- `INSERT`: Public

**Indexes:**
- `idx_contact_messages_status` on `status`

---

## 10. Site Settings

### 10.1 Table: `general_settings`

**Purpose:** Global site settings (name, currencies, feature flags).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Settings ID (singleton) |
| `site_name` | TEXT | DEFAULT 'Spirit Candles' | Site name |
| `site_url` | TEXT | DEFAULT 'https://spirit-candle.com' | Site URL |
| `currencies` | TEXT[] | DEFAULT ['PLN', 'EUR'] | Supported currencies |
| `show_live_chat` | BOOLEAN | DEFAULT true | Live chat enabled |
| `show_floating_plus` | BOOLEAN | DEFAULT true | Floating action button enabled |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public
- `UPDATE`: Admins only

---

### 10.2 Table: `header_settings`

**Purpose:** Header configuration (logo URLs, nav items, animations).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Settings ID (singleton) |
| `mobile_logo_url` | TEXT | | Mobile logo URL |
| `mobile_logo_height` | TEXT | DEFAULT 'h-14' | Mobile logo height (Tailwind class) |
| `mobile_logo_animation` | JSONB | | Mobile logo animation config |
| `tablet_logo_url` | TEXT | | Tablet logo URL |
| `desktop_logo_url` | TEXT | | Desktop logo URL |
| `nav_items` | JSONB | | Navigation items array |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public
- `UPDATE`: Admins only

---

### 10.3 Table: `footer_settings` (multiple tables)

**Footer is split into 4 tables:**

- `footer_social_icons`: Social media links (name, icon_url, link_url, display_order)
- `footer_contact_info`: Company info (name, address, NIP, REGON, phone, email)
- `footer_disclaimers`: Legal disclaimers (inspiration notice, independent brand notice)
- `legal_documents`: Legal document links (type, title_en, title_pl, pdf_url_en, pdf_url_pl, page_route)

**RLS Policies (all):**
- `SELECT`: Public
- `INSERT/UPDATE/DELETE`: Admins only

---

### 10.4 Table: `homepage_settings`

**Purpose:** Homepage content (hero text, features, testimonials).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Settings ID (singleton) |
| `hero_text_en` | TEXT | | Hero text (English) |
| `hero_text_pl` | TEXT | | Hero text (Polish) |
| `hero_video_url` | TEXT | | Hero background video URL |
| `features_enabled` | BOOLEAN | DEFAULT true | Features section enabled |
| `testimonials_enabled` | BOOLEAN | DEFAULT true | Testimonials section enabled |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public
- `UPDATE`: Admins only

---

### 10.5 Table: `seo_settings`

**Purpose:** SEO meta tags per route.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | SEO ID |
| `route` | TEXT | UNIQUE, NOT NULL | Route path (e.g., '/', '/shop', '/about') |
| `title_en` | TEXT | NOT NULL | Page title (English) |
| `title_pl` | TEXT | NOT NULL | Page title (Polish) |
| `description_en` | TEXT | | Meta description (English) |
| `description_pl` | TEXT | | Meta description (Polish) |
| `og_image` | TEXT | | OG image URL |
| `canonical_url` | TEXT | | Canonical URL |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public
- `INSERT/UPDATE/DELETE`: Admins only

---

### 10.6 Table: `custom_candles_settings`

**Purpose:** Custom candles page configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Settings ID (singleton) |
| `intro_text_en` | TEXT | | Intro text (English) |
| `intro_text_pl` | TEXT | | Intro text (Polish) |
| `options` | JSONB | | Custom options config |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public
- `UPDATE`: Admins only

---

## 11. Email Marketing

### 11.1 Table: `email_templates`

**Purpose:** Email templates metadata (linked to Edge Functions).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Template ID |
| `template_key` | TEXT | UNIQUE, NOT NULL | Template key (e.g., 'order_confirmation') |
| `name_en` | TEXT | NOT NULL | Template name (English) |
| `name_pl` | TEXT | NOT NULL | Template name (Polish) |
| `subject_en` | TEXT | NOT NULL | Email subject (English) |
| `subject_pl` | TEXT | NOT NULL | Email subject (Polish) |
| `description_en` | TEXT | | Template description (English) |
| `description_pl` | TEXT | | Template description (Polish) |
| `is_active` | BOOLEAN | DEFAULT true | Active/inactive flag |
| `edge_function_name` | TEXT | NOT NULL | Edge Function name (e.g., 'send-order-confirmation') |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |
| `last_sent_at` | TIMESTAMPTZ | | Last sent timestamp |

**RLS Policies:**
- `SELECT/UPDATE`: Admins only

---

### 11.2 Table: `email_campaigns`

**Purpose:** Marketing email campaigns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Campaign ID |
| `name` | TEXT | NOT NULL | Campaign name |
| `subject_en` | TEXT | NOT NULL | Email subject (English) |
| `subject_pl` | TEXT | NOT NULL | Email subject (Polish) |
| `template` | TEXT | NOT NULL | Template key |
| `segment` | TEXT | | Customer segment (e.g., 'all', 'vip', 'inactive') |
| `status` | TEXT | DEFAULT 'draft' | Status ('draft', 'scheduled', 'sent') |
| `scheduled_at` | TIMESTAMPTZ | | Scheduled send timestamp |
| `sent_at` | TIMESTAMPTZ | | Actual send timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- All operations: Admins only

---

### 11.3 Table: `customer_segments`

**Purpose:** Customer segmentation rules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Segment ID |
| `name` | TEXT | NOT NULL | Segment name (e.g., 'VIP Customers') |
| `criteria` | JSONB | NOT NULL | Segmentation criteria (e.g., `{"orders": {"$gte": 5}}`) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- All operations: Admins only

---

## 12. Chat

### 12.1 Table: `chat_messages`

**Purpose:** Live chat messages (user ↔ admin).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Message ID |
| `user_id` | UUID | FK → profiles(user_id) ON DELETE CASCADE | User reference |
| `session_id` | TEXT | NOT NULL | Chat session ID |
| `message` | TEXT | NOT NULL | Message text |
| `sender` | TEXT | CHECK (sender IN ('user', 'bot', 'admin')) | Sender type |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: User can view own messages; admins can view all
- `INSERT`: User can create own messages; admins can create admin messages

**Indexes:**
- `idx_chat_session` on `session_id`
- `idx_chat_user` on `user_id`

---

### 12.2 Table: `chat_responses`

**Purpose:** Automated chat responses (triggers + responses).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Response ID |
| `trigger` | TEXT | NOT NULL | Trigger phrase (e.g., 'hello', 'help') |
| `response_en` | TEXT | NOT NULL | Response text (English) |
| `response_pl` | TEXT | NOT NULL | Response text (Polish) |
| `is_active` | BOOLEAN | DEFAULT true | Active/inactive flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS Policies:**
- `SELECT`: Public
- `INSERT/UPDATE/DELETE`: Admins only

---

## 13. RPC Functions

**RPC (Remote Procedure Call) functions** are custom PostgreSQL functions callable from the frontend via Supabase client.

### 13.1 Authentication & User Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `find_user_by_username_or_email` | `identifier TEXT` | TABLE (user_id UUID, email TEXT) | Returns user by username or email (used for login) |
| `get_current_user_role` | — | TEXT | Returns current user's role ('user' or 'admin') |
| `get_user_points` | `user_id UUID` | INTEGER | Returns user's current points balance |

### 13.2 Product & Search Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `search_products` | `query TEXT` | TABLE (products) | Full-text search across product names/descriptions (EN/PL) |
| `get_product_summary` | `product_id UUID` | JSONB | Returns product with aggregated reviews (avg rating, count) |

### 13.3 Order Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `get_order_summary` | `order_id UUID` | JSONB | Returns order with items, user, shipping info |
| `get_user_orders` | `user_id UUID` | TABLE (orders with items) | Returns all orders for user with line items |

### 13.4 Analytics Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `get_admin_stats` | — | JSONB | Returns admin dashboard stats (total orders, revenue, customers, products) |
| `get_top_products` | `limit INTEGER` | TABLE (products with sales_count) | Returns best-selling products |

**Total RPC Functions:** ~15-20 functions (estimated from migrations)

---

## 14. Triggers

**Triggers** automatically execute functions on table events (INSERT, UPDATE, DELETE).

### 14.1 Timestamp Triggers

**Function:** `update_updated_at_column()`

Auto-updates `updated_at` timestamp on row update.

**Applied to tables:**
- `products`, `profiles`, `orders`, `coupons`, `reviews`, `cart_items`, `wishlist`, `profile_comments`, `email_templates`, `footer_social_icons`, `footer_contact_info`, `footer_disclaimers`, `legal_documents`, etc.

### 14.2 Notification Triggers

| Trigger | Function | Table | Event | Description |
|---------|----------|-------|-------|-------------|
| `trigger_notify_follow` | `notify_follow()` | `profile_follows` | INSERT | Inserts notification when user A follows user B |
| `trigger_notify_unfollow` | `notify_unfollow()` | `profile_follows` | DELETE | Inserts notification when user A unfollows user B |
| `trigger_notify_comment_reaction` | `notify_comment_reaction()` | `profile_comment_reactions` | INSERT | Inserts notification when user reacts to comment |

### 14.3 Profile Creation Trigger

| Trigger | Function | Table | Event | Description |
|---------|----------|-------|-------|-------------|
| `on_auth_user_created` | `handle_new_user()` | `auth.users` | INSERT | Auto-creates profile row when user signs up |

**Total Triggers:** ~44 triggers across all tables

---

## 15. Indexes

**Indexes** improve query performance on frequently searched columns.

### 15.1 Foreign Key Indexes

- `idx_orders_user` on `orders(user_id)`
- `idx_order_items_order` on `order_items(order_id)`
- `idx_order_items_product` on `order_items(product_id)`
- `idx_cart_items_user` on `cart_items(user_id)`
- `idx_reviews_product` on `reviews(product_id)`
- `idx_reviews_user` on `reviews(user_id)`
- `idx_wishlist_user` on `wishlist(user_id)`
- `idx_profile_comments_profile` on `profile_comments(profile_user_id)`
- `idx_profile_comments_commenter` on `profile_comments(commenter_id)`
- `idx_profile_notifications_user` on `profile_notifications(user_id)`

### 15.2 Lookup Indexes

- `idx_profiles_username` on `profiles(username)`
- `idx_profiles_referral_code` on `profiles(referral_code)`
- `idx_profiles_referral_short_code` on `profiles(referral_short_code)`
- `idx_coupons_code` on `coupons(code)`
- `idx_shared_wishlists_token` on `shared_wishlists(share_token)`
- `idx_newsletter_email` on `newsletter_subscribers(email)`

### 15.3 Status Indexes

- `idx_orders_status` on `orders(status)`
- `idx_orders_shipping_status` on `orders(shipping_status)`
- `idx_orders_tracking` on `orders(tracking_number)`
- `idx_referrals_status` on `referrals(status)`
- `idx_contact_messages_status` on `contact_messages(status)`

**Total Indexes:** ~50+ indexes across all tables

---

## 16. Gaps & Recommendations

### 16.1 Security Gaps

| Gap | Severity | Recommendation |
|-----|----------|----------------|
| **No audit trail for admin actions** | Medium | Add `admin_actions` audit table to log admin changes (who, what, when) |
| **No rate limiting on RPC functions** | Medium | Implement rate limiting (Supabase Edge Functions or application-level) |
| **Public read on `coupons` table** | Low | Consider restricting `coupons.SELECT` to authenticated users only (currently public for validation) |

### 16.2 Performance Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **No pagination on large tables** | High | Implement cursor-based pagination for `orders`, `reviews`, `notifications` in admin dashboard |
| **No composite indexes for common queries** | Medium | Add composite index on `orders(user_id, status)` for user order history queries |
| **No full-text search indexes** | Medium | Add GIN indexes on `products(name_en)`, `products(description_en)` for faster search |

### 16.3 Data Integrity Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **No `deleted_at` soft delete pattern** | Low | Consider adding `deleted_at` timestamp for soft deletes instead of hard deletes |
| **No referential integrity on `order_items.product_id`** | Medium | Currently no ON DELETE action; consider SET NULL if product deleted |
| **No validation on `orders.shipping_address` JSONB** | Medium | Add CHECK constraint or validation function for required address fields |

### 16.4 Missing Features (Database-Level)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Product variants** | P2 | Add `product_variants` table for size/color variations |
| **Inventory history** | P2 | Add `inventory_history` table to track stock changes (who, when, reason) |
| **Order notes** | P3 | Add `order_notes` table for admin/internal notes on orders |
| **Customer segments automation** | P2 | Add scheduled function to auto-assign users to segments based on `customer_segments.criteria` |

### 16.5 RLS Policy Recommendations

| Table | Current | Recommendation |
|-------|---------|----------------|
| `products` | Public SELECT | ✅ Appropriate |
| `coupons` | Public SELECT | ⚠️ Consider restricting to authenticated users |
| `profiles` | Users can view own; admins can view all; public profiles visible | ✅ Appropriate |
| `orders` | Users can view own; admins can view all | ✅ Appropriate |
| `reviews` | Public SELECT (if visible); users can manage own | ✅ Appropriate |
| `wishlist` | Users can manage own | ✅ Appropriate |
| `profile_comments` | Public SELECT (if visible + profile public) | ✅ Appropriate |
| `profile_notifications` | Users can view/update own | ✅ Appropriate |

### 16.6 Migration Recommendations

1. **Consolidate migrations:** 85 migrations is manageable, but consider squashing into fewer baseline migrations for new deployments
2. **Add migration tests:** Write integration tests for critical migrations (e.g., RLS policies, triggers)
3. **Document breaking changes:** Add comments to migrations that change existing behavior

---

## Conclusion

The Spirit Candles database is **well-structured, secure, and scalable**. All tables have RLS enabled, foreign keys enforce integrity, and indexes optimize performance. The schema supports a full-featured e-commerce platform with social/gamification features, advanced analytics, and bilingual content.

**Key Strengths:**
- ✅ Comprehensive RLS policies
- ✅ Bilingual support (EN/PL) across all user-facing content
- ✅ Audit fields (`created_at`, `updated_at`) on all tables
- ✅ Proper indexing on foreign keys and lookup columns
- ✅ Realtime subscriptions for cart, wishlist, notifications

**Recommended Next Steps:**
1. Add composite indexes for common query patterns (e.g., `orders(user_id, status)`)
2. Implement audit trail for admin actions
3. Add full-text search indexes (GIN) for products
4. Consider soft delete pattern (`deleted_at`) for sensitive tables
5. Add integration tests for RLS policies

---

**Document End**

