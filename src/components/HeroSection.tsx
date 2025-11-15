import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import spiritLogo from "@/assets/spirit-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const [logoGlow, setLogoGlow] = useState(false);
  const { t } = useLanguage();
  const [sectionActive, setSectionActive] = useState<boolean>(true);

  useEffect(() => {
    // Simple logo glow effect
    setTimeout(() => setLogoGlow(true), 600);
    loadSectionToggle();
  }, []);

  const loadSectionToggle = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_sections_toggle')
        .select('hero_section_active')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      if (error) {
        // If error (e.g., no row found), default to true
        console.warn('Error loading hero section toggle:', error);
        setSectionActive(true);
        return;
      }
      
      if (data) {
        setSectionActive(data.hero_section_active ?? true);
      } else {
        // No data found, default to true
        setSectionActive(true);
      }
    } catch (error) {
      console.error('Error loading hero section toggle:', error);
      // Default to true if error (section will show)
      setSectionActive(true);
    }
  };

  if (!sectionActive) return null;

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-100"
        style={{ zIndex: 0 }}
      >
        <source src="/videos/hero-background.mp4" type="video/mp4" />
      </video>

      {/* Black Overlay (60%) */}
      <div className="absolute inset-0 bg-black/60" style={{ zIndex: 1 }}></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30" style={{ zIndex: 2 }}>
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-accent rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-3 h-3 bg-primary/60 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-accent/80 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 text-center relative py-8 md:py-0" style={{ zIndex: 3 }}>
        <div className="max-w-4xl mx-auto">
          {/* Logo with Glow Effect */}
          <div className="mb-8">
            <div className="mb-6">
              <img 
                src={spiritLogo} 
                alt="SPIRIT CANDLES" 
                className={`h-48 md:h-64 mx-auto logo-aura transition-all duration-2000 ${logoGlow ? 'candle-glow scale-105 drop-shadow-[0_0_35px_rgba(255,255,255,0.8)]' : 'scale-100'}`}
              />
            </div>
            
            {/* H1 and H2 Text */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold text-foreground mb-4">
                <span className="block">SPIRIT</span>
                <span className="block text-primary">CANDLE</span>
              </h1>
              
              <h2 className="text-xl md:text-2xl text-muted-foreground mb-6 italic">
                Reborn your nature
              </h2>
            </div>
          </div>

          {/* Text Content */}
          <div className="animate-fade-in">
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 shadow-luxury hover:scale-105 transition-all duration-300"
              >
                <Link to="/shop">
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('shopCollection')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="border-border hover:bg-muted px-8 py-4 hover:scale-105 transition-all duration-300"
              >
                <Link to="/about">
                  {t('learnOurStory')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-16 md:h-32 bg-gradient-to-t from-background/20 to-transparent" style={{ zIndex: 2 }}></div>
    </section>
  );
};

export default HeroSection;