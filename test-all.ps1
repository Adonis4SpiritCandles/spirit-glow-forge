# Script di test completo per SEO, Sitemap e Cloudflare Worker
# PowerShell script per Windows

Write-Host "🧪 Testing SEO, Sitemap & Cloudflare Worker Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://spirit-candle.com"
$edgeFunctionUrl = "https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1"

# Test 1: Edge Function generate-sitemap
Write-Host "Test 1: Edge Function generate-sitemap" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$edgeFunctionUrl/generate-sitemap" -UseBasicParsing
    Write-Host "✅ Edge Function risponde (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Content length: $($response.Content.Length) bytes" -ForegroundColor Gray
    
    if ($response.Content -match '<?xml') {
        Write-Host "✅ Formato XML valido" -ForegroundColor Green
    } else {
        Write-Host "❌ Formato XML non valido" -ForegroundColor Red
    }
    
    $urlCount = ([regex]::Matches($response.Content, '<url>')).Count
    Write-Host "   Totale URL nella sitemap: $urlCount" -ForegroundColor Gray
} catch {
    Write-Host "❌ ERRORE: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Edge Function serve-seo-meta (homepage)
Write-Host "Test 2: Edge Function serve-seo-meta (homepage)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$edgeFunctionUrl/serve-seo-meta?path=/" -UseBasicParsing
    Write-Host "✅ Edge Function risponde (HTTP $($response.StatusCode))" -ForegroundColor Green
    
    if ($response.Content -match 'og:url') {
        $ogUrl = [regex]::Match($response.Content, 'property="og:url"\s+content="([^"]+)"').Groups[1].Value
        if ($ogUrl -match 'spirit-candle.com' -and $ogUrl -notmatch 'supabase.co') {
            Write-Host "✅ og:url corretto: $ogUrl" -ForegroundColor Green
        } else {
            Write-Host "⚠️  og:url potrebbe essere errato: $ogUrl" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ ERRORE: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Sitemap pubblica (se .htaccess è configurato)
Write-Host "Test 3: Sitemap pubblica (sitemap.xml)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/sitemap.xml" -UseBasicParsing
    Write-Host "✅ Sitemap accessibile (HTTP $($response.StatusCode))" -ForegroundColor Green
    
    if ($response.Content -match '<?xml') {
        Write-Host "✅ Formato XML valido" -ForegroundColor Green
    }
    
    $urlCount = ([regex]::Matches($response.Content, '<url>')).Count
    Write-Host "   Totale URL nella sitemap: $urlCount" -ForegroundColor Gray
    
    # Verifica assenza prefissi /en o /pl
    if ($response.Content -notmatch '/en|/pl') {
        Write-Host "✅ Nessun prefisso /en o /pl trovato" -ForegroundColor Green
    } else {
        Write-Host "⚠️  ATTENZIONE: Trovati prefissi /en o /pl" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Sitemap non ancora accessibile pubblicamente (HTTP $($_.Exception.Response.StatusCode.value__))" -ForegroundColor Yellow
    Write-Host "   Questo è normale se .htaccess non è ancora deployato su Hostinger" -ForegroundColor Gray
}
Write-Host ""

# Test 4: Verifica Cloudflare Worker (se configurato)
Write-Host "Test 4: Cloudflare Worker (simulando Facebook crawler)" -ForegroundColor Yellow
try {
    $headers = @{
        "User-Agent" = "facebookexternalhit/1.1"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/collections/luxury" -Headers $headers -UseBasicParsing
    Write-Host "✅ Worker risponde (HTTP $($response.StatusCode))" -ForegroundColor Green
    
    if ($response.Content -match 'og:url') {
        $ogUrl = [regex]::Match($response.Content, 'property="og:url"\s+content="([^"]+)"').Groups[1].Value
        if ($ogUrl -match 'spirit-candle.com' -and $ogUrl -notmatch 'supabase.co') {
            Write-Host "✅ og:url corretto: $ogUrl" -ForegroundColor Green
        } else {
            Write-Host "⚠️  og:url potrebbe essere errato: $ogUrl" -ForegroundColor Yellow
        }
    }
    
    # Verifica assenza URL Supabase
    if ($response.Content -notmatch 'fhtuqmdlgzmpsbflxhra\.supabase\.co') {
        Write-Host "✅ Nessun URL Supabase trovato nell'HTML" -ForegroundColor Green
    } else {
        Write-Host "⚠️  ATTENZIONE: Trovati riferimenti a Supabase nell'HTML" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Worker potrebbe non essere ancora attivo o nameserver non propagati" -ForegroundColor Yellow
    Write-Host "   Errore: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ Tests completati!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prossimi passi:" -ForegroundColor Cyan
Write-Host "   1. Deploy .htaccess su Hostinger (se non già fatto)" -ForegroundColor White
Write-Host "   2. Verifica propagazione nameserver Cloudflare (se usi Cloudflare)" -ForegroundColor White
Write-Host "   3. Testa su Facebook Debugger: https://developers.facebook.com/tools/debug/" -ForegroundColor White
Write-Host "   4. Testa su Twitter Card Validator: https://cards-dev.twitter.com/validator" -ForegroundColor White
Write-Host "   5. Verifica sitemap su Google Search Console" -ForegroundColor White

