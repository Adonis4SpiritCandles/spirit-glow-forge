# 🔧 Troubleshooting Guide - Furgonetka Integration

## ❌ Problema: "Calculate Shipping" Non Funziona

### Step 1: Verifica Variabili d'Ambiente in Supabase

1. Vai su **Supabase Dashboard** → Il tuo progetto
2. Vai su **Settings** → **Edge Functions** → **Secrets**
3. Verifica che queste variabili siano impostate:

```
FURGONETKA_API_URL = https://api.furgonetka.pl
FURGONETKA_CLIENT_ID = [il tuo client ID produzione]
FURGONETKA_CLIENT_SECRET = [il tuo client secret produzione]
FURGONETKA_EMAIL = [opzionale, se usi password grant]
FURGONETKA_PASSWORD = [opzionale, se usi password grant]
```

**⚠️ IMPORTANTE:**
- **Produzione:** `FURGONETKA_API_URL = https://api.furgonetka.pl` (senza `sandbox`)
- **Sandbox/Test:** `FURGONETKA_API_URL = https://api.sandbox.furgonetka.pl`

---

### Step 2: Verifica i Log di Supabase

1. Vai su **Supabase Dashboard** → **Edge Functions** → **Logs**
2. Filtra per funzione: `calculate-shipping-price`
3. Controlla gli ultimi log per vedere:
   - `Furgonetka API URL: ...` → Quale URL viene usato?
   - `Token obtained successfully` → Il token viene ottenuto?
   - `Fetching services from: ...` → Quale URL viene chiamato?
   - `Furgonetka API error: ...` → Quale errore viene restituito?

---

### Step 3: Errori Comuni e Soluzioni

#### Errore 1: "Failed to get Furgonetka token"

**Sintomo:** `Token fetch error` nei log

**Possibili cause:**
- ❌ `FURGONETKA_CLIENT_ID` non impostato o sbagliato
- ❌ `FURGONETKA_CLIENT_SECRET` non impostato o sbagliato
- ❌ `FURGONETKA_API_URL` punta a sandbox ma credenziali sono produzione (o viceversa)
- ❌ Credenziali Furgonetka non valide o scadute

**Soluzione:**
1. Verifica che `FURGONETKA_CLIENT_ID` e `FURGONETKA_CLIENT_SECRET` siano corrette
2. Verifica che `FURGONETKA_API_URL` corrisponda alle credenziali:
   - Credenziali **produzione** → `https://api.furgonetka.pl`
   - Credenziali **sandbox** → `https://api.sandbox.furgonetka.pl`

---

#### Errore 2: "Failed to load services: 401 Unauthorized"

**Sintomo:** Errore 401 quando chiama `/account/services`

**Possibili cause:**
- ❌ Token non valido o scaduto
- ❌ Token ottenuto da sandbox ma API è produzione (o viceversa)
- ❌ Token non ha permessi per leggere i servizi

**Soluzione:**
1. Controlla nei log `get-furgonetka-token` quale URL viene usato
2. Verifica che `FURGONETKA_API_URL` sia lo stesso per tutte le funzioni
3. Prova a rimuovere il token dal DB: `DELETE FROM furgonetka_tokens;`
4. Rilancia il calcolo per ottenere un nuovo token

---

#### Errore 3: "Failed to calculate prices: 400 Bad Request"

**Sintomo:** Errore 400 quando chiama `/packages/calculate-price`

**Possibili cause:**
- ❌ Formato del payload non corretto
- ❌ Indirizzo non valido (campi troppo lunghi, formato sbagliato)
- ❌ Dati mancanti (peso, dimensioni, indirizzo)

**Soluzione:**
1. Controlla nei log `requestBody` per vedere cosa viene inviato
2. Verifica che tutti i campi obbligatori siano presenti
3. Verifica che i limiti Furgonetka siano rispettati (35 caratteri per nome, indirizzo, città, etc.)
4. Controlla che l'indirizzo sia nel formato corretto (codice paese ISO-2, CAP valido)

---

#### Errore 4: "Failed to calculate prices: 404 Not Found"

