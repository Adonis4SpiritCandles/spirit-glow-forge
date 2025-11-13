# TASKS BACKLOG — Spirit Candles Development Roadmap

**Document Version:** 1.0  
**Generated:** 2025-11-13  
**Project:** spirit-glow-forge  
**Status:** Active Development

---

## Executive Summary

This document provides a **prioritized roadmap** of features, improvements, and technical debt to address in the Spirit Candles e-commerce platform. Tasks are categorized by priority (P0/P1/P2) with effort estimates, impact analysis, acceptance criteria, risks, and affected files/modules.

**Priority Levels:**
- **P0 (Critical):** Blockers, security issues, major bugs — Fix immediately
- **P1 (High):** Important features, performance improvements — Next sprint
- **P2 (Medium):** Nice-to-have features, minor bugs — Backlog
- **P3 (Low):** Future enhancements, experimental features — Deferred

**Effort Estimates:**
- **S (Small):** 1-2 days (1 developer)
- **M (Medium):** 3-5 days (1 developer)
- **L (Large):** 1-2 weeks (1 developer)
- **XL (Extra Large):** 3+ weeks (1 developer or team)

---

## Table of Contents

1. [P0 — Critical Tasks](#1-p0--critical-tasks)
2. [P1 — High-Priority Tasks](#2-p1--high-priority-tasks)
3. [P2 — Medium-Priority Tasks](#3-p2--medium-priority-tasks)
4. [P3 — Low-Priority Tasks](#4-p3--low-priority-tasks)
5. [Technical Debt](#5-technical-debt)
6. [Partial Features (In Progress)](#6-partial-features-in-progress)

---

## 1. P0 — Critical Tasks

### Task 1.1: Implement Rate Limiting on Public Edge Functions

**Priority:** P0  
**Effort:** M (3-5 days)  
**Impact:** High — Prevents abuse, DDoS, spam

**Goal:**  
Implement rate limiting on public Edge Functions to prevent abuse (newsletter spam, contact form spam, shipping rate abuse).

**Why:**  
Currently, no rate limiting exists on public endpoints like `newsletter-subscribe`, `contact-form`, `calculate-shipping-price`, `places-autocomplete`. This poses a security risk (DDoS, spam, API abuse).

**Acceptance Criteria:**
- [ ] Rate limiting implemented on:
  - `newsletter-subscribe` (5 requests/hour per IP)
  - `contact-form` (3 requests/hour per IP)
  - `calculate-shipping-price` (20 requests/hour per IP)
  - `places-autocomplete` (30 requests/hour per IP)
- [ ] 429 Too Many Requests response returned when limit exceeded
- [ ] Rate limit headers returned (`X-RateLimit-Limit`, `X-RateLimit-Remaining`)
- [ ] Admin endpoints exempt from rate limiting
- [ ] Rate limit counters stored in Redis or Supabase

**Risks:**
- Legitimate users may be blocked if rate limits too strict
- Redis dependency (if using Redis for counters)

**Files/Modules:**
- `supabase/functions/newsletter-subscribe/index.ts`
- `supabase/functions/contact-form/index.ts`
- `supabase/functions/calculate-shipping-price/index.ts`
- `supabase/functions/places-autocomplete/index.ts`
- New: `supabase/functions/_shared/rate-limiter.ts` (shared utility)

---

### Task 1.2: Fix Furgonetka Webhook Signature Verification

**Priority:** P0  
**Effort:** S (1-2 days)  
**Impact:** High — Security vulnerability

**Goal:**  
Verify Furgonetka webhook signatures to prevent unauthorized tracking status updates.

**Why:**  
Currently, `furgonetka-webhook` Edge Function does not verify webhook signatures. An attacker could send fake tracking updates.

**Acceptance Criteria:**
- [ ] Research Furgonetka webhook signature algorithm (if available)
- [ ] Implement signature verification in `furgonetka-webhook` Edge Function
- [ ] Return 401 Unauthorized if signature invalid
- [ ] Document signature verification in `EDGE_FUNCTIONS_CATALOG.md`

**Risks:**
- Furgonetka API may not provide signature verification (check docs)
- If no signature available, implement IP whitelist instead

**Files/Modules:**
- `supabase/functions/furgonetka-webhook/index.ts`

---

## 2. P1 — High-Priority Tasks

### Task 2.1: Migrate to Next.js (SSR/ISR)

**Priority:** P1  
**Effort:** XL (4-6 weeks)  
**Impact:** Very High — 30-40% LCP improvement, better SEO, better UX

**Goal:**  
Migrate from Vite SPA to Next.js with Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR) for improved SEO and performance.

**Why:**  
Current SPA architecture limits SEO potential (slow initial load, delayed rendering for crawlers). Next.js SSR/ISR solves this with:
- Server-rendered HTML (instant content for crawlers)
- Faster LCP (30-40% improvement)
- Better social media previews (OG meta tags render immediately)
- CDN caching with ISR (revalidate every hour)

**Acceptance Criteria:**
- [ ] Create `pages/` directory (Next.js routing)
- [ ] Migrate all `src/pages/*.tsx` to Next.js pages
- [ ] Convert React Router `<Link>` → Next.js `<Link>`
- [ ] Implement `getStaticProps` for static pages (Homepage, About, FAQ)
- [ ] Implement `getServerSideProps` for dynamic pages (ProductDetail, CollectionDetail)
- [ ] Enable ISR with `revalidate: 3600` (1 hour)
- [ ] Set up `next.config.js` (i18n, Tailwind, env vars, image optimization)
- [ ] Test all routes (ensure SSR works)
- [ ] Deploy to Vercel or self-hosted Next.js
- [ ] Lighthouse Performance score ≥ 90

**Risks:**
- Large refactor (4-6 weeks effort)
- Potential breaking changes in routing
- Stripe/Furgonetka integrations may need adjustments
- Edge Functions remain on Supabase (no migration needed)

**Files/Modules:**
- **All** `src/pages/*.tsx` files → migrate to `pages/*.tsx`
- `src/App.tsx` → remove (Next.js handles routing)
- `src/main.tsx` → replace with `pages/_app.tsx`
- New: `next.config.js`, `pages/_document.tsx`
- Update: `package.json` (replace Vite with Next.js)

**Related Tasks:**
- Task 2.2: Optimize images with Next.js Image
- Task 2.3: Implement critical CSS inlining

---

### Task 2.2: Optimize Images with Next.js Image Component

**Priority:** P1 (after Next.js migration)  
**Effort:** M (3-5 days)  
**Impact:** High — 20-30% LCP improvement

**Goal:**  
Replace all `<img>` tags with Next.js `<Image>` component for automatic optimization (WebP conversion, responsive sizing, lazy loading).

**Why:**  
Current images are not optimized (PNG/JPG, not responsive, no lazy loading). Next.js Image component provides:
- Automatic WebP conversion
- Responsive images (srcset)
- Lazy loading (below fold)
- Blur placeholder (LQIP)

**Acceptance Criteria:**
- [ ] Replace all `<img>` tags with `<Image>` from `next/image`
- [ ] Configure `next.config.js` with image domains (Supabase Storage)
- [ ] Use `fill` prop for fluid images, `width`/`height` for fixed
- [ ] Add blur placeholders for product images
- [ ] Verify images load correctly on mobile/tablet/desktop
- [ ] Lighthouse Performance score improves by ≥ 10 points

**Files/Modules:**
- `src/components/ProductCard.tsx`
- `src/pages/ProductDetail.tsx`
- `src/components/HeroSection.tsx`
- All components with `<img>` tags

---

### Task 2.3: Extract i18n Translations to JSON Files

**Priority:** P1  
**Effort:** M (3-5 days)  
**Impact:** Medium — Improved maintainability

**Goal:**  
Extract inline translations from `LanguageContext.tsx` (1337 lines) to separate JSON files (`en.json`, `pl.json`) for easier maintenance and collaboration with translators.

**Why:**  
Current approach (inline translations in context) is hard to maintain, makes the file too large, and is not translator-friendly. Separate JSON files solve this.

**Acceptance Criteria:**
- [ ] Create `src/locales/en.json` with all English translations
- [ ] Create `src/locales/pl.json` with all Polish translations
- [ ] Refactor `LanguageContext.tsx` to load JSON files
- [ ] Update `t(key)` function to read from JSON
- [ ] Ensure all existing translation keys work (no broken translations)
- [ ] File size of `LanguageContext.tsx` reduced to < 200 lines
- [ ] Document how to add new translations in `README.md`

**Risks:**
- Risk of missing keys during migration (test thoroughly)
- JSON files may be large (~1200 keys each)

**Files/Modules:**
- `src/contexts/LanguageContext.tsx`
- New: `src/locales/en.json`, `src/locales/pl.json`

---

### Task 2.4: Complete Collections CRUD (Admin)

**Priority:** P1  
**Effort:** M (3-5 days)  
**Impact:** Medium — Feature completion

**Goal:**  
Complete admin Collections management: bulk product assignment, drag-and-drop ordering, slug auto-generation.

**Why:**  
Collections feature is partially implemented. Admins can create collections, but bulk product assignment and ordering are missing.

**Acceptance Criteria:**
- [ ] Admin can bulk-assign products to collection (multi-select dropdown)
- [ ] Admin can reorder products within collection (drag-and-drop)
- [ ] Slug auto-generated from collection name (with uniqueness check)
- [ ] Admin can edit collection (name, description, gradient, banner image)
- [ ] Admin can delete collection (confirm dialog)
- [ ] Admin can view collection preview (frontend view)
- [ ] Collections page shows all collections with product count

**Risks:**
- Drag-and-drop may be complex (use @dnd-kit/sortable)

**Files/Modules:**
- `src/components/admin/AdminCollections.tsx`
- `src/pages/Collections.tsx`
- `src/pages/CollectionDetail.tsx`
- Database: `collections`, `product_collections` tables

**Related Tasks:**
- Task 3.5: Add collection filter to Shop page

---

### Task 2.5: Rename "Points" to "SpiritPoints" (Branding)

**Priority:** P1  
**Effort:** S (1-2 days)  
**Impact:** Low — Branding consistency

**Goal:**  
Rebrand generic "points" system to "SpiritPoints" across UI, DB, emails, and documentation.

**Why:**  
Current "points" name is generic. "SpiritPoints" is more on-brand and memorable.

**Acceptance Criteria:**
- [ ] Update all UI text: "Points" → "SpiritPoints"
- [ ] Update database column names: `profiles.points` → `profiles.spirit_points` (migration)
- [ ] Update `points_history` table → `spirit_points_history` (migration)
- [ ] Update email templates (referral milestone, loyalty emails)
- [ ] Update admin dashboard (points display)
- [ ] Update user dashboard (points balance, history)
- [ ] Update translation keys (`t('points')` → `t('spiritPoints')`)

**Risks:**
- Database migration (ensure backward compatibility with old queries)

**Files/Modules:**
- Database: `profiles` table, `points_history` table
- All components displaying points
- `src/contexts/LanguageContext.tsx` (translations)
- Email templates: `send-referral-milestone`, loyalty emails

---

### Task 2.6: Restructure Admin Dashboard (Tab Grouping)

**Priority:** P1  
**Effort:** M (3-5 days)  
**Impact:** Medium — UX improvement for admins

**Goal:**  
Group admin dashboard tabs into logical sections (e.g., "Products", "Orders", "Customers", "Marketing") to reduce clutter (currently 20+ tabs).

**Why:**  
Admin dashboard has 20+ tabs in a single row, making navigation difficult. Grouping improves UX.

**Acceptance Criteria:**
- [ ] Group tabs into sections:
  - **Catalog:** Products, Collections, Categories
  - **Orders:** Orders, Shipments, Coupons
  - **Customers:** Customers, Reviews, Referrals
  - **Marketing:** Email Marketing, Social Media, Campaigns
  - **Settings:** Site Settings, Header, Footer, Homepage, SEO
  - **Analytics:** Statistics, Advanced Analytics, Export
- [ ] Implement nested tabs (shadcn Tabs within Tabs)
- [ ] Persist selected tab in URL (e.g., `/admin?tab=orders`)
- [ ] Mobile-friendly navigation (accordion or hamburger menu)

**Risks:**
- May require significant refactor of `AdminDashboard.tsx`

**Files/Modules:**
- `src/pages/AdminDashboard.tsx`
- `src/components/admin/AdminDashboardTabs.tsx`

---

### Task 2.7: Add FAQ Page Schema (Rich Snippets)

**Priority:** P1  
**Effort:** S (1 day)  
**Impact:** Medium — SEO improvement (easy win)

**Goal:**  
Add FAQPage schema (JSON-LD) to FAQ page for Google rich snippets (FAQ accordion in search results).

**Why:**  
FAQ rich snippets significantly improve CTR (click-through rate) in search results. Easy to implement.

**Acceptance Criteria:**
- [ ] Add FAQPage schema to `src/pages/FAQ.tsx`
- [ ] Include all FAQ questions/answers in schema
- [ ] Test schema with Google Rich Results Test
- [ ] Verify FAQ rich snippets appear in search results (may take days/weeks)

**Files/Modules:**
- `src/pages/FAQ.tsx`
- `src/utils/seoUtils.ts` (add `generateFAQPageStructuredData()`)

---

## 3. P2 — Medium-Priority Tasks

### Task 3.1: Implement Multi-Coupon UI Improvements

**Priority:** P2  
**Effort:** S (1-2 days)  
**Impact:** Low — UX improvement

**Goal:**  
Improve multi-coupon UI in checkout (currently supports multi-coupon backend, but UI is single-input only).

**Why:**  
Backend supports multiple coupons, but UI only has single input field. Users can't easily apply 2+ coupons.

**Acceptance Criteria:**
- [ ] Update checkout coupon input to support multiple codes
- [ ] Show applied coupons as badges (with "remove" button)
- [ ] Display total discount from all coupons
- [ ] Show error if coupon invalid or limit reached
- [ ] Update translations (EN/PL)

**Files/Modules:**
- `src/pages/Checkout.tsx`

---

### Task 3.2: Add Password Reset Flow

**Priority:** P2  
**Effort:** M (3-5 days)  
**Impact:** Medium — User feature request

**Goal:**  
Implement password reset flow (request reset → email with link → set new password).

**Why:**  
Currently missing password reset. Users must contact support to reset password.

**Acceptance Criteria:**
- [ ] Add "Forgot Password?" link on login page
- [ ] Create reset password request form (email input)
- [ ] Edge Function: `send-password-reset` (sends email with reset link)
- [ ] Create reset password page (`/reset-password?token=...`)
- [ ] Verify token, allow user to set new password
- [ ] Update password in Supabase Auth
- [ ] Show success message, redirect to login

**Files/Modules:**
- New: `src/pages/ResetPassword.tsx` (already exists, but not functional)
- New: `supabase/functions/send-password-reset/index.ts`
- `src/pages/Auth.tsx` (add "Forgot Password?" link)

---

### Task 3.3: Implement Back-in-Stock Alerts

**Priority:** P2  
**Effort:** M (3-5 days)  
**Impact:** Medium — Sales opportunity

**Goal:**  
Allow users to enable back-in-stock alerts for out-of-stock products on wishlist.

**Why:**  
Users can't be notified when out-of-stock products return. This feature increases conversion.

**Acceptance Criteria:**
- [ ] Add "Notify me when back in stock" toggle to wishlist items
- [ ] Store `wishlist.stock_alert_enabled` in DB (already exists)
- [ ] Cron job checks for stock changes (daily)
- [ ] Send email when product back in stock (via `send-back-in-stock-alert` Edge Function)
- [ ] Remove alert after email sent (or after 30 days)

**Files/Modules:**
- `src/pages/Wishlist.tsx`
- New: `supabase/functions/send-back-in-stock-alert/index.ts`
- New: `supabase/functions/check-stock-alerts/index.ts` (cron)
- Database: `wishlist` table (column already exists)

---

### Task 3.4: Add Price Drop Alerts

**Priority:** P2  
**Effort:** M (3-5 days)  
**Impact:** Medium — Sales opportunity

**Goal:**  
Allow users to enable price drop alerts for products on wishlist.

**Why:**  
Similar to back-in-stock alerts, price drop alerts increase conversion.

**Acceptance Criteria:**
- [ ] Add "Notify me when price drops" toggle to wishlist items
- [ ] Store `wishlist.price_alert_enabled` in DB (already exists)
- [ ] Cron job checks for price changes (daily)
- [ ] Send email when price drops by ≥ 10%
- [ ] Include discount percentage in email

**Files/Modules:**
- `src/pages/Wishlist.tsx`
- New: `supabase/functions/send-price-drop-alert/index.ts`
- New: `supabase/functions/check-price-alerts/index.ts` (cron)
- Database: `wishlist` table (column already exists)

---

### Task 3.5: Add Collection Filter to Shop Page

**Priority:** P2  
**Effort:** S (1-2 days)  
**Impact:** Low — UX improvement

**Goal:**  
Add collection filter to Shop page (e.g., filter by "Summer Scents", "Best Sellers").

**Why:**  
Users can browse collections on `/collections` page, but can't filter Shop page by collection.

**Acceptance Criteria:**
- [ ] Add collection filter dropdown to Shop page
- [ ] Fetch products by collection when selected
- [ ] Update URL query param (e.g., `/shop?collection=summer-scents`)
- [ ] Clear filter button

**Files/Modules:**
- `src/pages/Shop.tsx`

---

### Task 3.6: Implement Abandoned Cart Email (Cron)

**Priority:** P2  
**Effort:** S (1-2 days)  
**Impact:** Medium — Sales recovery

**Goal:**  
Send abandoned cart reminder emails to users who added items to cart but didn't checkout (24 hours later).

**Why:**  
Abandoned cart emails recover ~10-15% of lost sales.

**Acceptance Criteria:**
- [ ] Cron job runs daily (checks `cart_items` table)
- [ ] Find users with cart items added > 24 hours ago
- [ ] Send email via `send-cart-reminder` Edge Function (already exists)
- [ ] Include cart items preview (images + names)
- [ ] CTA: "Complete Your Purchase"
- [ ] Don't send if user already checked out

**Files/Modules:**
- `supabase/functions/send-cart-reminder/index.ts` (already exists)
- New: Cron job configuration (Supabase pg_cron or external scheduler)

---

## 4. P3 — Low-Priority Tasks

### Task 4.1: Implement Full WebXR AR Experience

**Priority:** P3  
**Effort:** XL (4-6 weeks)  
**Impact:** Low — Experimental feature

**Goal:**  
Build full WebXR AR experience (view candle in your space using phone camera).

**Why:**  
Current AR feature is a scaffold (QR code handoff). Full WebXR AR enhances user experience.

**Acceptance Criteria:**
- [ ] Create 3D models (USDZ/GLB) for all products
- [ ] Implement WebXR API (check device capability)
- [ ] Allow user to place candle in AR (phone camera)
- [ ] Add UI controls (rotate, scale, reset)
- [ ] Fallback to 3D viewer if AR unsupported
- [ ] Test on iOS (ARKit) and Android (ARCore)

**Files/Modules:**
- `src/pages/ARViewer.tsx`
- `src/components/product/ARPreview.tsx`
- `src/components/product/Product3DViewer.tsx`
- New: 3D models in Supabase Storage

---

### Task 4.2: Complete Custom Candles Configurator

**Priority:** P3  
**Effort:** L (1-2 weeks)  
**Impact:** Medium — Revenue opportunity

**Goal:**  
Build custom candle configurator (choose scent, size, color, label text).

**Why:**  
Custom Candles page exists but configurator logic is incomplete.

**Acceptance Criteria:**
- [ ] User can select scent from dropdown
- [ ] User can select size (250g, 400g)
- [ ] User can select wax color
- [ ] User can input custom label text (max 50 chars)
- [ ] Preview updates in real-time (3D viewer or image)
- [ ] Price calculated dynamically (base price + customization fee)
- [ ] Add to cart with custom options
- [ ] Order includes custom options in `order_items` (JSONB column)

**Files/Modules:**
- `src/pages/CustomCandles.tsx`
- Database: `order_items` table (add `custom_options` JSONB column)

---

### Task 4.3: Implement Birthday Discount Feature

**Priority:** P3  
**Effort:** M (3-5 days)  
**Impact:** Low — Engagement feature

**Goal:**  
Send birthday discount email to users on their birthday (10% off).

**Why:**  
Birthday emails increase engagement and loyalty.

**Acceptance Criteria:**
- [ ] Add `birthday` field to `profiles` table
- [ ] Cron job runs daily (checks for birthdays)
- [ ] Send birthday email with coupon code (e.g., `BIRTHDAY10-{userId}`)
- [ ] Coupon auto-generated (10% off, valid for 7 days)

**Files/Modules:**
- Database: `profiles` table (add `birthday` DATE column)
- New: `supabase/functions/send-birthday-email/index.ts`
- New: Cron job

---

## 5. Technical Debt

### Debt 5.1: Refactor Large Components (>500 lines)

**Priority:** P2  
**Effort:** L (1-2 weeks)  
**Impact:** Medium — Maintainability

**Goal:**  
Break down large components (`AdminDashboard.tsx`, `Checkout.tsx`, `ProductDetail.tsx`) into smaller, focused components.

**Why:**  
Large components are hard to maintain, test, and reason about.

**Acceptance Criteria:**
- [ ] Extract reusable sub-components
- [ ] Reduce component file size to < 300 lines
- [ ] Improve readability and testability

**Files/Modules:**
- `src/pages/AdminDashboard.tsx` (~1000 lines)
- `src/pages/Checkout.tsx` (~600 lines)
- `src/pages/ProductDetail.tsx` (~576 lines)

---

### Debt 5.2: Add Unit Tests for Hooks

**Priority:** P2  
**Effort:** M (3-5 days)  
**Impact:** Medium — Code quality

**Goal:**  
Add unit tests for custom hooks (`useAuth`, `useCart`, `useWishlist`, `useReviews`).

**Why:**  
No unit tests currently. Tests prevent regressions and improve confidence.

**Acceptance Criteria:**
- [ ] Set up Jest + React Testing Library
- [ ] Write tests for `useAuth` (signup, login, logout)
- [ ] Write tests for `useCart` (add, remove, update quantity)
- [ ] Write tests for `useWishlist` (add, remove)
- [ ] Write tests for `useReviews` (fetch, submit)
- [ ] Achieve ≥ 80% code coverage on hooks

**Files/Modules:**
- New: `src/hooks/__tests__/useAuth.test.ts`
- New: `src/hooks/__tests__/useCart.test.ts`
- etc.

---

### Debt 5.3: Migrate Email "From" Address to Custom Domain

**Priority:** P1  
**Effort:** S (1 day)  
**Impact:** Medium — Deliverability & branding

**Goal:**  
Migrate email "From" address from `onboarding@resend.dev` to custom domain (e.g., `hello@spirit-candle.com`).

**Why:**  
Current "From" address looks unprofessional and may have lower deliverability.

**Acceptance Criteria:**
- [ ] Set up custom domain in Resend dashboard
- [ ] Configure DNS records (DKIM, SPF, DMARC)
- [ ] Update all Edge Functions to use new "From" address
- [ ] Test email delivery (check spam folder)
- [ ] Verify DMARC reports

**Files/Modules:**
- All Edge Functions sending emails (15 functions)

---

## 6. Partial Features (In Progress)

### Feature 6.1: Multi-Coupon Support

**Status:** ✅ Backend Complete, ⚠️ UI Partial  
**Files:** `supabase/functions/create-checkout/index.ts`, `src/pages/Checkout.tsx`

**What's Done:**
- ✅ Backend supports `couponCodes` array (multiple coupons)
- ✅ Validates all coupons (active, valid dates, per-user limit, referral-only)
- ✅ Calculates total discount from all coupons
- ✅ Records `coupon_redemptions` for each coupon

**What's Missing:**
- ⚠️ UI only has single coupon input field
- ⚠️ No way to apply 2+ coupons in UI

**Next Steps:** See Task 3.1

---

### Feature 6.2: Collections System

**Status:** ⚠️ Partial (create/view works, CRUD incomplete)  
**Files:** `src/components/admin/AdminCollections.tsx`, `src/pages/Collections.tsx`, `src/pages/CollectionDetail.tsx`

**What's Done:**
- ✅ Collections database schema (`collections`, `product_collections`)
- ✅ Collections listing page (`/collections`)
- ✅ Collection detail page (`/collections/:slug`)
- ✅ Admin can create collections

**What's Missing:**
- ⚠️ Bulk product assignment (admin must manually insert into DB)
- ⚠️ Drag-and-drop product ordering within collection
- ⚠️ Slug auto-generation

**Next Steps:** See Task 2.4

---

### Feature 6.3: SpiritPoints Branding

**Status:** ❌ Not Started (generic "points" still used)  
**Files:** All components/emails displaying points

**What's Done:**
- ❌ Nothing yet

**What's Missing:**
- ❌ "Points" → "SpiritPoints" rename across UI/DB/emails

**Next Steps:** See Task 2.5

---

### Feature 6.4: Dashboard Restructure

**Status:** ⚠️ In Progress (20+ tabs, needs grouping)  
**Files:** `src/pages/AdminDashboard.tsx`

**What's Done:**
- ✅ All admin features implemented (products, orders, customers, coupons, etc.)

**What's Missing:**
- ⚠️ Tab grouping (too many tabs in single row)
- ⚠️ Mobile-friendly navigation

**Next Steps:** See Task 2.6

---

## Conclusion

This backlog provides a **clear roadmap** for Spirit Candles development prioritized by impact and effort. Focus on **P0 (critical)** and **P1 (high-priority)** tasks first to maximize value and minimize risk.

**Recommended Sprint Plan:**
- **Sprint 1 (2 weeks):** P0 tasks (rate limiting, webhook signature)
- **Sprint 2-3 (4 weeks):** Next.js migration (P1)
- **Sprint 4 (2 weeks):** i18n extraction, Collections CRUD, SpiritPoints rename (P1)
- **Sprint 5+ (ongoing):** P2/P3 tasks as bandwidth allows

**Next Actions:**
1. Review backlog with team/stakeholders
2. Prioritize tasks based on business goals
3. Create GitHub issues for P0/P1 tasks
4. Assign tasks to developers
5. Track progress in project management tool (Jira, Linear, etc.)

---

**Document End**

