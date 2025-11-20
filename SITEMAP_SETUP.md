# 🗺️ Sitemap Auto-Generata - Setup e Manutenzione

## 📋 Panoramica

La sitemap viene generata automaticamente dalla Edge Function `generate-sitemap` e servita all'URL:
- **URL Sitemap**: `https://spirit-candle.com/sitemap.xml`
- **Edge Function**: `https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/generate-sitemap`

## ✅ Caratteristiche

- ✅ **Auto-generata**: Si rigenera ad ogni richiesta (sempre aggiornata)
- ✅ **Cache**: Cache per 1 ora (HTTP headers)
- ✅ **Completa**: Include tutte le pagine statiche, prodotti, collezioni
- ✅ **Ottimizzata**: Usa slug per collections, include immagini, hreflang
- ✅ **Robusta**: Gestisce errori gracefully (ritorna sitemap minimale)
- ✅ **No prefissi lingua**: Non usa `/en` o `/pl` (il sito non li usa)

## 🔧 Setup

### 1. Deploy Edge Function

```bash
npx supabase functions deploy generate-sitemap
```

### 2. Configura `.htaccess`

La regola per servire `/sitemap.xml` è già inclusa nel file `file_deploy/htaccess_root`:

```apache
# 3.5) Sitemap.xml: serve from Edge Function (auto-generated)
RewriteCond %{REQUEST_URI} ^/sitemap\.xml$ [NC]
RewriteRule ^(.*)$ https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/generate-sitemap [R=302,L]
```

**Nota**: Il sito è deployato su Hostinger in `public_html/spiritcandles/`, ma la regola `.htaccess` è nella root (`public_html/`) quindi funziona correttamente.

### 3. Verifica

Testa la sitemap:
```bash
curl https://spirit-candle.com/sitemap.xml
```

Oppure apri nel browser: https://spirit-candle.com/sitemap.xml

## 📊 Contenuto Sitemap

La sitemap include:

1. **Homepage** (priority: 1.0)
2. **Pagine principali** (shop, collections, about, contact, faq, custom-candles)
3. **Pagine feature** (scent-quiz, loyalty, wishlist)
4. **Pagine legali** (privacy, cookie, terms, shipping, etc.)
5. **Collezioni** (usando slug, non ID) - solo quelle attive (`is_active = true`)
6. **Prodotti** (solo pubblicati `published = true`)
7. **Profili pubblici** (opzionale, limitati a 1000)

### Formato URL

- **Homepage**: `https://spirit-candle.com/`
- **Collections**: `https://spirit-candle.com/collections/{slug}` (es. `/collections/luxury`)
- **Products**: `https://spirit-candle.com/product/{id}` (UUID)
- **Pagine statiche**: `https://spirit-candle.com/{page}` (es. `/shop`, `/about`)

**IMPORTANTE**: Il sito **NON** usa prefissi `/en` o `/pl` nelle URL. La lingua è determinata dall'header `Accept-Language` del browser.

## 🔄 Auto-Aggiornamento

La sitemap si aggiorna automaticamente perché:
- Viene generata **on-demand** ad ogni richiesta
- I dati vengono recuperati dal database in tempo reale
- Non serve cron job o script esterni

### Cache

La sitemap è cachata per 1 ora:
- **Browser cache**: `max-age=3600`
- **CDN/Proxy cache**: `s-maxage=3600`

Per forzare un refresh, puoi:
1. Attendere 1 ora
2. Invalidare la cache (se usi Cloudflare)
3. Aggiungere `?t=timestamp` all'URL (non standard, ma funziona)

## 🚀 Ottimizzazioni Future (Opzionali)

### 1. Sitemap Index (per siti molto grandi)

Se hai più di 50.000 URL, dividi in più sitemap:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://spirit-candle.com/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://spirit-candle.com/sitemap-products.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://spirit-candle.com/sitemap-collections.xml</loc>
  </sitemap>
</sitemapindex>
```

### 2. Cron Job per Pre-Generazione (Opzionale)

Se vuoi pre-generare la sitemap ogni giorno (per performance):

```typescript
// Supabase Edge Function: generate-sitemap-cron
// Chiamata da Supabase Cron o esterno
```

### 3. Submit Automatico a Google Search Console

Usa l'API di Google Search Console per submit automatico dopo aggiornamenti.

## 🐛 Troubleshooting

### La sitemap non si aggiorna
- Verifica che l'Edge Function sia deployata: `npx supabase functions list`
- Controlla i log: `npx supabase functions logs generate-sitemap`
- Verifica che `.htaccess` sia configurato correttamente e deployato su Hostinger

### Errori 503
- Verifica che Supabase sia raggiungibile
- Controlla i timeout (attualmente nessun timeout esplicito)
- Verifica le RLS policies per products/collections (devono permettere SELECT pubblica)

### URL mancanti
- Verifica che i prodotti siano `published = true`
- Verifica che le collections siano `is_active = true`
- Controlla che i campi `slug` siano presenti per le collections
- Verifica che le collections abbiano `slug` non nullo

### Collections usano ID invece di slug
- Verifica che la query nella Edge Function includa il campo `slug`
- Controlla che le collections nel database abbiano il campo `slug` popolato
- La sitemap usa `collection.slug` per costruire l'URL: `/collections/{slug}`

### Date formato errato
- Il formato date è `YYYY-MM-DD` (non include time)
- Viene estratto con: `new Date(date).toISOString().split('T')[0]`

## 📝 Note Importanti

- La sitemap **non include** pagine private (cart, checkout, dashboard, admin)
- Le pagine con `noindex: true` in SEO settings potrebbero essere incluse (filtro opzionale da aggiungere in futuro)
- Il formato date è `YYYY-MM-DD` (non include time)
- Le collections devono avere `slug` non nullo per essere incluse
- I prodotti devono essere `published = true` per essere inclusi
- Le collections devono essere `is_active = true` per essere incluse

## 🔍 Validazione

Puoi validare la sitemap con:

1. **Google Search Console**: https://search.google.com/search-console
2. **XML Sitemap Validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html
3. **Bing Webmaster Tools**: https://www.bing.com/webmasters

## 📚 Riferimenti

- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Google Sitemap Guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

