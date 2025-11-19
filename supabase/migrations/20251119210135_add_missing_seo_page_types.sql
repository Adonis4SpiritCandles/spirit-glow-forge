-- Add missing SEO page types for all routes
-- This ensures that all pages have SEO settings in the database

INSERT INTO public.seo_settings (page_type, title_en, title_pl, description_en, description_pl, keywords_en, keywords_pl, og_image_url, noindex) VALUES
-- Collections list page
('collections',
 'Collections | SPIRIT CANDLES',
 'Kolekcje | SPIRIT CANDLES',
 'Explore our curated collections of luxury soy candles. Each collection tells a unique story through fragrance.',
 'Odkryj nasze starannie wyselekcjonowane kolekcje luksusowych świec sojowych. Każda kolekcja opowiada unikalną historię przez zapach.',
 'candle collections, luxury candles, soy candles',
 'kolekcje świec, luksusowe świece, świece sojowe',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- FAQ
('faq',
 'Frequently Asked Questions | SPIRIT CANDLES',
 'Często Zadawane Pytania | SPIRIT CANDLES',
 'Find answers to common questions about our luxury soy candles, shipping, returns, and more.',
 'Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące naszych luksusowych świec sojowych, wysyłki, zwrotów i więcej.',
 'faq, questions, candle information',
 'faq, pytania, informacje o świecach',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Privacy Policy
('privacy_policy',
 'Privacy Policy | SPIRIT CANDLES',
 'Polityka Prywatności | SPIRIT CANDLES',
 'Learn how SPIRIT CANDLES protects your personal information and respects your privacy.',
 'Dowiedz się, jak SPIRIT CANDLES chroni Twoje dane osobowe i szanuje Twoją prywatność.',
 'privacy policy, data protection, GDPR',
 'polityka prywatności, ochrona danych, RODO',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Cookie Policy
('cookie_policy',
 'Cookie Policy | SPIRIT CANDLES',
 'Polityka plików cookie | SPIRIT CANDLES',
 'Information about how we use cookies and similar technologies on our website.',
 'Informacje o tym, jak używamy plików cookie i podobnych technologii na naszej stronie internetowej.',
 'cookie policy, cookies, tracking',
 'polityka plików cookie, cookies, śledzenie',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Terms of Sale
('terms_of_sale',
 'Terms of Sale | SPIRIT CANDLES',
 'Warunki Sprzedaży | SPIRIT CANDLES',
 'Terms and conditions for purchasing luxury soy candles from SPIRIT CANDLES.',
 'Warunki i zasady zakupu luksusowych świec sojowych od SPIRIT CANDLES.',
 'terms of sale, purchase terms, conditions',
 'warunki sprzedaży, warunki zakupu, zasady',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Shipping & Returns
('shipping_returns',
 'Shipping & Returns | SPIRIT CANDLES',
 'Wysyłka i Zwroty | SPIRIT CANDLES',
 'Information about shipping options, delivery times, and return policy for SPIRIT CANDLES products.',
 'Informacje o opcjach wysyłki, czasie dostawy i polityce zwrotów produktów SPIRIT CANDLES.',
 'shipping, returns, delivery, refunds',
 'wysyłka, zwroty, dostawa, zwroty pieniędzy',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Legal Notice
('legal_notice',
 'Legal Notice | SPIRIT CANDLES',
 'Informacje Prawne | SPIRIT CANDLES',
 'Legal information and company details for SPIRIT CANDLES.',
 'Informacje prawne i dane firmy SPIRIT CANDLES.',
 'legal notice, company information, legal',
 'informacje prawne, dane firmy, prawne',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Data Request
('data_request',
 'Data Request | SPIRIT CANDLES',
 'Żądanie Danych | SPIRIT CANDLES',
 'Request access to your personal data or exercise your GDPR rights.',
 'Poproś o dostęp do swoich danych osobowych lub skorzystaj ze swoich praw RODO.',
 'data request, GDPR, personal data',
 'żądanie danych, RODO, dane osobowe',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Accessibility
('accessibility',
 'Accessibility | SPIRIT CANDLES',
 'Dostępność | SPIRIT CANDLES',
 'Our commitment to making SPIRIT CANDLES website accessible to everyone.',
 'Nasze zaangażowanie w zapewnienie dostępności strony internetowej SPIRIT CANDLES dla wszystkich.',
 'accessibility, web accessibility, inclusive design',
 'dostępność, dostępność internetowa, projektowanie inkluzywne',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- All Notices
('all_notices',
 'All Legal Notices | SPIRIT CANDLES',
 'Wszystkie Informacje Prawne | SPIRIT CANDLES',
 'Complete list of all legal notices, policies, and terms for SPIRIT CANDLES.',
 'Pełna lista wszystkich informacji prawnych, polityk i warunków SPIRIT CANDLES.',
 'legal notices, policies, terms',
 'informacje prawne, polityki, warunki',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Wishlist
('wishlist',
 'My Wishlist | SPIRIT CANDLES',
 'Moja Lista Życzeń | SPIRIT CANDLES',
 'Save your favorite luxury candles to your wishlist for later.',
 'Zapisz swoje ulubione luksusowe świece na liście życzeń na później.',
 'wishlist, favorites, saved items',
 'lista życzeń, ulubione, zapisane przedmioty',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 true), -- noindex for user-specific pages

-- Scent Quiz
('scent_quiz',
 'Scent Quiz | Find Your Perfect Candle | SPIRIT CANDLES',
 'Quiz Zapachowy | Znajdź Swoją Idealną Świecę | SPIRIT CANDLES',
 'Take our scent quiz to discover the perfect luxury soy candle for your preferences.',
 'Rozwiąż nasz quiz zapachowy, aby odkryć idealną luksusową świecę sojową dla swoich preferencji.',
 'scent quiz, candle quiz, fragrance quiz',
 'quiz zapachowy, quiz świec, quiz zapachów',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Loyalty Program
('loyalty',
 'Loyalty Program | SPIRIT CANDLES',
 'Program Lojalnościowy | SPIRIT CANDLES',
 'Join our loyalty program and earn rewards with every purchase of luxury soy candles.',
 'Dołącz do naszego programu lojalnościowego i zdobywaj nagrody przy każdym zakupie luksusowych świec sojowych.',
 'loyalty program, rewards, points',
 'program lojalnościowy, nagrody, punkty',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 true), -- noindex for user-specific pages

-- Cart
('cart',
 'Shopping Cart | SPIRIT CANDLES',
 'Koszyk | SPIRIT CANDLES',
 'Review your selected luxury soy candles before checkout.',
 'Przejrzyj wybrane luksusowe świece sojowe przed finalizacją zakupu.',
 'shopping cart, cart, checkout',
 'koszyk, zakupy, kasa',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 true), -- noindex for user-specific pages

-- Checkout
('checkout',
 'Checkout | SPIRIT CANDLES',
 'Kasa | SPIRIT CANDLES',
 'Complete your purchase of luxury soy candles from SPIRIT CANDLES.',
 'Dokończ zakup luksusowych świec sojowych od SPIRIT CANDLES.',
 'checkout, purchase, payment',
 'kasa, zakup, płatność',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 true), -- noindex for user-specific pages

-- Payment Success
('payment_success',
 'Payment Successful | SPIRIT CANDLES',
 'Płatność Zakończona Sukcesem | SPIRIT CANDLES',
 'Thank you for your purchase! Your order has been confirmed.',
 'Dziękujemy za zakup! Twoje zamówienie zostało potwierdzone.',
 'payment success, order confirmation',
 'płatność zakończona sukcesem, potwierdzenie zamówienia',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 true), -- noindex for user-specific pages

-- Auth
('auth',
 'Login | SPIRIT CANDLES',
 'Logowanie | SPIRIT CANDLES',
 'Sign in to your SPIRIT CANDLES account to access your orders and wishlist.',
 'Zaloguj się do swojego konta SPIRIT CANDLES, aby uzyskać dostęp do zamówień i listy życzeń.',
 'login, sign in, account',
 'logowanie, konto, rejestracja',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 true), -- noindex for user-specific pages

-- Dashboard
('dashboard',
 'My Dashboard | SPIRIT CANDLES',
 'Mój Panel | SPIRIT CANDLES',
 'Manage your account, view orders, and track your loyalty points.',
 'Zarządzaj swoim kontem, przeglądaj zamówienia i śledź swoje punkty lojalnościowe.',
 'dashboard, account, orders',
 'panel, konto, zamówienia',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 true), -- noindex for user-specific pages

-- Admin
('admin',
 'Admin Dashboard | SPIRIT CANDLES',
 'Panel Administracyjny | SPIRIT CANDLES',
 'Administrative dashboard for managing SPIRIT CANDLES website and orders.',
 'Panel administracyjny do zarządzania stroną internetową i zamówieniami SPIRIT CANDLES.',
 'admin, administration, management',
 'admin, administracja, zarządzanie',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 true), -- noindex for admin pages

-- AR Viewer
('ar',
 'AR Viewer | SPIRIT CANDLES',
 'Przeglądarka AR | SPIRIT CANDLES',
 'View our luxury soy candles in augmented reality.',
 'Zobacz nasze luksusowe świece sojowe w rzeczywistości rozszerzonej.',
 'AR, augmented reality, 3D view',
 'AR, rzeczywistość rozszerzona, widok 3D',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Profile
('profile',
 'Profile | SPIRIT CANDLES',
 'Profil | SPIRIT CANDLES',
 'View public profile on SPIRIT CANDLES.',
 'Zobacz publiczny profil na SPIRIT CANDLES.',
 'profile, user profile, public profile',
 'profil, profil użytkownika, profil publiczny',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Leaderboard
('leaderboard',
 'Referral Leaderboard | SPIRIT CANDLES',
 'Ranking Referralny | SPIRIT CANDLES',
 'See the top referrers in our loyalty program.',
 'Zobacz najlepszych polecających w naszym programie lojalnościowym.',
 'leaderboard, referrals, top referrers',
 'ranking, polecenia, najlepsi polecający',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Order Timeline
('order_timeline',
 'Order Timeline | SPIRIT CANDLES',
 'Historia Zamówienia | SPIRIT CANDLES',
 'Track the status and timeline of your order.',
 'Śledź status i historię swojego zamówienia.',
 'order timeline, order status, tracking',
 'historia zamówienia, status zamówienia, śledzenie',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 true), -- noindex for user-specific pages

-- Shared Wishlist
('shared_wishlist',
 'Shared Wishlist | SPIRIT CANDLES',
 'Udostępniona Lista Życzeń | SPIRIT CANDLES',
 'View a shared wishlist of luxury soy candles.',
 'Zobacz udostępnioną listę życzeń luksusowych świec sojowych.',
 'shared wishlist, wishlist, shared',
 'udostępniona lista życzeń, lista życzeń, udostępnione',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 false),

-- Reset Password
('reset_password',
 'Reset Password | SPIRIT CANDLES',
 'Resetowanie Hasła | SPIRIT CANDLES',
 'Reset your SPIRIT CANDLES account password.',
 'Zresetuj hasło do swojego konta SPIRIT CANDLES.',
 'reset password, password recovery',
 'resetowanie hasła, odzyskiwanie hasła',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 true), -- noindex for user-specific pages

-- Privacy Registration
('privacy_registration',
 'Privacy Registration | SPIRIT CANDLES',
 'Rejestracja Prywatności | SPIRIT CANDLES',
 'Register for privacy updates and data management.',
 'Zarejestruj się, aby otrzymywać aktualizacje dotyczące prywatności i zarządzania danymi.',
 'privacy registration, data management',
 'rejestracja prywatności, zarządzanie danymi',
 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
 true) -- noindex for user-specific pages

ON CONFLICT (page_type) DO NOTHING;

