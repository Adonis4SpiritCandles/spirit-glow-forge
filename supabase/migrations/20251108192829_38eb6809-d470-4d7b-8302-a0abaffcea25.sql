-- Create chat_responses table for Live Chat Settings
CREATE TABLE IF NOT EXISTS public.chat_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  trigger_keywords_en TEXT[] DEFAULT '{}',
  trigger_keywords_pl TEXT[] DEFAULT '{}',
  response_en TEXT NOT NULL,
  response_pl TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_responses ENABLE ROW LEVEL SECURITY;

-- Admin can manage
CREATE POLICY "Admins manage chat responses"
  ON public.chat_responses FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

-- Everyone can view active
CREATE POLICY "View active chat responses"
  ON public.chat_responses FOR SELECT
  USING (is_active = true);

-- Insert default chat responses
INSERT INTO public.chat_responses (category, trigger_keywords_en, trigger_keywords_pl, response_en, response_pl, display_order, is_default, is_active) VALUES
('welcome', ARRAY['hello', 'hi', 'hey', 'greetings'], ARRAY['cześć', 'witaj', 'hej', 'dzień dobry'], 
 'Welcome to SPIRIT CANDLES! 🕯️ How can I help you today? Feel free to ask about our products, orders, shipping, or rewards program!',
 'Witaj w SPIRIT CANDLES! 🕯️ Jak mogę Ci dzisiaj pomóc? Pytaj śmiało o nasze produkty, zamówienia, wysyłkę lub program nagród!',
 1, true, true),

('shipping', ARRAY['shipping', 'delivery', 'send', 'track', 'tracking'], ARRAY['wysyłka', 'dostawa', 'wysłać', 'śledzenie', 'tracking'],
 'We ship via Furgonetka with various carriers. Once your order is shipped, you''ll receive a tracking number by email. Shipping typically takes 2-5 business days within Poland. 📦',
 'Wysyłamy przez Furgonetka z różnymi przewoźnikami. Po wysłaniu zamówienia otrzymasz numer śledzenia mailem. Wysyłka zazwyczaj trwa 2-5 dni roboczych w Polsce. 📦',
 2, true, true),

('orders', ARRAY['order', 'purchase', 'buy', 'checkout', 'payment'], ARRAY['zamówienie', 'zakup', 'kupić', 'płatność', 'koszyk'],
 'You can view all your orders in your Dashboard → Orders. Each order shows detailed tracking, status updates, and delivery information. Need help with a specific order? 🛍️',
 'Możesz zobaczyć wszystkie zamówienia w Panelu → Zamówienia. Każde zamówienie pokazuje szczegółowe śledzenie, aktualizacje statusu i informacje o dostawie. Potrzebujesz pomocy z konkretnym zamówieniem? 🛍️',
 3, true, true),

('custom_candles', ARRAY['custom', 'personalize', 'customize', 'design'], ARRAY['niestandardowe', 'personalizować', 'spersonalizować', 'projekt'],
 'Create your unique candle in our Custom Candles section! Choose scent, color, container, and add personal text. Perfect for gifts! Go to Customize in the menu. 🎨',
 'Stwórz swoją unikalną świecę w sekcji Niestandardowe Świece! Wybierz zapach, kolor, pojemnik i dodaj osobisty tekst. Idealne na prezenty! Przejdź do Personalizuj w menu. 🎨',
 4, true, true),

('referral', ARRAY['referral', 'invite', 'friend', 'discount', 'code'], ARRAY['polecenie', 'zaproś', 'przyjaciel', 'zniżka', 'kod'],
 'Share your referral code and earn rewards! You get 200 SpiritPoints + €2 coupon when friends make their first purchase. Your friends get 10% off + 100 bonus points! Find your code in Dashboard → Referrals. 🎁',
 'Udostępnij swój kod polecający i zdobywaj nagrody! Otrzymasz 200 SpiritPoints + 2€ kupon gdy przyjaciele dokonają pierwszego zakupu. Twoi znajomi otrzymają 10% zniżki + 100 punktów bonusowych! Znajdź swój kod w Panel → Polecenia. 🎁',
 5, true, true),

('badges', ARRAY['badge', 'badges', 'achievement', 'rewards', 'points'], ARRAY['odznaka', 'odznaki', 'osiągnięcie', 'nagrody', 'punkty'],
 'Earn badges by completing actions: Welcome (register), First Order, Referral Inviter, Loyalty Champion, and more! Check your Spirit Profile to see all your badges and progress. 🏆',
 'Zdobywaj odznaki wykonując akcje: Witamy (rejestracja), Pierwsze Zamówienie, Zapraszający, Mistrz Lojalności i więcej! Sprawdź swój Profil Spirit aby zobaczyć wszystkie odznaki i postęp. 🏆',
 6, true, true),

('social_profile', ARRAY['profile', 'social', 'public', 'comment', 'post'], ARRAY['profil', 'społecznościowy', 'publiczny', 'komentarz', 'post'],
 'Your Spirit Profile is your public page! Share posts, get likes and ratings from the community. Customize with cover image and bio. Access via Dashboard → Spirit Profile. ✨',
 'Twój Profil Spirit to Twoja publiczna strona! Udostępniaj posty, otrzymuj polubienia i oceny od społeczności. Dostosuj zdjęciem okładki i bio. Dostęp przez Panel → Profil Spirit. ✨',
 7, true, true),

('returns', ARRAY['return', 'refund', 'cancel', 'change order'], ARRAY['zwrot', 'zwrócić', 'anulować', 'zmienić zamówienie'],
 'You can request returns within 14 days of receiving your order. Contact us at m5moffice@proton.me with your order number. See full policy in Shipping & Returns page. 📋',
 'Możesz zgłosić zwrot w ciągu 14 dni od otrzymania zamówienia. Skontaktuj się z nami pod m5moffice@proton.me podając numer zamówienia. Zobacz pełny regulamin na stronie Wysyłka i Zwroty. 📋',
 8, true, true);

-- Enable REPLICA IDENTITY FULL for real-time comments
ALTER TABLE public.profile_comments REPLICA IDENTITY FULL;
ALTER TABLE public.profile_comment_likes REPLICA IDENTITY FULL;
ALTER TABLE public.profile_comment_ratings REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_comment_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_comment_ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_responses;