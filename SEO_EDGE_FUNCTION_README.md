# 🔍 Dynamic SEO Meta Tags - Edge Function Implementation

## Overview

This implementation solves the problem where social media crawlers (Facebook, Twitter, LinkedIn, etc.) see the same meta tags for all pages on the Spirit Candles website. The solution uses a Supabase Edge Function that intercepts crawler requests and serves HTML with dynamic meta tags fetched from the database.

## Architecture

```
┌─────────────────┐
│  Social Media   │
│    Crawler      │
│ (Facebook, etc.)│
└────────┬────────┘
         │
         │ User-Agent: facebookexternalhit
         ▼
┌─────────────────────────────┐
│   Hosting Platform          │
│   (Netlify/Vercel)          │
│                             │
│   Detects Crawler →         │
│   Redirects to Edge Function│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Supabase Edge Function     │
│  serve-seo-meta             │
│                             │
│  1. Parse URL               │
│  2. Detect page type        │
│  3. Extract language        │
│  4. Query seo_settings DB   │
│  5. Generate HTML with      │
│     dynamic meta tags       │
└────────┬────────────────────┘
         │
         │ HTML with correct meta tags
         ▼
┌─────────────────────────────┐
│  Social Media Platform      │
│  Renders preview card       │
│  with correct image,        │
│  title, and description     │
└─────────────────────────────┘
```

## Files Created/Modified

### New Files
- `supabase/migrations/20251119000001_add_use_specific_meta_to_seo_settings.sql` - Database schema update
- `supabase/functions/serve-seo-meta/index.ts` - Main Edge Function
- `supabase/functions/serve-seo-meta/helpers.ts` - Helper functions
- `netlify.toml` - Netlify hosting configuration
- `vercel.json` - Vercel hosting configuration
- `SEO_EDGE_FUNCTION_README.md` - This file

### Modified Files
- `src/components/admin/SiteSettings/SEOSettings/SEOSettingsManager.tsx` - Added UI for meta tag generation strategy
- `DEPLOY_INSTRUCTIONS.md` - Added deployment and testing instructions

## Database Schema

### New Column: `use_specific_meta`

Added to `seo_settings` table:

```sql
ALTER TABLE public.seo_settings
ADD COLUMN IF NOT EXISTS use_specific_meta boolean DEFAULT false;
```

**Purpose**: Controls whether to use generic meta tags (from `product_default`/`collection_default`) or generate specific meta tags from actual product/collection data.

## URL Pattern Detection

The Edge Function detects page types based on URL patterns:

| URL Pattern | Page Type | Language Extraction |
|-------------|-----------|---------------------|
| `/` or `/en` or `/pl` | `home` | EN or PL |
| `/en/about` or `/pl/about` | `about` | EN or PL |
| `/en/shop` or `/pl/shop` | `shop` | EN or PL |
| `/en/contact` or `/pl/contact` | `contact` | EN or PL |
| `/en/product/:id` | `product` | EN |
| `/pl/product/:id` | `product` | PL |
| `/en/collection/:id` | `collection` | EN |
| `/pl/collection/:id` | `collection` | PL |
| `/en/custom-candles` | `custom_candles` | EN |

**Default Language**: English (if no language prefix is detected)

## Meta Tag Generation Logic

### For Regular Pages (home, shop, about, contact, custom_candles)
1. Fetch SEO settings from `seo_settings` table for the specific `page_type`
2. Use the appropriate language fields (`title_en`/`title_pl`, etc.)
3. Fallback to default values if no settings found

### For Products
1. Check `use_specific_meta` flag in `product_default` settings
2. **If `false` (default)**:
   - Use generic meta tags from `product_default` settings
3. **If `true`**:
   - Fetch specific product data (name, description, image, price)
   - Generate meta tags from actual product data
   - Title: `{Product Name} | SPIRIT CANDLES`
   - Description: Product description
   - Image: Product image
   - Include `product:price:amount` and `product:price:currency` tags

### For Collections
1. Check `use_specific_meta` flag in `collection_default` settings
2. **If `false` (default)**:
   - Use generic meta tags from `collection_default` settings
3. **If `true`**:
   - Fetch specific collection data (name, description, image)
   - Generate meta tags from actual collection data
   - Title: `{Collection Name} Collection | SPIRIT CANDLES`
   - Description: Collection description
   - Image: Collection image or cover image

## Crawler Detection

The function detects the following crawlers:
- Facebook: `facebookexternalhit`, `Facebot`
- Twitter: `twitterbot`
- LinkedIn: `linkedinbot`
- Slack: `slackbot`
- Telegram: `telegrambot`
- WhatsApp: `whatsapp`
- Pinterest: `pinterest`
- Discord: `discordbot`
- Google: `googlebot`
- Bing: `bingbot`
- Baidu: `baiduspider`
- Yandex: `yandexbot`

**Non-crawler users** see the normal React SPA (no redirect to Edge Function).

## Generated HTML Structure

The Edge Function generates complete HTML with:
- `<title>` tag
- `<meta name="description">`
- `<meta name="keywords">` (if provided)
- `<meta name="robots">` (respects `noindex` setting)
- `<link rel="canonical">`
- **Open Graph tags**:
  - `og:type`, `og:url`, `og:title`, `og:description`
  - `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`
  - `og:site_name`, `og:locale`, `og:locale:alternate`
  - `product:price:amount`, `product:price:currency` (for products)
