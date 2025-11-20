# 🔧 Fix: Content-Type per og-image-default.jpg

## Problema

Facebook Debugger mostra l'errore:
> "Tipo di contenuto dell'immagine non valido - Non è stato possibile elaborare come immagine l'URL og:image fornito https://spirit-candle.com/spiritcandles/og-image-default.jpg perché presenta un tipo di contenuto non valido."

## Soluzione Implementata

### 1. Modifiche al `.htaccess`

Aggiunte le seguenti regole in `file_deploy/htaccess_root`:

```apache
# 3) LASCIA PASSARE TUTTI GLI ASSET DELLA SPA
RewriteRule ^spiritcandles/(assets|images|img|videos|media|fonts|static)/ - [L]
RewriteRule ^spiritcandles/(favicon\.(ico|png)|robots\.txt|sitemap\.xml|og-image-default\.jpg|og-image-home\.jpg)$ - [L]

# 3.3) Assicura Content-Type corretto per immagini OG e altre immagini
<IfModule mod_mime.c>
  AddType image/jpeg .jpg .jpeg
  AddType image/png .png
  AddType image/gif .gif
  AddType image/webp .webp
  AddType image/svg+xml .svg
</IfModule>

# 3.4) Cache per immagini (opzionale, migliora performance)
<IfModule mod_headers.c>
  <FilesMatch "\.(jpg|jpeg|png|gif|webp|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
```

### 2. File System

- Creato `public/spiritcandles/` se non esisteva
- Copiato `og-image-default.jpg` in `public/spiritcandles/og-image-default.jpg`
- Vite copierà automaticamente questo file in `dist/spiritcandles/og-image-default.jpg` durante il build

## Verifica

Dopo il deploy, verifica che:

1. **Il file sia accessibile:**
   ```bash
   curl -I https://spirit-candle.com/spiritcandles/og-image-default.jpg
   ```
   Dovrebbe restituire:
   ```
   HTTP/1.1 200 OK
   Content-Type: image/jpeg
   ```

2. **Facebook Debugger:**
   - Vai su https://developers.facebook.com/tools/debug/
   - Inserisci `https://spirit-candle.com/spiritcandles/og-image-default.jpg`
   - Clicca "Scrape"
   - Verifica che non ci siano più errori sul Content-Type

3. **Test diretto:**
   ```bash
   curl -H "User-Agent: facebookexternalhit/1.1" https://spirit-candle.com/ | grep "og:image"
   ```
   Dovrebbe mostrare l'URL corretto.

## Note

- Il file `og-image-default.jpg` deve essere in formato JPEG valido
- La dimensione consigliata per le immagini OG è 1200x630px
- Il file deve essere accessibile pubblicamente (non protetto da autenticazione)

## Troubleshooting

Se il problema persiste:

1. **Verifica che il file esista sul server:**
   - Controlla che `dist/spiritcandles/og-image-default.jpg` esista dopo il build
   - Verifica che il file sia stato uploadato correttamente su Hostinger

2. **Verifica il Content-Type:**
   ```bash
   curl -I https://spirit-candle.com/spiritcandles/og-image-default.jpg
   ```
   Se non è `image/jpeg`, il problema è nel server. Contatta Hostinger support.

3. **Verifica che mod_mime sia abilitato:**
   - Le regole `<IfModule mod_mime.c>` funzionano solo se `mod_mime` è abilitato
   - Su Hostinger/LiteSpeed dovrebbe essere abilitato di default

4. **Verifica che mod_headers sia abilitato:**
   - Le regole `<IfModule mod_headers.c>` funzionano solo se `mod_headers` è abilitato
   - Su Hostinger/LiteSpeed dovrebbe essere abilitato di default

