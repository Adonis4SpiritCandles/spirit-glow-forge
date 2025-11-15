<!-- b135dc99-e66b-469d-ba51-62aad789d608 754fdb87-5320-4954-ae40-dead1fd0e433 -->
# Fix Testimonials Carousel Spacing e Toggle Bugs

## Problemi Identificati

1. **TestimonialsCarousel Desktop**: Card tagliate agli angoli (sopra, sinistra, destra) - serve padding sopra le card per evitare tagli quando hover fa zoom
2. **TestimonialsCarousel Mobile**: Ridurre spazio sopra/sotto sezione, aggiungere fluorescenza gialla sulla card attiva, cambiare paginazione da blu a giallo
3. **Spacing generale**: Ridurre padding sezione "Customer Reviews" (desktop e mobile)
4. **Toggle Community bug**: Il toggle Community disattiva Newsletter invece di Community - verificare SocialFeed.tsx
5. **Toggle Contact checkbox bug**: Il toggle non funziona quando si prova a disattivarlo

## Implementazione

### 1. Fix Spacing TestimonialsCarousel

**File**: `src/components/homepage/TestimonialsCarousel.tsx`

- Aggiungere `pt-8` o `pt-12` al wrapper Swiper per evitare tagli superiori su hover
- Aggiungere padding laterale (`px-4` o `px-6`) al wrapper per evitare tagli laterali
- Ridurre padding sezione da `py-20` a `py-12` o `py-16` (desktop) e `py-8` o `py-10` (mobile)
- Aggiungere fluorescenza gialla sulla card attiva in mobile (box-shadow con primary color)
- Custom CSS per paginazione Swiper: cambiare colore bullet da blu a giallo/golden (primary color)

### 2. Fix Toggle Community

**File**: `src/components/homepage/SocialFeed.tsx`

- Verificare che il toggle controlli solo `homepage_community_settings.is_active`
- Il problema potrebbe essere che SocialFeed controlla `is_active: true` nella query - rimuovere questo filtro e controllare solo dopo il loadSettings
- Assicurarsi che il controllo finale `if (settings && !settings.is_active)` funzioni correttamente

**File**: `src/components/admin/SiteSettings/HomepageSettings/CommunityManager.tsx`

- Verificare che il toggle salvi correttamente in `homepage_community_settings` (già fatto)
- Assicurarsi che `handleSave` salvi immediatamente quando il toggle cambia (non solo al click su Save)

### 3. Fix Toggle Contact Checkbox

**File**: `src/components/admin/EmailMarketing/EmailMarketingSettings.tsx`

- Il toggle Contact potrebbe non salvare immediatamente - aggiungere `handleSave` automatico al cambio toggle o assicurarsi che lo stato locale si aggiorni
- Verificare che `onCheckedChange` aggiorni correttamente lo stato

**File**: `src/pages/Contact.tsx`

- Verificare che `loadEmailMarketingSettings` venga chiamato e che lo stato si aggiorni correttamente
- Potrebbe servire un listener per aggiornamenti real-time o un refresh manuale

## CSS Custom per Paginazione Swiper

Aggiungere CSS personalizzato per cambiare colore paginazione da blu a giallo/golden:

```css
.testimonials-swiper .swiper-pagination-bullet {
  background-color: var(--primary) !important;
  opacity: 0.5;
}

.testimonials-swiper .swiper-pagination-bullet-active {
  background-color: var(--primary) !important;
  opacity: 1;
}
```

### To-dos

- [ ] Creare trigger per generazione automatica referral_short_code alla creazione profilo
- [ ] Creare migration per backfill referral_short_code per utenti esistenti
- [ ] Modificare validazione referral code in Auth.tsx per non bloccare se referrer non ha codice
- [ ] Modificare signUp per salvare referral_source_id durante registrazione
- [ ] Aggiornare handle_new_user trigger per salvare referral_source_id dai metadata
- [ ] Migliorare flusso confirm-referral: rimuovere setTimeout, usare onAuthStateChange, aggiungere retry
- [ ] Migliorare gestione errori in confirm-referral Edge Function
- [ ] Verificare e fixare RLS policies per referral_source_id e referrals
- [ ] Testare e verificare email referral in EN/PL
- [ ] Verificare conteggio referrals in ReferralDashboard