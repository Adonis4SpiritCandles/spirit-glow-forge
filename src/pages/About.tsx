import { useState, useEffect } from 'react';
import { Flame, Leaf, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import candleWax from "@/assets/candle-wax.png";
import spiritLogo from "@/assets/spirit-logo.png";
import SEOManager from "@/components/SEO/SEOManager";
import { 
  generateAboutPageStructuredData,
  generateBreadcrumbStructuredData,
  getFullUrl,
  generateAlternateUrls,
  truncateDescription
} from "@/utils/seoUtils";
import { supabase } from "@/integrations/supabase/client";
import { useSEOSettings } from "@/hooks/useSEOSettings";

const About = () => {
  const { t, language } = useLanguage();
  const seoSettings = useSEOSettings('about');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heroSettings, setHeroSettings] = useState<any>(null);

  // Add styles for luminescence and candle-flicker animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes candleFlicker {
        0%, 100% { 
          opacity: 1;
          filter: brightness(1) drop-shadow(0 0 10px hsl(var(--primary) / 0.5));
        }
        15% { 
          opacity: 0.95;
          filter: brightness(0.90) drop-shadow(0 0 15px hsl(var(--primary) / 0.6));
        }
        30% { 
          opacity: 0.98;
          filter: brightness(0.95) drop-shadow(0 0 12px hsl(var(--primary) / 0.55));
        }
        45% { 
          opacity: 0.92;
          filter: brightness(0.88) drop-shadow(0 0 18px hsl(var(--primary) / 0.65));
        }
        60% { 
          opacity: 0.96;
          filter: brightness(0.93) drop-shadow(0 0 14px hsl(var(--primary) / 0.58));
        }
        75% { 
          opacity: 0.94;
          filter: brightness(0.91) drop-shadow(0 0 16px hsl(var(--primary) / 0.62));
        }
        90% { 
          opacity: 0.97;
          filter: brightness(0.96) drop-shadow(0 0 11px hsl(var(--primary) / 0.52));
        }
      }
      .title-candle-flicker {
        animation: candleFlicker 8s ease-in-out infinite;
      }
      .title-luminescent {
        text-shadow: 
          0 0 20px hsl(var(--primary) / 0.4),
          0 0 40px hsl(var(--primary) / 0.3),
          0 0 60px hsl(var(--primary) / 0.2);
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await (supabase as any)
          .from('about_settings')
          .select('*, hero_animation_enabled, hero_fluorescent_enabled, hero_fluorescent_intensity, hero_image_size, hero_parallax_strength')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .eq('is_active', true)
          .single();
        
        if (data) {
          setSettings(data);
          
          // Load hero settings with defaults
          setHeroSettings({
            animationEnabled: data.hero_animation_enabled ?? true,
            fluorescentEnabled: data.hero_fluorescent_enabled ?? false,
            fluorescentIntensity: data.hero_fluorescent_intensity ?? 30,
            imageSize: data.hero_image_size || 'medium',
            parallaxStrength: data.hero_parallax_strength ?? 300,
          });
        }
      } catch (error) {
        console.error('Error loading about settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Icon map for features
  const iconMap: Record<string, any> = {
    leaf: Leaf,
    heart: Heart,
    flame: Flame,
    award: Award,
  };

  // Use settings if available, otherwise fallback to defaults
  const heroTitle = settings?.hero_title_en && settings?.hero_title_pl
    ? (language === 'en' ? settings.hero_title_en : settings.hero_title_pl)
    : t('rebornYourNature');
  
  const heroIntro1 = settings?.hero_intro1_en && settings?.hero_intro1_pl
    ? (language === 'en' ? settings.hero_intro1_en : settings.hero_intro1_pl)
    : t('aboutIntro1');
  
  const heroIntro2 = settings?.hero_intro2_en && settings?.hero_intro2_pl
    ? (language === 'en' ? settings.hero_intro2_en : settings.hero_intro2_pl)
    : t('aboutIntro2');
  
  const heroButtonText = settings?.hero_button_text_en && settings?.hero_button_text_pl
    ? (language === 'en' ? settings.hero_button_text_en : settings.hero_button_text_pl)
    : t('discoverOurCollection');

  const heroImageUrl = settings?.hero_image_url || settings?.hero_image_url_external || null;

  // SEO Data
  const aboutUrl = getFullUrl('/about', language);
  const alternateUrls = generateAlternateUrls('/about');
  const heroImage = settings?.hero_image_url || settings?.hero_image_url_external;

  // Breadcrumb
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: getFullUrl('/', language) },
    { name: language === 'en' ? 'About Us' : 'O Nas', url: aboutUrl }
  ]);

  // About structured data
  const aboutStructuredData = generateAboutPageStructuredData({
    description: heroIntro1 || heroIntro2 || undefined,
    image: heroImage
  });

  // Keywords
  const keywords = language === 'en'
    ? 'about spirit candles, luxury candles story, handcrafted soy candles, candle makers, premium candles'
    : 'o spirit candles, historia luksusowych świec, ręcznie robione świece sojowe, producenci świec, świece premium';
  
  const featuresSectionTitle = settings?.features_section_title_en && settings?.features_section_title_pl
    ? (language === 'en' ? settings.features_section_title_en : settings.features_section_title_pl)
    : t('whyChooseSpiritCandles');
  
  const featuresSectionDescription = settings?.features_section_description_en && settings?.features_section_description_pl
    ? (language === 'en' ? settings.features_section_description_en : settings.features_section_description_pl)
    : t('whyChooseDesc');
  
  // Build features array from settings or fallback to defaults
  const features = settings?.features && Array.isArray(settings.features) && settings.features.length > 0
    ? settings.features.map((feature: any) => {
        const IconComponent = iconMap[feature.icon] || Leaf;
        return {
          icon: <IconComponent className="w-6 h-6 text-primary" />,
          title: language === 'en' ? feature.title_en : feature.title_pl,
          description: language === 'en' ? feature.description_en : feature.description_pl,
          link: feature.link
        };
      })
    : [
        {
          icon: <Leaf className="w-6 h-6 text-primary" />,
          title: t('feature1Title'),
          description: t('feature1Desc')
        },
        {
          icon: <Heart className="w-6 h-6 text-primary" />,
          title: t('feature2Title'),
          description: t('feature2Desc')
        },
        {
          icon: <Flame className="w-6 h-6 text-primary" />,
          title: t('feature3Title'),
          description: t('feature3Desc')
        },
        {
          icon: <Award className="w-6 h-6 text-primary" />,
          title: t('feature4Title'),
          description: t('feature4Desc')
        },
        {
          icon: <Leaf className="w-6 h-6 text-primary" />,
          title: t('feature5Title'),
          description: t('feature5Desc')
        },
        {
          icon: <Award className="w-6 h-6 text-primary" />,
          title: t('feature6Title'),
          description: language === 'pl' 
            ? 'Stwórz swoją własną spersonalizowaną świecę, z personalizowaną etykietą lub zapachem według własnego wyboru dla siebie lub jako unikalny prezent!' 
            : 'Create your own personalized candle, with a personalized label, or fragrance of your choice for yourself or as a unique gift!',
          link: '/custom-candles'
        }
      ];

  // Use SEO settings from database or fallback to defaults
  const seoTitle = seoSettings.title || (language === 'en' ? 'About Us' : 'O Nas');
  const seoDescription = seoSettings.description || truncateDescription(heroIntro1 || heroIntro2 || (language === 'en' 
    ? 'Learn about SPIRIT CANDLES – our story, values, and commitment to creating luxury soy candles.'
    : 'Dowiedz się więcej o SPIRIT CANDLES – naszej historii, wartościach i zaangażowaniu w tworzenie luksusowych świec sojowych.'), 160);

  return (
    <>
      {/* Only render SEOManager after data is loaded */}
      {!seoSettings.loading && (
        <SEOManager
          title={seoTitle}
          description={seoDescription}
          keywords={seoSettings.keywords || keywords}
          type="website"
          image={seoSettings.og_image_url || heroImage || 'https://spirit-candle.com/spiritcandles/og-image-default.jpg'}
          imageAlt={language === 'en' ? 'About SPIRIT CANDLES' : 'O SPIRIT CANDLES'}
          url={aboutUrl}
          canonical={aboutUrl}
          noindex={seoSettings.noindex}
          structuredData={[aboutStructuredData, breadcrumbData]}
          alternateUrls={alternateUrls}
        />
      )}
      <main className="min-h-screen bg-gradient-mystical">
        {/* Hero Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-foreground leading-tight">
                  {heroTitle}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {heroIntro1}
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {heroIntro2}
                </p>
                <Link to={settings?.hero_button_link || '/shop'}>
                  <Button 
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-luxury hover:scale-105 transition-all duration-300"
                  >
                    {heroButtonText}
                  </Button>
                </Link>
              </div>
              
              <div className="relative">
                {heroImageUrl ? (
                  <div 
                    className={`aspect-square bg-gradient-glow rounded-xl p-8 overflow-hidden relative ${
                      heroSettings?.imageSize === 'small' ? 'max-w-md mx-auto' : 
                      heroSettings?.imageSize === 'large' ? 'max-w-2xl mx-auto' : 
                      'max-w-lg mx-auto'
                    }`}
                    style={{
                      animation: heroSettings?.animationEnabled ? 'fadeIn 1s ease-in-out' : 'none',
                    }}
                  >
                    {/* Fluorescent glow effect */}
                    {heroSettings?.fluorescentEnabled && (
                      <div 
                        className="absolute inset-0 pointer-events-none rounded-xl"
                        style={{
                          boxShadow: `0 0 ${(heroSettings?.fluorescentIntensity ?? 30) * 2}px hsl(var(--primary) / ${(heroSettings?.fluorescentIntensity ?? 30) / 100})`,
                          filter: `blur(${(heroSettings?.fluorescentIntensity ?? 30) / 5}px)`,
                          zIndex: 1,
                        }}
                      />
                    )}
                    <img
                      src={heroImageUrl}
                      alt="Handcrafted SPIRIT CANDLE"
                      className="w-full h-full object-contain rounded-xl candle-glow relative z-10"
                    />
                  </div>
                ) : null}
                <div className="absolute -bottom-6 -right-6 bg-card border border-border/40 rounded-lg p-4 shadow-elegant">
                  <img 
                    src={spiritLogo}
                    alt="SPIRIT CANDLES Logo"
                    className="w-24 h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gradient-secondary">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
                {featuresSectionTitle}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {featuresSectionDescription}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className="bg-card border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-luxury hover:scale-105"
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-playfair font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    {feature.link && (
                      <Link to={feature.link}>
                        <Button className="mt-4 w-full">
                          {language === 'pl' ? 'Dowiedz się więcej' : 'Learn More'}
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground">
                {t('ourStory')}
              </h2>
              
              <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
                <p>
                  {t('storyPara1')}
                </p>
                
                <p>
                  {t('storyPara2')}
                </p>
                
                <p>
                  {t('storyPara3')}
                </p>
              </div>

              <div className="bg-card border border-border/40 rounded-lg p-8 shadow-elegant">
                <blockquote className="text-xl font-playfair italic text-foreground mb-4">
                  {t('philosophyQuote')}
                </blockquote>
                <cite className="text-sm text-muted-foreground">— {t('philosophyCite')}</cite>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                <strong>{t('legalDisclaimer')}</strong> {t('legalDisclaimerText')}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;