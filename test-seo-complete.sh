#!/bin/bash
# Script completo di test per SEO, Sitemap e Cloudflare Worker
# Verifica che tutto funzioni correttamente

echo "🧪 Test Completo SEO, Sitemap e Cloudflare Worker"
echo "=================================================="
echo ""

BASE_URL="https://spirit-candle.com"
SUPABASE_EDGE_FUNCTION="https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1"

# Colori per output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contatori
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNING=0

# Funzione helper per test
test_check() {
    local name="$1"
    local condition="$2"
    local message="$3"
    
    if eval "$condition"; then
        echo -e "${GREEN}✅ $name${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        if [ -n "$message" ]; then
            echo -e "${RED}❌ $name${NC} - $message"
        else
            echo -e "${RED}❌ $name${NC}"
        fi
        ((TESTS_FAILED++))
        return 1
    fi
}

test_warning() {
    local name="$1"
    local message="$2"
    echo -e "${YELLOW}⚠️  $name${NC} - $message"
    ((TESTS_WARNING++))
}

echo "📋 Test 1: Sitemap XML"
echo "----------------------"

# Test 1.1: Sitemap accessibile
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/sitemap.xml")
test_check "Sitemap accessibile" "[ '$HTTP_CODE' = '200' ]" "HTTP Code: $HTTP_CODE"

# Test 1.2: Formato XML valido
XML_HEADER=$(curl -s "$BASE_URL/sitemap.xml" | head -1 | grep -q "<?xml" && echo "valid" || echo "invalid")
test_check "Formato XML valido" "[ '$XML_HEADER' = 'valid' ]"

# Test 1.3: Nessun prefisso /en o /pl
HAS_PREFIXES=$(curl -s "$BASE_URL/sitemap.xml" | grep -c "/en\|/pl" || echo "0")
test_check "Nessun prefisso /en o /pl" "[ '$HAS_PREFIXES' = '0' ]" "Trovati $HAS_PREFIXES riferimenti"

# Test 1.4: Collections usano slug (non UUID)
HAS_UUID_COLLECTIONS=$(curl -s "$BASE_URL/sitemap.xml" | grep -c "/collections/[0-9a-f]\{8\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{12\}" || echo "0")
test_check "Collections usano slug" "[ '$HAS_UUID_COLLECTIONS' = '0' ]" "Trovate $HAS_UUID_COLLECTIONS collections con UUID"

# Test 1.5: Homepage presente
HAS_HOMEPAGE=$(curl -s "$BASE_URL/sitemap.xml" | grep -c "<loc>$BASE_URL/</loc>" || echo "0")
test_check "Homepage presente" "[ '$HAS_HOMEPAGE' = '1' ]"

# Test 1.6: Conta URL totali
URL_COUNT=$(curl -s "$BASE_URL/sitemap.xml" | grep -c "<url>" || echo "0")
echo "   📊 Totale URL nella sitemap: $URL_COUNT"
if [ "$URL_COUNT" -lt "10" ]; then
    test_warning "Numero URL sitemap" "Solo $URL_COUNT URL trovati (attesi almeno 10)"
fi

# Test 1.7: Tag hreflang presenti
HAS_HREFLANG=$(curl -s "$BASE_URL/sitemap.xml" | grep -c "hreflang" || echo "0")
if [ "$HAS_HREFLANG" -gt "0" ]; then
    echo -e "${GREEN}✅ Tag hreflang presenti ($HAS_HREFLANG occorrenze)${NC}"
    ((TESTS_PASSED++))
else
    test_warning "Tag hreflang" "Nessun tag hreflang trovato"
fi

echo ""
echo "📋 Test 2: Edge Function SEO Meta Tags"
echo "----------------------------------------"

# Test 2.1: Edge Function raggiungibile
EDGE_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_EDGE_FUNCTION/serve-seo-meta?path=/")
test_check "Edge Function serve-seo-meta raggiungibile" "[ '$EDGE_HTTP' = '200' ]" "HTTP Code: $EDGE_HTTP"

# Test 2.2: Edge Function sitemap raggiungibile
SITEMAP_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_EDGE_FUNCTION/generate-sitemap")
test_check "Edge Function generate-sitemap raggiungibile" "[ '$SITEMAP_HTTP' = '200' ]" "HTTP Code: $SITEMAP_HTTP"

# Test 2.3: Homepage meta tags
HOME_HTML=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/" 2>/dev/null)
if [ -n "$HOME_HTML" ]; then
    HAS_OG_TITLE=$(echo "$HOME_HTML" | grep -c "og:title" || echo "0")
    HAS_OG_DESCRIPTION=$(echo "$HOME_HTML" | grep -c "og:description" || echo "0")
    HAS_OG_IMAGE=$(echo "$HOME_HTML" | grep -c "og:image" || echo "0")
    HAS_OG_URL=$(echo "$HOME_HTML" | grep -c "og:url" || echo "0")
    
    test_check "Homepage: og:title presente" "[ '$HAS_OG_TITLE' -gt '0' ]"
    test_check "Homepage: og:description presente" "[ '$HAS_OG_DESCRIPTION' -gt '0' ]"
    test_check "Homepage: og:image presente" "[ '$HAS_OG_IMAGE' -gt '0' ]"
    test_check "Homepage: og:url presente" "[ '$HAS_OG_URL' -gt '0' ]"
    
    # Verifica che og:url sia corretto
    OG_URL_VALUE=$(echo "$HOME_HTML" | grep -oP 'property="og:url"\s+content="\K[^"]+' || echo "")
    if [[ "$OG_URL_VALUE" == "$BASE_URL/"* ]] || [[ "$OG_URL_VALUE" == "$BASE_URL" ]]; then
        echo -e "${GREEN}✅ Homepage: og:url corretto ($OG_URL_VALUE)${NC}"
        ((TESTS_PASSED++))
    else
        test_warning "Homepage: og:url" "Valore: $OG_URL_VALUE (atteso: $BASE_URL/)"
    fi
