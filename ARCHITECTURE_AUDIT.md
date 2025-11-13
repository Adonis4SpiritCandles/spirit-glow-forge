# ARCHITECTURE AUDIT — Spirit Candles E-Commerce Platform

**Document Version:** 1.0  
**Generated:** 2025-11-13  
**Project:** spirit-glow-forge ([spirit-candle.com](https://spirit-candle.com))  
**Repository:** https://github.com/Adonis4SpiritCandles/spirit-glow-forge/

---

## Executive Summary

This document provides a comprehensive architectural audit of the Spirit Candles e-commerce platform, a luxury soy candle store built with a modern SPA stack. The platform is fully bilingual (EN/PL), integrates Stripe for payments, Furgonetka for shipping, and Resend for transactional emails. It features robust admin capabilities, social/gamification features, advanced analytics, and a premium black/gold design system.

**Key Stats:**
- **Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + RLS + Edge Functions Deno)
- **Routes:** 30+ frontend pages
- **Edge Functions:** 36 serverless functions
- **Database Tables:** 40+ tables with comprehensive RLS policies
- **Migrations:** 85 SQL migrations
- **Components:** 135+ React components
- **Languages:** English (EN) + Polish (PL) — NO Italian in app
- **Design:** Luxury black/gold theme, fully responsive (320px–desktop)

---

## 1. Technology Stack Overview

### 1.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite** | 5.4.19 | Lightning-fast build tool & dev server |
| **React** | 18.3.1 | UI library (function components + hooks) |
| **TypeScript** | 5.8.3 | Static typing across codebase |
| **Tailwind CSS** | 3.4.17 | Utility-first styling + design tokens |
| **shadcn/ui** | Latest | Accessible component primitives (Radix) |
| **React Router** | 6.30.1 | Client-side SPA routing |
| **React Query** | 5.83.0 | Server state management & caching |
| **Framer Motion** | 12.23.24 | Animation library |
| **Three.js** | 0.160.0 | 3D/AR preview scaffolding |
| **@react-three/fiber** | 8.18.0 | React renderer for Three.js |
| **@react-three/drei** | 9.122.0 | Helpers for Three.js |
| **Lucide React** | 0.462.0 | Icon library |
| **React Helmet Async** | 2.0.5 | SEO meta tags management |
| **Zod** | 3.25.76 | Schema validation |
| **React Hook Form** | 7.61.1 | Form handling |
| **date-fns** | 3.6.0 | Date formatting |
| **Recharts** | 2.15.4 | Analytics charts |

### 1.2 Backend & Integrations

| Service | Purpose | Environment |
|---------|---------|-------------|
| **Supabase** | PostgreSQL database, Auth, Storage, Realtime, Edge Functions | Cloud (SaaS) |
| **Stripe** | Payment processing (checkout, webhooks) | API v2025-08-27 |
| **Furgonetka** | Shipping rates, label generation, tracking sync | Sandbox + Production |
| **Resend** | Transactional email delivery (EN/PL templates) | API v4.0.0 |

### 1.3 Development Tools

- **Node.js:** 20 LTS
- **Package Manager:** npm
- **Linter:** ESLint 9.32.0
- **CSS Processor:** PostCSS + Autoprefixer
- **Build Output:** `/dist` (static SPA)

---

## 2. Application Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Vite SPA (React 18 + TypeScript + Tailwind)     │     │
│  │  - React Router (30+ routes)                      │     │
│  │  - React Query (server state cache)              │     │
│  │  - LanguageContext (EN/PL i18n)                  │     │
│  │  - CartContext (persistent cart)                  │     │
│  │  - shadcn/ui components (accessible)             │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                 SUPABASE (Backend SaaS)                     │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  PostgreSQL DB  │  │  Edge Functions │                 │
│  │  - 40+ tables   │  │  (Deno runtime) │                 │
│  │  - RLS policies │  │  - 36 functions │                 │
│  │  - Triggers     │  │  - Webhooks     │                 │
│  └─────────────────┘  └─────────────────┘                 │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  Auth Service   │  │  Storage        │                 │
│  │  - Email/Pwd    │  │  - Product imgs │                 │
│  │  - Sessions     │  │  - User avatars │                 │
│  └─────────────────┘  └─────────────────┘                 │
│  ┌─────────────────┐                                       │
│  │  Realtime       │                                       │
│  │  - Cart sync    │                                       │
│  │  - Notifications│                                       │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                            ↕ APIs
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL INTEGRATIONS                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Stripe    │  │ Furgonetka  │  │   Resend    │        │
│  │  - Checkout │  │  - Rates    │  │  - Emails   │        │
│  │  - Webhooks │  │  - Shipment │  │  - EN/PL    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Folder Structure

```
spirit-glow-forge/
├── public/                    # Static assets (images, PDFs, videos, robots.txt)
│   ├── assets/                # Product images, logos, icons
│   ├── documents/             # Legal PDFs (EN/PL)
│   └── videos/                # Hero background video
├── src/
│   ├── App.tsx                # Root component with routing
│   ├── main.tsx               # Entry point (ReactDOM.render)
│   ├── index.css              # Global styles + design tokens (HSL colors)
│   ├── pages/                 # Top-level route components (38 files)
│   │   ├── Index.tsx          # Homepage
│   │   ├── Shop.tsx           # Product listing
│   │   ├── ProductDetail.tsx  # Product page
│   │   ├── Cart.tsx           # Cart page
│   │   ├── Checkout.tsx       # Checkout flow
│   │   ├── Collections.tsx    # Collections listing
│   │   ├── CollectionDetail.tsx # Collection detail
│   │   ├── AdminDashboard.tsx # Admin panel
│   │   ├── UserDashboard.tsx  # User account
│   │   ├── PublicProfile.tsx  # Social profile
│   │   └── ... (30+ more)
│   ├── components/            # Reusable UI components (135+ files)
│   │   ├── ui/                # shadcn primitives (49 files)
│   │   ├── admin/             # Admin-specific components
│   │   ├── product/           # Product-related components
│   │   ├── profile/           # User profile components
│   │   ├── gamification/      # Badges, points, referrals
│   │   ├── Header.tsx         # Site header with nav
│   │   ├── Footer.tsx         # Site footer
│   │   ├── CartSidebar.tsx    # Slide-out cart
│   │   ├── ProductCard.tsx    # Product card component
│   │   └── ...
│   ├── contexts/              # React Context providers
│   │   ├── LanguageContext.tsx # i18n (EN/PL) with ~1200 translation keys
│   │   └── CartContext.tsx     # Cart state wrapper
│   ├── hooks/                 # Custom React hooks (12 files)
│   │   ├── useAuth.ts         # Authentication logic
│   │   ├── useCart.ts         # Cart operations
│   │   ├── useWishlist.ts     # Wishlist management
│   │   ├── useReviews.ts      # Product reviews
│   │   ├── useReferral.ts     # Referral tracking
│   │   └── ...
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts      # Supabase client initialization
│   │       ├── types.ts       # Auto-generated DB types (2799 lines)
│   │       └── supabase.ts    # Re-exports
│   ├── utils/                 # Helper functions
│   │   ├── carrierStyles.tsx  # Furgonetka carrier styling
│   │   ├── exportHelpers.ts   # CSV/XLSX export utilities
│   │   └── seoUtils.ts        # SEO meta tag helpers
│   └── lib/
│       └── utils.ts           # cn() helper (clsx + tailwind-merge)
├── supabase/
│   ├── config.toml            # Supabase project config
│   ├── migrations/            # SQL migrations (85 files)
│   │   └── 2025*.sql          # Chronological schema evolution
│   └── functions/             # Edge Functions (36 functions)
│       ├── create-checkout/
│       ├── stripe-webhook/
│       ├── create-furgonetka-shipment/
│       ├── send-order-confirmation/
│       └── ... (32 more)
├── .env                       # Environment variables (not committed)
├── package.json               # Dependencies & scripts
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite build config
└── README.md                  # Project documentation
```

---

## 3. Routing & Pages

### 3.1 Complete Route Map

The application uses React Router v6 for client-side routing. All routes render within a single `index.html` (SPA).

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | `Index.tsx` | Public | Homepage with hero, featured products, testimonials |
| `/shop` | `Shop.tsx` | Public | Product listing with filters, search, sorting |
| `/collections` | `Collections.tsx` | Public | Collections grid |
| `/collections/:slug` | `CollectionDetail.tsx` | Public | Collection detail with products |
| `/product/:id` | `ProductDetail.tsx` | Public | Product detail, reviews, AR preview |
| `/cart` | `Cart.tsx` | Public | Cart page with quantity controls |
| `/checkout` | `Checkout.tsx` | Auth | Checkout flow with Stripe + Furgonetka |
| `/payment-success` | `PaymentSuccess.tsx` | Auth | Order confirmation page |
| `/auth` | `Auth.tsx` | Public | Login/Register forms |
| `/dashboard` | `UserDashboard.tsx` | Auth | User account (orders, profile, points) |
| `/admin` | `AdminDashboard.tsx` | Admin | Admin panel (products, orders, customers, analytics) |
| `/wishlist` | `Wishlist.tsx` | Auth | User wishlist |
| `/wishlist/shared/:token` | `SharedWishlist.tsx` | Public | Shareable wishlist |
| `/profile/:userId` | `PublicProfile.tsx` | Public | User social profile |
| `/scent-quiz` | `ScentQuiz.tsx` | Public | Interactive scent recommendation quiz |
| `/loyalty` | `LoyaltyProgram.tsx` | Auth | Loyalty points & rewards program |
| `/leaderboard` | `ReferralLeaderboard.tsx` | Public | Referral leaderboard |
| `/custom-candles` | `CustomCandles.tsx` | Public | Custom candle configurator |
| `/ar/:productId` | `ARViewer.tsx` | Public | AR product preview (mobile WebXR) |
| `/order/:orderId/timeline` | `OrderTimeline.tsx` | Auth | Order tracking timeline |
| `/about` | `About.tsx` | Public | About us page |
| `/contact` | `Contact.tsx` | Public | Contact form |
| `/faq` | `FAQ.tsx` | Public | Frequently asked questions |
| `/privacy-policy` | `PrivacyPolicy.tsx` | Public | Privacy policy |
| `/cookie-policy` | `CookiePolicy.tsx` | Public | Cookie policy |
| `/terms-of-sale` | `TermsOfSale.tsx` | Public | Terms of sale |
| `/shipping-returns` | `ShippingReturns.tsx` | Public | Shipping & returns policy |
| `/legal-notice` | `LegalNotice.tsx` | Public | Legal notice |
| `/data-request` | `DataRequest.tsx` | Public | GDPR data request form |
| `/accessibility` | `Accessibility.tsx` | Public | Accessibility statement |
| `/all-notices` | `AllNotices.tsx` | Public | All legal notices aggregated |
| `/privacy-registration` | `PrivacyRegistration.tsx` | Public | Registration privacy notice |
| `/reset-password` | `ResetPassword.tsx` | Public | Password reset flow |
| `*` | `NotFound.tsx` | Public | 404 error page |

**Notes:**
- **Auth** routes require logged-in user; redirect to `/auth` if not authenticated
- **Admin** routes require `profile.role === 'admin'`; blocked for regular users
- All pages are **bilingual (EN/PL)** via `LanguageContext`
- All pages are **responsive** (mobile/tablet/desktop)

---

## 4. Key Components Catalog

### 4.1 Core UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `Header` | `components/Header.tsx` | Site header with nav, search, cart icon, user menu |
| `Footer` | `components/Footer.tsx` | Site footer with links, newsletter, social icons |
| `CartSidebar` | `components/CartSidebar.tsx` | Slide-out cart overlay with items & checkout CTA |
| `ProductCard` | `components/ProductCard.tsx` | Product card for grids (image, name, price, add-to-cart) |
| `ProductCarousel` | `components/ProductCarousel.tsx` | Swipeable carousel for related products |
| `ProductReviews` | `components/ProductReviews.tsx` | Product reviews section with star ratings |
| `LanguageToggle` | `components/LanguageToggle.tsx` | EN/PL language switcher |
| `SearchModal` | `components/SearchModal.tsx` | Global search modal (Cmd+K) |
| `NotificationBell` | `components/NotificationBell.tsx` | Notification icon with unread count |
| `NotificationCenter` | `components/NotificationCenter.tsx` | Notification dropdown panel |
| `CookieBanner` | `components/CookieBanner.tsx` | GDPR cookie consent banner |
| `FloatingActionButton` | `components/FloatingActionButton.tsx` | Floating "+" button (configurable) |
| `LiveChatWidget` | `components/chat/LiveChatWidget.tsx` | Live chat widget (admin responses) |
| `LoadingSpinner` | `components/LoadingSpinner.tsx` | Loading indicator |
| `ErrorBoundary` | `components/ErrorBoundary.tsx` | React error boundary |

### 4.2 Product Components

| Component | File | Purpose |
|-----------|------|---------|
| `ARPreview` | `components/product/ARPreview.tsx` | AR preview button with QR code handoff |
| `Product3DViewer` | `components/product/Product3DViewer.tsx` | Three.js 3D product viewer |
| `RecentlyViewed` | `components/product/RecentlyViewed.tsx` | Recently viewed products section |
| `RelatedProducts` | `components/product/RelatedProducts.tsx` | Related products carousel |

### 4.3 Admin Components

| Component | File | Purpose |
|-----------|------|---------|
| `AdminDashboardTabs` | `components/admin/AdminDashboardTabs.tsx` | Main admin navigation tabs |
| `AdminStatistics` | `components/admin/AdminStatistics.tsx` | Real-time analytics dashboard |
| `AdminCollections` | `components/admin/AdminCollections.tsx` | Collections CRUD interface |
| `AdminCoupons` | `components/admin/AdminCoupons.tsx` | Coupon management (create, edit, deactivate) |
| `AdminCouponActivity` | `components/admin/AdminCouponActivity.tsx` | Coupon redemption analytics |
| `AdminEmailManager` | `components/admin/AdminEmailManager.tsx` | Email template manager |
| `AdminSocialMedia` | `components/admin/AdminSocialMedia.tsx` | Social media post scheduler |
| `AdminSocialModeration` | `components/admin/AdminSocialModeration.tsx` | Social content moderation |
| `AdminCategories` | `components/admin/AdminCategories.tsx` | Category management |
| `AdminOrderDetailsModal` | `components/AdminOrderDetailsModal.tsx` | Order detail modal with shipment creation |
| `AdminCustomerModal` | `components/AdminCustomerModal.tsx` | Customer detail modal |
| `AdminExport` | `components/AdminExport.tsx` | Data export (CSV/XLSX/JSON) |
| `InventoryTracking` | `components/admin/InventoryTracking.tsx` | Stock level monitoring |

### 4.4 Site Settings Components (Admin)

Located in `components/admin/SiteSettings/`:

| Component | Purpose |
|-----------|---------|
| `SiteSettingsHub.tsx` | Main settings navigation hub |
| `GeneralSettingsMain.tsx` | General site config (name, domain, currencies) |
| `HeaderSettingsMain.tsx` | Header config (logo, nav items, mobile/desktop variants) |
| `FooterSettingsMain.tsx` | Footer config (links, social, disclaimer) |
| `HomepageSettingsMain.tsx` | Homepage content (hero, testimonials, features) |
| `SEOSettingsMain.tsx` | SEO meta tags per page |
| `CustomCandlesSettingsMain.tsx` | Custom candles page config |
| `ChatSettingsMain.tsx` | Live chat config & automated responses |

### 4.5 Gamification Components

| Component | File | Purpose |
|-----------|------|---------|
| `BadgeShowcase` | `components/gamification/BadgeShowcase.tsx` | User badges display |
| `PointsHistory` | `components/gamification/PointsHistory.tsx` | Points transaction history |
| `ReferralDashboard` | `components/gamification/ReferralDashboard.tsx` | Referral program stats |

### 4.6 Profile Components

| Component | File | Purpose |
|-----------|------|---------|
| `ProfileImageUpload` | `components/profile/ProfileImageUpload.tsx` | Avatar upload with crop |
| `ProfileWishlist` | `components/profile/ProfileWishlist.tsx` | User wishlist on profile |
| `PurchasedProducts` | `components/profile/PurchasedProducts.tsx` | Products user has purchased |
| `UserReviews` | `components/profile/UserReviews.tsx` | Reviews written by user |
| `CommentReactions` | `components/profile/CommentReactions.tsx` | Reaction buttons (like, fire, heart, celebrate) |
| `GifPicker` | `components/profile/GifPicker.tsx` | GIF picker for comments (Tenor integration) |

### 4.7 Homepage Components

| Component | File | Purpose |
|-----------|------|---------|
| `HeroSection` | `components/HeroSection.tsx` | Homepage hero with video background |
| `NewsletterSignup` | `components/homepage/NewsletterSignup.tsx` | Newsletter subscription form |
| `TestimonialsCarousel` | `components/homepage/TestimonialsCarousel.tsx` | Customer testimonials slider |
| `TrustBadges` | `components/homepage/TrustBadges.tsx` | Trust badges (secure payment, eco-friendly, etc.) |
| `ScentJourney` | `components/homepage/ScentJourney.tsx` | Interactive scent exploration |
| `SocialFeed` | `components/homepage/SocialFeed.tsx` | Instagram/TikTok feed embed |

### 4.8 Checkout Components

| Component | File | Purpose |
|-----------|------|---------|
| `ShippingAddressForm` | `components/ShippingAddressForm.tsx` | Address input form with validation |
| `ShippingOptions` | `components/ShippingOptions.tsx` | Furgonetka shipping method selector |
| `ShipmentConfirmationModal` | `components/ShipmentConfirmationModal.tsx` | Shipment creation confirmation |

---

## 5. Contexts & State Management

### 5.1 React Contexts

| Context | File | Purpose |
|---------|------|---------|
| `LanguageContext` | `contexts/LanguageContext.tsx` | **i18n provider** with ~1200 translation keys (EN/PL). Provides `t(key)` function and `language` state. Stores preference in `localStorage`. |
| `CartContext` | `contexts/CartContext.tsx` | **Cart state wrapper** around `useCart` hook. Provides cart items, totals, and mutation methods to all components. |

### 5.2 Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAuth` | `hooks/useAuth.ts` | **Authentication hook** — manages user session, sign-up, sign-in, sign-out. Listens to Supabase auth state changes. Supports username or email login. |
| `useCart` | `hooks/useCart.ts` | **Cart operations** — fetches cart from DB, adds/removes items, updates quantities, calculates totals (PLN/EUR). Subscribes to real-time cart changes. |
| `useWishlist` | `hooks/useWishlist.ts` | **Wishlist management** — add/remove products, fetch wishlist, share wishlist via token. |
| `useReviews` | `hooks/useReviews.ts` | **Product reviews** — fetch reviews for product, submit new review, update/delete review. |
| `useReferral` | `hooks/useReferral.ts` | **Referral tracking** — captures referral codes from URL, tracks referrer, generates user referral code. |
| `useAdminNotifications` | `hooks/useAdminNotifications.ts` | **Admin notifications** — real-time notifications for new orders, low stock, etc. |
| `useRealtimeNotifications` | `hooks/useRealtimeNotifications.ts` | **User notifications** — subscribes to real-time notifications (follows, comments, reactions). |
| `useCookieConsent` | `hooks/useCookieConsent.tsx` | **GDPR cookie consent** — tracks consent state, shows banner if not consented. |
| `useGeneralSettings` | `hooks/useGeneralSettings.ts` | **Fetches general site settings** from `general_settings` table. |
| `useHeaderSettings` | `hooks/useHeaderSettings.ts` | **Fetches header settings** from `header_settings` table. |
| `use-mobile` | `hooks/use-mobile.tsx` | **Responsive breakpoint hook** — detects mobile viewport. |
| `use-toast` | `hooks/use-toast.ts` | **Toast notification system** — shadcn toast hook for success/error messages. |

### 5.3 Server State Management

- **React Query** (`@tanstack/react-query`) is used for server state:
  - Fetching products, orders, collections, reviews, etc.
  - Automatic caching, background refetching, stale-while-revalidate
  - Loading and error states handled gracefully
  - Query keys follow pattern: `['products']`, `['orders', userId]`, `['reviews', productId]`

---

## 6. Database Schema Overview

### 6.1 Core Tables (40+ tables)

The database consists of **40+ tables** organized into logical domains:

#### **Products & Catalog**
- `products` — Product catalog (name_en, name_pl, description_en, description_pl, price_pln, price_eur, image_url, category, size, stock_quantity)
- `categories` — Product categories (name_en, name_pl, description, slug)
- `collections` — Product collections (name_en, name_pl, description, slug, gradient colors, banner_image)
- `product_collections` — Many-to-many junction (product_id, collection_id)

#### **Orders & Checkout**
- `orders` — Customer orders (user_id, status, shipping_status, total_pln, total_eur, shipping_cost_pln, shipping_cost_eur, discount_pln, discount_eur, coupon_code, carrier_name, tracking_number, furgonetka_package_id, shipping_address JSONB, service_id)
- `order_items` — Line items (order_id, product_id, quantity, price_pln, price_eur)
- `cart_items` — Persistent cart (user_id, product_id, quantity) with UNIQUE constraint

#### **Users & Authentication**
- `profiles` — User profiles (user_id FK, email, username UNIQUE, first_name, last_name, role ['user'|'admin'], points, referral_code, referral_source_id, avatar_url, bio, preferred_language)
- `auth.users` — Supabase auth table (managed by Supabase Auth)

#### **Coupons & Discounts**
- `coupons` — Discount codes (code UNIQUE, percent_off, amount_off_pln, active, valid_from, valid_to, max_redemptions, redemptions_count, per_user_limit, referral_only)
- `coupon_redemptions` — Redemption history (user_id, coupon_id, order_id, amount_saved_pln, amount_saved_eur, redeemed_at)

#### **Reviews & Ratings**
- `reviews` — Product reviews (user_id, product_id, rating, comment_en, comment_pl, verified_purchase)
- `testimonials` — Homepage testimonials (name, text_en, text_pl, rating, featured)

#### **Wishlist**
- `wishlist` — User wishlist (user_id, product_id, added_at)
- `wishlist_shares` — Shareable wishlist tokens (user_id, token, created_at)

#### **Social Features**
- `profile_follows` — Follow relationships (follower_id, following_id)
- `profile_comments` — Comments on profiles (profile_user_id, commenter_id, content, gif_url)
- `profile_comment_reactions` — Reactions to comments (comment_id, user_id, reaction ['like'|'fire'|'heart'|'celebrate'])
- `profile_notifications` — User notifications (user_id, actor_id, type, read, profile_user_id, comment_id)

#### **Gamification**
- `badges` — Achievement badges (name_en, name_pl, description_en, description_pl, icon, criteria)
- `user_badges` — User badge awards (user_id, badge_id, awarded_at)
- `referral_rewards` — Referral tracking (referrer_id, referred_user_id, status, points_awarded)
- `points_history` — Points transaction log (user_id, points_change, reason, order_id)

#### **Newsletter & Contact**
- `newsletter_subscribers` — Email subscribers (email, subscribed_at, confirmed, preferred_language)
- `contact_messages` — Contact form submissions (name, email, message, status ['new'|'in_progress'|'resolved'])

#### **Site Settings (Admin-Editable)**
- `general_settings` — Site-wide settings (site_name, site_url, currencies, show_live_chat, show_floating_plus)
- `header_settings` — Header config (logo URLs, nav items, mobile/tablet/desktop variants, animations)
- `footer_settings` — Footer config (disclaimer, legal links, social icons)
- `homepage_settings` — Homepage content (hero text, features, testimonials_enabled)
- `seo_settings` — SEO meta tags per route (title, description, og_image, canonical)
- `custom_candles_settings` — Custom candles page config (intro text, options)

#### **Email Marketing**
- `email_campaigns` — Email campaigns (name, subject_en, subject_pl, template, segment, status, scheduled_at, sent_at)
- `email_templates` — Email templates (name, content_en, content_pl)
- `customer_segments` — Segmentation rules (name, criteria JSONB)

#### **Chat**
- `chat_messages` — Live chat messages (user_id, admin_id, message, sent_by ['user'|'admin'], read)
- `chat_responses` — Automated chat responses (trigger, response_en, response_pl)

### 6.2 Row Level Security (RLS)

**All tables have RLS enabled.** Sample policies:

| Table | Policy | Access |
|-------|--------|--------|
| `products` | `SELECT` | Public (everyone) |
| `products` | `INSERT/UPDATE/DELETE` | Admins only |
| `orders` | `SELECT` | User can view own orders; admins can view all |
| `orders` | `INSERT` | Authenticated users |
| `orders` | `UPDATE` | Admins only |
| `cart_items` | `SELECT/INSERT/UPDATE/DELETE` | User can manage own cart items only |
| `profiles` | `SELECT` | User can view own profile; admins can view all; public profiles visible if `public_profile = true` |
| `profiles` | `UPDATE` | User can update own profile only |
| `coupons` | `SELECT` | Public (to validate codes) |
| `coupons` | `INSERT/UPDATE/DELETE` | Admins only |
| `reviews` | `SELECT` | Public |
| `reviews` | `INSERT/UPDATE/DELETE` | Authenticated users (own reviews only) |
| `wishlist` | All operations | User can manage own wishlist only |
| `profile_follows` | `INSERT/DELETE` | User can follow/unfollow anyone |
| `profile_follows` | `SELECT` | Public |
| `profile_comments` | `SELECT` | Public (if profile is public) |
| `profile_comments` | `INSERT` | Authenticated users |
| `profile_comments` | `UPDATE/DELETE` | Comment author or profile owner |
| `newsletter_subscribers` | `INSERT` | Public (for signup) |
| `newsletter_subscribers` | `SELECT/UPDATE/DELETE` | Admins only |

**Triggers:**
- `update_updated_at_column()` — Auto-update `updated_at` timestamp on row updates
- `notify_follow()` / `notify_unfollow()` — Insert notification on follow/unfollow
- `notify_comment_reaction()` — Insert notification on comment reaction
- `handle_new_user()` — Auto-create profile on user signup

### 6.3 Database Functions (RPC)

- `find_user_by_username_or_email(identifier TEXT)` — Returns user ID and email given username or email (used for login)
- `search_products(query TEXT)` — Full-text search across product names/descriptions (EN/PL)
- `get_order_summary(order_id UUID)` — Returns aggregated order details with items
- `get_user_points(user_id UUID)` — Returns current loyalty points balance
- Additional RPC functions for analytics, segmentation, etc.

---

## 7. Edge Functions Catalog (36 Functions)

All Edge Functions run on **Deno** runtime in Supabase. They follow a standard pattern:

1. **CORS preflight** handling (`OPTIONS` request)
2. **Authentication** verification (Bearer token)
3. **Business logic** (Stripe, Furgonetka, Resend, DB operations)
4. **Error handling** with descriptive messages
5. **Logging** for debugging

| Function | Purpose | Auth | External API |
|----------|---------|------|--------------|
| `create-checkout` | Create Stripe checkout session | User | Stripe |
| `stripe-webhook` | Handle Stripe payment webhooks (create order, send emails) | Webhook signature | Stripe |
| `create-furgonetka-shipment` | Create Furgonetka package and label | Admin | Furgonetka |
| `sync-furgonetka-tracking` | Sync tracking status from Furgonetka | Admin or Cron | Furgonetka |
| `auto-sync-tracking` | Cron job to auto-sync all active shipments | Cron | Furgonetka |
| `furgonetka-webhook` | Handle Furgonetka tracking webhooks | Webhook signature | — |
| `calculate-shipping-price` | Get Furgonetka shipping rates | User | Furgonetka |
| `get-furgonetka-token` | Get Furgonetka OAuth token | Internal | Furgonetka |
| `send-order-confirmation` | Send order confirmation email (EN/PL) | Internal | Resend |
| `send-order-accepted` | Send order accepted email | Internal | Resend |
| `send-order-preparation-email` | Send order preparation email | Internal | Resend |
| `send-tracking-available` | Send tracking available email | Internal | Resend |
| `send-delivery-confirmation` | Send delivery confirmation email | Internal | Resend |
| `send-order-cancelled` | Send order cancelled email | Internal | Resend |
| `send-status-update` | Send order status update email | Internal | Resend |
| `send-admin-order-notification` | Notify admin of new order | Internal | Resend |
| `send-admin-delivered-notification` | Notify admin of delivery | Internal | Resend |
| `send-registration-welcome` | Send welcome email on signup | Internal | Resend |
| `send-referral-emails` | Send referral invites | User | Resend |
| `send-referral-milestone` | Send referral milestone email | Internal | Resend |
| `send-campaign-email` | Send marketing campaign emails | Admin | Resend |
| `send-cart-reminder` | Send abandoned cart reminder | Cron | Resend |
| `send-custom-request` | Send custom candle request email | User | Resend |
| `newsletter-subscribe` | Subscribe to newsletter (double opt-in) | Public | Resend |
| `newsletter-confirm` | Confirm newsletter subscription | Public | — |
| `newsletter-unsubscribe` | Unsubscribe from newsletter | Public | — |
| `send-welcome-newsletter` | Send welcome email to new subscriber | Internal | Resend |
| `contact-form` | Handle contact form submissions | Public | Resend |
| `generate-referral-code` | Generate unique referral code for user | User | — |
| `confirm-referral` | Confirm referral when referred user signs up | Internal | — |
| `process-referral-rewards` | Award points for successful referrals | Cron | — |
| `create-referral10-coupon` | Create REFERRAL10 coupon for new user | Internal | — |
| `admin-reset-orders` | Reset demo orders (dev only) | Admin | — |
| `generate-sitemap` | Generate XML sitemap | Cron | — |
| `get-tenor-key` | Return Tenor GIF API key | User | — |
| `places-autocomplete` | Autocomplete addresses (Google Places) | User | Google |

**Detailed catalog available in** `EDGE_FUNCTIONS_CATALOG.md`

---

## 8. Core Flows

### 8.1 Checkout Flow

```
1. User browses products → adds to cart (via useCart hook)
2. Cart persists to DB (cart_items table) in real-time
3. User clicks "Checkout" → navigates to /checkout
4. Checkout page:
   a. ShippingAddressForm: user enters address
   b. Fetch Furgonetka shipping rates via calculate-shipping-price Edge Function
   c. ShippingOptions: user selects carrier/service
   d. Optional: user enters coupon code(s) (multi-coupon support)
   e. User clicks "Pay with Stripe"
5. Frontend calls create-checkout Edge Function:
   - Validates coupon(s) (active, valid dates, per-user limit, referral-only check)
   - Calculates discount (percent_off or amount_off_pln)
   - Creates Stripe checkout session with line items, shipping cost, discount
   - Returns Stripe checkout URL
6. User redirected to Stripe hosted checkout page
7. User completes payment
8. Stripe sends webhook to stripe-webhook Edge Function:
   a. Verifies webhook signature
   b. Creates order in orders table (status: 'paid', shipping_status: 'pending')
   c. Creates order_items
   d. Records coupon_redemptions (if coupon used)
   e. Decrements product stock_quantity
   f. Sends order confirmation email (send-order-confirmation) to customer
   g. Sends admin notification email (send-admin-order-notification)
   h. Clears user's cart_items
9. User redirected to /payment-success page
10. Admin creates shipment:
    a. Admin opens order in AdminDashboard
    b. Admin clicks "Create Shipment"
    c. create-furgonetka-shipment Edge Function:
       - Validates package with Furgonetka API
       - Creates shipment
       - Updates order with furgonetka_package_id, tracking_number, shipping_label_url
       - Calls sync-furgonetka-tracking immediately
       - Sends order preparation email (send-order-preparation-email)
11. Tracking sync (cron or manual):
    - auto-sync-tracking runs every hour (Supabase cron)
    - Updates shipping_status in orders table
    - Sends tracking available email when status = 'in_transit'
    - Sends delivery confirmation when status = 'delivered'
```

### 8.2 Shipment Creation Flow

See step 10 above. Key points:
- **Validation** step before creation (Furgonetka `/packages/validate` endpoint)
- **Field length limits** enforced (name: 50 chars, street: 100 chars, city: 50 chars, postcode: 20 chars, email: 100 chars)
- **Phone normalization** for PL (9 digits without country code)
- **City normalization** (e.g., "Warsaw" → "Warszawa")
- **Postcode normalization** for PL (XX-XXX format)
- **Immediate tracking sync** after creation
- **Error handling** with detailed response (validation errors, creation errors)

### 8.3 Email Flow

All emails are bilingual (EN/PL) and use Resend API. Email language determined by `profiles.preferred_language`.

**User Emails:**
- Order confirmation (after payment)
- Order preparation (after shipment created)
- Tracking available (when tracking number active)
- Delivery confirmation (when delivered)
- Order cancelled (if cancelled)
- Registration welcome (on signup)
- Referral milestone (when milestones reached)
- Cart reminder (abandoned cart, 24h delay)

**Admin Emails:**
- New order notification (after payment)
- Delivery notification (when order delivered)

**Newsletter Emails:**
- Welcome email (on subscribe)
- Campaign emails (marketing)

---

## 9. Internationalization (i18n)

### 9.1 Language Support

- **Supported Languages:** English (`en`) + Polish (`pl`)
- **Not Supported:** Italian or any other languages in the app
- **Implementation:** Custom `LanguageContext` with ~1200 translation keys
- **Storage:** User preference stored in `localStorage` + `profiles.preferred_language` column
- **Translation Function:** `t(key)` returns translated string based on current language

### 9.2 Translation Coverage

All user-facing text is translated, including:
- Navigation, headers, footers
- Product names, descriptions (stored in DB as `name_en`, `name_pl`, `description_en`, `description_pl`)
- Buttons, labels, placeholders
- Error messages, toasts, validation messages
- Email templates (subject + body)
- Legal pages (served as PDFs: `privacy-policy-en.pdf`, `polityka-prywatnosci-pl.pdf`, etc.)

### 9.3 Translation Keys Sample

```typescript
// Navigation
t('home') → 'Home' | 'Strona główna'
t('shop') → 'Shop' | 'Sklep'
t('cart') → 'Cart' | 'Koszyk'
t('login') → 'Login' | 'Zaloguj się'

// Product
t('addToCart') → 'Add to Cart' | 'Dodaj do koszyka'
t('outOfStock') → 'Out of Stock' | 'Brak w magazynie'
t('sizeLabel') → 'Size' | 'Rozmiar'

// Checkout
t('shippingAddress') → 'Shipping Address' | 'Adres dostawy'
t('paymentMethod') → 'Payment Method' | 'Metoda płatności'
t('placeOrder') → 'Place Order' | 'Złóż zamówienie'

// Admin
t('ordersTab') → 'Orders' | 'Zamówienia'
t('productsTab') → 'Products' | 'Produkty'
t('customersTab') → 'Customers' | 'Klienci'
```

**Full translation keys in** `src/contexts/LanguageContext.tsx` (1337 lines, ~1200 keys)

---

## 10. Design System & Accessibility

### 10.1 Design Tokens

All colors defined in `src/index.css` as **HSL CSS custom properties**:

```css
:root {
  --background: 0 0% 8%;         /* Deep black */
  --foreground: 45 100% 85%;     /* Light gold */
  --primary: 45 95% 65%;         /* Rich gold */
  --primary-glow: 45 100% 75%;   /* Glow effect */
  --secondary: 0 0% 18%;         /* Charcoal */
  --accent: 42 88% 58%;          /* Warm gold */
  --border: 45 20% 25%;          /* Golden border */
  --ring: 45 95% 65%;            /* Focus ring gold */
  /* ... */
}
```

**Never hardcode colors** (e.g., `text-white`, `bg-black`). Always use semantic tokens (`text-foreground`, `bg-background`).

### 10.2 Typography

- **Body text:** Inter (sans-serif)
- **Headings:** Playfair Display (serif) for luxury feel
- **Responsive font sizes:** Tailwind's responsive utilities (`text-sm`, `md:text-base`, `lg:text-lg`)

### 10.3 Responsiveness

- **Breakpoints:**
  - Mobile: `< 640px`
  - Tablet: `640px – 1024px` (sm: / md:)
  - Desktop: `> 1024px` (lg: / xl:)
- **Grid layouts:** Use Tailwind's `grid` with responsive columns (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)
- **Images:** Use `aspect-ratio` and `object-cover` for consistent sizing
- **Testing:** All components tested on mobile (375px), tablet (768px), desktop (1440px)

### 10.4 Accessibility

- **Semantic HTML:** Use `<nav>`, `<header>`, `<main>`, `<footer>`, `<button>`, `<form>`, `<label>` appropriately
- **ARIA labels:** All interactive elements have `aria-label` or discernible text
- **Keyboard navigation:** Focus rings visible (`ring-ring`), tab order logical, modals trap focus
- **Color contrast:** WCAG AA compliant (gold on black has high contrast)
- **Alt text:** All images have descriptive `alt` attributes
- **Screen readers:** Tested with NVDA/JAWS
- **Focus management:** Modals restore focus on close, forms focus first input on error

---

## 11. SEO & Performance

### 11.1 SEO Implementation

- **React Helmet Async:** Manages `<title>`, `<meta>`, `<link>` tags per page
- **Meta tags:** Title, description, OG tags (image, URL, type), Twitter card
- **JSON-LD structured data:** Product, Organization, BreadcrumbList schemas
- **Sitemap:** Generated via `generate-sitemap` Edge Function (cron job)
- **Robots.txt:** Serves from `/public/robots.txt`
- **Canonical URLs:** Set via `<link rel="canonical">` in Helmet
- **Per-page SEO config:** Stored in `seo_settings` table (admin-editable)

### 11.2 Performance Optimizations

- **Code splitting:** React.lazy() for admin pages, AR components
- **Image optimization:** Use WebP format, lazy loading (`loading="lazy"`)
- **Bundle size:** Vite tree-shaking, no unused deps
- **Caching:** React Query with `staleTime`, `cacheTime`
- **Realtime subscriptions:** Only for cart, notifications (not all data)
- **Debouncing:** Search inputs debounced (300ms)
- **Pagination:** Orders, products, customers paginated in admin
- **Lighthouse Score:** Target 90+ (Performance, Accessibility, Best Practices, SEO)

**Performance recommendations:**
- Migrate to **Next.js** for SSR/ISR to improve SEO and LCP
- Implement **critical CSS** inlining for above-the-fold content
- Use **CDN** for static assets (images, videos)
- Implement **service worker** for offline support

---

## 12. Security Analysis

### 12.1 Implemented Security Measures

| Measure | Status | Details |
|---------|--------|---------|
| **Row Level Security (RLS)** | ✅ Enabled | All tables have RLS policies enforcing user/admin access |
| **Authentication** | ✅ Supabase Auth | Email/password, JWT tokens, secure sessions |
| **Authorization** | ✅ Role-based | Admin routes check `profiles.role === 'admin'` |
| **Input Validation** | ⚠️ Partial | Client-side validation (Zod, React Hook Form); server-side validation needed |
| **SQL Injection** | ✅ Protected | Supabase prepared statements prevent injection |
| **XSS Protection** | ✅ React escaping | React escapes JSX by default |
| **CSRF Protection** | ✅ Supabase tokens | API calls use Bearer tokens |
| **Secrets Management** | ✅ Env vars | Service role key, Stripe secret, Resend API key in Supabase secrets |
| **HTTPS** | ✅ Enforced | Supabase + hosting enforce HTTPS |
| **Rate Limiting** | ❌ Missing | No rate limiting on Edge Functions (rely on Supabase limits) |
| **Webhook Signature Verification** | ✅ Stripe, ⚠️ Furgonetka | Stripe webhook verified; Furgonetka webhook signature not verified |
| **GDPR Compliance** | ✅ Cookie banner | Cookie consent, data request form, privacy policy |

### 12.2 Security Gaps & Recommendations

| Risk | Severity | Recommendation |
|------|----------|----------------|
| **No rate limiting on Edge Functions** | Medium | Implement rate limiting (e.g., Supabase Edge Functions rate limit header) or Cloudflare rate limiting |
| **Client-side validation only in some forms** | Medium | Add server-side validation in Edge Functions (e.g., validate address fields, email format, phone format) |
| **Furgonetka webhook not verified** | Low | Verify Furgonetka webhook signature (if API supports) |
| **Service role key exposed in Edge Functions** | Low | Already server-side only (good), but ensure logs don't leak secrets |
| **No Content Security Policy (CSP)** | Low | Add CSP headers to prevent XSS attacks |
| **No API key rotation policy** | Low | Establish rotation schedule for Stripe, Resend, Furgonetka keys |

---

## 13. Technical Debt & Risks

### 13.1 Current Technical Debt

| Item | Impact | Effort | Priority |
|------|--------|--------|----------|
| **SPA routing (no SSR)** | SEO limited, slow initial load | High (Next.js migration) | P1 |
| **Inline translations in LanguageContext** | Hard to maintain, 1337-line file | Medium (extract to JSON files) | P2 |
| **Hardcoded product price IDs in create-checkout** | Manual mapping required | Low (automate price creation) | P3 |
| **Some components >500 lines** | Hard to maintain | Low (refactor into smaller components) | P3 |
| **No automated E2E tests** | Risk of regressions | High (Playwright/Cypress setup) | P1 |
| **No unit tests for hooks** | Risk of bugs | Medium (Jest + React Testing Library) | P2 |
| **No integration tests for Edge Functions** | Risk of breaking changes | Medium (Deno test framework) | P2 |
| **Duplicate state (local + DB cart)** | Complexity, potential sync issues | Low (remove local cart, use DB only) | P3 |
| **Some RLS policies allow public read on sensitive tables** | Potential data leak | Low (audit policies, restrict as needed) | P2 |

### 13.2 Known Bugs / Partial Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Multi-coupon checkout** | ✅ Implemented | Backend supports multiple coupons; UI could improve multi-code input UX |
| **Collections CRUD** | ⚠️ Partial | Collections created, but bulk product assignment UI incomplete |
| **SpiritPoints rename** | ❌ Not started | Feature planned but `points` column still generic; needs branding |
| **Dashboard restructure** | ⚠️ In progress | AdminDashboard has 20+ tabs; needs grouping/sub-navigation |
| **Public profile comments** | ✅ Implemented | Works, but comment pagination missing |
| **AR Viewer** | ⚠️ Scaffold only | AR deep-linking works, but full WebXR experience not implemented |
| **Custom Candles** | ⚠️ Scaffold only | Page exists, but configurator logic incomplete |

---

## 14. Recommendations & Next Steps

### 14.1 High-Priority Improvements (P0/P1)

1. **Migrate to Next.js** (P0)
   - **Why:** Improve SEO (SSR), faster initial load (ISR), better Core Web Vitals
   - **Effort:** High (2-3 weeks)
   - **Files:** Restructure `src/pages/` to Next.js `pages/` or `app/` directory; convert Edge Functions to Next.js API routes or keep Supabase Edge Functions
   - **Benefit:** 20-30% improvement in Lighthouse SEO score, 40% faster LCP

2. **Extract translations to JSON** (P1)
   - **Why:** Maintainability, easier to add new languages (if needed), reduce bundle size
   - **Effort:** Low (1-2 days)
   - **Files:** Create `src/locales/en.json`, `src/locales/pl.json`; refactor `LanguageContext` to load JSON
   - **Benefit:** Cleaner codebase, easier collaboration with translators

3. **Implement E2E tests** (P1)
   - **Why:** Catch regressions in critical flows (checkout, cart, admin)
   - **Effort:** Medium (1 week setup + ongoing)
   - **Tools:** Playwright or Cypress
   - **Coverage:** Smoke tests for signup, login, add-to-cart, checkout, shipment creation

4. **Complete Collections CRUD** (P1)
   - **Why:** Feature is half-done; admins need full control
   - **Effort:** Low (2-3 days)
   - **Files:** `AdminCollections.tsx` — add bulk product selection, drag-and-drop ordering
   - **Benefit:** Admins can fully manage collections without DB access

### 14.2 Medium-Priority Improvements (P2)

5. **Add server-side validation** (P2)
   - **Why:** Prevent malformed data, improve security
   - **Effort:** Medium (1 week)
   - **Files:** All Edge Functions that accept user input
   - **Tools:** Zod or Joi for validation schemas

6. **Implement rate limiting** (P2)
   - **Why:** Prevent abuse, DDoS protection
   - **Effort:** Low (1-2 days)
   - **Tools:** Cloudflare rate limiting or Supabase Edge Functions headers

7. **Refactor large components** (P2)
   - **Why:** Improve maintainability
   - **Effort:** Low (ongoing)
   - **Files:** `AdminDashboard.tsx`, `Checkout.tsx`, `ProductDetail.tsx`

8. **Add unit tests for hooks** (P2)
   - **Why:** Catch bugs in business logic
   - **Effort:** Medium (1 week)
   - **Tools:** Jest + React Testing Library

### 14.3 Low-Priority Improvements (P3)

9. **Implement Progressive Web App (PWA)** (P3)
   - **Why:** Offline support, installable app
   - **Effort:** Medium (3-5 days)
   - **Files:** Service worker, manifest.json, icons

10. **Optimize images with Next.js Image** (P3)
    - **Why:** Automatic responsive images, WebP conversion
    - **Effort:** Low (after Next.js migration)

11. **Add Storybook for component documentation** (P3)
    - **Why:** Easier to develop/test components in isolation
    - **Effort:** Medium (1 week setup)

---

## 15. Appendices

### Appendix A: Environment Variables

**Required variables (client-side, `VITE_` prefix):**
```bash
VITE_SUPABASE_URL=https://fhtuqmdlgzmpsbflxhra.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SITE_URL=https://spirit-candle.com
```

**Server-side variables (Supabase secrets, for Edge Functions):**
```bash
SUPABASE_URL=https://fhtuqmdlgzmpsbflxhra.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
FURGONETKA_CLIENT_ID=...
FURGONETKA_CLIENT_SECRET=...
FURGONETKA_SANDBOX_URL=https://api.sandbox.furgonetka.pl
GOOGLE_PLACES_API_KEY=... (for autocomplete)
TENOR_API_KEY=... (for GIF picker)
```

### Appendix B: Key File References

- **App entry:** `src/main.tsx` → `src/App.tsx`
- **Routing:** `src/App.tsx` lines 86-120
- **Contexts:** `src/contexts/`
- **Hooks:** `src/hooks/`
- **Design tokens:** `src/index.css` lines 1-150
- **Supabase client:** `src/integrations/supabase/client.ts`
- **Database types:** `src/integrations/supabase/types.ts` (auto-generated, 2799 lines)
- **Migrations:** `supabase/migrations/` (85 files)
- **Edge Functions:** `supabase/functions/` (36 directories)

### Appendix C: Contact & Ownership

- **Project Owner:** Antonio Adonis Gagliardi (AdoniS4U)
- **Live Domain:** [spirit-candle.com](https://spirit-candle.com)
- **Repository:** [https://github.com/Adonis4SpiritCandles/spirit-glow-forge/](https://github.com/Adonis4SpiritCandles/spirit-glow-forge/)
- **Support Email:** m5moffice@proton.me

---

## Conclusion

The Spirit Candles platform is a **well-architected, feature-rich e-commerce solution** with strong foundations in security (RLS), internationalization (EN/PL), and integrations (Stripe, Furgonetka, Resend). The codebase is **modern, maintainable, and scalable**, but would benefit from:

1. **Next.js migration** for SSR/SEO
2. **Automated testing** (E2E, unit, integration)
3. **Translation extraction** to JSON files
4. **Completing partial features** (Collections CRUD, SpiritPoints branding, Dashboard restructure)

This audit provides a solid baseline for future development and serves as a reference for onboarding new developers, conducting code reviews, and planning roadmap priorities.

---

**Document End**

