#!/bin/bash
# Script di test per verificare che la sitemap funzioni correttamente

echo "🧪 Testing Sitemap Auto-Generation"
echo ""

# Test 1: Verifica che la sitemap sia accessibile
echo "Test 1: Verifica accessibilità sitemap.xml"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://spirit-candle.com/sitemap.xml)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Sitemap accessibile (HTTP $HTTP_CODE)"
else
  echo "❌ ERRORE: Sitemap non accessibile (HTTP $HTTP_CODE)"
fi
echo ""

# Test 2: Verifica formato XML valido
echo "Test 2: Verifica formato XML"
XML_VALID=$(curl -s https://spirit-candle.com/sitemap.xml | head -1 | grep -q "<?xml" && echo "valid" || echo "invalid")
if [ "$XML_VALID" = "valid" ]; then
  echo "✅ Formato XML valido"
else
  echo "❌ ERRORE: Formato XML non valido"
fi
echo ""

# Test 3: Verifica che non ci siano prefissi /en o /pl
echo "Test 3: Verifica assenza prefissi /en e /pl"
HAS_PREFIXES=$(curl -s https://spirit-candle.com/sitemap.xml | grep -c "/en\|/pl" || echo "0")
if [ "$HAS_PREFIXES" = "0" ]; then
  echo "✅ Nessun prefisso /en o /pl trovato"
else
  echo "⚠️  ATTENZIONE: Trovati $HAS_PREFIXES riferimenti a /en o /pl"
fi
echo ""

# Test 4: Verifica che le collections usino slug
echo "Test 4: Verifica che le collections usino slug (non ID UUID)"
HAS_UUID_COLLECTIONS=$(curl -s https://spirit-candle.com/sitemap.xml | grep -c "/collections/[0-9a-f]\{8\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{12\}" || echo "0")
if [ "$HAS_UUID_COLLECTIONS" = "0" ]; then
  echo "✅ Collections usano slug (non UUID)"
else
  echo "⚠️  ATTENZIONE: Trovate $HAS_UUID_COLLECTIONS collections con UUID invece di slug"
fi
echo ""

# Test 5: Conta URL totali
echo "Test 5: Conteggio URL nella sitemap"
URL_COUNT=$(curl -s https://spirit-candle.com/sitemap.xml | grep -c "<url>" || echo "0")
echo "📊 Totale URL trovati: $URL_COUNT"
echo ""

# Test 6: Verifica homepage presente
echo "Test 6: Verifica presenza homepage"
HAS_HOMEPAGE=$(curl -s https://spirit-candle.com/sitemap.xml | grep -c "<loc>https://spirit-candle.com/</loc>" || echo "0")
if [ "$HAS_HOMEPAGE" = "1" ]; then
  echo "✅ Homepage presente nella sitemap"
else
  echo "❌ ERRORE: Homepage non trovata nella sitemap"
fi
echo ""

# Test 7: Verifica presenza hreflang
echo "Test 7: Verifica presenza tag hreflang"
HAS_HREFLANG=$(curl -s https://spirit-candle.com/sitemap.xml | grep -c "hreflang" || echo "0")
if [ "$HAS_HREFLANG" -gt "0" ]; then
  echo "✅ Tag hreflang presenti ($HAS_HREFLANG occorrenze)"
else
  echo "⚠️  ATTENZIONE: Nessun tag hreflang trovato"
fi
echo ""

echo "✅ Tests completati!"
echo ""
echo "📝 Per visualizzare la sitemap completa:"
echo "   curl https://spirit-candle.com/sitemap.xml | head -50"

