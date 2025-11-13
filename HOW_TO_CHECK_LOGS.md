# 📋 Come Controllare i Log Dettagliati di Supabase Edge Functions

## 🔍 Metodo 1: Dashboard Supabase (UI)

### Step 1: Vai ai Log delle Edge Functions

1. Vai su **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto **Spirit Candles**
3. Vai su **Edge Functions** (nel menu laterale)
4. Clicca su **Logs** (tab in alto)

### Step 2: Filtra per Funzione

1. Nella barra di ricerca/filtro, cerca: `calculate-shipping-price`
2. Oppure seleziona il filtro **Function Name** e scegli `calculate-shipping-price`

### Step 3: Trova l'Errore Recente

1. Cerca l'ultimo log con **status 500**
2. Clicca sulla riga per espandere i dettagli
3. Dovresti vedere:
   - **Request Body** (se disponibile)
   - **Response Body** (il messaggio di errore)
   - **Function Logs** (tutti i `console.log` e `console.error`)

### Step 4: Cerca i Log Dettagliati

Scorri verso il basso per vedere tutti i log della funzione. Dovresti vedere:

```
calculate-shipping-price: Request received
Request body parsed successfully
Using Furgonetka API URL: ...
Error in calculate-shipping-price: { ... }
```

---

## 🔧 Metodo 2: Supabase CLI (Se Installato)

Se hai Supabase CLI installato, puoi vedere i log in tempo reale:

```bash
# Installa Supabase CLI (se non ce l'hai)
npm install -g supabase

# Login
supabase login

# Link al progetto
supabase link --project-ref fhtuqmdlgzmpsbflxhra

# Vedi i log in tempo reale
supabase functions logs calculate-shipping-price --follow
```

Oppure vedi gli ultimi log:

```bash
supabase functions logs calculate-shipping-price --limit 50
```

---

## 🚨 Metodo 3: API Supabase (Programmatico)

Se hai accesso all'API di Supabase, puoi recuperare i log via API:

```bash
curl -X GET \
  "https://api.supabase.com/v1/projects/fhtuqmdlgzmpsbflxhra/edge-functions/logs?function_name=calculate-shipping-price" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📸 Screenshot di Riferimento

In Supabase Dashboard, i log dettagliati dovrebbero apparire così:

```
┌─────────────────────────────────────────────────┐
│ Edge Functions > Logs                           │
├─────────────────────────────────────────────────┤
│ Filter: [calculate-shipping-price ▼]           │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Status: 500 | Function: calculate-shipping  │ │
│ │ Time: 2025-11-13 16:08:54                  │ │
│ │                                             │ │
│ │ > calculate-shipping-price: Request received│ │
│ │ > Request body parsed successfully         │ │
│ │ > Using Furgonetka API URL: ...            │ │
│ │ > Error in calculate-shipping-price: {     │ │
│ │     message: "...",                        │ │
│ │     stack: "...",                          │ │
│ │     apiBaseUrl: "...",                     │ │
│ │   }                                         │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## ❓ Se Non Vedi i Log Dettagliati

Se non vedi i log dettagliati (`console.log`, `console.error`), potrebbe essere:

1. **Funzione non deployata correttamente**: 
   - Verifica che la funzione sia stata deployata:
   ```bash
   supabase functions deploy calculate-shipping-price
   ```

2. **Log non ancora disponibili**:
   - I log possono richiedere alcuni secondi/minuti per apparire
   - Prova a ricaricare la pagina o aspettare qualche minuto

3. **Problema di permessi**:
   - Verifica di avere i permessi per vedere i log
   - Controlla che tu sia il proprietario del progetto

4. **Log troppo vecchi**:
   - I log potrebbero essere stati rimossi (alcuni piani Supabase hanno limiti)
   - Prova a generare un nuovo errore per vedere log freschi

---

## 🔍 Cosa Cercare nei Log

Quando trovi i log dettagliati, cerca questi messaggi per capire dove si blocca:

### ✅ Sequenza Normale (Se Funziona):
```
calculate-shipping-price: Request received
Request body parsed successfully
Using Furgonetka API URL: https://api.furgonetka.pl
Token obtained successfully
Fetching services from: https://api.furgonetka.pl/account/services
Calculating price at: https://api.furgonetka.pl/packages/calculate-price
Price calculation result: { options: [...] }
```

### ❌ Sequenza di Errore (Quando Fallisce):
```
calculate-shipping-price: Request received
Error in calculate-shipping-price: {
  message: "...",  ← QUESTO È L'ERRORE DA VEDERE!
  stack: "...",
  apiBaseUrl: "NOT SET" o "https://api.sandbox.furgonetka.pl",
  hasEnvVar: false
}
```

---

## 📞 Supporto

Se non riesci a trovare i log dettagliati, prova:

1. **Genera un nuovo errore**: Prova di nuovo "Calculate Shipping" per generare log freschi
2. **Controlla i log di get-furgonetka-token**: Potrebbe essere quello che fallisce
3. **Verifica il deploy**: Assicurati che le modifiche siano state deployate

---

**Ultimo aggiornamento:** 2025-11-13

