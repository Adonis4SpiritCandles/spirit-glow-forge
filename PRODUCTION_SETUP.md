# 🚀 Production Setup Guide - Furgonetka & Stripe

## ✅ Modifiche Completate

Tutti i file Edge Functions sono stati aggiornati per supportare la configurazione produzione tramite variabili d'ambiente.

### File Modificati:
- ✅ `supabase/functions/get-furgonetka-token/index.ts` (già aveva la variabile)
- ✅ `supabase/functions/calculate-shipping-price/index.ts` (3 URL aggiornati)
- ✅ `supabase/functions/create-furgonetka-shipment/index.ts` (2 URL aggiornati)
- ✅ `supabase/functions/sync-furgonetka-tracking/index.ts` (API + web URL aggiornati)

---

## 📋 Step 1: Configura Variabili d'Ambiente in Supabase

### 1.1 Vai su Supabase Dashboard

1. Accedi a: https://supabase.com/dashboard
2. Seleziona il tuo progetto **Spirit Candles**
3. Vai su: **Settings** → **Edge Functions** → **Secrets**

### 1.2 Aggiungi/Modifica Variabili Furgonetka

Aggiungi o aggiorna queste variabili:

```
FURGONETKA_API_URL = https://api.furgonetka.pl
```

**⚠️ IMPORTANTE:** 
- **Sandbox:** `https://api.sandbox.furgonetka.pl` (per test)
- **Produzione:** `https://api.furgonetka.pl` (per produzione reale)

### 1.3 Verifica Credenziali Furgonetka Produzione

Assicurati di avere le credenziali di **produzione** (non sandbox):

```
FURGONETKA_CLIENT_ID = [il tuo client ID produzione]
FURGONETKA_CLIENT_SECRET = [il tuo client secret produzione]
FURGONETKA_EMAIL = [opzionale, se usi password grant]
FURGONETKA_PASSWORD = [opzionale, se usi password grant]
```

---

## 💳 Step 2: Configura Stripe Production

### 2.1 Ottieni Stripe Live Keys

1. Vai su: https://dashboard.stripe.com/apikeys
2. Assicurati di essere in modalità **"Live mode"** (toggle in alto a destra)
3. Copia la **Secret key** (inizia con `sk_live_...`)

### 2.2 Aggiorna in Supabase Secrets

In Supabase Dashboard → Edge Functions → Secrets, aggiorna:

```
STRIPE_SECRET_KEY = sk_live_... [la tua chiave LIVE, non sk_test_...]
```

**⚠️ IMPORTANTE:**
- **Test:** `sk_test_...` (per sviluppo)
- **Produzione:** `sk_live_...` (per transazioni reali)

---

## 🔄 Step 3: Deploy Edge Functions

Dopo aver configurato le variabili d'ambiente, deploya le Edge Functions:

```bash
# Se usi Supabase CLI
supabase functions deploy get-furgonetka-token
supabase functions deploy calculate-shipping-price
supabase functions deploy create-furgonetka-shipment
supabase functions deploy sync-furgonetka-tracking
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

Oppure deploya tutte insieme:

```bash
supabase functions deploy
```

---

## ✅ Step 4: Verifica Configurazione

### 4.1 Test Furgonetka

1. Vai al checkout e calcola una spedizione
2. Controlla i log Edge Functions in Supabase Dashboard
3. Verifica che le chiamate vadano a `api.furgonetka.pl` (non sandbox)

### 4.2 Test Stripe

1. Crea un ordine di test (usa carta di test Stripe)
2. Verifica che il pagamento vada a Stripe Live
3. Controlla in Stripe Dashboard → Payments che l'ordine appaia

---

## 🔍 Come Funziona

### Furgonetka

Tutti i file ora leggono:
```typescript
const apiBaseUrl = Deno.env.get('FURGONETKA_API_URL') || 'https://api.sandbox.furgonetka.pl';
```

- Se `FURGONETKA_API_URL` è impostato → usa quello (produzione)
- Se NON è impostato → fallback a sandbox (sicurezza)

### Stripe

Stripe SDK rileva automaticamente l'ambiente dalla chiave:
- `sk_test_...` → Stripe Test Mode
- `sk_live_...` → Stripe Live Mode

---

## ⚠️ Checklist Pre-Produzione

Prima di andare live, verifica:

- [ ] `FURGONETKA_API_URL = https://api.furgonetka.pl` (senza sandbox)
- [ ] Credenziali Furgonetka sono di produzione
- [ ] `STRIPE_SECRET_KEY = sk_live_...` (chiave LIVE)
- [ ] Edge Functions deployate
- [ ] Test ordine di prova completato con successo
- [ ] Verificato che chiamate vanno a API produzione (non sandbox)
- [ ] Webhook Stripe configurato per produzione
- [ ] Webhook Furgonetka configurato per produzione (se applicabile)

---

## 🔄 Rollback a Sandbox (se necessario)

Se devi tornare a sandbox per test:

1. In Supabase Secrets, cambia:
   ```
   FURGONETKA_API_URL = https://api.sandbox.furgonetka.pl
   ```

2. Aggiorna credenziali Furgonetka con quelle sandbox

3. Per Stripe, usa chiave test:
   ```
   STRIPE_SECRET_KEY = sk_test_...
   ```

4. Redeploy Edge Functions

---

## 📞 Supporto

Se hai problemi:
1. Controlla i log Edge Functions in Supabase Dashboard
2. Verifica che le variabili d'ambiente siano impostate correttamente
3. Controlla che le credenziali siano valide per l'ambiente selezionato

---

**Ultimo aggiornamento:** 2025-01-XX  
**Commit:** `76694f3` - feat: configure Furgonetka to use production API via environment variable

