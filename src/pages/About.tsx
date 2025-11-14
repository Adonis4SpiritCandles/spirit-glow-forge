import { useState, useEffect } from 'react';
import { Flame, Leaf, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import candleWax from "@/assets/candle-wax.png";
import spiritLogo from "@/assets/spirit-logo.png";
import SEOManager from "@/components/SEO/SEOManager";
import { generateBreadcrumbStructuredData, getFullUrl, generateAlternateUrls } from "@/utils/seoUtils";
import { supabase } from "@/integrations/supabase/client";

const About = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase
          .from('about_settings')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .eq('is_active', true)
          .single();
        
        if (data) {
          setSettings(data);
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

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: getFullUrl('/', language) },
    { name: language === 'en' ? 'About Us' : 'O Nas', url: getFullUrl('/about', language) }
  ]);
  
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
  
  const heroImageUrl = settings?.hero_image_url || candleWax;
  
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
        description={language === 'en' 
          ? 'Learn about SPIRIT CANDLES - our story, values, and commitment to creating luxury soy candles inspired by iconic fragrances.'
          : 'Poznaj SPIRIT CANDLES - naszą historię, wartości i zaangażowanie w tworzenie luksusowych świec sojowych inspirowanych kultowymi zapachami.'}
        keywords={language === 'en'
          ? 'about spirit candles, candle brand story, luxury candle company, handcrafted candles'
          : 'o spirit candles, historia marki świec, luksusowa firma świec, ręcznie robione świece'}
        url={getFullUrl('/about', language)}
        structuredData={breadcrumbData}
        alternateUrls={generateAlternateUrls('/about')}
      />
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
              <div className="aspect-square bg-gradient-glow rounded-full p-8">
                <img 
                  src={heroImageUrl}
                  alt="Handcrafted SPIRIT CANDLE"
                  className="w-full h-full object-cover rounded-full candle-glow"
                />
              </div>
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