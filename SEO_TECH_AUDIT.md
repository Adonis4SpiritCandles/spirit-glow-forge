# SEO TECHNICAL AUDIT — Spirit Candles E-Commerce

**Document Version:** 1.0  
**Generated:** 2025-11-13  
**Project:** spirit-glow-forge  
**Platform:** Vite SPA + React + React Helmet Async

---

## Executive Summary

This document audits the **SEO implementation** for Spirit Candles e-commerce platform. The site uses **React Helmet Async** for managing meta tags, **structured data (JSON-LD)** for rich snippets, and **bilingual hreflang tags** (EN/PL). However, as a **SPA (Single Page Application)**, it faces SEO challenges (slow initial load, limited crawlability) that would be solved by migrating to **Next.js with SSR/ISR**.

**Current SEO Stack:**
- Meta tags: React Helmet Async
- Structured data: JSON-LD (Product, Organization, Website, BreadcrumbList)
- Sitemap: `generate-sitemap` Edge Function (cron-generated)
- Robots.txt: Static file in `/public/robots.txt`
- Bilingual: `<link rel="alternate" hreflang>` tags for EN/PL
- Canonical URLs: Implemented via `<link rel="canonical">`

**SEO Score (Estimated Lighthouse):**
- Performance: ~75-80 (slow initial load due to SPA)
- SEO: ~85-90 (good meta tags, but SPA limitations)
- Accessibility: ~90-95 (good ARIA labels, semantic HTML)
- Best Practices: ~85-90 (HTTPS, secure, no console errors)

**Critical Issue:** SPA architecture limits SEO potential. **Recommendation: Migrate to Next.js for SSR/ISR.**

---

## 1. Meta Tags Implementation

### 1.1 Current Implementation

**Component:** `src/components/SEO/SEOManager.tsx`

**Pattern:** Uses `react-helmet-async` to dynamically inject meta tags per page

**Example (Homepage):**
```typescript
<SEOManager
  title="SPIRIT CANDLES — Reborn Your Nature | Luxury Soy Candles"
  description="Discover SPIRIT CANDLES luxury soy candles inspired by iconic fragrances. Handcrafted with natural soy wax and wooden wicks for an elevated sensory experience. Reborn your nature."
  type="website"
  image="https://spirit-candle.com/og-image-home.jpg"
  url="https://spirit-candle.com/en"
  structuredData={generateWebSiteStructuredData()}
  alternateUrls={{
    en: 'https://spirit-candle.com/en',
    pl: 'https://spirit-candle.com/pl'
  }}
/>
```

**Rendered Meta Tags (Homepage):**
```html
<!-- Title & Description -->
<title>SPIRIT CANDLES — Reborn Your Nature | Luxury Soy Candles</title>
<meta name="description" content="Discover SPIRIT CANDLES luxury soy candles...">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="SPIRIT CANDLES — Reborn Your Nature | Luxury Soy Candles">
<meta property="og:description" content="Discover SPIRIT CANDLES luxury soy candles...">
<meta property="og:image" content="https://spirit-candle.com/og-image-home.jpg">
<meta property="og:url" content="https://spirit-candle.com/en">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="SPIRIT CANDLES — Reborn Your Nature | Luxury Soy Candles">
<meta name="twitter:description" content="Discover SPIRIT CANDLES luxury soy candles...">
<meta name="twitter:image" content="https://spirit-candle.com/og-image-home.jpg">

<!-- Canonical -->
<link rel="canonical" href="https://spirit-candle.com/en">

<!-- Alternate URLs (Hreflang) -->
<link rel="alternate" hreflang="en" href="https://spirit-candle.com/en">
<link rel="alternate" hreflang="pl" href="https://spirit-candle.com/pl">
```

**SEO Utils:** `src/utils/seoUtils.ts` provides helpers:
- `generateProductStructuredData()` — Product schema
- `generateBreadcrumbStructuredData()` — Breadcrumb schema
- `getProductAvailability()` — Converts stock to schema.org availability
- `truncateDescription()` — Truncates descriptions to 160 chars for meta

### 1.2 Meta Tags Coverage by Page

