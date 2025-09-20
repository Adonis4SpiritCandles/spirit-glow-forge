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
      title: t('naturalSoyWax'),
      description: t('naturalSoyWaxDesc')
    },
    {
      icon: <Flame className="w-6 h-6 text-primary" />,
      title: t('woodenWicks'),
      description: t('woodenWicksDesc')
    },
    {
      icon: <Heart className="w-6 h-6 text-primary" />,
      title: t('handPouredWithLove'),
      description: t('handPouredDesc')
    },
    {
      icon: <Award className="w-6 h-6 text-primary" />,
      title: t('luxuryFragrances'),
      description: t('luxuryFragrancesDesc')
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
                At SPIRIT CANDLES, we believe that fragrance has the power to transform not just spaces, 
                but souls. Our luxury soy candles are more than just beautiful objects—they're portals 
                to memories, emotions, and deeper connections with yourself and your environment.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Each candle is inspired by iconic fragrances and handcrafted with the finest natural 
                ingredients, creating an elevated sensory experience that awakens your inner spirit.
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
              Every aspect of our candles is designed with intention, from the sustainable 
              materials we use to the mystical fragrances that inspire transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                SPIRIT CANDLES was born from a simple yet profound belief: that the right fragrance 
                can unlock the deepest parts of our being. Our founder, inspired by the transformative 
                power of scent, embarked on a journey to create candles that would not just fill rooms 
                with beautiful aromas, but awaken the spirit within.
              </p>
              
              <p>
                Drawing inspiration from the world's most iconic fragrances, we carefully craft each 
                candle using traditional techniques and modern innovation. Our soy wax base ensures 
                a clean burn, while our wooden wicks provide the gentle crackling sound of a cozy 
                fireplace, creating an atmosphere of warmth and tranquility.
              </p>
              
              <p>
                Every SPIRIT CANDLE is a invitation to pause, breathe deeply, and reconnect with 
                your inner nature. Whether you're seeking motivation, relaxation, or simply a moment 
                of beauty in your day, our candles are designed to be your companion on the journey 
                of self-discovery.
              </p>
            </div>

            <div className="bg-card border border-border/40 rounded-lg p-8 shadow-elegant">
              <blockquote className="text-xl font-playfair italic text-foreground mb-4">
                "Light a candle, ignite your spirit, and let your true nature emerge."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— SPIRIT CANDLES Philosophy</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              <strong>{t('legalDisclaimer')}</strong> Our candles are inspired by popular fragrances for descriptive purposes only. 
              We are not affiliated with any original fragrance manufacturers. All trademarks belong to their respective owners.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;