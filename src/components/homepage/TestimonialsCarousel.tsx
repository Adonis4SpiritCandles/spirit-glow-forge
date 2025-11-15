import { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination, Navigation, EffectCoverflow } from "swiper/modules";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  location: string;
  product?: string;
}

const TestimonialsCarousel = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { t } = useLanguage();
  const [sectionActive, setSectionActive] = useState<boolean>(true);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    loadSectionToggle();
    loadTestimonials();
  }, []);

  // Force autoplay on desktop - periodic check
  useEffect(() => {
    if (!swiperRef.current) return;
    
    const checkAutoplay = () => {
      if (window.innerWidth >= 768 && swiperRef.current?.autoplay && !swiperRef.current.autoplay.running) {
        swiperRef.current.autoplay.start();
      }
    };

    // Check immediately
    checkAutoplay();

    // Check periodically (every 5 seconds)
    const interval = setInterval(checkAutoplay, 5000);

    // Check on window resize
    window.addEventListener('resize', checkAutoplay);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkAutoplay);
    };
  }, [testimonials]);

  const loadSectionToggle = async () => {
    try {
      const { data } = await supabase
        .from('homepage_sections_toggle')
        .select('testimonials_section_active')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      if (data) {
        setSectionActive(data.testimonials_section_active ?? true);
      }
    } catch (error) {
      console.error('Error loading section toggle:', error);
    }
  };

  const loadTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setTestimonials(data);
    }
  };

  if (!sectionActive || testimonials.length === 0) return null;

  return (
    <section ref={ref} className="py-6 md:py-10 lg:py-12 bg-background/50 overflow-x-hidden md:overflow-visible">
      <style>{`
        /* Mobile: overflow hidden per prevenire overflow orizzontale */
        @media (max-width: 767px) {
          .testimonials-swiper {
            overflow: hidden !important;
            padding-top: 20px !important;
            max-width: 100vw !important;
          }
          .testimonials-swiper .swiper-wrapper {
            overflow: hidden !important;
            padding-top: 20px !important;
          }
          .testimonials-swiper .swiper-slide {
            overflow: hidden !important;
            height: auto !important;
            max-width: 100% !important;
          }
        }
        /* Desktop: overflow visible per effetti coverflow */
        @media (min-width: 768px) {
          .testimonials-swiper {
            overflow: visible !important;
            padding-top: 20px !important;
          }
          .testimonials-swiper .swiper-wrapper {
            overflow: visible !important;
            padding-top: 20px !important;
          }
          .testimonials-swiper .swiper-slide {
            overflow: visible !important;
            height: auto !important;
          }
        }
        .testimonials-swiper .swiper-pagination-bullet {
          background-color: hsl(var(--primary)) !important;
          opacity: 0.5;
          width: 8px !important;
          height: 8px !important;
        }
        .testimonials-swiper .swiper-pagination-bullet-active {
          background-color: hsl(var(--primary)) !important;
          opacity: 1;
          width: 24px !important;
        }
        /* Fluorescenza gialla sulla card attiva in mobile - border-radius aware */
        @media (max-width: 767px) {
          .testimonials-swiper .swiper-slide-active .testimonial-card {
            box-shadow: 
              0 0 20px hsl(var(--primary) / 0.4),
              0 0 40px hsl(var(--primary) / 0.25),
              0 0 60px hsl(var(--primary) / 0.15),
              inset 0 0 20px hsl(var(--primary) / 0.1) !important;
            border-color: hsl(var(--primary) / 0.8) !important;
            border-radius: 0.5rem !important;
          }
        }
        /* Fluorescenza su hover desktop - attiva su tutta la card */
        @media (min-width: 768px) {
          .testimonials-swiper .testimonial-card {
            transition: all 0.3s ease !important;
            border-radius: 0.5rem !important;
            overflow: hidden !important;
            position: relative !important;
            pointer-events: auto !important;
          }
          .testimonials-swiper .testimonial-card > * {
            pointer-events: none !important;
          }
          .testimonials-swiper .testimonial-card:hover {
            box-shadow: 
              0 0 25px hsl(var(--primary) / 0.35),
              0 0 50px hsl(var(--primary) / 0.2),
              0 0 75px hsl(var(--primary) / 0.1),
              inset 0 0 15px hsl(var(--primary) / 0.05) !important;
            transform: scale(1.02) translateY(-5px) !important;
            border-radius: 0.5rem !important;
            z-index: 10 !important;
          }
          .testimonials-swiper .testimonial-card:hover::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 0.5rem;
            padding: 2px;
            background: linear-gradient(45deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3));
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: -1;
          }
        }
        /* Fix angoli card - rimuovi qualsiasi border-radius conflittuale */
        .testimonials-swiper .swiper-slide {
          border-radius: 0.5rem !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        .testimonials-swiper .swiper-slide .testimonial-card {
          border-radius: 0.5rem !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        /* Mobile: assicura che le slide rispettino il viewport */
        @media (max-width: 767px) {
          .testimonials-swiper .swiper-slide {
            width: calc(100vw - 1rem) !important;
            max-width: calc(100vw - 1rem) !important;
            margin: 0 !important;
          }
          .testimonials-swiper .swiper-wrapper {
            width: 100% !important;
            max-width: 100vw !important;
          }
        }
      `}</style>
      <div className="container mx-auto px-2 md:px-4 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t('customerReviews') || 'What Our Customers Say'}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('customerReviewsSubtitle') || 'Join thousands of satisfied customers who have transformed their spaces'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative pt-12 md:pt-16 px-1 md:px-4 overflow-x-hidden md:overflow-visible max-w-full"
        >
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
            spaceBetween={10}
            slidesPerView={1}
            loop={true}
            autoplay={{ 
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              stopOnLastSlide: false,
            }}
            pagination={{ 
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 3
            }}
            navigation={{
              nextEl: '.swiper-button-next-testimonials',
              prevEl: '.swiper-button-prev-testimonials',
              enabled: true,
            }}
            effect="coverflow"
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            breakpoints={{
              640: { 
                slidesPerView: 1,
                spaceBetween: 15,
                effect: 'slide',
                autoplay: { 
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              },
              768: { 
                slidesPerView: 2,
                spaceBetween: 20,
                effect: 'coverflow',
                autoplay: { 
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              },
              1024: { 
                slidesPerView: 3,
                spaceBetween: 30,
                effect: 'coverflow',
                autoplay: { 
                  delay: 6500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              },
            }}
            className="testimonials-swiper pb-12 md:pb-16"
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              // Force autoplay start on desktop
              setTimeout(() => {
                if (window.innerWidth >= 768 && swiper.autoplay && !swiper.autoplay.running) {
                  try {
                    swiper.autoplay.start();
                  } catch (error) {
                    console.error('Error starting autoplay:', error);
                  }
                }
              }, 200);
            }}
            onSlideChange={(swiper) => {
              // Ensure autoplay continues after navigation
              if (window.innerWidth >= 768 && swiper.autoplay && !swiper.autoplay.running) {
                try {
                  swiper.autoplay.start();
                } catch (error) {
                  console.error('Error restarting autoplay:', error);
                }
              }
            }}
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={testimonial.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.1 * index,
                    ease: "easeOut"
                  }}
                  className="testimonial-card bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50 hover:border-primary/50 h-full flex flex-col cursor-pointer relative w-full max-w-full"
                  style={{ 
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={inView ? { scale: 1 } : {}}
                        transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-muted-foreground flex-1 mb-3">"{testimonial.comment}"</p>

                  {testimonial.product && (
                    <p className="text-sm text-primary/70 font-medium">
                      {t('purchasedProduct') || 'Purchased'}: {testimonial.product}
                    </p>
                  )}
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Custom Navigation Buttons */}
          <button 
            className="swiper-button-prev-testimonials absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-20 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 hidden md:flex items-center justify-center w-10 h-10 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (swiperRef.current) {
                try {
                  swiperRef.current.slidePrev();
                  // Ensure autoplay continues after manual navigation
                  if (swiperRef.current.autoplay && !swiperRef.current.autoplay.running) {
                    setTimeout(() => {
                      swiperRef.current?.autoplay?.start();
                    }, 100);
                  }
                } catch (error) {
                  console.error('Error navigating previous:', error);
                }
              }
            }}
            aria-label="Previous testimonial"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            className="swiper-button-next-testimonials absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-20 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 hidden md:flex items-center justify-center w-10 h-10 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (swiperRef.current) {
                try {
                  swiperRef.current.slideNext();
                  // Ensure autoplay continues after manual navigation
                  if (swiperRef.current.autoplay && !swiperRef.current.autoplay.running) {
                    setTimeout(() => {
                      swiperRef.current?.autoplay?.start();
                    }, 100);
                  }
                } catch (error) {
                  console.error('Error navigating next:', error);
                }
              }
            }}
            aria-label="Next testimonial"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
