# 🚀 Setup Cloudflare Workers per SEO Meta Tags

Questa guida ti aiuta a configurare Cloudflare Workers per risolvere il problema dell'URL di Supabase che appare nelle anteprime social.

## 📋 Prerequisiti

1. Account Cloudflare (gratuito): https://dash.cloudflare.com/sign-up
2. Accesso al dominio `spirit-candle.com`
3. Possibilità di modificare i nameserver del dominio

## 🔧 Passo 1: Aggiungi il dominio a Cloudflare

1. Accedi a https://dash.cloudflare.com/
2. Clicca su **"Add a Site"**
3. Inserisci `spirit-candle.com`
4. Scegli il piano **Free** (gratuito)
5. Cloudflare scannerà i tuoi DNS records automaticamente
6. Verifica che tutti i record DNS siano corretti (A, CNAME, MX, ecc.)

## 🔄 Passo 2: Cambia i Nameserver

1. Cloudflare ti fornirà 2 nameserver (es. `alice.ns.cloudflare.com` e `bob.ns.cloudflare.com`)
2. Vai al tuo registrar del dominio (dove hai registrato `spirit-candle.com`)
3. Modifica i nameserver del dominio con quelli forniti da Cloudflare
4. **IMPORTANTE**: Questo processo può richiedere 24-48 ore per propagarsi completamente

## 👷 Passo 3: Crea il Worker

1. Nel dashboard Cloudflare, vai su **Workers & Pages**
2. Clicca su **"Create application"** → **"Create Worker"**
3. Dai un nome al Worker (es. `seo-meta-proxy`)
4. Incolla il codice da `cloudflare-worker-seo.js`
5. Clicca su **"Save and Deploy"**

## 🛣️ Passo 4: Configura le Routes

1. Nel dashboard del Worker, vai su **"Triggers"** → **"Routes"**
2. Clicca su **"Add route"**
3. Inserisci:
   - **Route**: `spirit-candle.com/*`
   - **Zone**: `spirit-candle.com`
   - **Worker**: Seleziona il Worker appena creato
4. Clicca su **"Add route"**
5. Ripeti per `www.spirit-candle.com/*` se usi anche il www

## ✅ Passo 5: Verifica la configurazione

1. Attendi che i nameserver si propaghino (puoi verificare con: https://www.whatsmydns.net/)
2. Una volta propagati, testa con:
   - Facebook Debugger: https://developers.facebook.com/tools/debug/
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
3. Verifica che l'URL canonico sia `https://spirit-candle.com/...` e non quello di Supabase

## 🔍 Test del Worker

Puoi testare il Worker direttamente:
h
# Test con curl simulando Facebook crawler
curl -H "User-Agent: facebookexternalhit/1.1" https://spirit-candle.com/collections/luxury

# Dovresti vedere l'HTML con i meta tag corretti
# Verifica che og:url sia https://spirit-candle.com/collections/luxury## 📝 Note importanti

- **DNS Propagation**: I nameserver possono richiedere fino a 48 ore per propagarsi
- **Cache**: Cloudflare cache le risposte per 1 ora. Puoi invalidare la cache dal dashboard se necessario
- **Fallback**: Se il Worker fallisce, la richiesta passa automaticamente al server originale (Hostinger)
- **Costi**: Il piano Free di Cloudflare include 100.000 richieste/giorno, più che sufficiente per il tuo sito

## 🐛 Troubleshooting

### Il Worker non viene eseguito
- Verifica che i nameserver siano corretti
- Controlla che la route sia configurata correttamente
- Verifica i log del Worker nel dashboard Cloudflare

### Facebook mostra ancora l'URL di Supabase
- Verifica che l'HTML generato dall'Edge Function abbia `og:url` corretto
- Controlla i log del Worker per vedere se il proxy pass funziona
- Prova a invalidare la cache di Facebook: https://developers.facebook.com/tools/debug/

### Errori 502/503
- Verifica che l'Edge Function Supabase sia raggiungibile
- Controlla i log del Worker per vedere gli errori
- Verifica che l'URL dell'Edge Function sia corretto nel codice del Worker