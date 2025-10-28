import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Bell } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { unseenCount, isAdmin } = useAdminNotifications();
  const { t } = useLanguage();

  return (
    <main>
      {/* Admin Notification Banner */}
      {isAdmin && unseenCount > 0 && (
        <div className="container mx-auto px-4 pt-4">
          <Alert className="bg-gradient-to-r from-amber-900/20 via-amber-800/20 to-amber-900/20 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20 animate-fade-in backdrop-blur-sm">
            <Bell className="h-5 w-5 text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <strong className="text-lg font-semibold text-amber-200 drop-shadow-md flex items-center gap-2">
                  🔔 {t('newOrdersToConfirm')}
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
