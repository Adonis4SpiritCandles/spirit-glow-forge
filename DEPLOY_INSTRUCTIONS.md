# 🚀 Istruzioni per Deploy di Edge Functions su Supabase

## 🆕 DYNAMIC SEO META TAGS EDGE FUNCTION

### Panoramica

La funzione `serve-seo-meta` intercetta i crawler dei social media (Facebook, Twitter, LinkedIn, ecc.) e serve HTML con meta tags dinamici dal database, risolvendo il problema in cui tutti gli URL mostrano i meta tags della homepage.

### Deploy della Funzione

```bash
# Deploy della funzione serve-seo-meta
supabase functions deploy serve-seo-meta

# Verifica che sia stata deployata correttamente
supabase functions list
```

### Configurazione Hosting

**Dopo aver deployato la funzione**, devi configurare il tuo hosting per reindirizzare i crawler all'Edge Function.

#### Opzione A: Netlify

1. Il file `netlify.toml` è già presente nella root del progetto
2. **IMPORTANTE**: Modifica la URL della funzione sostituendo `YOUR_SUPABASE_PROJECT` con il tuo project reference:
   ```toml
   to = "https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/serve-seo-meta?path=:splat"
   ```
3. Fai commit e push del file `netlify.toml`
4. Netlify applicherà automaticamente le regole al prossimo deploy

#### Opzione B: Vercel

1. Il file `vercel.json` è già presente nella root del progetto
2. **IMPORTANTE**: Modifica la URL della funzione sostituendo `YOUR_SUPABASE_PROJECT`:
   ```json
   "destination": "https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/serve-seo-meta?path=$1"
   ```
3. Fai commit e push del file `vercel.json`
4. Vercel applicherà le regole al prossimo deploy

### Testing

#### Test con Facebook Debugger

1. Vai su https://developers.facebook.com/tools/debug/
2. Inserisci un URL del tuo sito: `https://spirit-candle.com/about`
3. Clicca **"Scrape Again"** più volte (2-3 volte)
4. Dovresti vedere i meta tags corretti per quella pagina

#### Test con Twitter Card Validator

1. Vai su https://cards-dev.twitter.com/validator
2. Inserisci l'URL
3. Verifica che la card mostri i meta tags corretti

#### Test con curl (simula un crawler)

```bash
# Simula Facebook crawler
curl -H "User-Agent: facebookexternalhit/1.0" https://spirit-candle.com/about

# Dovresti vedere HTML con meta tags specifici per /about
```

### Cache Management

**Facebook e Twitter cachano i meta tags pesantemente!**

- **Facebook**: Usa "Scrape Again" 2-3 volte per forzare il refresh
- **Twitter**: La cache scade dopo ~7 giorni, oppure aggiungi `?v=2` all'URL per forzare un nuovo scrape
- **Google**: Indicizza dinamicamente, nessuna azione necessaria

### SEO Settings Manager

Gli admin possono ora gestire la strategia di generazione meta tags:

1. Vai su **Admin Dashboard → Spirit Tools & Site → SEO Settings**
2. Seleziona **Product Pages** o **Collections**
3. Vedrai un nuovo toggle: **"Use Specific Meta Tags"**
   - **OFF** (default): Usa meta tags generici da `product_default`/`collection_default`
   - **ON**: Genera meta tags specifici dai dati prodotto/collezione (nome, descrizione, immagine)

### Troubleshooting

**I crawler vedono ancora i vecchi meta tags:**
- Forza il refresh della cache (vedi sopra)
- Verifica che la funzione sia deployata: `supabase functions list`
- Controlla i logs: `supabase functions logs serve-seo-meta`
- Verifica che `netlify.toml` o `vercel.json` abbiano l'URL corretta

**La funzione restituisce errori:**
- Controlla i logs: `supabase functions logs serve-seo-meta`
- Verifica che le variabili d'ambiente `SUPABASE_URL` e `SUPABASE_ANON_KEY` siano configurate
- Testa la funzione direttamente: `curl -H "User-Agent: facebookexternalhit" https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/serve-seo-meta?path=/about`

---

## ⚠️ PROBLEMA PRECEDENTE (RISOLTO)

I log di Supabase mostrano solo metadati HTTP (status 500), ma **NON mostrano i `console.log`** che abbiamo aggiunto nel codice. Questo significa che **la funzione deployata è probabilmente una versione vecchia**.

L'errore dal browser mostra: `"Invalid URL: '${apiBaseUrl}/account/services'"`, il che significa che `apiBaseUrl` è `undefined` e il template literal non viene valutato.

---

## 📋 COME DEPLOYARE LA FUNZIONE AGGIORNATA

### Metodo 1: Dashboard Supabase (UI) - ⚠️ LIMITATO