**Sintomo:** Errore 404 quando chiama l'API

**Possibili cause:**
- ❌ URL sbagliato (include `/oauth/token` per errore)
- ❌ Endpoint non esiste nell'API Furgonetka

**Soluzione:**
1. Verifica nei log l'URL completo usato (es. `Calculating price at: ...`)
2. Dovrebbe essere: `https://api.furgonetka.pl/packages/calculate-price`
3. NON dovrebbe essere: `https://api.furgonetka.pl/oauth/token/packages/calculate-price` ❌

---

### Step 4: Test Manuale del Token

Per testare se il token funziona:

1. Vai su **Supabase Dashboard** → **SQL Editor**
2. Esegui:

```sql
-- Ottieni l'ultimo token
SELECT access_token, expires_at, created_at 
FROM furgonetka_tokens 
ORDER BY created_at DESC 
LIMIT 1;
```

3. Copia il token e testa con curl o Postman:

```bash
# Test: Ottieni servizi
curl -X GET "https://api.furgonetka.pl/account/services" \
  -H "Authorization: Bearer [IL_TUO_TOKEN]" \
  -H "Accept: application/vnd.furgonetka.v1+json"
```

Se questo funziona, il problema potrebbe essere nel payload della richiesta.

---

### Step 5: Verifica Credenziali Furgonetka

1. Vai su **Furgonetka Dashboard** → **API** → **Application Credentials**
2. Verifica che:
   - Le credenziali siano **attive**
   - Il tipo di account corrisponda (`production` o `sandbox`)
   - Le credenziali non siano scadute

---

### Step 6: Deploy delle Edge Functions

Dopo aver corretto le variabili d'ambiente, **deve fare deploy** delle funzioni:

```bash
# Se usi Supabase CLI
supabase functions deploy get-furgonetka-token
supabase functions deploy calculate-shipping-price
supabase functions deploy create-furgonetka-shipment
supabase functions deploy sync-furgonetka-tracking
```

**⚠️ IMPORTANTE:** Le modifiche alle variabili d'ambiente non richiedono redeploy, ma le modifiche al codice sì!

---

### Step 7: Verifica URL Usato

Nei log di Supabase, cerca:

```
Furgonetka API URL: https://api.furgonetka.pl
Token endpoint: https://api.furgonetka.pl/oauth/token
Validating package at: https://api.furgonetka.pl/packages/validate
Fetching services from: https://api.furgonetka.pl/account/services
Calculating price at: https://api.furgonetka.pl/packages/calculate-price
```

**Se vedi `sandbox` in qualsiasi URL ma hai impostato produzione, controlla:**
1. La variabile `FURGONETKA_API_URL` in Supabase Secrets
2. Che non ci siano spazi o caratteri nascosti
3. Che il valore sia esattamente: `https://api.furgonetka.pl` (senza trailing slash)

---

## 📋 Checklist Diagnostica

Quando apri un ticket o chiedi aiuto, fornisci:

- [ ] Quale errore vedi esattamente (messaggio completo)
- [ ] Codice di stato HTTP (es. 401, 404, 500)
- [ ] Log completi da Supabase Edge Functions
- [ ] Valore di `FURGONETKA_API_URL` in Supabase Secrets (verifica che sia corretto)
- [ ] Versione delle credenziali (produzione o sandbox)
- [ ] Ultimo deploy delle Edge Functions (quando è stato fatto)

---

## 🔍 Log Esempio Corretto

Quando tutto funziona, dovresti vedere nei log:

```
Furgonetka API URL: https://api.furgonetka.pl
Token endpoint: https://api.furgonetka.pl/oauth/token
New token obtained successfully
Using Furgonetka API URL: https://api.furgonetka.pl
Token obtained successfully
Validating package at: https://api.furgonetka.pl/packages/validate
Fetching services from: https://api.furgonetka.pl/account/services
Calculating price at: https://api.furgonetka.pl/packages/calculate-price
Price calculation result: { options: [...] }
```

---

**Ultimo aggiornamento:** 2025-01-XX  
**Versione:** Con logging dettagliato per debugging

