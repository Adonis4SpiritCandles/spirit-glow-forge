import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Leaf, Flame, Hand, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TrustBadges = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { language } = useLanguage();
  const [sectionActive, setSectionActive] = useState<boolean>(true);

  useEffect(() => {
    loadSectionToggle();
  }, []);

  const loadSectionToggle = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_sections_toggle')
        .select('features_section_active')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      if (error) {
        // If error (e.g., no row found), default to true
        console.warn('Error loading features section toggle:', error);
        setSectionActive(true);
        return;
      }
      
      if (data) {
        setSectionActive(data.features_section_active ?? true);
      } else {
        // No data found, default to true
        setSectionActive(true);
      }
    } catch (error) {
      console.error('Error loading section toggle:', error);
      // Default to true if error (section will show)
      setSectionActive(true);
    }
  };

  if (!sectionActive) return null;

  const badges = [
    {
      icon: Leaf,
      title: language === 'pl' ? 'Ekologiczne' : 'Eco-Friendly',
      description: language === 'pl'
        ? '100% naturalne składniki, biodegradowalne opakowania'
        : '100% natural ingredients, biodegradable packaging',
    },
    {
      icon: Flame,
      title: language === 'pl' ? '100% Wosk Sojowy' : '100% Soy Wax',
      description: language === 'pl'
        ? 'Czysty, wolno palący się wosk sojowy bez toksyn'
        : 'Pure, slow-burning soy wax without toxins',
    },
    {
      icon: Hand,
      title: language === 'pl' ? 'Ręcznie Robione' : 'Hand-Poured',
      description: language === 'pl'
        ? 'Każda świeca jest starannie robiona ręcznie'
        : 'Each candle is carefully hand-poured with love',
    },
    {
      icon: Truck,
      title: language === 'pl' ? 'Wysyłka' : 'Shipping',
      description: language === 'pl'
        ? 'Bezpieczna, szybka i niezawodna wysyłka!'
        : 'Safe, fast, and reliable shipping!',
    },
    {
      icon: RotateCcw,
      title: language === 'pl' ? '30 Dni Zwrotu' : '30-Day Returns',
      description: language === 'pl'
        ? 'Łatwe zwroty w ciągu 30 dni bez pytań'
        : 'Easy returns within 30 days, no questions asked',
    },
    {
      icon: ShieldCheck,
      title: language === 'pl' ? 'Bezpieczna Płatność' : 'Secure Payment',
      description: language === 'pl'
        ? 'Szyfrowane płatności za pomocą SSL'
        : 'Encrypted payments with SSL security',
    },
  ];

  return (
    <section ref={ref} className="py-16 md:py-18 lg:py-20 pb-24 md:pb-28 lg:pb-32 bg-gradient-to-b from-background to-background/50 relative w-full overflow-x-hidden overflow-y-visible">
      <style>{`
        .features-section {
          padding-top: 40px !important;
          padding-bottom: 40px !important;
        }
        .features-section .glow-bg {
          opacity: 0.12 !important;
        }
        .features-section .glow-bg > div {
          filter: blur(2.5rem) !important;
        }
        /* Prevent horizontal overflow from glow circles */
        .features-section {
          max-width: 100vw;
          overflow-x: hidden;
        }
        @media (max-width: 1023px) {
          .features-section .glow-bg > div {
            width: 200px !important;
            height: 200px !important;
          }
        }
        /* Trust badges container - allow space for hover animations and tooltips */
        .trust-badges-grid-container {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          overflow-y: visible;
          position: relative;
          /* Add perspective for 3D transforms */
          perspective: 1000px;
          /* Extra padding for hover animations and tooltips - vertical and horizontal */
          /* Increased bottom padding to ensure tooltips are fully visible */
          /* Increased horizontal padding to prevent tooltip clipping at edges */
          padding: 15px 20px 100px 20px;
          /* Ensure container doesn't clip transformed children */
          isolation: isolate;
        }
        /* Trust badge card wrapper - prevent clipping during hover, allow tooltip space */
        .trust-badge-card-wrapper {
          width: 100%;
          height: 100%;
          /* Allow overflow for hover animations and tooltips */
          overflow: visible;
          /* Add padding to prevent clipping - enough for scale 1.05 + rotate 2deg */
          padding: 6px;
          /* Ensure cards can transform without being clipped */
          transform-style: preserve-3d;
          /* Prevent wrapper from creating overflow */
          box-sizing: border-box;
          /* Add margin bottom for tooltip space - increased to ensure tooltip is visible */
          margin-bottom: 70px;
        }
        /* Trust badge card - ensure no clipping, improved centering */
        .trust-badge-card {
          width: 100%;
          height: 100%;
          /* Ensure card can be transformed without clipping */
          transform-origin: center center;
          will-change: transform;
          /* Improved min-height to fit content better */
          min-height: 160px;
          /* Ensure card respects wrapper bounds during transform */
          box-sizing: border-box;
          /* Prevent card from creating overflow itself */
          margin: 0;
          /* Improve centering of content */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        /* Ensure grid doesn't cause horizontal overflow */
        .trust-badges-grid {
          width: 100%;
          max-width: 100%;
          /* Ensure grid respects container padding */
          box-sizing: border-box;
        }
        /* Icon container - responsive sizes */
        .icon-container {
          width: 64px;
          height: 64px;
        }
        .icon-inner {
          width: 32px;
          height: 32px;
        }
        @media (min-width: 641px) {
          .icon-container {
            width: 72px;
            height: 72px;
          }
          .icon-inner {
            width: 36px;
            height: 36px;
          }
        }
        @media (min-width: 1025px) {
          .icon-container {
            width: 80px;
            height: 80px;
          }
          .icon-inner {
            width: 40px;
            height: 40px;
          }
        }
        @media (max-width: 640px) {
          .trust-badges-grid {
            gap: 0.75rem !important;
          }
          .trust-badge-card-wrapper {
            padding: 5px;
            margin-bottom: 65px;
          }
          .trust-badge-card {
            min-height: 130px;
            padding: 1rem !important;
            gap: 0.5rem;
          }
          .icon-container {
            width: 56px !important;
            height: 56px !important;
          }
          .icon-inner {
            width: 28px !important;
            height: 28px !important;
          }
          .trust-badges-grid-container {
            padding: 12px 16px 85px 16px;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .trust-badge-card-wrapper {
            padding: 6px;
            margin-bottom: 68px;
          }
          .trust-badge-card {
            min-height: 145px;
            gap: 0.625rem;
            padding: 1.25rem !important;
          }
          .trust-badges-grid-container {
            padding: 15px 18px 90px 18px;
          }
        }
        @media (min-width: 1025px) {
          .trust-badge-card {
            min-height: 160px;
            gap: 0.75rem;
            padding: 1.5rem !important;
          }
        }
      `}</style>
      {/* Parallax background decoration - reduced intensity, clipped to prevent overflow */}
      <motion.div
        style={{
          transform: inView ? 'translateY(0)' : 'translateY(50px)',
          clipPath: 'inset(0)'
        }}
        transition={{ duration: 1 }}
        className="absolute inset-0 glow-bg pointer-events-none overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/3 w-64 md:w-80 lg:w-96 h-64 md:h-80 lg:h-96 bg-primary/25 rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 bg-accent/25 rounded-full" />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10 max-w-full overflow-x-hidden overflow-y-visible">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {language === 'pl' ? 'Dlaczego Spirit Candles?' : 'Why Spirit Candles?'}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {language === 'pl'
              ? 'Jakość i zaufanie, które sprawiają, że jesteśmy wyjątkowi'
              : 'Quality and trust that make us special'}
          </p>
        </motion.div>

        <div className="trust-badges-grid-container">
          <div className="trust-badges-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
            <TooltipProvider>
              {badges.map((badge, index) => {
                // Determine tooltip alignment based on card position
                // First card: align start (to prevent left clipping)
                // Last card: align end (to prevent right clipping)
                // Middle cards: align center
                const isFirstCard = index === 0;
                const isLastCard = index === badges.length - 1;
                const align = isFirstCard ? 'start' : isLastCard ? 'end' : 'center';
                
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div className="trust-badge-card-wrapper">
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={inView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.6, delay: 0.1 * index }}
                          whileHover={{ scale: 1.05, rotate: 2 }}
                          className="trust-badge-card bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer group"
                        >
                          <motion.div
                            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className="icon-container bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow flex-shrink-0"
                          >
                            <badge.icon className="icon-inner text-primary drop-shadow-[0_0_8px_currentColor]" />
                          </motion.div>
                          <h3 className="font-semibold text-sm md:text-base text-foreground leading-tight text-center px-2">
                            {badge.title}
                          </h3>
                        </motion.div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align={align}
                      className="max-w-xs bg-card/95 backdrop-blur-sm border-primary/20 z-50"
                      sideOffset={8}
                    >
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{badge.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
