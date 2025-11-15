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
        ? 'Spedizione sicura, veloce ed affidabile!'
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
    <section ref={ref} className="py-16 md:py-18 lg:py-20 bg-gradient-to-b from-background to-background/50 relative overflow-hidden w-full">
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

      <div className="container mx-auto px-4 relative z-10 max-w-full overflow-x-hidden">
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
          <TooltipProvider>
            {badges.map((badge, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="flex flex-col items-center text-center p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer group"
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow"
                    >
                      <badge.icon className="w-8 h-8 text-primary drop-shadow-[0_0_8px_currentColor]" />
                    </motion.div>
                    <h3 className="font-semibold text-sm md:text-base text-foreground mb-1">
                      {badge.title}
                    </h3>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-xs bg-card/95 backdrop-blur-sm border-primary/20"
                >
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
