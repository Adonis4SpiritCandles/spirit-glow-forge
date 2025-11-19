import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import ProductCarousel from "@/components/ProductCarousel";
import TestimonialsCarousel from "@/components/homepage/TestimonialsCarousel";
import ScentJourney from "@/components/homepage/ScentJourney";
import SocialFeed from "@/components/homepage/SocialFeed";
import NewsletterSignup from "@/components/homepage/NewsletterSignup";
import TrustBadges from "@/components/homepage/TrustBadges";
import FloatingActionButton from "@/components/FloatingActionButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, Gift } from "lucide-react";
import SEOManager from "@/components/SEO/SEOManager";
import { generateWebSiteStructuredData } from "@/utils/seoUtils";
import { useSEOSettings } from "@/hooks/useSEOSettings";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { unseenCount, isAdmin } = useAdminNotifications();
  const { t, language } = useLanguage();
  const seoSettings = useSEOSettings('home');
  const [searchParams, setSearchParams] = useSearchParams();
  const [showReferralBanner, setShowReferralBanner] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && ref.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      setShowReferralBanner(true);
    }

    // Handle newsletter confirmation status
    const newsletterStatus = searchParams.get('newsletter');
    if (newsletterStatus === 'success') {
      toast.success(
        language === 'pl' 
          ? '✓ Newsletter potwierdzony! Sprawdź swoją skrzynkę email, aby otrzymać kod rabatowy 10%!'
          : '✓ Newsletter confirmed! Check your email to receive your 10% discount code!',
        { duration: 5000 }
      );
      setSearchParams({});
    } else if (newsletterStatus === 'error') {
      toast.error(
        language === 'pl'
          ? 'Błąd potwierdzenia. Skontaktuj się z nami.'
          : 'Confirmation error. Please contact us.',
        { duration: 5000 }
      );
      setSearchParams({});
    } else if (newsletterStatus === 'invalid') {
      toast.error(
        language === 'pl'
          ? 'Nieprawidłowy lub wygasły link. Zapisz się ponownie.'
          : 'Invalid or expired link. Please subscribe again.',
        { duration: 5000 }
      );
      setSearchParams({});
    }
  }, [searchParams, language, setSearchParams]);

  // Use SEO settings from database or fallback to defaults
  const title = seoSettings.title || (language === 'en' 
    ? 'SPIRIT CANDLES — Reborn Your Nature | Luxury Soy Candles'
    : 'SPIRIT CANDLES — Odrodź Swoją Naturę | Luksusowe Świece Sojowe');
  
  const description = seoSettings.description || (language === 'en'
    ? 'Discover SPIRIT CANDLES luxury soy candles inspired by iconic fragrances. Handcrafted with natural soy wax and wooden wicks for an elevated sensory experience. Reborn your nature.'
    : 'Odkryj luksusowe świece sojowe SPIRIT CANDLES inspirowane kultowymi zapachami. Ręcznie robione z naturalnego wosku sojowego i drewnianymi knotami dla wyjątkowych doznań zmysłowych. Odrodź swoją naturę.');

  return (
    <main>
      {/* Only render SEOManager after data is loaded to ensure crawlers get correct meta tags */}
      {!seoSettings.loading && (
        <SEOManager
          title={title}
          description={description}
          keywords={seoSettings.keywords}
          type="website"
          image={seoSettings.og_image_url || "https://spirit-candle.com/spiritcandles/og-image-default.jpg"}
          url="https://spirit-candle.com/"
          noindex={seoSettings.noindex}
          structuredData={generateWebSiteStructuredData()}
          alternateUrls={{
            en: 'https://spirit-candle.com/',
            pl: 'https://spirit-candle.com/'
          }}
        />
      )}
      {/* Referral Banner - Fixed Overlay */}
      {showReferralBanner && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 animate-fade-in">
          <Alert className="bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 border-2 border-primary/50 shadow-2xl shadow-primary/30 backdrop-blur-md max-w-2xl w-full">
            <Gift className="h-5 w-5 text-primary animate-pulse drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <strong className="text-lg font-semibold text-foreground drop-shadow-md flex items-center gap-2">
                  🎁 {language === 'pl' ? 'Link Polecający Aktywowany!' : 'Referral Link Activated!'}
                </strong>
                <p className="text-foreground/90 mt-2 font-medium">
                  {language === 'pl' 
                    ? 'Zarejestruj się teraz, aby zyskać 10% zniżki na pierwsze zamówienie i 100 Bonus SpiritPoints!' 
                    : 'Sign up now to get 10% off your first order and 100 Bonus SpiritPoints!'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {language === 'pl' ? 'Zarejestruj się' : 'Sign Up Now'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowReferralBanner(false)}
                  className="text-foreground/70 hover:text-foreground"
                >
                  {language === 'pl' ? 'Zamknij' : 'Close'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Admin Notification Banner - Fixed Overlay */}
      {isAdmin && unseenCount > 0 && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-fade-in">
          <Alert className="bg-gradient-to-r from-amber-900/20 via-amber-800/20 to-amber-900/20 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/30 backdrop-blur-md">
            <Bell className="h-5 w-5 text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <strong className="text-lg font-semibold text-amber-200 drop-shadow-md flex items-center gap-2">
                  🔔 Hey! {t('newOrdersToConfirm')}
                </strong>
                <p className="text-amber-100/90 mt-2 font-medium">
                  {t('youHaveXOrders').replace('{count}', unseenCount.toString())}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {t('viewInDashboard')}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <HeroSection />
      <ProductCarousel />
      <TestimonialsCarousel />
      <ScentJourney />
      <TrustBadges />
      <SocialFeed />
      <NewsletterSignup />
      <FloatingActionButton />
    </main>
  );
};

export default Index;
