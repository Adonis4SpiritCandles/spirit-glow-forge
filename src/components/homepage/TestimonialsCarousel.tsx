import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
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

  useEffect(() => {
    loadSectionToggle();
    loadTestimonials();
  }, []);

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
    <section ref={ref} className="py-6 md:py-10 lg:py-12 bg-background/50 overflow-visible">
      <style>{`
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
          }
          .testimonials-swiper .testimonial-card:hover {
            box-shadow: 
              0 0 25px hsl(var(--primary) / 0.35),
              0 0 50px hsl(var(--primary) / 0.2),
              0 0 75px hsl(var(--primary) / 0.1),
              inset 0 0 15px hsl(var(--primary) / 0.05) !important;
            transform: scale(1.02) translateY(-5px) !important;
            border-radius: 0.5rem !important;
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative pt-12 md:pt-16 px-2 md:px-4 overflow-visible"
        >
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{ 
              delay: window.innerWidth >= 1024 ? 6000 : 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
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
                effect: 'slide',
                autoplay: { delay: 5000 }
              },
              768: { 
                slidesPerView: 2,
                effect: 'coverflow',
                autoplay: { delay: 5000 }
              },
              1024: { 
                slidesPerView: 3,
                effect: 'coverflow',
                autoplay: { delay: 6000 }
              },
            }}
            className="testimonials-swiper pb-12 md:pb-16"
            onSwiper={(swiper) => {
              // Ensure autoplay works on desktop
              if (swiper.autoplay) {
                swiper.autoplay.start();
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
                  className="testimonial-card bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50 hover:border-primary/50 h-full flex flex-col cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
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
          <button className="swiper-button-prev-testimonials absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 hidden md:flex items-center justify-center w-10 h-10">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="swiper-button-next-testimonials absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 hidden md:flex items-center justify-center w-10 h-10">
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
