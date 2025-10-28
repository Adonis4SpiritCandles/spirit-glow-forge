import { Flame, Leaf, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import candleWax from "@/assets/candle-wax.png";
import spiritLogo from "@/assets/spirit-logo.png";

const About = () => {
  const { t } = useLanguage();
  
  const features = [
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
      icon: <Heart className="w-6 h-6 text-primary" />,
      title: t('feature6Title'),
      description: t('feature6Desc')
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-mystical">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-foreground leading-tight">
                {t('rebornYourNature')}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('aboutIntro1')}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('aboutIntro2')}
              </p>
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-luxury hover:scale-105 transition-all duration-300"
              >
                {t('discoverOurCollection')}
              </Button>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-glow rounded-full p-8">
                <img 
                  src={candleWax}
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
              {t('whyChooseSpiritCandles')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('whyChooseDesc')}
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
  );
};

export default About;