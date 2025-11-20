#!/bin/bash
# Script di test completo per Cloudflare Worker e SEO

echo "🧪 Testing Cloudflare Worker & SEO Setup"
echo "=========================================="
echo ""

BASE_URL="https://spirit-candle.com"

# Test 1: Verifica che il Worker risponda
echo "Test 1: Verifica risposta Worker"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Worker risponde correttamente (HTTP $HTTP_CODE)"
else
  echo "❌ ERRORE: Worker non risponde (HTTP $HTTP_CODE)"
fi
echo ""

# Test 2: Verifica og:url corretto (non Supabase URL)
echo "Test 2: Verifica og:url corretto"
OG_URL=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/collections/luxury" | grep -oP 'property="og:url" content="\K[^"]*' | head -1)
if [[ "$OG_URL" == *"spirit-candle.com"* ]] && [[ "$OG_URL" != *"supabase.co"* ]]; then
  echo "✅ og:url corretto: $OG_URL"
else
  echo "❌ ERRORE: og:url non corretto: $OG_URL"
fi
echo ""

# Test 3: Verifica sitemap accessibile
echo "Test 3: Verifica sitemap.xml"
SITEMAP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/sitemap.xml")
if [ "$SITEMAP_CODE" = "200" ]; then
  echo "✅ Sitemap accessibile (HTTP $SITEMAP_CODE)"
  
  # Verifica formato XML
  XML_VALID=$(curl -s "$BASE_URL/sitemap.xml" | head -1 | grep -q "<?xml" && echo "valid" || echo "invalid")
  if [ "$XML_VALID" = "valid" ]; then
    echo "✅ Formato XML valido"
  else
    echo "❌ ERRORE: Formato XML non valido"
  fi
  
  # Conta URL
  URL_COUNT=$(curl -s "$BASE_URL/sitemap.xml" | grep -c "<url>" || echo "0")
  echo "📊 Totale URL nella sitemap: $URL_COUNT"
else
  echo "❌ ERRORE: Sitemap non accessibile (HTTP $SITEMAP_CODE)"
fi
echo ""

# Test 4: Verifica che utenti normali non vengano intercettati
echo "Test 4: Verifica utenti normali (non crawler)"
NORMAL_USER_HTML=$(curl -s -H "User-Agent: Mozilla/5.0" "$BASE_URL/" | head -20)
if [[ "$NORMAL_USER_HTML" == *"<!DOCTYPE html>"* ]] || [[ "$NORMAL_USER_HTML" == *"<html"* ]]; then
  echo "✅ Utenti normali ricevono HTML normale (SPA)"
else
  echo "⚠️  ATTENZIONE: Utenti normali potrebbero ricevere contenuto errato"
fi
echo ""

# Test 5: Verifica meta tags per homepage
echo "Test 5: Verifica meta tags homepage"
HOMEPAGE_OG_TITLE=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/" | grep -oP 'property="og:title" content="\K[^"]*' | head -1)
if [ -n "$HOMEPAGE_OG_TITLE" ]; then
  echo "✅ og:title homepage: $HOMEPAGE_OG_TITLE"
else
  echo "⚠️  ATTENZIONE: og:title non trovato per homepage"
fi
echo ""

# Test 6: Verifica meta tags per collection
echo "Test 6: Verifica meta tags collection"
COLLECTION_OG_TITLE=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/collections/luxury" | grep -oP 'property="og:title" content="\K[^"]*' | head -1)
if [ -n "$COLLECTION_OG_TITLE" ]; then
  echo "✅ og:title collection: $COLLECTION_OG_TITLE"
  if [[ "$COLLECTION_OG_TITLE" == *"{"* ]]; then
    echo "⚠️  ATTENZIONE: Placeholder non sostituito in og:title"
  fi
else
  echo "⚠️  ATTENZIONE: og:title non trovato per collection"
fi
echo ""

# Test 7: Verifica meta tags per prodotto
echo "Test 7: Verifica meta tags prodotto"
PRODUCT_OG_TITLE=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/product/70c30e10-1d2f-4dab-bf63-1932d11c561b" | grep -oP 'property="og:title" content="\K[^"]*' | head -1)
if [ -n "$PRODUCT_OG_TITLE" ]; then
  echo "✅ og:title prodotto: $PRODUCT_OG_TITLE"
  if [[ "$PRODUCT_OG_TITLE" == *"{"* ]]; then
    echo "⚠️  ATTENZIONE: Placeholder non sostituito in og:title"
  fi
else
  echo "⚠️  ATTENZIONE: og:title non trovato per prodotto"
fi
echo ""

# Test 8: Verifica che non ci siano URL Supabase nell'HTML
echo "Test 8: Verifica assenza URL Supabase"
SUPABASE_URLS=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/collections/luxury" | grep -c "fhtuqmdlgzmpsbflxhra.supabase.co" || echo "0")
if [ "$SUPABASE_URLS" = "0" ]; then
  echo "✅ Nessun URL Supabase trovato nell'HTML"
else
  echo "⚠️  ATTENZIONE: Trovati $SUPABASE_URLS riferimenti a Supabase nell'HTML"
fi
echo ""

echo "=========================================="
echo "✅ Tests completati!"
echo ""
echo "📝 Prossimi passi:"
echo "   1. Verifica su Facebook Debugger: https://developers.facebook.com/tools/debug/"
echo "   2. Verifica su Twitter Card Validator: https://cards-dev.twitter.com/validator"
echo "   3. Testa condivisione su WhatsApp"
echo "   4. Verifica sitemap su Google Search Console"