**ATTENZIONE:** Il dashboard di Supabase potrebbe non supportare il deploy diretto da file locali. Se hai modificato i file localmente, devi usare la CLI.

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Trova `calculate-shipping-price`
3. Se c'è un pulsante **"Deploy"** o **"Redeploy"**, provalo
4. **⚠️ Ma probabilmente deployerà la versione vecchia!**

---

### Metodo 2: Supabase CLI (CONSIGLIATO) ✅

Se non hai Supabase CLI installato:

```bash
# Installa Supabase CLI globalmente
npm install -g supabase

# Oppure se usi pnpm
pnpm install -g supabase
```

Poi:

```bash
# Login a Supabase
supabase login

# Link al progetto (usa il tuo project-ref)
supabase link --project-ref fhtuqmdlgzmpsbflxhra

# Deploy della funzione specifica
supabase functions deploy calculate-shipping-price

# Oppure deploy di tutte le funzioni
supabase functions deploy
```

---

### Metodo 3: GitHub Actions o CI/CD

Se hai configurato CI/CD, il deploy dovrebbe avvenire automaticamente quando fai push su `main`.

---

## ✅ VERIFICA CHE IL DEPLOY SIA RIUSCITO

### 1. Controlla la Data/Ora del Deploy

1. Vai su **Supabase Dashboard** → **Edge Functions** → `calculate-shipping-price`
2. Cerca la sezione **"Deployments"** o **"Version History"**
3. Verifica che l'ultimo deploy sia **dopo le tue modifiche** (oggi)

### 2. Testa la Funzione

Dopo il deploy:

1. Ricarica la pagina del checkout (Ctrl+F5 per svuotare la cache)
2. Inserisci un indirizzo e clicca **"Calculate Shipping"**
3. Controlla i log:

   - **Nel browser console** (F12), dovresti vedere:
     ```json
     {
       "error": "...",
       "details": {
         "name": "...",
         "message": "...",
         "apiBaseUrl": "...",
         "hasEnvVar": true/false
       }
     }
     ```

   - **Nei log di Supabase** (se disponibili), dovresti vedere:
     ```
     calculate-shipping-price: Request received
     FURGONETKA_API_URL from env: ...
     Using Furgonetka API URL (final): ...
     ```

---

## 🔍 COME VEDERE I LOG DETTAGLIATI

### Metodo A: Supabase CLI (MIGLIORE)

```bash
# Vedi i log in tempo reale
supabase functions logs calculate-shipping-price --follow

# Oppure vedi gli ultimi 50 log
supabase functions logs calculate-shipping-price --limit 50
```

### Metodo B: Dashboard Supabase

1. Vai su **Supabase Dashboard** → **Edge Functions** → **Logs**
2. Filtra per: `calculate-shipping-price`
3. Clicca sull'ultimo errore 500
4. **Cerca una sezione chiamata:**
   - "Function Logs" o
   - "Console Output" o
   - "Logs" (tab separato)

   **⚠️ Se non vedi questa sezione, i log console non sono disponibili nel dashboard!**

### Metodo C: Response Body nel Browser

Il frontend ora mostra l'errore dettagliato nel toast e nella console. Apri **F12 → Console** dopo aver cliccato "Calculate Shipping".

---

## 🐛 SE IL PROBLEMA PERSISTE

### 1. Verifica Variabile d'Ambiente

1. Vai su **Supabase Dashboard** → **Settings** → **Edge Functions** → **Secrets**
2. Verifica che esista:
   ```
   FURGONETKA_API_URL = https://api.furgonetka.pl
   ```
3. **IMPORTANTE:**
   - Nome: `FURGONETKA_API_URL` (esatto, case-sensitive)
   - Valore: `https://api.furgonetka.pl` (senza spazi, senza virgolette)

### 2. Verifica che la Funzione Sia Deployata

```bash
# Vedi le funzioni deployate
supabase functions list

# Vedi i dettagli di una funzione specifica
supabase functions inspect calculate-shipping-price
```

### 3. Testa Localmente (Se Possibile)

```bash
# Testa la funzione localmente
supabase functions serve calculate-shipping-price

# Poi in un altro terminale:
curl -X POST http://localhost:54321/functions/v1/calculate-shipping-price \
  -H "Content-Type: application/json" \
  -d '{"receiver": {...}, "parcels": [...]}'
```

---

## 📝 CHECKLIST PRE-DEPLOY

Prima di deployare, verifica:

- [ ] Hai salvato tutti i file modificati
- [ ] Hai fatto commit delle modifiche (opzionale ma consigliato)
- [ ] Hai verificato che `FURGONETKA_API_URL` sia impostato nei Secrets
- [ ] Hai verificato che il codice non abbia errori di sintassi

---

## 🆘 SUPPORTO

Se dopo il deploy il problema persiste:

1. Condividi l'output di: `supabase functions logs calculate-shipping-price --limit 10`
2. Condividi l'errore completo dalla console del browser (F12 → Console)
3. Verifica che la data del deploy sia successiva alle modifiche

---

**Ultimo aggiornamento:** 2025-11-13
