import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame } from "lucide-react";
import candleLit from "@/assets/candle-lit.png";
import candleUnlit from "@/assets/candle-unlit.png";
import spiritLogo from "@/assets/spirit-logo.png";

const HeroSection = () => {
  const [isLit, setIsLit] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Auto-start the lighting animation after 2 seconds
    const timer1 = setTimeout(() => {
      setIsLit(true);
    }, 2000);

    // Show logo after flame appears
    const timer2 = setTimeout(() => {
      setShowLogo(true);
    }, 3500);

    // Mark animation as complete
    const timer3 = setTimeout(() => {
      setAnimationComplete(true);
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const lightCandle = () => {
    if (!isLit) {
      setIsLit(true);
      setTimeout(() => setShowLogo(true), 1500);
      setTimeout(() => setAnimationComplete(true), 3000);
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-mystical overflow-hidden flex items-center justify-center">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        {/* Candle Animation Container */}
        <div className="relative mb-8 flex justify-center">
          {/* Hand with Match (appears when lighting) */}
          {isLit && (
            <div className="absolute right-0 top-1/2 transform translate-x-16 -translate-y-1/2 animate-slide-in-right">
              <div className="w-20 h-32 opacity-70">
                <div className="w-3 h-24 bg-amber-600 rounded-full mb-2 mx-auto" />
                <div className="w-6 h-6 bg-primary rounded-full mx-auto animate-flame-dance" />
              </div>
            </div>
          )}
          
          {/* Candle */}
          <div 
            className="relative cursor-pointer transition-transform hover:scale-105 duration-500"
            onClick={lightCandle}
          >
            <img 
              src={isLit ? candleLit : candleUnlit}
              alt={isLit ? "Lit SPIRIT CANDLE" : "Unlit SPIRIT CANDLE"}
              className="w-64 md:w-80 lg:w-96 h-auto transition-all duration-1000"
            />
            
            {/* Flame Effect */}
            {isLit && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-4">
                <Flame 
                  className="w-8 h-12 text-primary animate-candle-flicker" 
                  fill="currentColor"
                />
                <div className="absolute inset-0 w-8 h-12 bg-primary/30 rounded-full blur-md animate-glow-pulse" />
              </div>
            )}
            
            {/* Glow Effect */}
            {isLit && (
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-glow-pulse" />
            )}
          </div>
        </div>

        {/* Logo Reveal */}
        <div className={`transition-all duration-1000 ${showLogo ? 'opacity-100 scale-100 animate-fade-in-up' : 'opacity-0 scale-90'}`}>
          <img 
            src={spiritLogo}
            alt="SPIRIT CANDLES - Reborn Your Nature"
            className="w-80 md:w-96 lg:w-[500px] h-auto mx-auto mb-6 candle-glow"
          />
        </div>

        {/* Hero Text */}
        <div className={`transition-all duration-1000 delay-300 ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-lg md:text-xl lg:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover our luxury collection of soy candles inspired by iconic fragrances. 
            Handcrafted with natural ingredients and wooden wicks for an elevated sensory experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-4 shadow-luxury hover:scale-105 transition-all duration-300"
            >
              Shop Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary/30 text-foreground hover:bg-primary/10 px-8 py-4 hover:scale-105 transition-all duration-300"
            >
              Discover Our Story
            </Button>
          </div>
        </div>

        {/* Ambient Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Call to Action Hint */}
        {!isLit && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <p className="text-sm text-foreground/60">Click the candle to begin your journey</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;