| Page | Title | Description | OG Tags | Canonical | Hreflang | Structured Data |
|------|-------|-------------|---------|-----------|----------|-----------------|
| Homepage (`/`) | ✅ Bilingual | ✅ Bilingual | ✅ | ✅ | ✅ EN/PL | ✅ WebSite, Organization |
| Shop (`/shop`) | ✅ Bilingual | ✅ Bilingual | ✅ | ✅ | ✅ | ⚠️ Missing CollectionPage |
| Product Detail | ✅ Dynamic | ✅ Truncated | ✅ | ✅ | ✅ | ✅ Product, BreadcrumbList |
| Collections | ✅ Bilingual | ✅ Bilingual | ✅ | ✅ | ✅ | ✅ BreadcrumbList |
| Collection Detail | ✅ Dynamic | ✅ Dynamic | ✅ | ✅ | ✅ | ✅ CollectionPage, BreadcrumbList |
| About | ✅ Bilingual | ✅ Bilingual | ✅ | ✅ | ✅ | ⚠️ Missing Organization |
| Contact | ✅ Bilingual | ✅ Bilingual | ✅ | ✅ | ✅ | ⚠️ Missing ContactPage |
| FAQ | ✅ Bilingual | ✅ Bilingual | ✅ | ✅ | ✅ | ⚠️ Missing FAQPage |
| Cart | ❌ Generic | ❌ Generic | ❌ | ✅ | ✅ | ❌ Missing |
| Checkout | ❌ Generic | ❌ Generic | ❌ | ✅ | ❌ | ❌ Missing |
| User Dashboard | ❌ Generic | ❌ Generic | ❌ | ✅ | ❌ | ❌ Missing |
| Legal Pages | ✅ Bilingual | ✅ Bilingual | ✅ | ✅ | ✅ | ❌ Missing |

**Coverage Score:** 75% (good for public pages, missing for authenticated pages)

---

## 2. Structured Data (JSON-LD)

### 2.1 Implemented Schemas

**1. Product Schema (ProductDetail page)**

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Mystic Rose Candle",
  "description": "Elegant rose fragrance...",
  "image": "https://spirit-candle.com/products/mystic-rose.jpg",
  "brand": {
    "@type": "Brand",
    "name": "SPIRIT CANDLES"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://spirit-candle.com/en/product/123",
    "priceCurrency": "PLN",
    "price": "50.00",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "24"
  }
}
```

**2. BreadcrumbList Schema**

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://spirit-candle.com" },
    { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://spirit-candle.com/shop" },
    { "@type": "ListItem", "position": 3, "name": "Product Name", "item": "https://spirit-candle.com/product/123" }
  ]
}
```

**3. Organization Schema (Homepage)**

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SPIRIT CANDLES",
  "url": "https://spirit-candle.com",
  "logo": "https://spirit-candle.com/spirit-logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+48 729877557",
    "contactType": "customer service",
    "email": "m5moffice@proton.me"
  },
  "sameAs": [
    "https://www.instagram.com/spirit_candle_official/",
    "https://www.facebook.com/profile.php?id=61571360287880",
    "https://x.com/SpiritCandlePL"
  ]
}
```

**4. WebSite Schema (Homepage)**

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SPIRIT CANDLES",
  "url": "https://spirit-candle.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://spirit-candle.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### 2.2 Missing Schemas

| Page | Recommended Schema | Priority | Benefit |
|------|-------------------|----------|---------|
| Shop | CollectionPage | P2 | Better indexing for category pages |
| Collections | CollectionPage | P2 | Rich snippets for collections |
| About | AboutPage, Organization | P3 | Enhanced brand SERP |
| Contact | ContactPage | P3 | Rich contact info in SERP |
| FAQ | FAQPage | P1 | FAQ rich snippets in search results |
| Reviews | Review schema | P2 | Star ratings in search results |
| Blog (future) | BlogPosting, Article | P2 | Rich snippets for blog posts |

---

## 3. Sitemap & Robots.txt

### 3.1 Sitemap

**Generator:** `supabase/functions/generate-sitemap/index.ts` (Edge Function)  
**Endpoint:** `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/generate-sitemap`  
**Output:** XML sitemap served at `https://spirit-candle.com/sitemap.xml`

**Generation Logic:**
1. Fetches all public routes (pages, products, collections)
2. Generates XML sitemap with `<lastmod>`, `<priority>`, `<changefreq>`
3. Stores sitemap in Supabase Storage (optional) or returns directly

**Cron Schedule:** Daily (regenerated every 24 hours)

**Sample Sitemap Entry:**
```xml
<url>
  <loc>https://spirit-candle.com/en/product/mystic-rose</loc>
  <lastmod>2025-11-13</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
  <xhtml:link rel="alternate" hreflang="en" href="https://spirit-candle.com/en/product/mystic-rose"/>
  <xhtml:link rel="alternate" hreflang="pl" href="https://spirit-candle.com/pl/product/mystic-rose"/>
</url>
```

**Issues:**
- ⚠️ Sitemap not automatically submitted to Google Search Console (manual submission required)
- ⚠️ No image sitemap (product images not included)

