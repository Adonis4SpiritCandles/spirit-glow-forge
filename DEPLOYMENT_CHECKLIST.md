# ✅ SEO Edge Function - Deployment Checklist

Use this checklist to deploy the Dynamic SEO Meta Tags feature to production.

## 📋 Pre-Deployment

- [ ] Review all changes in this PR/commit
- [ ] Read `SEO_IMPLEMENTATION_SUMMARY.md` for overview
- [ ] Read `DEPLOY_INSTRUCTIONS.md` for detailed steps
- [ ] Read `SEO_EDGE_FUNCTION_README.md` for technical documentation

## 🗄️ Database Migration

- [ ] Login to Supabase Dashboard or use Supabase CLI
- [ ] Apply migration: `supabase/migrations/20251119000001_add_use_specific_meta_to_seo_settings.sql`
  - **CLI**: `supabase db push`
  - **Dashboard**: Copy SQL to SQL Editor and execute
- [ ] Verify column exists: `SELECT use_specific_meta FROM seo_settings LIMIT 1;`
- [ ] Set default values if needed: `UPDATE seo_settings SET use_specific_meta = false WHERE use_specific_meta IS NULL;`

## 🚀 Edge Function Deployment

- [ ] Ensure Supabase CLI is installed: `supabase --version`
  - If not: `npm install -g supabase`
- [ ] Login to Supabase: `supabase login`
- [ ] Link to project: `supabase link --project-ref fhtuqmdlgzmpsbflxhra`
- [ ] Deploy function: `supabase functions deploy serve-seo-meta`
- [ ] Verify deployment: `supabase functions list`
  - Look for `serve-seo-meta` in the list
- [ ] Test function directly:
  ```bash
  curl -H "User-Agent: facebookexternalhit/1.0" \
    https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/serve-seo-meta?path=/about
  ```
- [ ] Verify response contains HTML with meta tags

## 🌐 Hosting Configuration

### If Using Netlify:
- [ ] Open `netlify.toml` in the project root
- [ ] Replace `YOUR_SUPABASE_PROJECT` with `fhtuqmdlgzmpsbflxhra`
  - Line should read: `to = "https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/serve-seo-meta?path=:splat"`
- [ ] Commit changes: `git add netlify.toml && git commit -m "Configure SEO Edge Function redirect"`
- [ ] Push to repository: `git push`
- [ ] Wait for Netlify auto-deploy to complete
- [ ] Verify redirects are active in Netlify dashboard

### If Using Vercel:
- [ ] Open `vercel.json` in the project root
- [ ] Replace `YOUR_SUPABASE_PROJECT` with `fhtuqmdlgzmpsbflxhra`
  - Line should read: `"destination": "https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/serve-seo-meta?path=$1"`
- [ ] Commit changes: `git add vercel.json && git commit -m "Configure SEO Edge Function rewrite"`
- [ ] Push to repository: `git push`
- [ ] Wait for Vercel auto-deploy to complete
- [ ] Verify rewrites are active in Vercel dashboard

## 🧪 Testing

### Test 1: Direct Edge Function
- [ ] Run: `bash test-seo-edge-function.sh`
- [ ] All tests should pass
- [ ] Verify HTML contains correct meta tags

### Test 2: Facebook Debugger
- [ ] Go to: https://developers.facebook.com/tools/debug/
- [ ] Test homepage: `https://spirit-candle.com/`
  - [ ] Click "Scrape Again" 2-3 times
  - [ ] Verify title matches homepage settings
  - [ ] Verify description matches
  - [ ] Verify OG image displays
- [ ] Test about page: `https://spirit-candle.com/en/about`
  - [ ] Click "Scrape Again" 2-3 times
  - [ ] Verify title is DIFFERENT from homepage
  - [ ] Verify description is specific to About page
- [ ] Test shop page: `https://spirit-candle.com/en/shop`
  - [ ] Click "Scrape Again" 2-3 times
  - [ ] Verify shop-specific meta tags

### Test 3: Twitter Card Validator
- [ ] Go to: https://cards-dev.twitter.com/validator
- [ ] Test homepage: `https://spirit-candle.com/`
  - [ ] Verify card displays correctly
- [ ] Test contact page: `https://spirit-candle.com/contact`
  - [ ] Verify card shows contact-specific data

