# Script completo di test per SEO, Sitemap e Cloudflare Worker (PowerShell)
# Verifica che tutto funzioni correttamente

Write-Host "🧪 Test Completo SEO, Sitemap e Cloudflare Worker" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "https://spirit-candle.com"
$SUPABASE_EDGE_FUNCTION = "https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1"

$TESTS_PASSED = 0
$TESTS_FAILED = 0
$TESTS_WARNING = 0

# Test 1: Sitemap
Write-Host "📋 Test 1: Sitemap XML" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/sitemap.xml" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Sitemap accessibile (HTTP 200)" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "❌ Sitemap non accessibile (HTTP $($response.StatusCode))" -ForegroundColor Red
        $TESTS_FAILED++
    }
} catch {
    Write-Host "❌ Sitemap non accessibile: $_" -ForegroundColor Red
    $TESTS_FAILED++
}

# Verifica formato XML
try {
    $sitemapContent = (Invoke-WebRequest -Uri "$BASE_URL/sitemap.xml" -UseBasicParsing).Content
    if ($sitemapContent -match '<?xml') {
        Write-Host "✅ Formato XML valido" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "❌ Formato XML non valido" -ForegroundColor Red
        $TESTS_FAILED++
    }
    
    # Verifica prefissi /en o /pl
    $hasPrefixes = ([regex]::Matches($sitemapContent, '/en|/pl')).Count
    if ($hasPrefixes -eq 0) {
        Write-Host "✅ Nessun prefisso /en o /pl trovato" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "WARNING: Trovati $hasPrefixes riferimenti a /en o /pl" -ForegroundColor Yellow
        $TESTS_WARNING++
    }
    
    # Conta URL
    $urlCount = ([regex]::Matches($sitemapContent, '<url>')).Count
    Write-Host "📊 Totale URL nella sitemap: $urlCount" -ForegroundColor Cyan
    if ($urlCount -lt 10) {
        Write-Host "WARNING: Solo $urlCount URL trovati (attesi almeno 10)" -ForegroundColor Yellow
        $TESTS_WARNING++
    } else {
        $TESTS_PASSED++
    }
    
    # Verifica homepage
    if ($sitemapContent -match '<loc>https://spirit-candle\.com/</loc>') {
        Write-Host "✅ Homepage presente nella sitemap" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "❌ Homepage non trovata nella sitemap" -ForegroundColor Red
        $TESTS_FAILED++
    }
    
    # Verifica hreflang
    $hreflangCount = ([regex]::Matches($sitemapContent, 'hreflang')).Count
    if ($hreflangCount -gt 0) {
        Write-Host "✅ Tag hreflang presenti ($hreflangCount occorrenze)" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "WARNING: Nessun tag hreflang trovato" -ForegroundColor Yellow
        $TESTS_WARNING++
    }
} catch {
    Write-Host "❌ Errore nel test sitemap: $_" -ForegroundColor Red
    $TESTS_FAILED++
}

Write-Host ""
Write-Host "📋 Test 2: Edge Function SEO Meta Tags" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

# Test Edge Function serve-seo-meta
try {
    $edgeResponse = Invoke-WebRequest -Uri "$SUPABASE_EDGE_FUNCTION/serve-seo-meta?path=/" -UseBasicParsing -ErrorAction Stop
    if ($edgeResponse.StatusCode -eq 200) {
        Write-Host "✅ Edge Function serve-seo-meta raggiungibile" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "❌ Edge Function serve-seo-meta non raggiungibile (HTTP $($edgeResponse.StatusCode))" -ForegroundColor Red
        $TESTS_FAILED++
    }
} catch {
    Write-Host "❌ Edge Function serve-seo-meta non raggiungibile: $_" -ForegroundColor Red
    $TESTS_FAILED++
}

# Test Edge Function generate-sitemap
try {
    $sitemapResponse = Invoke-WebRequest -Uri "$SUPABASE_EDGE_FUNCTION/generate-sitemap" -UseBasicParsing -ErrorAction Stop
    if ($sitemapResponse.StatusCode -eq 200) {
        Write-Host "✅ Edge Function generate-sitemap raggiungibile" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "❌ Edge Function generate-sitemap non raggiungibile (HTTP $($sitemapResponse.StatusCode))" -ForegroundColor Red
        $TESTS_FAILED++
    }
} catch {
    Write-Host "❌ Edge Function generate-sitemap non raggiungibile: $_" -ForegroundColor Red
    $TESTS_FAILED++
}

Write-Host ""
Write-Host "📋 Test 3: Homepage Meta Tags" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

try {
    $headers = @{
        "User-Agent" = "facebookexternalhit/1.1"
    }
    $homeResponse = Invoke-WebRequest -Uri "$BASE_URL/" -Headers $headers -UseBasicParsing -ErrorAction Stop
    $homeContent = $homeResponse.Content
    
    $hasOgTitle = $homeContent -match 'og:title'
    $hasOgDescription = $homeContent -match 'og:description'
    $hasOgImage = $homeContent -match 'og:image'
    $hasOgUrl = $homeContent -match 'og:url'
    
    if ($hasOgTitle) {
        Write-Host "✅ Homepage: og:title presente" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "❌ Homepage: og:title non presente" -ForegroundColor Red
        $TESTS_FAILED++
    }
    
    if ($hasOgDescription) {
        Write-Host "✅ Homepage: og:description presente" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "❌ Homepage: og:description non presente" -ForegroundColor Red
        $TESTS_FAILED++
    }
    
    if ($hasOgImage) {
        Write-Host "✅ Homepage: og:image presente" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "❌ Homepage: og:image non presente" -ForegroundColor Red
        $TESTS_FAILED++
    }
    
    if ($hasOgUrl) {
        Write-Host "✅ Homepage: og:url presente" -ForegroundColor Green
        $TESTS_PASSED++
        
        # Verifica che og:url sia corretto
        if ($homeContent -match 'property="og:url"\s+content="([^"]+)"') {
            $ogUrlValue = $matches[1]
            if ($ogUrlValue -like "$BASE_URL*") {
                Write-Host "✅ Homepage: og:url corretto ($ogUrlValue)" -ForegroundColor Green
                $TESTS_PASSED++
            } else {
                Write-Host "WARNING: Homepage: og:url non corretto ($ogUrlValue)" -ForegroundColor Yellow
                $TESTS_WARNING++
            }
        }
    } else {
        Write-Host "❌ Homepage: og:url non presente" -ForegroundColor Red
        $TESTS_FAILED++
    }
} catch {
    Write-Host "WARNING: Homepage: Impossibile recuperare HTML: $_" -ForegroundColor Yellow
    $TESTS_WARNING++
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📊 Riepilogo Test" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ Test passati: $TESTS_PASSED" -ForegroundColor Green
Write-Host "❌ Test falliti: $TESTS_FAILED" -ForegroundColor Red
Write-Host "WARNING: $TESTS_WARNING" -ForegroundColor Yellow
Write-Host ""

if ($TESTS_FAILED -eq 0) {
    Write-Host "Tutti i test critici sono passati!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Alcuni test sono falliti. Controlla i dettagli sopra." -ForegroundColor Red
    exit 1
}

