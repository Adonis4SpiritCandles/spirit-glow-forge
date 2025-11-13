<!-- b135dc99-e66b-469d-ba51-62aad789d608 edcfc624-bac6-43b5-a4c1-2a7da063f3d9 -->
# Switch Stripe Integration to Production Mode

## Overview

Update Stripe integration from test/sandbox mode to production mode. This involves updating secret keys in Supabase Edge Functions secrets, configuring production webhook endpoint, and verifying Price IDs are production-ready.

## Files to Update

### 1. Supabase Edge Functions Secrets (Dashboard Configuration)

- Update `STRIPE_SECRET_KEY` from `sk_test_...` to `sk_live_...`
- Update `STRIPE_WEBHOOK_SECRET` with production webhook secret

### 2. Code Files to Review (no changes needed, but verify)

**`supabase/functions/create-checkout/index.ts`**

- Currently uses `Deno.env.get("STRIPE_SECRET_KEY")` - will automatically use production key once secret is updated
- Price IDs hardcoded (lines 57-60):
- `"281d5900-7df0-4bfe-9d4d-920267df2125": "price_1S971nDllMinRcxPqTG8h1r0"`
- `"c576eedf-5a2e-4991-bac9-13d1e8160e85": "price_1S974EDllMinRcxPFufkrqc6"`
- **Action needed**: Verify these Price IDs are production Price IDs in Stripe Dashboard

**`supabase/functions/stripe-webhook/index.ts`**

- Currently uses `Deno.env.get("STRIPE_SECRET_KEY")` and `Deno.env.get("STRIPE_WEBHOOK_SECRET")`
- Will automatically use production values once secrets are updated

## Configuration Steps

### Step 1: Get Stripe Production Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Switch to **"Live mode"** (toggle in top right)
3. Copy **Secret key** (starts with `sk_live_...`)

### Step 2: Configure Production Webhook

1. In Stripe Dashboard (Live mode), go to **Developers** → **Webhooks**
2. Create new webhook endpoint OR update existing one:

- Endpoint URL: `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/stripe-webhook`
- Events to listen: `checkout.session.completed` (and any other events needed)

3. Copy the **Signing secret** (starts with `whsec_...`)

### Step 3: Update Supabase Secrets

1. Go to **Supabase Dashboard** → **Settings** → **Edge Functions** → **Secrets**
2. Update or add:

- `STRIPE_SECRET_KEY` = `sk_live_...` (your production secret key)
- `STRIPE_WEBHOOK_SECRET` = `whsec_...` (your production webhook signing secret)

### Step 4: Verify Production Price IDs

1. In Stripe Dashboard (Live mode), go to **Products**
2. Find the products matching:

- Product ID `281d5900-7df0-4bfe-9d4d-920267df2125` (Mystic Rose)
- Product ID `c576eedf-5a2e-4991-bac9-13d1e8160e85` (Golden Amber)

3. Copy the **Price IDs** for these products (should start with `price_...`)
4. If Price IDs differ from test mode, update them in `supabase/functions/create-checkout/index.ts` (lines 57-60)

### Step 5: Test Production Setup

1. Create a test order using Stripe test card: `4242 4242 4242 4242`
2. Verify payment appears in Stripe Dashboard → **Payments** (Live mode)
3. Verify webhook events appear in Stripe Dashboard → **Developers** → **Webhooks** → **Events**
4. Verify order is created in Supabase `orders` table

## Documentation Update

- Update `PRODUCTION_SETUP.md` to include verification checklist for Price IDs

## Notes

- Stripe SDK automatically detects environment from key prefix (`sk_test_...` vs `sk_live_...`)
- No code changes needed if Price IDs remain the same between test and production
- Webhook endpoint URL should match exactly: `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/stripe-webhook`
- Frontend uses Edge Functions (no direct Stripe SDK), so no frontend changes needed

### To-dos

- [ ] Replace country list with all EU/EEA countries (~30) in ShippingAddressForm.tsx
- [ ] Move Country selector field before Street Address in form layout
- [ ] Add character counters and visual warnings (yellow/red borders) for all fields with Furgonetka limits
- [ ] Add submit validation to block form if any field exceeds Furgonetka limits