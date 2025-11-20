# 🧪 Guida Completa ai Test SEO, Sitemap e Cloudflare Worker

Questa guida ti aiuta a testare completamente l'implementazione SEO, sitemap e Cloudflare Worker.

## 📋 Prerequisiti

- Accesso a terminale/command prompt
- `curl` installato (disponibile su Linux, macOS, Windows 10+)
- Connessione internet

## 🚀 Test Rapidi

### Test 1: Sitemap

```bash
# Verifica che la sitemap sia accessibile
curl https://spirit-candle.com/sitemap.xml

# Conta gli URL nella sitemap
curl -s https://spirit-candle.com/sitemap.xml | grep -c "<url>"

# Verifica che non ci siano prefissi /en o /pl
curl -s https://spirit-candle.com/sitemap.xml | grep "/en\|/pl"
# Dovrebbe non restituire nulla
```

### Test 2: Meta Tags (simulando crawler)

```bash
# Homepage
curl -H "User-Agent: facebookexternalhit/1.1" https://spirit-candle.com/ | grep "og:title"

# Collections
curl -H "User-Agent: facebookexternalhit/1.1" https://spirit-candle.com/collections/luxury | grep "og:title"

# Products (sostituisci con un ID reale)
curl -H "User-Agent: facebookexternalhit/1.1" https://spirit-candle.com/product/70c30e10-1d2f-4dab-bf63-1932d11c561b | grep "og:title"
```

### Test 3: Verifica og:url

```bash
# Verifica che og:url sia corretto (non Supabase)
curl -H "User-Agent: facebookexternalhit/1.1" https://spirit-candle.com/ | grep "og:url"
# Dovrebbe mostrare: https://spirit-candle.com/ (non Supabase URL)
```

## 📝 Script di Test Completi

### Script 1: Test Sitemap (`test-sitemap.sh`)

Esegue test completi sulla sitemap:

```bash
bash test-sitemap.sh
```

**Cosa verifica:**
- ✅ Sitemap accessibile (HTTP 200)
- ✅ Formato XML valido
- ✅ Nessun prefisso /en o /pl
- ✅ Collections usano slug (non UUID)
- ✅ Homepage presente
- ✅ Tag hreflang presenti

### Script 2: Test Cloudflare Worker (`test-cloudflare-worker.sh`)

Esegue test sul Cloudflare Worker:

```bash
bash test-cloudflare-worker.sh
```

**Cosa verifica:**
- ✅ Meta tags presenti su homepage
- ✅ Meta tags presenti su collections
- ✅ Meta tags presenti su products
- ✅ Nessun URL Supabase nell'HTML
- ✅ og:url corretto

### Script 3: Test Completo SEO (`test-seo-complete.sh`)

Esegue tutti i test in sequenza:

```bash
bash test-seo-complete.sh
```

**Cosa verifica:**
- ✅ Sitemap (7 test)
- ✅ Edge Functions (3 test)
- ✅ Homepage meta tags (5 test)
- ✅ Pagine principali (6 pagine)
- ✅ Collections e Products (fino a 3 di ciascuno)
- ✅ Cloudflare Worker (se configurato)

**Output:**
- ✅ Test passati (verde)
- ❌ Test falliti (rosso)
- ⚠️ Warning (giallo)

## 🔍 Test Manuali con Browser

### Test 1: Facebook Debugger

1. Vai su https://developers.facebook.com/tools/debug/
2. Inserisci un URL (es. `https://spirit-candle.com/collections/luxury`)
3. Clicca "Scrape"
4. Verifica:
   - ✅ **URL canonico**: deve essere `https://spirit-candle.com/...` (non Supabase)
   - ✅ **og:title**: deve essere presente e corretto
   - ✅ **og:description**: deve essere presente
   - ✅ **og:image**: deve essere presente
   - ✅ **og:url**: deve essere `https://spirit-candle.com/...`

### Test 2: Twitter Card Validator

1. Vai su https://cards-dev.twitter.com/validator
2. Inserisci un URL
3. Verifica che le Twitter Cards siano corrette

### Test 3: WhatsApp Preview

1. Apri WhatsApp Web o mobile
2. Condividi un link (es. `https://spirit-candle.com/collections/luxury`)
3. Verifica che l'anteprima mostri:
   - ✅ Titolo corretto
   - ✅ Descrizione corretta
   - ✅ Immagine corretta

### Test 4: Google Search Console

1. Vai su https://search.google.com/search-console
2. Aggiungi la sitemap: `https://spirit-candle.com/sitemap.xml`
3. Verifica che Google la accetti e la processi

## 🐛 Troubleshooting

### La sitemap non è accessibile

```bash
# Verifica che l'Edge Function funzioni
curl https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/generate-sitemap

# Verifica che .htaccess sia deployato
# Controlla che la regola per sitemap.xml sia presente
```

### Meta tags non appaiono

```bash
# Verifica che l'Edge Function serve-seo-meta funzioni
curl "https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/serve-seo-meta?path=/"

# Verifica i log dell'Edge Function
npx supabase functions logs serve-seo-meta
```

### Cloudflare Worker non funziona

1. Verifica che i nameserver siano configurati correttamente
2. Controlla i log del Worker nel dashboard Cloudflare
3. Verifica che la route sia configurata correttamente
4. Assicurati che "Fail open" sia selezionato

## ✅ Checklist Finale

Prima di considerare tutto completato, verifica:

- [ ] Sitemap accessibile e valida
- [ ] Sitemap contiene tutti i prodotti pubblicati
- [ ] Sitemap contiene tutte le collections attive (con slug)
- [ ] Nessun prefisso /en o /pl nella sitemap
- [ ] Homepage mostra meta tags corretti su Facebook Debugger
- [ ] Collections mostrano meta tags corretti
- [ ] Products mostrano meta tags corretti
- [ ] og:url è sempre `https://spirit-candle.com/...` (non Supabase)
- [ ] WhatsApp preview funziona
- [ ] Twitter Card preview funziona
- [ ] Google Search Console accetta la sitemap
- [ ] Cloudflare Worker funziona (se configurato)

## 📊 Metriche di Successo

- **Sitemap**: 100% accessibile, formato valido, nessun errore
- **Meta Tags**: 100% delle pagine pubbliche hanno meta tags
- **og:url**: 100% corretto (nessun URL Supabase)
- **Social Preview**: 100% funzionante su Facebook, Twitter, WhatsApp
- **Google Search Console**: Sitemap accettata e processata

## 🎯 Prossimi Passi

Dopo aver completato tutti i test:

1. **Submit sitemap a Google Search Console**
2. **Monitora i log** per eventuali errori
3. **Testa periodicamente** con Facebook Debugger
4. **Monitora le performance** del Cloudflare Worker (se configurato)
