# 🔧 Fix: Content-Type per og-image-default.jpg

## Problema

Facebook Debugger mostra l'errore:
> "Tipo di contenuto dell'immagine non valido - Non è stato possibile elaborare come immagine l'URL og:image fornito https://spirit-candle.com/spiritcandles/og-image-default.jpg perché presenta un tipo di contenuto non valido."

**Causa principale**: Il Cloudflare Worker intercettava anche le richieste alle immagini dei crawler, cercando di fare proxy all'Edge Function che non serve immagini, causando un Content-Type errato.

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

### 3. Cloudflare Worker (`cloudflare-worker-seo.js`)

**PROBLEMA CRITICO RISOLTO**: Il Worker intercettava anche le richieste alle immagini dei crawler, causando Content-Type errato.

**Soluzione**: Aggiunto controllo per escludere asset statici (immagini, CSS, JS, font, etc.) dal proxy pass:

```javascript
// IMPORTANTE: Lascia passare direttamente immagini e asset statici
const staticExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', 
                          '.js', '.css', '.woff', '.woff2', '.ttf', '.eot', '.json', '.xml', '.txt',
                          '.mp4', '.mp3', '.pdf', '.zip'];
const isStaticAsset = staticExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));

if (isStaticAsset) {
  // Per asset statici, passa direttamente al server originale
  return fetch(request);
}
```

Ora le immagini vengono servite direttamente dal server Hostinger con il Content-Type corretto.

## Deploy

### 1. Deploy Cloudflare Worker

1. Vai su https://dash.cloudflare.com/
2. Seleziona il tuo Worker (`seo-meta-proxy`)
3. Incolla il codice aggiornato da `cloudflare-worker-seo.js`
4. Clicca "Save and Deploy"

### 2. Deploy .htaccess

Il file `.htaccess` aggiornato verrà deployato automaticamente con il prossimo build GitHub Actions.

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
   - Controlla via FTP: `/public_html/spiritcandles/og-image-default.jpg`

2. **Verifica il Content-Type:**
   ```bash
   curl -I https://spirit-candle.com/spiritcandles/og-image-default.jpg
   ```
   Dovrebbe restituire:
   ```
   HTTP/1.1 200 OK
   Content-Type: image/jpeg
   ```
   Se non è `image/jpeg`, verifica:
   - Che il Cloudflare Worker sia deployato con le modifiche
   - Che mod_mime sia abilitato su Hostinger
   - Che il file sia effettivamente un JPEG valido

3. **Verifica Cloudflare Worker:**
   - Controlla i log del Worker nel dashboard Cloudflare
   - Verifica che le richieste alle immagini vengano "passate through" (non proxy)
   - Cerca nel log: `[Cloudflare Worker] Static asset detected`

4. **Test diretto dell'immagine:**
   ```bash
   # Simula richiesta Facebook crawler
   curl -H "User-Agent: facebookexternalhit/1.1" -I https://spirit-candle.com/spiritcandles/og-image-default.jpg
   ```
   Dovrebbe restituire `Content-Type: image/jpeg`

5. **Verifica che mod_mime sia abilitato:**
   - Le regole `<IfModule mod_mime.c>` funzionano solo se `mod_mime` è abilitato
   - Su Hostinger/LiteSpeed dovrebbe essere abilitato di default
   - Se non funziona, contatta Hostinger support

6. **Verifica che mod_headers sia abilitato:**
   - Le regole `<IfModule mod_headers.c>` funzionano solo se `mod_headers` è abilitato
   - Su Hostinger/LiteSpeed dovrebbe essere abilitato di default

