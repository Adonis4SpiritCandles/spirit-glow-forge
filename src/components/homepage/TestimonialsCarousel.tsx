import { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination, Navigation, EffectCoverflow } from "swiper/modules";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
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
  const [navigationSettings, setNavigationSettings] = useState({
    mobile: false,
    tablet: false,
    desktop: true,
  });
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    loadSectionToggle();
    loadTestimonials();
  }, []);

  // Force autoplay on desktop - periodic check (only if testimonials.length > 3)
  useEffect(() => {
    if (!swiperRef.current) return;
    
    const checkAutoplay = () => {
      const isDesktop = window.innerWidth >= 1024;
      const shouldAutoplay = isDesktop && testimonials.length > 3;
      
      if (shouldAutoplay && swiperRef.current?.autoplay && !swiperRef.current.autoplay.running) {
        swiperRef.current.autoplay.start();
      } else if (!shouldAutoplay && swiperRef.current?.autoplay && swiperRef.current.autoplay.running) {
        swiperRef.current.autoplay.stop();
      }
    };

    checkAutoplay();
    const interval = setInterval(checkAutoplay, 5000);
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
        .select('testimonials_section_active, testimonials_navigation_enabled_mobile, testimonials_navigation_enabled_tablet, testimonials_navigation_enabled_desktop')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      if (data) {
        setSectionActive(data.testimonials_section_active ?? true);
        setNavigationSettings({
          mobile: data.testimonials_navigation_enabled_mobile ?? false,
          tablet: data.testimonials_navigation_enabled_tablet ?? false,
          desktop: data.testimonials_navigation_enabled_desktop ?? true,
        });
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

  // Determine device type and whether to show navigation
  const getShouldShowNavigation = () => {
    if (windowWidth === 0) return false; // SSR safe
    
    if (windowWidth < 768) {
      return navigationSettings.mobile;
    } else if (windowWidth >= 768 && windowWidth < 1024) {
      return navigationSettings.tablet;
    } else {
      // Desktop: show only if enabled AND testimonials.length > 3
      return navigationSettings.desktop && testimonials.length > 3;
    }
  };

  const shouldShowNavigation = getShouldShowNavigation();
  const shouldAutoplayDesktop = testimonials.length > 3;
  const isDesktop = windowWidth >= 1024;

  return (
    <section ref={ref} className="py-6 md:py-10 lg:py-12 bg-background/50 w-full overflow-hidden">
      <style>{`
        /* Prevent horizontal overflow on all devices */
        .testimonials-carousel-container {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          position: relative;
          /* Extra padding to prevent glow clipping */
          padding: 15px 0 30px 0;
        }
        .testimonials-swiper {
          width: 100%;
          max-width: 100%;
          padding-top: 20px;
          padding-bottom: 40px;
          position: relative;
        }
        /* Container for pagination area glow on mobile */
        .testimonials-swiper::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 40px;
          background: radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.1) 40%, transparent 70%);
          filter: blur(20px);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        @media (min-width: 768px) {
          .testimonials-swiper::after {
            display: none;
          }
        }
        .testimonials-swiper .swiper-wrapper {
          width: 100%;
          max-width: 100%;
        }
        .testimonials-swiper .swiper-slide {
          width: auto;
          height: auto;
        }
        .testimonials-swiper .swiper-slide .testimonial-card {
          width: 100%;
          height: 100%;
        }
        /* Pagination styling */
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
        /* Mobile glow effect - using pseudo-element for border-radius aware glow */
        @media (max-width: 767px) {
          .testimonials-swiper .swiper-slide-active .testimonial-card {
            position: relative;
            border-color: hsl(var(--primary) / 0.8) !important;
            /* Ensure card has proper z-index for glow */
            z-index: 1;
          }
          .testimonials-swiper .swiper-slide-active .testimonial-card::before {
            content: '';
            position: absolute;
            inset: -12px;
            border-radius: inherit;
            background: radial-gradient(circle at center, hsl(var(--primary) / 0.35) 0%, hsl(var(--primary) / 0.25) 30%, hsl(var(--primary) / 0.12) 50%, transparent 70%);
            filter: blur(18px);
            z-index: -1;
            pointer-events: none;
            /* Ensure glow extends beyond card */
            overflow: visible;
          }
          .testimonials-swiper .swiper-slide-active .testimonial-card::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            box-shadow: inset 0 0 15px hsl(var(--primary) / 0.08);
            pointer-events: none;
            z-index: 0;
          }
          /* Prevent glow clipping by parent containers */
          .testimonials-carousel-container,
          .testimonials-swiper,
          .testimonials-swiper .swiper-wrapper {
            overflow: visible;
          }
          .testimonials-swiper .swiper-slide {
            overflow: visible;
          }
        }
        /* Desktop/Tablet hover effect - using pseudo-element for border-radius aware glow */
        @media (min-width: 768px) {
          .testimonials-swiper .testimonial-card {
            transition: all 0.3s ease;
            position: relative;
            cursor: pointer;
          }
          /* Ensure entire card area is hoverable */
          .testimonials-swiper .testimonial-card:hover {
            transform: scale(1.02) translateY(-5px) !important;
            z-index: 10 !important;
            border-color: hsl(var(--primary) / 0.6) !important;
          }
          .testimonials-swiper .testimonial-card:hover::before {
            content: '';
            position: absolute;
            inset: -18px;
            border-radius: inherit;
            background: radial-gradient(ellipse at center, hsl(var(--primary) / 0.3) 0%, hsl(var(--primary) / 0.18) 30%, hsl(var(--primary) / 0.08) 50%, transparent 70%);
            filter: blur(22px);
            z-index: -1;
            pointer-events: none;
            /* Ensure glow extends beyond card */
            overflow: visible;
          }
          .testimonials-swiper .testimonial-card:hover::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            box-shadow: inset 0 0 12px hsl(var(--primary) / 0.04);
            pointer-events: none;
            z-index: 0;
          }
          /* Prevent glow clipping by parent containers on desktop/tablet */
          .testimonials-carousel-container,
          .testimonials-swiper,
          .testimonials-swiper .swiper-wrapper {
            overflow: visible;
          }
          .testimonials-swiper .swiper-slide {
            overflow: visible;
          }
        }
        /* Ensure cards don't overflow on mobile */
        @media (max-width: 767px) {
          .testimonials-swiper .swiper-slide {
            padding: 0 0.5rem;
          }
          .testimonials-swiper .swiper-slide .testimonial-card {
            max-width: calc(100vw - 2rem);
            margin: 0 auto;
          }
        }
      `}</style>
      
      <div className="container mx-auto px-4">
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

        <div className="testimonials-carousel-container relative overflow-visible">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
            spaceBetween={20}
            slidesPerView={1}
            loop={true}
            autoplay={shouldAutoplayDesktop && isDesktop ? { 
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              stopOnLastSlide: false,
            } : false}
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
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 16,
                effect: 'slide',
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
                effect: 'coverflow',
                coverflowEffect: {
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 1,
                  slideShadows: true,
                },
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
                effect: 'coverflow',
                coverflowEffect: {
                  rotate: 0,
                  stretch: 0,
                  depth: 150,
                  modifier: 1,
                  slideShadows: true,
                },
              },
            }}
            className="testimonials-swiper pb-12 md:pb-16"
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setTimeout(() => {
                if (isDesktop && shouldAutoplayDesktop && swiper.autoplay && !swiper.autoplay.running) {
                  try {
                    swiper.autoplay.start();
                  } catch (error) {
                    console.error('Error starting autoplay:', error);
                  }
                }
              }, 200);
            }}
            onSlideChange={(swiper) => {
              if (isDesktop && shouldAutoplayDesktop && swiper.autoplay && !swiper.autoplay.running) {
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="testimonial-card bg-card/50 backdrop-blur-sm p-4 md:p-6 rounded-lg border border-border/50 hover:border-primary/50 h-full flex flex-col relative"
                  style={{ borderRadius: '0.5rem' }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{testimonial.location}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 flex-shrink-0 ${
                          i < testimonial.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-muted-foreground flex-1 mb-3 break-words">"{testimonial.comment}"</p>

                  {testimonial.product && (
                    <p className="text-sm text-primary/70 font-medium truncate">
                      {t('purchasedProduct') || 'Purchased'}: {testimonial.product}
                    </p>
                  )}
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Custom Navigation Buttons - Conditional based on settings */}
          {shouldShowNavigation && (
            <>
              <button 
                className={`swiper-button-prev-testimonials absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 items-center justify-center w-10 h-10 cursor-pointer ${
                  windowWidth < 768 ? 'flex' : windowWidth < 1024 ? 'md:flex' : 'md:flex'
                }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (swiperRef.current) {
                try {
                  swiperRef.current.slidePrev();
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
                className={`swiper-button-next-testimonials absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 items-center justify-center w-10 h-10 cursor-pointer ${
                  windowWidth < 768 ? 'flex' : windowWidth < 1024 ? 'md:flex' : 'md:flex'
                }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (swiperRef.current) {
                try {
                  swiperRef.current.slideNext();
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
              </>
            )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