### Test 4: Language-Specific Pages
- [ ] Test Polish homepage: `https://spirit-candle.com/pl`
  - [ ] Use Facebook Debugger
  - [ ] Verify Polish title and description
  - [ ] Verify `og:locale` is `pl_PL`
- [ ] Test Polish about: `https://spirit-candle.com/pl/about`
  - [ ] Verify Polish content

### Test 5: Product/Collection Pages (if applicable)
- [ ] Go to Admin Dashboard → SEO Settings → Product Pages
- [ ] Note current "Use Specific Meta Tags" setting
- [ ] Test a product URL with Facebook Debugger
  - [ ] If toggle is OFF: Should show generic product meta tags
  - [ ] If toggle is ON: Should show product-specific name and image
- [ ] Repeat for collection page

### Test 6: Regular User Experience
- [ ] Open site in regular browser (not crawler)
- [ ] Navigate through pages
- [ ] Verify site loads normally (no redirects for regular users)
- [ ] Check browser console for errors
- [ ] Verify page transitions work smoothly

## 🔍 Verification

### Edge Function Logs
- [ ] Check logs: `supabase functions logs serve-seo-meta`
- [ ] Look for any errors
- [ ] Verify crawler requests are being logged
- [ ] Verify correct page types are detected

### Database Verification
- [ ] Check `seo_settings` table has data for all page types
- [ ] Verify English fields are populated (`title_en`, `description_en`)
- [ ] Verify Polish fields are populated (`title_pl`, `description_pl`)
- [ ] Verify OG image URLs are accessible
- [ ] Check `use_specific_meta` values are set correctly

### Admin Dashboard
- [ ] Login as admin
- [ ] Go to: Admin Dashboard → Spirit Tools & Site → SEO Settings
- [ ] Verify all page types are listed
- [ ] Test editing a page's SEO settings
- [ ] Save changes
- [ ] Verify changes appear in database
- [ ] Test with Facebook Debugger to confirm changes are live

## 🐛 Troubleshooting

If tests fail, check:

### Issue: Facebook still shows old data
- [ ] Clear Facebook cache: Click "Scrape Again" 3-5 times
- [ ] Wait 5 minutes and try again
- [ ] Add query parameter: `?v=2` to force new scrape

### Issue: Edge Function returns 404
- [ ] Verify function is deployed: `supabase functions list`
- [ ] Check Supabase project ID is correct in hosting config
- [ ] Test function directly with curl (bypass hosting)

### Issue: All pages show homepage data
- [ ] Verify hosting redirects/rewrites are active
- [ ] Check `netlify.toml` or `vercel.json` syntax
- [ ] Test crawler detection: `curl -H "User-Agent: facebookexternalhit" https://spirit-candle.com/about`
- [ ] Check Edge Function logs for requests

### Issue: Meta tags are empty
- [ ] Verify database has SEO settings for that page type
- [ ] Check language fields are populated
- [ ] Review Edge Function logs for errors
- [ ] Test fallback logic is working

## 📝 Post-Deployment

- [ ] Update team/documentation with new feature
- [ ] Train admins on SEO Settings Manager
- [ ] Monitor Edge Function logs for errors (first 24 hours)
- [ ] Track social media traffic changes
- [ ] Set up monitoring/alerts for Edge Function errors
- [ ] Schedule review of SEO performance in 1 week

## 🎉 Success Criteria

All of these should be true:

- ✅ Edge Function deployed and accessible
- ✅ Database migration applied successfully
- ✅ Hosting redirects configured correctly
- ✅ Facebook Debugger shows different meta tags for different pages
- ✅ Twitter Card Validator displays correct previews
- ✅ Polish pages show Polish meta tags
- ✅ Regular users see normal site (no performance impact)
- ✅ Admin can edit SEO settings and changes appear immediately
- ✅ No errors in Edge Function logs
- ✅ Products/collections show correct meta tags based on toggle

## 📞 Support

If you encounter issues during deployment:

1. Check `DEPLOY_INSTRUCTIONS.md` for detailed troubleshooting
2. Review `SEO_EDGE_FUNCTION_README.md` for technical details
3. Check Supabase logs: `supabase functions logs serve-seo-meta`
4. Test with provided scripts: `bash test-seo-edge-function.sh`
5. Verify hosting configuration matches your platform (Netlify/Vercel)

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Verified By**: _______________  
**Status**: [ ] Complete [ ] Issues Found