- **Twitter Card tags**:
  - `twitter:card`, `twitter:url`, `twitter:title`, `twitter:description`
  - `twitter:image`, `twitter:image:alt`
  - `twitter:creator`, `twitter:site`
- **Alternate language links**:
  - `<link rel="alternate" hreflang="en">`
  - `<link rel="alternate" hreflang="pl">`
  - `<link rel="alternate" hreflang="x-default">`

## Admin UI

### Accessing SEO Settings Manager

1. Login as admin
2. Navigate to **Admin Dashboard → Spirit Tools & Site → SEO Settings**
3. Select the page type from the badges (Homepage, Shop, Product Pages, Collections, About, Contact)

### Meta Tag Generation Strategy (Products/Collections Only)

When editing **Product Pages** or **Collections**, you'll see a new section:

**"Meta Tag Generation Strategy"**

- **Toggle: "Use Specific Meta Tags"**
  - **OFF** (default): Uses the generic meta tags you configure above
  - **ON**: Generates specific meta tags from actual product/collection data

**Example Use Cases**:

- **Use generic tags** (OFF) when:
  - You want consistent branding across all products
  - You have a specific message for all product pages
  - You want to control the OG image used for all products

- **Use specific tags** (ON) when:
  - You want each product to show its own name and image
  - Product descriptions should appear in social previews
  - You need accurate product-specific information for SEO

## Testing

### 1. Test Crawler Detection

```bash
# Simulate Facebook crawler
curl -H "User-Agent: facebookexternalhit/1.0" \
  https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/serve-seo-meta?path=/about

# Should return HTML with meta tags for "About" page
```

### 2. Test with Facebook Debugger

1. Go to https://developers.facebook.com/tools/debug/
2. Enter: `https://spirit-candle.com/about`
3. Click **"Scrape Again"** 2-3 times
4. Verify:
   - Title shows "About" page title (not homepage)
   - Description is specific to About page
   - Image is correct

### 3. Test with Twitter Card Validator

1. Go to https://cards-dev.twitter.com/validator
2. Enter: `https://spirit-candle.com/shop`
3. Verify the preview shows correct Shop meta tags

### 4. Test Different URLs

Test all page types:
- Homepage: `https://spirit-candle.com/`
- Shop: `https://spirit-candle.com/en/shop`
- About (Polish): `https://spirit-candle.com/pl/about`
- Contact: `https://spirit-candle.com/contact`
- Product: `https://spirit-candle.com/en/product/{product-id}`
- Collection: `https://spirit-candle.com/pl/collection/{collection-id}`

### 5. Test Generic vs Specific Meta Tags

**For Products:**
1. Go to SEO Settings → Product Pages
2. Set "Use Specific Meta Tags" to **OFF**
3. Test a product URL in Facebook Debugger → should show generic tags
4. Set "Use Specific Meta Tags" to **ON**
5. Test again → should show product-specific name, description, and image

## Cache Busting

Social media platforms aggressively cache meta tags!

### Facebook
- Use "Scrape Again" button 2-3 times
- Cache duration: ~24 hours
- Force refresh: Scrape multiple times in succession

### Twitter
- Cache duration: ~7 days
- Workaround: Add query parameter `?v=2` to URL
- Example: `https://spirit-candle.com/about?v=2`

### LinkedIn
- Cache duration: ~7 days
- Use LinkedIn Post Inspector to refresh

## Troubleshooting

### Issue: Crawlers still see old meta tags

**Solutions:**
1. Clear cache using social media debugger tools
2. Verify Edge Function is deployed: `supabase functions list`
3. Check hosting configuration (`netlify.toml` or `vercel.json`)
4. Verify Supabase URL is correct in hosting config

### Issue: Edge Function returns errors

**Check:**
1. Function logs: `supabase functions logs serve-seo-meta`
2. Environment variables are set (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
3. Database `seo_settings` table has data
4. Product/collection IDs exist in database

### Issue: Meta tags are empty

**Check:**
1. SEO settings exist for that `page_type` in database
2. Language-specific fields are populated (`title_en`, `description_en`, etc.)
3. Fallback values are working (check Edge Function code)

### Issue: Specific meta tags not working for products

**Check:**
1. `use_specific_meta` is set to `true` in `product_default` settings
2. Product ID in URL exists in `products` table
3. Product has required fields (`name_en`, `description_en`, `image`)
4. Check Edge Function logs for errors

## Performance

### Caching Strategy

The Edge Function includes cache headers:
```
Cache-Control: public, max-age=3600, s-maxage=3600
```

This caches responses for 1 hour:
- Reduces database queries
- Improves response time for repeated crawler requests
- Still allows fresh data after updates

### Database Queries

For each crawler request:
- 1 query to `seo_settings` table
- +1 query to `products` or `collections` (if using specific meta tags)

**Optimization**: Consider adding database indexes on frequently queried columns.

## Future Improvements

1. **Pre-rendering**: Migrate to Next.js for built-in SSR and SSG
2. **Dynamic OG Images**: Generate OG images on-the-fly with product info
3. **Analytics**: Track crawler visits and meta tag performance
4. **A/B Testing**: Test different meta tag strategies
5. **Automated Testing**: CI/CD pipeline to verify meta tags

## Support

For issues or questions:
1. Check `supabase functions logs serve-seo-meta`
2. Review `DEPLOY_INSTRUCTIONS.md`
3. Test with curl to isolate hosting vs Edge Function issues
4. Verify database settings in admin dashboard

---

**Last Updated**: November 19, 2024
**Version**: 1.0.0