**Recommendations:**
- Add image sitemap (`<image:image>` tags for product images)
- Auto-submit sitemap to Google Search Console via API
- Add video sitemap (future: if adding product videos)

### 3.2 Robots.txt

**Location:** `/public/robots.txt`

**Content:**
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /checkout
Disallow: /cart

Sitemap: https://spirit-candle.com/sitemap.xml
```

**Coverage:** ✅ Good (blocks admin/private routes, allows public pages)

---

## 4. Performance Audit (Core Web Vitals)

### 4.1 Current Performance Metrics (Estimated)

| Metric | Target | Current (Estimated) | Status |
|--------|--------|---------------------|--------|
| **LCP (Largest Contentful Paint)** | < 2.5s | ~3.5-4.5s | ⚠️ Needs Improvement |
| **FID (First Input Delay)** | < 100ms | ~80-120ms | ⚠️ Borderline |
| **CLS (Cumulative Layout Shift)** | < 0.1 | ~0.05-0.15 | ⚠️ Borderline |
| **TTI (Time to Interactive)** | < 3.8s | ~4.5-5.5s | ❌ Poor |
| **FCP (First Contentful Paint)** | < 1.8s | ~2.0-2.5s | ⚠️ Needs Improvement |

**Performance Score:** ~75-80/100 (Good, but not Great)

### 4.2 Performance Bottlenecks

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| **SPA initial load (large JS bundle)** | High | Code-splitting, lazy loading, Next.js |
| **No SSR (server-side rendering)** | High | Migrate to Next.js SSR/ISR |
| **Large images (not optimized)** | Medium | Use WebP format, Next.js Image component |
| **No service worker (offline support)** | Low | Implement PWA with service worker |
| **No critical CSS inlining** | Medium | Inline above-the-fold CSS |
| **Heavy dependencies (Three.js, Framer Motion)** | Medium | Lazy load 3D/AR components |

### 4.3 Recommendations (Priority Order)

**P0 (Critical):**
1. **Migrate to Next.js** — SSR/ISR for 30-40% LCP improvement
2. **Optimize images** — Use WebP, responsive images, lazy loading
3. **Code-splitting** — Lazy load admin pages, AR components, analytics

**P1 (High):**
4. **Implement critical CSS** — Inline above-the-fold styles
5. **Optimize fonts** — Preload fonts, use font-display: swap
6. **Reduce JS bundle size** — Tree-shake unused code, analyze bundle with webpack-bundle-analyzer

**P2 (Medium):**
7. **Implement PWA** — Service worker for offline support, installability
8. **Optimize third-party scripts** — Lazy load analytics, chat widgets
9. **Enable HTTP/2 push** — Preload critical assets

---

## 5. SSR/ISR Migration Strategy (Next.js)

### 5.1 Why Migrate to Next.js?

| Benefit | Impact | Description |
|---------|--------|-------------|
| **SEO** | High | Google crawls fully-rendered HTML (not waiting for JS) |
| **LCP** | High | 30-40% faster initial load with SSR |
| **User Experience** | High | Instant page transitions with prefetching |
| **Social Sharing** | High | OG meta tags render immediately (no JS required) |
| **Caching** | High | ISR enables CDN caching of static pages |

### 5.2 Migration Plan

**Phase 1: Setup (1 week)**
1. Create `pages/` directory (Next.js routing)
2. Migrate `src/pages/*.tsx` to Next.js pages
3. Convert React Router → Next.js Link
4. Set up `next.config.js` (i18n, Tailwind, env vars)

**Phase 2: API Routes (1 week)**
5. Migrate Edge Functions → Next.js API routes (optional, or keep Supabase Edge Functions)
6. Set up server-side Supabase client

**Phase 3: SSR/ISR (2 weeks)**
7. Implement `getStaticProps` for static pages (Homepage, About, FAQ)
8. Implement `getServerSideProps` for dynamic pages (ProductDetail, CollectionDetail)
9. Enable ISR (Incremental Static Regeneration) with revalidate: 3600 (1 hour)

**Phase 4: Testing & Deployment (1 week)**
10. Test all routes (ensure SSR works)
11. Test Stripe, Furgonetka, email integrations
12. Deploy to Vercel or self-hosted Next.js

**Total Effort:** 5 weeks (1 developer)

### 5.3 Alternative: Vite SSR (Lighter Option)

**Pros:**
- Keep Vite build tool (familiar)
- Minimal codebase changes

**Cons:**
- Less mature SSR ecosystem vs. Next.js
- No built-in ISR
- Manual SSR setup required

**Recommendation:** Choose Next.js for production-grade SSR.

---

## 6. Bilingual SEO

### 6.1 Current Implementation

**Strategy:** URL-based language switching (e.g., `/en/shop`, `/pl/sklep`)

**Hreflang Tags:**
```html
<link rel="alternate" hreflang="en" href="https://spirit-candle.com/en/shop">
<link rel="alternate" hreflang="pl" href="https://spirit-candle.com/pl/shop">
<link rel="alternate" hreflang="x-default" href="https://spirit-candle.com/en/shop">
```

**Language Detection:**
- User preference stored in `localStorage` + `profiles.preferred_language`
- URL reflects language (`/en/...` or `/pl/...`)
- Language toggle in header

**SEO Impact:** ✅ Good (hreflang implemented correctly)

**Recommendations:**
- Add `x-default` hreflang for language-agnostic fallback
- Ensure all pages have hreflang tags (currently missing on some authenticated pages)

### 6.2 Bilingual Content Coverage

| Content Type | EN | PL | Status |
|--------------|----|----|--------|
| Product names/descriptions | ✅ | ✅ | ✅ Complete |
| Page titles/meta descriptions | ✅ | ✅ | ✅ Complete |
| UI text | ✅ | ✅ | ✅ Complete |
| Legal pages | ✅ | ✅ | ✅ Complete (PDF) |
| Email templates | ✅ | ✅ | ✅ Complete |
| Structured data | ✅ | ❌ | ⚠️ Only EN (schema.org requires English) |

**Note:** Schema.org allows localized `name` fields, but best practice is to use primary language (English) for interoperability.

---

## 7. Crawlability & Indexability

### 7.1 Google Search Console Status

**Indexed Pages (Estimated):** ~50-100 pages (depends on crawl rate)

**Crawl Issues:**
- ⚠️ SPA delay: Googlebot waits for JS to render (slower indexing)
- ⚠️ Large JS bundle: Googlebot may timeout on slow connections
- ✅ No `noindex` tags on public pages
- ✅ Robots.txt allows crawling

**Recommendations:**
- Submit sitemap to Google Search Console (manual or automated)
- Monitor "Coverage" report for indexing errors
- Enable "URL Inspection" to test rendering

### 7.2 Social Media Preview

**OG Tags Validation:**
- ✅ Facebook Open Graph Debugger: https://developers.facebook.com/tools/debug/
- ✅ Twitter Card Validator: https://cards-dev.twitter.com/validator

**Sample OG Image:** `https://spirit-candle.com/og-image-home.jpg` (1200x630px)

**Issue:** Some pages use placeholder OG images (need unique images per product)

---

## 8. SEO Gaps & Recommendations

### 8.1 Critical Gaps (P0)

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **SPA architecture (no SSR)** | High | Migrate to Next.js for SSR/ISR |
| **Slow LCP (3.5-4.5s)** | High | Optimize images, code-splitting, SSR |
| **Missing FAQPage schema** | Medium | Add FAQPage schema to FAQ page (easy win for rich snippets) |

### 8.2 High-Priority Gaps (P1)

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **No image sitemap** | Medium | Add image URLs to sitemap for better image search indexing |
| **Large JS bundle** | High | Code-split admin pages, lazy load 3D/AR |
| **No critical CSS inlining** | Medium | Inline above-the-fold CSS for faster FCP |

### 8.3 Medium-Priority Gaps (P2)

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **Missing CollectionPage schema** | Low | Add CollectionPage schema to Shop/Collections |
| **No breadcrumb microdata** | Low | Already have JSON-LD; microdata optional |
| **No video sitemap** | Low | Add if product videos implemented |

---

## Conclusion

Spirit Candles has a **solid SEO foundation** with bilingual meta tags, structured data, and proper hreflang implementation. However, the **SPA architecture limits SEO potential** due to slow initial load and delayed rendering for crawlers.

**Key Strengths:**
- ✅ Bilingual meta tags (EN/PL)
- ✅ Structured data (Product, BreadcrumbList, Organization, WebSite)
- ✅ Hreflang tags for international SEO
- ✅ Canonical URLs
- ✅ Sitemap + Robots.txt

**Critical Recommendations:**
1. **Migrate to Next.js** for SSR/ISR (30-40% LCP improvement, better SEO)
2. **Add FAQPage schema** (easy win for rich snippets)
3. **Optimize images** (WebP, responsive, lazy loading)
4. **Code-split** admin pages and 3D/AR components

**Expected Impact of Next.js Migration:**
- **SEO Score:** 85-90 → 95-100
- **LCP:** 3.5-4.5s → 1.5-2.5s (50% improvement)
- **Lighthouse Performance:** 75-80 → 90-95

---

**Document End**