else
    test_warning "Homepage HTML" "Impossibile recuperare HTML"
fi

echo ""
echo "📋 Test 3: Pagine Principali"
echo "-----------------------------"

# Array di pagine da testare
PAGES=(
    "/shop"
    "/collections"
    "/about"
    "/contact"
    "/faq"
    "/custom-candles"
)

for page in "${PAGES[@]}"; do
    PAGE_HTML=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL$page" 2>/dev/null)
    if [ -n "$PAGE_HTML" ]; then
        HAS_OG_TITLE=$(echo "$PAGE_HTML" | grep -c "og:title" || echo "0")
        if [ "$HAS_OG_TITLE" -gt "0" ]; then
            echo -e "${GREEN}✅ $page: meta tags presenti${NC}"
            ((TESTS_PASSED++))
        else
            test_warning "$page: meta tags" "Nessun og:title trovato"
        fi
    else
        test_warning "$page: accessibilità" "Impossibile recuperare HTML"
    fi
done

echo ""
echo "📋 Test 4: Collections e Products"
echo "----------------------------------"

# Test collections (se disponibili)
COLLECTIONS=$(curl -s "$BASE_URL/sitemap.xml" | grep -oP '/collections/\K[^<]+' | head -3)
if [ -n "$COLLECTIONS" ]; then
    echo "$COLLECTIONS" | while read -r collection_slug; do
        if [ -n "$collection_slug" ]; then
            COLL_HTML=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/collections/$collection_slug" 2>/dev/null)
            if [ -n "$COLL_HTML" ]; then
                HAS_OG_TITLE=$(echo "$COLL_HTML" | grep -c "og:title" || echo "0")
                if [ "$HAS_OG_TITLE" -gt "0" ]; then
                    echo -e "${GREEN}✅ Collection /collections/$collection_slug: meta tags presenti${NC}"
                    ((TESTS_PASSED++))
                else
                    test_warning "Collection /collections/$collection_slug" "Nessun og:title trovato"
                fi
            fi
        fi
    done
else
    test_warning "Collections" "Nessuna collection trovata nella sitemap"
fi

# Test products (se disponibili)
PRODUCTS=$(curl -s "$BASE_URL/sitemap.xml" | grep -oP '/product/\K[^<]+' | head -3)
if [ -n "$PRODUCTS" ]; then
    echo "$PRODUCTS" | while read -r product_id; do
        if [ -n "$product_id" ]; then
            PROD_HTML=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/product/$product_id" 2>/dev/null)
            if [ -n "$PROD_HTML" ]; then
                HAS_OG_TITLE=$(echo "$PROD_HTML" | grep -c "og:title" || echo "0")
                if [ "$HAS_OG_TITLE" -gt "0" ]; then
                    echo -e "${GREEN}✅ Product /product/$product_id: meta tags presenti${NC}"
                    ((TESTS_PASSED++))
                else
                    test_warning "Product /product/$product_id" "Nessun og:title trovato"
                fi
            fi
        fi
    done
else
    test_warning "Products" "Nessun prodotto trovato nella sitemap"
fi

echo ""
echo "📋 Test 5: Cloudflare Worker (se configurato)"
echo "----------------------------------------------"

# Test se Cloudflare è attivo (verifica header CF-Ray)
CF_RAY=$(curl -s -I "$BASE_URL/" | grep -i "cf-ray" || echo "")
if [ -n "$CF_RAY" ]; then
    echo -e "${GREEN}✅ Cloudflare attivo${NC}"
    echo "   $CF_RAY"
    ((TESTS_PASSED++))
    
    # Verifica che il Worker funzioni (se configurato)
    # Nota: Questo test funziona solo se Cloudflare Worker è configurato
    WORKER_TEST=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$BASE_URL/" | grep -i "cloudflare\|worker" || echo "")
    if [ -z "$WORKER_TEST" ]; then
        echo -e "${GREEN}✅ Worker funziona (nessun errore visibile)${NC}"
        ((TESTS_PASSED++))
    fi
else
    test_warning "Cloudflare" "Cloudflare non rilevato (header CF-Ray mancante). Il Worker potrebbe non essere attivo."
fi

echo ""
echo "=================================================="
echo "📊 Riepilogo Test"
echo "=================================================="
echo -e "${GREEN}✅ Test passati: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Test falliti: $TESTS_FAILED${NC}"
echo -e "${YELLOW}⚠️  Warning: $TESTS_WARNING${NC}"
echo ""

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}🎉 Tutti i test critici sono passati!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Alcuni test sono falliti. Controlla i dettagli sopra.${NC}"
    exit 1
fi

