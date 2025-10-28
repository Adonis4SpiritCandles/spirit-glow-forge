import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Flower2, Heart, TreePine } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const ScentJourney = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const lineRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const phases = [
    {
      icon: Flower2,
      title: language === 'pl' ? 'Nuty Głowy' : 'Top Notes',
      subtitle: language === 'pl' ? 'Pierwsze Wrażenie' : 'First Impression',
      description: language === 'pl' 
        ? 'Świeże i żywe nuty powitają Cię pierwszym zapachem - cytrusy, zioła, delikatne kwiaty.'
        : 'Fresh and vibrant notes greet you first - citrus, herbs, delicate florals.',
      duration: '0-15 min',
      gradient: 'from-cyan-500/20 to-blue-500/20',
      iconColor: 'text-cyan-400',
    },
    {
      icon: Heart,
      title: language === 'pl' ? 'Nuty Serca' : 'Heart Notes',
      subtitle: language === 'pl' ? 'Esencja Duszy' : 'The Soul',
      description: language === 'pl'
        ? 'Bogaty i pełny charakter - róże, jaśmin, przyprawy tworzą głęboki, uwodzicielski aromat.'
        : 'Rich and full-bodied character - roses, jasmine, spices create a deep, seductive aroma.',
      duration: '15-60 min',
      gradient: 'from-pink-500/20 to-rose-500/20',
      iconColor: 'text-rose-400',
    },
    {
      icon: TreePine,
      title: language === 'pl' ? 'Nuty Bazy' : 'Base Notes',
      subtitle: language === 'pl' ? 'Trwałe Wspomnienie' : 'Lasting Memory',
      description: language === 'pl'
        ? 'Głębokie i ziemiste akordy pozostają najdłużej - drzewo sandałowe, piżmo, wanilia.'
        : 'Deep and earthy accords linger longest - sandalwood, musk, vanilla.',
      duration: '60+ min',
      gradient: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  useEffect(() => {
    if (!inView || !lineRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: lineRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
      },
    });

    tl.fromTo(
      lineRef.current,
      { height: "0%" },
      { height: "100%", ease: "none" }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [inView]);

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-background via-background/50 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {language === 'pl' ? 'Podróż Zapachowa' : 'The Scent Journey'}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {language === 'pl' 
              ? 'Odkryj trzy fazy aromatycznej podróży naszych świec - od pierwszego zapalenia do ostatniej chwili'
              : 'Discover the three phases of our candles\' aromatic journey - from first light to final moment'}
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Animated connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-accent/20 to-primary/20 -translate-x-1/2 hidden md:block">
            <div
              ref={lineRef}
              className="w-full bg-gradient-to-b from-primary via-accent to-primary"
              style={{ height: "0%" }}
            />
          </div>

          {/* Phases */}
          <div className="space-y-16 md:space-y-24">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 * index }}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className={`inline-block bg-gradient-to-r ${phase.gradient} backdrop-blur-sm px-6 py-8 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10`}>
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
                      {phase.title}
                    </h3>
                    <p className="text-primary font-semibold mb-3">{phase.subtitle}</p>
                    <p className="text-muted-foreground mb-4 max-w-md">{phase.description}</p>
                    <span className="text-sm text-accent font-medium">{phase.duration}</span>
                  </div>
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative z-10"
                >
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${phase.gradient} backdrop-blur-sm border-2 border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20`}>
                    <phase.icon className={`w-10 h-10 md:w-12 md:h-12 ${phase.iconColor} drop-shadow-[0_0_10px_currentColor]`} />
                  </div>
                </motion.div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScentJourney;
