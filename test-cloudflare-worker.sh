#!/bin/bash
# Script di test per verificare che il Cloudflare Worker funzioni correttamente

echo "🧪 Testing Cloudflare Worker for SEO Meta Tags"
echo ""

BASE_URL="https://spirit-candle.com"

# Test 1: Homepage
echo "Test 1: Homepage"
OG_URL=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/" | grep -o 'og:url[^>]*' | head -1)
echo "   $OG_URL"
echo ""

# Test 2: Collections page
echo "Test 2: Collections page"
OG_URL=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/collections/luxury" 2>/dev/null | grep -o 'og:url[^>]*' | head -1)
if [ -n "$OG_URL" ]; then
    echo "   $OG_URL"
else
    echo "   ⚠️  Nessun og:url trovato (la collection potrebbe non esistere)"
fi
echo ""

# Test 3: Product page
echo "Test 3: Product page"
# Prendi il primo product ID dalla sitemap
PRODUCT_ID=$(curl -s "$BASE_URL/sitemap.xml" | grep -oP '/product/\K[^<]+' | head -1)
if [ -n "$PRODUCT_ID" ]; then
    OG_URL=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/product/$PRODUCT_ID" 2>/dev/null | grep -o 'og:url[^>]*' | head -1)
    echo "   Product: $PRODUCT_ID"
    if [ -n "$OG_URL" ]; then
        echo "   $OG_URL"
    else
        echo "   ⚠️  Nessun og:url trovato"
    fi
else
    echo "   ⚠️  Nessun prodotto trovato nella sitemap"
fi
echo ""

# Test 4: Verify no Supabase URL
echo "Test 4: Verifying no Supabase URL in HTML"
HAS_SUPABASE=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/collections/luxury" 2>/dev/null | grep -c "fhtuqmdlgzmpsbflxhra.supabase.co" || echo "0")
if [ "$HAS_SUPABASE" = "0" ]; then
    echo "   ✅ OK: No Supabase URL found"
else
    echo "   ❌ ERROR: Supabase URL found!"
fi
echo ""

# Test 5: Verify og:url is correct
echo "Test 5: Verify og:url is correct (should be spirit-candle.com, not Supabase)"
HOME_OG_URL=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/" | grep -oP 'property="og:url"\s+content="\K[^"]+' || echo "")
if [[ "$HOME_OG_URL" == "$BASE_URL"* ]]; then
    echo "   ✅ OK: og:url corretto ($HOME_OG_URL)"
else
    echo "   ❌ ERROR: og:url non corretto ($HOME_OG_URL)"
fi
echo ""

echo "✅ Tests completed!"
echo ""
echo "📝 Per visualizzare l'HTML completo di una pagina:"
echo "   curl -H \"User-Agent: facebookexternalhit/1.1\" $BASE_URL/ | head -100"
