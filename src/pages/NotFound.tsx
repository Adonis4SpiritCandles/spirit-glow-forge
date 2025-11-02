import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOManager from "@/components/SEO/SEOManager";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t, language } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const title = language === 'en' ? 'Page Not Found' : 'Strona nie znaleziona';
  const description = language === 'en' 
    ? "The page you're looking for doesn't exist. Return to SPIRIT CANDLES homepage or explore our luxury candle collection."
    : "Strona, której szukasz, nie istnieje. Wróć na stronę główną SPIRIT CANDLES lub odkryj naszą kolekcję luksusowych świec.";

  return (
    <>
      <SEOManager
        title={title}
        description={description}
        noindex={true}
        nofollow={false}
      />
      
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-mystical px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* 404 Number with glow effect */}
          <div className="relative">
            <h1 className="text-[200px] md:text-[280px] font-playfair font-bold text-primary/10 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl md:text-8xl font-playfair font-bold text-primary animate-glow-pulse">
                404
              </div>
            </div>
          </div>

          {/* Error message */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground">
              {language === 'en' ? 'Page Not Found' : 'Strona nie znaleziona'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              {language === 'en'
                ? "Oops! The page you're looking for seems to have vanished into thin air, just like the smoke from our candles."
                : "Ups! Strona, której szukasz, wydaje się zniknąć w powietrzu, jak dym z naszych świec."}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button asChild size="lg" variant="default" className="min-w-[200px]">
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                {language === 'en' ? 'Back to Home' : 'Powrót do strony głównej'}
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="min-w-[200px]">
              <Link to="/shop">
                <Search className="mr-2 h-5 w-5" />
                {language === 'en' ? 'Browse Shop' : 'Przeglądaj sklep'}
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="min-w-[200px]">
              <Link to="/contact">
                <Mail className="mr-2 h-5 w-5" />
                {language === 'en' ? 'Contact Us' : 'Skontaktuj się'}
              </Link>
            </Button>
          </div>

          {/* Decorative element */}
          <div className="pt-12">
            <div className="inline-block px-6 py-3 bg-card/50 border border-border/40 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">
                {language === 'en'
                  ? 'Lost? Let us guide you back to the light.'
                  : 'Zgubiony? Pozwól nam poprowadzić Cię z powrotem do światła.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;