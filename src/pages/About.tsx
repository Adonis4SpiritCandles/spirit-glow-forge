import { useState, useEffect } from 'react';
import { Flame, Leaf, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import candleWax from "@/assets/candle-wax.png";
import spiritLogo from "@/assets/spirit-logo.png";
import { Parallax } from "react-parallax";
import SEOManager from "@/components/SEO/SEOManager";
import { 
  generateAboutPageStructuredData,
  generateBreadcrumbStructuredData,
  getFullUrl,
  generateAlternateUrls,
  truncateDescription
} from "@/utils/seoUtils";
import { supabase } from "@/integrations/supabase/client";

const About = () => {
  const { t, language } = useLanguage();
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
    return () => document.head.removeChild(style);
  }, []);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase
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

  return (
    <>
      <SEOManager
        title={language === 'en' ? 'About Us' : 'O Nas'}
        description={truncateDescription(heroIntro1 || heroIntro2 || (language === 'en' 
          ? 'Learn about SPIRIT CANDLES – our story, values, and commitment to creating luxury soy candles.'
          : 'Dowiedz się więcej o SPIRIT CANDLES – naszej historii, wartościach i zaangażowaniu w tworzenie luksusowych świec sojowych.'), 160)}
        keywords={keywords}
        type="website"
        image={heroImage || 'https://spirit-candle.com/spirit-logo.png'}
        imageAlt={language === 'en' ? 'About SPIRIT CANDLES' : 'O SPIRIT CANDLES'}
        url={aboutUrl}
        canonical={aboutUrl}
        structuredData={[aboutStructuredData, breadcrumbData]}
        alternateUrls={alternateUrls}
      />
      <main>
        {/* Hero Section */}
        <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
          {heroImageUrl ? (
            <Parallax
              blur={0}
              bgImage={heroImageUrl}
              bgImageAlt={heroTitle}
              strength={heroSettings?.parallaxStrength || 300}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
            </Parallax>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          )}
          
          <div className="relative z-10 container mx-auto px-4 lg:px-8 py-20 text-center">
            <h1 className={`text-4xl md:text-6xl font-playfair font-bold mb-6 title-luminescent ${heroSettings?.animationEnabled ? 'title-candle-flicker' : ''}`}>
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {heroIntro1}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {heroIntro2}
            </p>
            {settings?.hero_button_link && (
              <Link to={settings.hero_button_link}>
                <Button size="lg" className="mt-4">
                  {heroButtonText}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              {featuresSectionTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {featuresSectionDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                      {feature.link && (
                        <Link to={feature.link}>
                          <Button variant="link" className="mt-2 p-0 h-auto">
                            {language === 'en' ? 'Learn more' : 'Dowiedz się więcej'} →
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Brand Story Section */}
        <div className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
                  {language === 'en' ? 'Our Story' : 'Nasza Historia'}
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {language === 'en'
                    ? 'SPIRIT CANDLES was born from a passion for creating moments of tranquility and connection. Each candle is handcrafted with care, using only the finest natural soy wax and wooden wicks that create a soothing crackling sound.'
                    : 'SPIRIT CANDLES narodziło się z pasji do tworzenia chwil spokoju i połączenia. Każda świeca jest ręcznie robiona z troską, używając tylko najwyższej jakości naturalnego wosku sojowego i drewnianych knotów, które tworzą kojący trzaskający dźwięk.'}
                </p>
                <p className="text-lg text-muted-foreground">
                  {language === 'en'
                    ? 'We believe that every candle tells a story and brings warmth to your home. Our fragrances are inspired by iconic scents, carefully selected to evoke emotions and memories.'
                    : 'Wierzymy, że każda świeca opowiada historię i wnosi ciepło do Twojego domu. Nasze zapachy są inspirowane kultowymi aromatami, starannie wybrane, aby wywołać emocje i wspomnienia.'}
                </p>
              </div>
              <div className="flex justify-center">
                <img 
                  src={spiritLogo} 
                  alt="SPIRIT CANDLES Logo" 
                  className="w-64 h-64 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default About;