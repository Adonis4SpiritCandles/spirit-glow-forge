import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import spiritLogo from "@/assets/spirit-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { gsap } from "gsap";

const HeroSection = () => {
  const [logoGlow, setLogoGlow] = useState(false);
  const { t, language } = useLanguage();
  const [sectionActive, setSectionActive] = useState<boolean>(true);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const animationTriggered = useRef(false);

  useEffect(() => {
    // Simple logo glow effect
    setTimeout(() => setLogoGlow(true), 600);
    loadSectionToggle();
  }, []);

  // GSAP Animation with IntersectionObserver
  useEffect(() => {
    if (!textContainerRef.current || !h1Ref.current || !h2Ref.current || animationTriggered.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animationTriggered.current) {
            animationTriggered.current = true;
            
            // Wait longer for more dramatic delay before animation starts
            setTimeout(() => {
              if (!h1Ref.current || !h2Ref.current) return;
              
              // Animate H1 existing spans
              const h1Spans = Array.from(h1Ref.current.querySelectorAll('span'));
              
              h1Spans.forEach((originalSpan, index) => {
                // Set initial state - much more dramatic for maximum visibility
                gsap.set(originalSpan, {
                  opacity: 0,
                  rotationX: 270,
                  scale: 0.5,
                  transformOrigin: '50% 50%',
                  y: 60,
                  x: index % 2 === 0 ? -30 : 30
                });
                
                // Animate each word with rotate-in effect - very visible and dramatic
                gsap.to(originalSpan, {
                  opacity: 1,
                  rotationX: 0,
                  scale: 1,
                  y: 0,
                  x: 0,
                  duration: 1.8,
                  delay: 0.5 + (index * 0.3),
                  ease: 'elastic.out(1, 0.5)',
                  onComplete: () => {
                    if (index === h1Spans.length - 1) {
                      // Wait a bit before starting floating
                      setTimeout(() => {
                        startFloatingAnimation(h1Ref.current!);
                      }, 300);
                    }
                  }
                });
              });
              
              // Wrap H2 text for animation
              const h2Text = h2Ref.current.textContent || '';
              h2Ref.current.innerHTML = '';
              
              const h2Wrapper = document.createElement('span');
              h2Wrapper.textContent = h2Text;
              h2Wrapper.style.display = 'inline-block';
              h2Ref.current.appendChild(h2Wrapper);
              
              // Set initial state for H2 - very dramatic
              gsap.set(h2Wrapper, {
                opacity: 0,
                rotationX: 270,
                scale: 0.5,
                transformOrigin: '50% 50%',
                y: 60,
                x: 20
              });
              
              // Animate H2 - very visible and dramatic
              gsap.to(h2Wrapper, {
                opacity: 1,
                rotationX: 0,
                scale: 1,
                y: 0,
                x: 0,
                duration: 1.8,
                delay: 0.5 + (h1Spans.length * 0.3) + 0.5,
                ease: 'elastic.out(1, 0.5)',
                onComplete: () => {
                  // Wait a bit before starting floating
                  setTimeout(() => {
                    startFloatingAnimation(h2Ref.current!);
                  }, 300);
                }
              });
            }, 800);
          }
        });
      },
      { threshold: 0.2, triggerOnce: true }
    );

    observer.observe(textContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Floating animation loop - fast, smooth and fluid using GSAP timeline
  const startFloatingAnimation = (element: HTMLElement) => {
    // Kill any existing animations on this element to avoid conflicts
    gsap.killTweensOf(element);
    
    // Create smooth, fast, continuous floating motion using timeline
    const tl = gsap.timeline({ repeat: -1 });
    
    // Smooth elliptical floating motion - fast and fluid
    tl.to(element, {
      y: -8,
      x: 5,
      duration: 1.2,
      ease: 'sine.inOut'
    })
    .to(element, {
      y: 0,
      x: -5,
      duration: 1.2,
      ease: 'sine.inOut'
    })
    .to(element, {
      y: 8,
      x: 0,
      duration: 1.2,
      ease: 'sine.inOut'
    })
    .to(element, {
      y: 0,
      x: 0,
      duration: 1.2,
      ease: 'sine.inOut'
    });
  };

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
            <div className="mb-6" style={{ willChange: 'transform', isolation: 'isolate' }}>
              <img 
                src={spiritLogo} 
                alt="SPIRIT CANDLES" 
                className={`h-48 md:h-64 mx-auto logo-aura transition-all duration-1500 ${logoGlow ? 'candle-glow scale-105 drop-shadow-[0_0_35px_rgba(255,255,255,0.8)]' : 'scale-100'}`}
                style={{ willChange: 'transform, filter' }}
              />
            </div>
            
            {/* H1 and H2 Text */}
            <div ref={textContainerRef} className="mb-8">
              <h1 
                ref={h1Ref}
                className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold text-foreground mb-4"
                style={{ perspective: '1000px' }}
              >
                <span className="block">SPIRIT</span>
                <span className="block text-primary">CANDLE</span>
              </h1>
              
              <h2 
                ref={h2Ref}
                className="text-xl md:text-2xl text-muted-foreground mb-6 italic"
              >
                {language === 'pl' ? 'Odnów swoją naturę' : 'Reborn your nature'}
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