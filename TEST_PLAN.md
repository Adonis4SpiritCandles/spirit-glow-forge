# TEST PLAN — Spirit Candles E-Commerce Platform

**Document Version:** 1.0  
**Generated:** 2025-11-13  
**Project:** spirit-glow-forge  
**Testing Scope:** Functional, UI/UX, i18n, Accessibility, Performance, Integration

---

## Executive Summary

This document provides a comprehensive test plan for the Spirit Candles e-commerce platform. Testing covers **responsive design (Mobile/Tablet/Desktop)**, **bilingual support (EN/PL)**, **accessibility (WCAG AA)**, **critical user flows** (signup, checkout, admin operations), and **Edge Function regressions**.

**Testing Pyramid:**
1. **Smoke Tests** (5 min) — Critical flows must work
2. **Functional Tests** (30 min) — Feature-level testing
3. **Regression Tests** (1 hour) — Ensure no breaking changes
4. **E2E Tests** (automated, 10 min) — End-to-end user journeys

**Test Environments:**
- **Dev:** `http://localhost:5173` (Vite dev server)
- **Staging:** (if available) — Pre-production environment
- **Production:** `https://spirit-candle.com`

---

## Table of Contents

1. [Smoke Tests (Critical Paths)](#1-smoke-tests-critical-paths)
2. [Responsive Design Testing](#2-responsive-design-testing)
3. [i18n Testing (EN/PL)](#3-i18n-testing-enpl)
4. [Accessibility Testing (WCAG AA)](#4-accessibility-testing-wcag-aa)
5. [Functional Testing by Feature](#5-functional-testing-by-feature)
6. [Edge Function Regression Tests](#6-edge-function-regression-tests)
7. [Performance Testing](#7-performance-testing)
8. [Browser & Device Matrix](#8-browser--device-matrix)
9. [Automated E2E Tests](#9-automated-e2e-tests)

---

## 1. Smoke Tests (Critical Paths)

**Duration:** 5 minutes  
**Frequency:** Before every deployment  
**Goal:** Ensure core functionality works

### 1.1 Smoke Test Checklist

| # | Test | Pass/Fail | Notes |
|---|------|-----------|-------|
| 1 | Homepage loads without errors | ☐ |  |
| 2 | Shop page displays products | ☐ |  |
| 3 | Product detail page loads | ☐ |  |
| 4 | Add to cart works | ☐ |  |
| 5 | Cart sidebar opens | ☐ |  |
| 6 | Checkout page loads | ☐ |  |
| 7 | Language toggle (EN ↔ PL) works | ☐ |  |
| 8 | Login works | ☐ |  |
| 9 | Admin dashboard loads (for admin user) | ☐ |  |
| 10 | No console errors on any page | ☐ |  |

**Critical:** All 10 tests must pass before deployment.

---

## 2. Responsive Design Testing

### 2.1 Test Viewports

| Device Type | Viewport Size | Breakpoint |
|-------------|---------------|------------|
| **Mobile** | 375x667 (iPhone SE) | < 640px (`sm:`) |
| **Mobile Large** | 414x896 (iPhone 12 Pro) | < 640px |
| **Tablet** | 768x1024 (iPad) | 640-1024px (`md:`) |
| **Desktop** | 1440x900 (MacBook Pro) | > 1024px (`lg:`) |
| **Desktop Large** | 1920x1080 (Full HD) | > 1280px (`xl:`) |

### 2.2 Responsive Checklist (Per Page)

**Pages to Test:**
- Homepage, Shop, ProductDetail, Cart, Checkout, Collections, About, Contact, FAQ, UserDashboard, AdminDashboard

| Test | Mobile | Tablet | Desktop | Notes |
|------|--------|--------|---------|-------|
| **Layout** | | | | |
| Header fits viewport | ☐ | ☐ | ☐ | Logo, nav, cart icon visible |
| Footer fits viewport | ☐ | ☐ | ☐ | All links accessible |
| No horizontal scroll | ☐ | ☐ | ☐ | Content contained |
| Grid columns adjust | ☐ | ☐ | ☐ | 1 col (M), 2 col (T), 4 col (D) |
| **Typography** | | | | |
| Text readable (font size ≥ 14px) | ☐ | ☐ | ☐ | Body text |
| Headings scale properly | ☐ | ☐ | ☐ | H1/H2/H3 responsive sizes |
| No text overflow | ☐ | ☐ | ☐ | Long product names wrap |
| **Images** | | | | |
| Images load correctly | ☐ | ☐ | ☐ | No broken images |
| Images responsive | ☐ | ☐ | ☐ | Aspect ratio maintained |
| Alt text present | ☐ | ☐ | ☐ | Screen reader support |
| **Forms** | | | | |
| Input fields usable | ☐ | ☐ | ☐ | Touch targets ≥ 44x44px |
| Buttons accessible | ☐ | ☐ | ☐ | CTAs visible |
| Form validation works | ☐ | ☐ | ☐ | Error messages visible |
| **Navigation** | | | | |
| Mobile menu works | ☐ | N/A | N/A | Hamburger menu |
| Desktop nav works | N/A | ☐ | ☐ | Horizontal nav |
| Footer links work | ☐ | ☐ | ☐ | All links clickable |

**Tools:**
- Chrome DevTools (Device Toolbar)
- BrowserStack (real devices)
- Responsively App (multi-viewport preview)

---

## 3. i18n Testing (EN/PL)

### 3.1 Language Coverage Checklist

| Category | EN | PL | Notes |
|----------|----|----|-------|
| **UI Text** | | | |
| Navigation labels | ☐ | ☐ | Home, Shop, Collections, About, Contact, Cart, Login |
| Buttons/CTAs | ☐ | ☐ | Add to Cart, Buy Now, Submit, etc. |
| Form labels | ☐ | ☐ | Email, Password, Name, Address, etc. |
| Error messages | ☐ | ☐ | Validation errors, toasts |
| Success messages | ☐ | ☐ | Order placed, Item added, etc. |
| **Product Data** | | | |
| Product names | ☐ | ☐ | All products have name_en, name_pl |
| Product descriptions | ☐ | ☐ | All products have description_en, description_pl |
| Category names | ☐ | ☐ | All categories translated |
| Collection names | ☐ | ☐ | All collections translated |
| **Page Content** | | | |
| Homepage hero text | ☐ | ☐ | Reborn Your Nature / Odrodź Swoją Naturę |
| About page content | ☐ | ☐ | Full page text translated |
| FAQ questions/answers | ☐ | ☐ | All FAQs translated |
| Legal pages | ☐ | ☐ | PDFs available in both languages |
| **Emails** | | | |
| Order confirmation | ☐ | ☐ | Subject + body translated |
| Tracking available | ☐ | ☐ | Subject + body translated |
| Welcome email | ☐ | ☐ | Subject + body translated |
| Newsletter emails | ☐ | ☐ | Subject + body translated |
| **SEO** | | | |
| Meta titles | ☐ | ☐ | Translated per language |
| Meta descriptions | ☐ | ☐ | Translated per language |
| Hreflang tags | ☐ | ☐ | Present on all pages |

### 3.2 Language Switching Test

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| Language toggle works on all pages | ☐ | EN ↔ PL switch |
| Language persists after page reload | ☐ | Stored in localStorage |
| URL reflects language (`/en/...`, `/pl/...`) | ☐ | If URL-based routing |
| User's `preferred_language` synced to DB | ☐ | For logged-in users |
| No broken translations (missing keys) | ☐ | No "undefined" or key names shown |

**Test Cases:**
1. Start on Homepage (EN) → Switch to PL → Verify all text translated
2. Navigate to Product Detail (PL) → Switch to EN → Verify product name/desc translated
3. Add to cart (EN) → Switch to PL → Verify cart items show Polish names
4. Complete checkout (PL) → Verify confirmation email in Polish
5. Login (EN) → Dashboard should remember EN preference

---

## 4. Accessibility Testing (WCAG AA)

### 4.1 Accessibility Checklist

| Category | Test | Pass/Fail | Notes |
|----------|------|-----------|-------|
| **Keyboard Navigation** | | | |
| Tab through all interactive elements | ☐ | Focus ring visible |
| Skip to main content link | ☐ | For screen readers |
| Modal focus trap | ☐ | Tab cycles within modal |
| Escape key closes modals | ☐ | Keyboard shortcut |
| Arrow keys navigate carousels | ☐ | Product carousels |
| **Screen Readers** | | | |
| All images have alt text | ☐ | Descriptive alt text |
| ARIA labels on icon buttons | ☐ | Cart icon, search icon, etc. |
| ARIA roles on custom components | ☐ | Modals, tabs, accordions |
| Screen reader reads page order correctly | ☐ | Test with NVDA/JAWS |
| Forms have associated labels | ☐ | `<label for="...">` |
| **Visual** | | | |
| Color contrast ≥ 4.5:1 (body text) | ☐ | WCAG AA standard |
| Color contrast ≥ 3:1 (large text) | ☐ | Headings |
| Focus indicators visible | ☐ | Blue/gold ring on focus |
| Text resizable to 200% | ☐ | No text cut off |
| No text in images | ☐ | Text should be HTML |
| **Forms** | | | |
| Error messages descriptive | ☐ | "Email is required", not "Error" |
| Required fields marked | ☐ | Asterisk or "required" label |
| Autocomplete attributes | ☐ | `autocomplete="email"`, etc. |

**Tools:**
- **axe DevTools** (Chrome extension) — Automated accessibility testing
- **WAVE** (Web Accessibility Evaluation Tool) — Visual accessibility feedback
- **NVDA** (Windows) / **VoiceOver** (Mac) — Screen reader testing
- **Lighthouse** (Chrome DevTools) — Accessibility score

---

## 5. Functional Testing by Feature

### 5.1 Authentication

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| **Signup** | | |
| User can sign up with email/password | ☐ | |
| Validation: email format checked | ☐ | |
| Validation: password min 6 chars | ☐ | |
| Welcome email sent | ☐ | Check Resend logs |
| Profile created in DB | ☐ | Check `profiles` table |
| Referral code generated | ☐ | If referral source provided |
| **Login** | | |
| User can login with email | ☐ | |
| User can login with username | ☐ | |
| Error: invalid credentials | ☐ | Toast message shown |
| Session persisted after reload | ☐ | User stays logged in |
| **Logout** | | |
| User can logout | ☐ | Session cleared |
| Redirect to homepage after logout | ☐ | |

### 5.2 Shopping (Core E-Commerce Flow)

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| **Browse Products** | | |
| Shop page shows products | ☐ | Grid layout |
| Filters work (category, price, size) | ☐ | |
| Search works | ☐ | Search modal |
| Product card shows image, name, price | ☐ | |
| **Product Detail** | | |
| Product detail page loads | ☐ | Image, name, description, price |
| Quantity selector works | ☐ | +/- buttons |
| Add to cart works | ☐ | Toast confirmation |
| Reviews displayed | ☐ | Star rating, comments |
| **Cart** | | |
| Cart sidebar opens | ☐ | |
| Cart shows added items | ☐ | |
| Quantity update works | ☐ | +/- buttons |
| Remove from cart works | ☐ | |
| Cart total calculated correctly | ☐ | PLN + EUR |
| Cart persists after reload | ☐ | Stored in DB |
| **Wishlist** | | |
| Add to wishlist works | ☐ | Heart icon |
| Wishlist page shows items | ☐ | |
| Remove from wishlist works | ☐ | |

### 5.3 Checkout & Payment

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| **Checkout Flow** | | |
| Checkout page loads | ☐ | |
| Shipping address form validation | ☐ | Required fields |
| Furgonetka shipping rates load | ☐ | DHL, GLS, DPD options |
| Shipping service selection works | ☐ | |
| Coupon code validation works | ☐ | Valid/invalid messages |
| Multi-coupon support works | ☐ | Apply 2+ coupons |
| Discount applied to subtotal | ☐ | |
| Shipping cost displayed correctly | ☐ | |
| Total calculated correctly | ☐ | Subtotal + shipping - discount |
| **Stripe Payment** | | |
| "Pay with Stripe" button works | ☐ | Redirect to Stripe |
| Stripe checkout session created | ☐ | Check create-checkout logs |
| Payment succeeds (test card) | ☐ | Use 4242 4242 4242 4242 |
| Redirect to payment-success page | ☐ | |
| Order created in DB | ☐ | Check `orders` table |
| Order items created | ☐ | Check `order_items` table |
| Stock decremented | ☐ | Check `products.stock_quantity` |
| Cart cleared | ☐ | |
| Order confirmation email sent | ☐ | Check Resend logs |
| Admin notification email sent | ☐ | Check admin inbox |

### 5.4 Admin Dashboard

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| **Products Management** | | |
| Admin can view products list | ☐ | |
| Admin can create product | ☐ | EN/PL names, prices |
| Admin can edit product | ☐ | |
| Admin can delete product | ☐ | |
| Stock quantity updatable | ☐ | |
| **Orders Management** | | |
| Admin can view orders list | ☐ | |
| Admin can view order details | ☐ | Items, shipping, tracking |
| Admin can create Furgonetka shipment | ☐ | |
| Tracking number updated in order | ☐ | |
| Admin can mark order as delivered | ☐ | |
| Admin can cancel order | ☐ | |
| **Coupons Management** | | |
| Admin can create coupon | ☐ | Code, percent_off, valid dates |
| Admin can view coupon redemptions | ☐ | |
| Admin can deactivate coupon | ☐ | |

---

## 6. Edge Function Regression Tests

### 6.1 Payment Functions

| Function | Test | Pass/Fail | Notes |
|----------|------|-----------|-------|
| `create-checkout` | Creates Stripe session with valid cart | ☐ | |
| `create-checkout` | Validates coupon code | ☐ | |
| `create-checkout` | Applies multi-coupon discount | ☐ | |
| `create-checkout` | Returns error for invalid input | ☐ | |
| `stripe-webhook` | Creates order on payment success | ☐ | |
| `stripe-webhook` | Sends confirmation emails | ☐ | |
| `stripe-webhook` | Clears cart | ☐ | |
| `stripe-webhook` | Records coupon redemption | ☐ | |

### 6.2 Shipping Functions

| Function | Test | Pass/Fail | Notes |
|----------|------|-----------|-------|
| `calculate-shipping-price` | Returns rates for valid address | ☐ | |
| `calculate-shipping-price` | Normalizes PL postcode | ☐ | |
| `calculate-shipping-price` | Handles validation errors | ☐ | |
| `create-furgonetka-shipment` | Creates shipment with valid order | ☐ | Admin only |
| `create-furgonetka-shipment` | Returns label URL | ☐ | |
| `sync-furgonetka-tracking` | Updates order shipping status | ☐ | |
| `sync-furgonetka-tracking` | Sends tracking email | ☐ | |

### 6.3 Email Functions

| Function | Test | Pass/Fail | Notes |
|----------|------|-----------|-------|
| `send-order-confirmation` | Sends email in correct language | ☐ | EN/PL |
| `send-tracking-available` | Includes tracking number | ☐ | |
| `send-delivery-confirmation` | Sends after delivery | ☐ | |
| `newsletter-subscribe` | Sends double opt-in email | ☐ | |
| `newsletter-confirm` | Confirms subscription | ☐ | |

---

## 7. Performance Testing

### 7.1 Lighthouse Scores (Target)

| Metric | Target | Current | Pass/Fail |
|--------|--------|---------|-----------|
| Performance | ≥ 90 | | ☐ |
| Accessibility | ≥ 90 | | ☐ |
| Best Practices | ≥ 90 | | ☐ |
| SEO | ≥ 90 | | ☐ |

**Pages to Test:** Homepage, Shop, ProductDetail

### 7.2 Core Web Vitals

| Metric | Target | Current | Pass/Fail |
|--------|--------|---------|-----------|
| LCP (Largest Contentful Paint) | < 2.5s | | ☐ |
| FID (First Input Delay) | < 100ms | | ☐ |
| CLS (Cumulative Layout Shift) | < 0.1 | | ☐ |

**Tool:** Chrome DevTools Lighthouse / PageSpeed Insights

---

## 8. Browser & Device Matrix

### 8.1 Browsers to Test

| Browser | Version | OS | Priority |
|---------|---------|----|---------:|
| Chrome | Latest | Windows/Mac | P0 |
| Safari | Latest | Mac/iOS | P0 |
| Firefox | Latest | Windows/Mac | P1 |
| Edge | Latest | Windows | P1 |
| Safari Mobile | iOS 15+ | iPhone | P0 |
| Chrome Mobile | Latest | Android | P0 |

### 8.2 Device Matrix

| Device | OS | Browser | Resolution | Priority |
|--------|----|---------|-----------|---------:|
| iPhone 12 Pro | iOS 15+ | Safari | 390x844 | P0 |
| Samsung Galaxy S21 | Android 12+ | Chrome | 360x800 | P0 |
| iPad Pro | iOS 15+ | Safari | 1024x1366 | P1 |
| MacBook Pro 13" | macOS | Chrome | 1440x900 | P0 |
| Windows Laptop | Windows 10/11 | Edge | 1920x1080 | P1 |

---

## 9. Automated E2E Tests

### 9.1 Recommended E2E Framework

**Tool:** Playwright (cross-browser, fast, reliable)

**Alternative:** Cypress (developer-friendly, but Chrome-only by default)

### 9.2 E2E Test Suite (Priority Flows)

**Test File:** `tests/e2e/smoke.spec.ts`

```typescript
test('User can complete full checkout flow', async ({ page }) => {
  // 1. Navigate to shop
  await page.goto('/shop');
  
  // 2. Add product to cart
  await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  
  // 3. Open cart sidebar
  await page.click('[data-testid="cart-icon"]');
  await expect(page.locator('[data-testid="cart-sidebar"]')).toBeVisible();
  
  // 4. Proceed to checkout
  await page.click('[data-testid="checkout-button"]');
  await expect(page).toHaveURL(/\/checkout/);
  
  // 5. Fill shipping form
  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="street"]', 'Test Street 123');
  await page.fill('[name="city"]', 'Warszawa');
  await page.fill('[name="postalCode"]', '00-001');
  
  // 6. Select shipping method
  await page.click('[data-testid="shipping-service"]:first-child');
  
  // 7. Click "Pay with Stripe"
  await page.click('[data-testid="stripe-checkout-button"]');
  
  // 8. Verify redirect to Stripe (external)
  await expect(page).toHaveURL(/checkout\.stripe\.com/);
});
```

### 9.3 E2E Test Coverage

| Flow | Test File | Priority |
|------|-----------|----------|
| Signup & Login | `auth.spec.ts` | P0 |
| Add to Cart & Checkout | `checkout.spec.ts` | P0 |
| Admin Create Shipment | `admin-shipment.spec.ts` | P1 |
| Language Switching | `i18n.spec.ts` | P1 |
| Wishlist Add/Remove | `wishlist.spec.ts` | P2 |

---

## Conclusion

This test plan provides a **comprehensive testing strategy** for Spirit Candles covering responsive design, i18n, accessibility, functional testing, and Edge Function regressions. Follow this plan before every major release to ensure quality and prevent regressions.

**Recommended Testing Workflow:**
1. **Pre-commit:** Run linter + TypeScript checks
2. **Pre-deployment:** Run smoke tests (5 min)
3. **Post-deployment (staging):** Run full functional tests (30 min)
4. **Weekly:** Run automated E2E tests (10 min)
5. **Before major release:** Run full regression suite (1 hour)

---

**Document End**

