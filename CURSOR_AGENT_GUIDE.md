# Cursor Agent Guide — Spirit Candles Project

This guide provides Cursor AI agents with essential context, patterns, and best practices for working on the Spirit Candles e-commerce platform.

## Project Context

**Domain:** spirit-candle.com  
**Tech Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + Supabase + Stripe  
**Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)  
**Languages:** Bilingual (EN/PL)  
**Design:** Luxury black/gold theme with glow effects

## Key Architecture Patterns

### 1. Database & Authentication
- **PostgreSQL via Supabase** with Row Level Security (RLS)
- Custom authentication system (email/username)
- User roles: `user` (default), `admin`
- All tables have RLS policies for security

### 2. Frontend Structure
```
src/
├── pages/          # Top-level routes (Index, Shop, ProductDetail, UserDashboard, AdminDashboard)
├── components/     # Reusable UI components
├── contexts/       # React contexts (LanguageContext, CartContext)
├── hooks/          # Custom hooks (useAuth, useCart, useReviews)
├── integrations/   # External services (Supabase client)
└── utils/          # Helper functions
```

### 3. Styling Guidelines
- **Use design tokens** from `index.css` and `tailwind.config.ts`
- **Never hardcode colors** - always use semantic tokens
- **All colors must be HSL format**
- Example: Use `bg-background`, `text-foreground`, `border-border`
- Theme: `--primary`, `--secondary`, `--accent`, `--muted`

### 4. Responsive Design
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Test all three: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)

### 5. Internationalization (i18n)
- Use `LanguageContext` for all text
- Access via: `const { t, language } = useLanguage();`
- Both frontend and backend must support EN/PL
- Email templates have bilingual versions

## Common Development Tasks

### Adding a New Feature
1. **Database First**: Create migration if needed
2. **RLS Policies**: Define security rules
3. **Edge Function**: Add backend logic (if needed)
4. **Frontend Component**: Build UI with TypeScript
5. **Translations**: Add both EN and PL strings
6. **Responsive**: Test mobile/tablet/desktop

### Working with Supabase
```typescript
// Always use typed queries
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

// Handle errors
if (error) {
  console.error('Error:', error);
  toast({ title: 'Error', description: error.message, variant: 'destructive' });
  return;
}
```

### Edge Functions (Deno)
- Location: `supabase/functions/`
- Always handle CORS preflight requests
- Verify authentication when needed
- Return proper JSON responses with status codes

### Stripe Integration
- Checkout flow via `create-checkout` edge function
- Webhook handling in `stripe-webhook` function
- Test mode: Use Stripe test keys

## Database Schema (Key Tables)

### Core Tables
- `profiles`: User data (username, role, points, referral_code)
- `products`: Product catalog
- `orders`: Order tracking with Furgonetka integration
- `order_items`: Line items for orders
- `coupons`: Discount codes
- `reviews`: Product reviews

### Social Features
- `profile_comments`: User comments on profiles
- `profile_comment_reactions`: Likes, fire, heart, celebrate
- `profile_follows`: Follow/unfollow system
- `profile_notifications`: Social notifications

### Gamification
- `badges`: Achievement system
- `user_badges`: User achievements
- `referral_rewards`: Referral tracking

## Security Best Practices

1. **Always use RLS policies** on tables
2. **Validate user input** client and server-side
3. **Use prepared statements** (Supabase handles this)
4. **Never expose API keys** in frontend code
5. **Check user authentication** before sensitive operations

## Common Pitfalls to Avoid

❌ **DON'T:**
- Hardcode colors (`text-white`, `bg-black`)
- Skip mobile testing
- Forget to add translations
- Ignore TypeScript errors
- Create tables without RLS policies
- Use direct Supabase client calls in components (use hooks)

✅ **DO:**
- Use semantic color tokens
- Test responsiveness
- Add bilingual support
- Fix all TypeScript issues
- Apply RLS policies
- Create custom hooks for data fetching

## File Length Limits (Furgonetka API)

When working with shipping forms:
- Full Name: max 50 characters
- Street Address: max 100 characters
- City: max 50 characters
- Postal Code: max 20 characters
- Email: max 100 characters

## Testing Checklist

Before marking a feature complete:

- [ ] Works on mobile (< 640px)
- [ ] Works on tablet (640-1024px)
- [ ] Works on desktop (> 1024px)
- [ ] English translations present
- [ ] Polish translations present
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] RLS policies applied (if DB changes)
- [ ] Edge function tested (if backend changes)
- [ ] User authentication checked
- [ ] Toast notifications for errors/success

## Useful Commands

```bash
# Run dev server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Supabase migrations
supabase migration new migration_name
supabase db push

# Edge function deployment
supabase functions deploy function-name
```

## Key Dependencies

- `@supabase/supabase-js`: Supabase client
- `@tanstack/react-query`: Data fetching/caching
- `react-router-dom`: Client-side routing
- `framer-motion`: Animations
- `lucide-react`: Icons
- `zod`: Schema validation
- `react-hook-form`: Form handling

## Documentation References

- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)
- [Stripe API](https://stripe.com/docs/api)
- [Furgonetka API](https://furgonetka.pl/api)

## Current Implementation Status

See and update (if is necessary and without altering the structure or display of the file,) `IMPLEMENTATION_STATUS.md`, `IMPLEMENTATION_COMPLETE_SUMMARY.md`, `IMPLEMENTATION_SUMMARY.md`  for detailed progress on:
- Collections system
- Social features (reactions, follows, notifications)
- Multi-coupon checkout
- SpiritPoints rebranding
- Public profile enhancements
- Changes not completed or to be completed
- Others and more

## Getting Help

1. Check `IMPLEMENTATION_STATUS_OLD.md` for current state and create new file update `IMPLEMENTATION_STATUS.md`.
2. Review `CURSOR_PROMPT_TEMPLATE.md` for prompt structure.
3. Check `.cursorrules` for Rules.
4. Check `.README.md` for general info of site or project actually.
5. Search codebase for similar patterns
6. Check Supabase logs for backend errors
7. Use browser DevTools for frontend debugging

---

**Remember:** This is a production e-commerce site. Always prioritize:
1. **Security** (RLS, input validation)
2. **User experience** (responsive, accessible)
3. **Data integrity** (proper validation, error handling)
4. **Performance** (optimized queries, lazy loading)