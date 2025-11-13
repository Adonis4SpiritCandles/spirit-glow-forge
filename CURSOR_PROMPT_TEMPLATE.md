This file provides a template for crafting effective prompts when working with the Spirit Glow Forge project using AI assistants such as Cursor. A well‑structured prompt helps the agent understand the context, technical stack, requirements and desired outcome. Use this template as a starting point and adapt it to the specific task.

1. Persona & tone

You are an experienced full‑stack engineer with expertise in Node.js, TypeScript, React 18 and modern web development.  You understand Supabase (PostgreSQL, RLS and Edge Functions), Stripe, Furgonetka and Resend integrations.  Your goal is to implement features and fixes for the Spirit Candle e‑commerce platform, adhering to the project’s design system, accessibility guidelines, responsiveness and bilingual (EN/PL) support.

2. Include technical context

Technical context:
- The frontend is built with Vite + React 18 + TypeScript.
- Tailwind CSS and shadcn/ui components are used for styling.
- Backend is Supabase (PostgreSQL) with Edge Functions (Deno).  Stripe handles payments; Furgonetka handles shipping; Resend handles emails.
- The project is multilingual (English & Polish).  Use existing translation files and keys.
- The design theme uses a luxury black/gold palette.
- Node 20 LTS environment.

Describe the task clearly

Explain what needs to be done, why it is needed and what constraints apply. Be specific about which files or components to touch, what functionality to add or fix, and any acceptance criteria.

Task:
- Implement the new **CollectionDetail** page at `/collections/:slug`.
- Fetch the collection by slug from Supabase; display a hero section with the collection’s gradient and banner image; list all products in that collection with responsive grid.
- Add SEO meta tags and JSON‑LD structured data for the collection.
- Ensure the page is responsive (mobile/tablet/desktop), accessible (semantic elements, aria labels) and bilingual (EN/PL).
- Update admin forms to allow selection of collection and slug generation.


4. Specify deliverables and quality checks

List what the agent should provide (e.g. modified files, new components, migrations) and the success criteria for the task. Use checklists to remind the agent about responsiveness, translations, accessibility and testing.

Deliverables:
- New file `src/pages/CollectionDetail.tsx` with the page component.
- Updated Supabase function `fetchCollectionBySlug` if necessary.
- Updated admin form component to include collection slug dropdown.
- Migrations if new database fields are required.
- A Pull Request description summarising the changes.

Quality checks:
- [ ] Page renders correctly for existing collections.
- [ ] Layout adjusts for mobile (1 column), tablet (2 columns) and desktop (4 columns).
- [ ] All text is translatable via existing translation keys.
- [ ] SEO tags and JSON‑LD are added.
- [ ] No console errors and build passes.

5. Example prompt
Below is an example of a full prompt combining persona, context, task and deliverables:

You are an experienced full‑stack engineer with expertise in Node.js, TypeScript and React 18.  Our project is an e‑commerce site built with Vite + React, Tailwind, Supabase and Stripe.  The site is bilingual (EN/PL) and uses a black/gold design.

Task:
Implement the **Gift Card** feature.  Users should be able to purchase digital gift cards in fixed amounts (50 PLN, 100 PLN, 200 PLN).  After checkout, a unique code should be generated and emailed via Resend to the recipient.  Admins should be able to view and redeem gift cards in the dashboard.

Requirements:
- Create a new database table `gift_cards` with fields: id, code (unique), amount, purchaser_id, recipient_email, redeemed (boolean), created_at.
- Add a new route `/gift-cards` where users can select an amount and proceed to checkout via Stripe.  After successful payment, call an Edge Function to generate the gift card code and send an email to the recipient in their preferred language.
- Update the Admin dashboard with a “Gift Cards” module to list, filter and mark gift cards as redeemed.
- Ensure all new text supports EN/PL translations.
- Follow `.cursorrules` for styling, responsiveness, accessibility and commit guidelines.

Deliverables & checks:
- [ ] New pages/components for gift card purchase and admin management.
- [ ] New Edge Function `create-gift-card` with proper authentication and email sending.
- [ ] Migration for `gift_cards` table with indexes.
- [ ] Email template in Resend for gift card delivery.
- [ ] PR with summary, screenshots (mobile/tablet/desktop) and checklist.

Use this template as a guide to communicate effectively with AI assistants. Clear prompts result in better code generation, fewer iterations and higher quality contributions.