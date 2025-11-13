# SPIRIT GLOW FORGE — Spirit Candle eCommerce # Spirit Candles — Project README

## Project info

**Dominio live:** [spirit-candle.com](https://spirit-candle.com)  
**Repository:** [https://github.com/Adonis4SpiritCandles/spirit-glow-forge/](https://github.com/Adonis4SpiritCandles/spirit-glow-forge/)

> This repository contains the complete source code of the Spirit Candles e-commerce website.

### Descrizione
Spirit Candle è un e-commerce **premium di candele di soia di lusso** con funzionalità avanzate per utenti e amministratori, completamente integrato con backend, multilingua ed e-commerce reale (carrello, Stripe, dashboard e gestione prodotti/ordini/utenti).

---

## What technologies are used for this project? ##

**This project is built with:**

- Vite — lightning-fast dev server and build tool (ESBuild + Rollup).

- TypeScript — static typing across the entire codebase.

- React 18 — UI layer (function components + hooks).

- shadcn-ui (Radix primitives + Tailwind components) — accessible design system.

- Tailwind CSS — utility-first styling and design tokens.

- Supabase — Auth, Postgres database, Storage, Realtime, and Edge Functions.

- Stripe — payment processing.

- Furgonetka API — shipping creation, tracking and label generation.

- @tanstack/react-query — server-state/cache management (checkout, orders, etc.).

- React Router v6 — client-side routing.

- Framer Motion — micro-interactions/animations.

- Three.js / @react-three/fiber + drei — 3D/AR preview scaffolding.

- Lucide-react — icon set.

**Technical architecture (at a glance)**

- Client: Vite + React + TS + Tailwind + shadcn-ui.

- Backend: Supabase (Postgres + Row Level Security) and Edge Functions (Deno) for:

- Stripe webhook handling, checkout orchestration.

- Furgonetka: rates, shipment creation, tracking sync.

- Admin utilities (e.g., reset demo orders, admin email notifications).

- Auth & profiles: Supabase Auth; a profiles table stores user role and preferences (e.g., language).

- Storage: Supabase Storage for images and assets.

- Email: transactional emails via Resend (admin/user notifications).

- Realtime: live updates for admin stats and order events.

- i18n: custom LanguageContext (English/Polish), no Italian on site.

---

## Directory structure (high-level) ##

spirit-glow-forge/
├─ public/                 # Static assets
├─ src/
│  ├─ app/ (or pages/)     # Top-level routes (Home, Shop, Collections, About, Contact, Legal, etc.)
│  ├─ pages/               # ProductDetail, ARViewer, AdminDashboard, UserDashboard...
│  ├─ components/          # UI blocks (CartSidebar, ProductCard, Admin modals, ARPreview...)
│  ├─ components/ui/       # shadcn-ui components
│  ├─ contexts/            # LanguageContext, CartContext (if present)
│  ├─ hooks/               # useCart, useAuth, react-query hooks
│  ├─ integrations/        # supabase client, stripe helpers
│  ├─ utils/               # helpers (prices, carrier styles, formatting)
│  └─ styles/              # Tailwind, globals
├─ supabase/
│  ├─ **functions**/       # Edge Functions (create shipment, sync tracking, stripe-webhook, etc.)
│  └─ migrations/          # SQL migrations
├─ .github/workflows/      # CI/CD (if configured)
└─ package.json


---

## Tech Stack

- **Frontend:** Vite • React 18+ • TypeScript
- **Design System/UI:** TailwindCSS • shadcn/ui (tema gold/nero custom), responsive, animazioni flicker/glow brandizzate
- **Backend & Database:** Supabase (PostgreSQL, Auth, API, Storage, Row Level Security)
- **Checkout:** Stripe (integrazione diretta)
- **Automazioni:** Email newsletter, gestione contatti, trigger, policies di sicurezza avanzate
- **SEO:** Ottimizzazione avanzata, sitemap, robots, headless CMS SEO tags

---

## Funzionalità principali

### **Pubblico/Utente**
- Navigazione a pagine: Home, Shop (collezioni, ricerca, bestseller, novità), Product page (dettaglio), About, Contact, Wishlist
- **Multilingua** integrato — attualmente PL/EN (toggle e traduzioni live su tutto il sito)
- **Carrello persistente** su user/session (anche da DB)
- Checkout con pagamento Stripe (internazionale, con valute supportate)
- **Autenticazione:** login/registrazione via email o username
- Area **user dashboard** ordini, dati profilo, wishlist
- **Wishlist** prodotti

### **Amministrazione**
- **Admin panel** accessibile da /admin per utenti con ruolo admin
    - Gestione prodotti: crea/modifica/elimina e stock
    - Gestione ordini: tracking, stato, dettagli, esportazione dati
    - Gestione clienti: lista, dettagli, ricerca
    - Gestione recensioni/testimonianze
    - Gestione newsletter/contatti (esportazione csv)
    - Statistiche vendite, revenue, clienti e inventario in real time
- Gestione sicurezza accessi (row-level security)

### **Funzionalità Trasversali**
- Animazione del logo con effetto glow/flicker
- Design luxury responsive
- Disclaimer & policy privacy/cookie/GDPR
- SEO avanzato e ottimizzato (robots, sitemap, head html, structured data)
- Email automation per ordini, newsletter subscription, contatti
- Generazione documentazione ‘data request’ (GDPR compliant)

---

## Struttura Progetto

- `/src`
    - `/components` UI modulari/riutilizzabili (navbar, cards, modals, buttons ecc)
    - `/pages` routing principale: Home, Shop, Product, About, Contact, Dashboard, Admin ecc.
    - `/lib`, `/hooks` funzioni utility custom, context per lingua/carrello/user notifications
    - `/integrations/supabase` API client per accesso a DB, auth e storage
- `/public` assets statici (icone, svg, robots, logo, immagini prodotto, manifest)
- `/supabase` codice migrations, policies, funzioni, trigger, table schema
- `/file_deploy` / `old_files_deploy` utility/backup per deploy e automation
- `package.json`, `vite.config.ts`, `tailwind.config.ts`, ecc.: configurazione build, lint, styling

---

## How can I edit this code?

There are several ways to work on the application.

**Use your preferred IDE**

The stack uses Node.js, Vite, React and TypeScript. To run locally:

1. Clone the repository
git clone https://github.com/Adonis4SpiritCandles/spirit-glow-forge.git
cd spirit-glow-forge

2. Use Node 20 LTS (recommended) and install dependencies
If you use nvm:
nvm install 20 && nvm use 20
npm i

3. Start development server with hot reload on http://localhost:5173
npm run dev

4. Build for production (outputs to /dist)
npm run build

5. Preview a production build locally
npm run preview

---

## Istruzioni Avvio/Build (ITA)

1. **Clona il repository**
git clone https://github.com/Adonis4SpiritCandles/spirit-glow-forge.git
cd spirit-glow-forge

text
2. **Installa le dipendenze - Usa Node 20 LTS e installa le dipendenze**
npm install

text
3. **Configura le variabili ambiente**
- Copia `.env.example` → `.env` e inserisci le chiavi API Supabase/Stripe/etc.

4. **Avvia sviluppo**
npm run dev

text

5. **Build produzione**
npm run build
npm start

text

6. **Deploy**
- Il progetto è deployato da GitHub Actions verso [spirit-candle.com](https://spirit-candle.com)  
- Puoi forzare deployment con `git push` su main branch.

**Edit a file directly in GitHub**
- Browse to the file you want to change.
- Click the ✏️ Edit icon (top-right of the file view).
- Commit your changes to a branch and open a PR, or commit to main if appropriate.

**Use GitHub Codespaces**

- Open the repository main page.
- Click Code → Codespaces → Create codespace.
- Develop in the cloud and commit/push when done.

---

## Scripts ##

From package.json:

- npm run dev — start Vite dev server.

- npm run build — create production build.

- npm run build:dev — development build (useful for previewing).

- npm run preview — preview the built site.

- npm run lint — run ESLint on the project.

**Environment variables**

- Create a .env (for local dev) with at least:

VITE_SUPABASE_URL=<your_supabase_project_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
VITE_STRIPE_PUBLISHABLE_KEY=<your_stripe_pk>
# Optional/when used on client side:
VITE_SITE_URL=https://spirit-candle.com

^ Edge Functions (server side) use project-level secrets configured in the Supabase dashboard:
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, Furgonetka API keys, Stripe WEBHOOK_SECRET, etc. ^

**Development details**

- TypeScript & ESLint: strict typing, modern ESLint config; run "npm run lint" .

- Styling: Tailwind with "tailwind-merge" + "clsx"; shadcn-ui components are generated and customized.

- Routing: "react-router-dom" SPA routes with nested layouts; i18n toggles (EN/PL) via LanguageContext.

- State: UI state with React hooks; server state with React Query (caching, retries, stale-while-revalidate).

- 3D/AR: "ARViewer" and "ARPreview" components scaffold mobile AR deep-linking and QR handoff; full WebXR AR is planned.

- Checkout: client prepares shipping data → calls Edge Functions for rates, shipment creation, and Stripe payment flow.

- Admin: secure routes guarded by role; dashboard modules for Products, Collections, Orders, Customers, Warehouse, Coupons, Social Media, Site Settings, Statistics and Export.

**Deployment**

- The site is built from GitHub (npm run build) and the /dist folder is published by the hosting provider (Cloudflare Pages, Netlify, Vercel or similar).
- The live domain spirit-candle.com points to the hosting output configured from this repository.
- Ensure “SPA rewrites” are enabled (all routes → /index.html).
- Supabase Edge Functions are deployed from the Supabase project; Stripe webhook endpoint points to the corresponding Edge Function.

**Security & access control**

- Supabase Row Level Security is enabled where applicable.
- Admin routes and Edge Functions verify the authenticated user’s role (profiles.role === 'admin').
- Service-to-service calls use the Service Role key (server-side only).

**Troubleshooting**

- Clear the browser cache when changing service worker or build assets.
- Ensure your local .env is present and values are correct.
- Stripe test mode requires test keys; Furgonetka sandbox credentials for development.

---

## Database Design (Supabase)

Tabelle principali:
- `users` (roletype: user/admin, oauth/email, login multi-identity)
- `profiles` (user info: email, username, nome, cognome, ruolo)
- `products` (multilang name, descrizione, prezzo PLN/EUR, img, categoria, quantità, size/grammatura, stock)
- `orders` (user_id, status, totale, shipping, relazione item, timestamps)
- `order_items` (order_id, product_id, quantity, price, timestamps)
- `cart_items` (persistent per user)
- `reviews`, `testimonials`, `newsletter_subscribers`, `contact_messages`, `reviews`, `loyalty_points`, `coupons`...

**Row Level Security:** Policy granulari per visibilità e modifica dati (ad es. solo admin può vedere tutti i profili/ordini; utenti solo i propri ordini).

**Trigger e automazioni:** 
- Aggiornamento automatico campi `updated_at`
- Insert automatica profilo su signup
- Funzioni custom per ricerca prodotti, filtri, esportazioni CSV

---

## Note di Sicurezza, Privacy e GDPR

- Politiche privacy/cookie disponibili come pagina e download PDF in multilingua
- Sistema di data request/mass export (GDPR)
- Login sicuro con password breach protection attivo su Supabase
- Stripe per pagamenti PCI DSS compliant
- Solo admin autenticati vedono admin panel

---

## Altre Informazioni

- Brand, comunicazione, SEO e tutti i testi sono editabili e localizzati
- Supporta spedizione e metodi di consegna (Furgonetka/DHL/GLS/DPD/UPS ecc.) con tracciamento
- FAQ, Legal Notices, Accessibility e policy integrate nel sito
- Community, Instagram e TikTok integrati a piè pagina
- Progetto firmato e creato da Antonio Adonis Gagliardi (AdoniS4U)