# Script semplice di test per SEO e Sitemap (PowerShell)
Write-Host "Test SEO e Sitemap" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "https://spirit-candle.com"
$SUPABASE_EDGE_FUNCTION = "https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1"

Write-Host "Test 1: Sitemap XML" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/sitemap.xml" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Sitemap accessibile (HTTP 200)" -ForegroundColor Green
        
        $sitemapContent = $response.Content
        if ($sitemapContent -match '<?xml') {
            Write-Host "[OK] Formato XML valido" -ForegroundColor Green
        } else {
            Write-Host "[ERR] Formato XML non valido" -ForegroundColor Red
        }
        
        $urlCount = ([regex]::Matches($sitemapContent, '<url>')).Count
        Write-Host "[INFO] Totale URL nella sitemap: $urlCount" -ForegroundColor Cyan
        
        $hasPrefixes = ([regex]::Matches($sitemapContent, '/en|/pl')).Count
        if ($hasPrefixes -eq 0) {
            Write-Host "[OK] Nessun prefisso /en o /pl trovato" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Trovati $hasPrefixes riferimenti a /en o /pl" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[ERR] Sitemap non accessibile (HTTP $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERR] Sitemap non accessibile: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test 2: Edge Functions" -ForegroundColor Yellow
try {
    $edgeResponse = Invoke-WebRequest -Uri "$SUPABASE_EDGE_FUNCTION/serve-seo-meta?path=/" -UseBasicParsing -ErrorAction Stop
    if ($edgeResponse.StatusCode -eq 200) {
        Write-Host "[OK] Edge Function serve-seo-meta raggiungibile" -ForegroundColor Green
    } else {
        Write-Host "[ERR] Edge Function serve-seo-meta non raggiungibile (HTTP $($edgeResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERR] Edge Function serve-seo-meta non raggiungibile: $_" -ForegroundColor Red
}

try {
    $sitemapResponse = Invoke-WebRequest -Uri "$SUPABASE_EDGE_FUNCTION/generate-sitemap" -UseBasicParsing -ErrorAction Stop
    if ($sitemapResponse.StatusCode -eq 200) {
        Write-Host "[OK] Edge Function generate-sitemap raggiungibile" -ForegroundColor Green
    } else {
        Write-Host "[ERR] Edge Function generate-sitemap non raggiungibile (HTTP $($sitemapResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERR] Edge Function generate-sitemap non raggiungibile: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completati!" -ForegroundColor Cyan

