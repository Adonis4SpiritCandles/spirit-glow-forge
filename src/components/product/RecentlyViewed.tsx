import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const RECENTLY_VIEWED_KEY = 'spirit_recently_viewed';
const MAX_RECENT_PRODUCTS = 10;

const RecentlyViewed = ({ currentProductId }: { currentProductId: string }) => {
  const [products, setProducts] = useState<any[]>([]);
  const { language } = useLanguage();

  useEffect(() => {
    // Add current product to recently viewed
    addToRecentlyViewed(currentProductId);
    
    // Load recently viewed products
    loadRecentlyViewed();
  }, [currentProductId]);

  const addToRecentlyViewed = (productId: string) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let recentIds: string[] = stored ? JSON.parse(stored) : [];
      
      // Remove if already exists
      recentIds = recentIds.filter(id => id !== productId);
      
      // Add to beginning
      recentIds.unshift(productId);
      
      // Keep only MAX_RECENT_PRODUCTS
      recentIds = recentIds.slice(0, MAX_RECENT_PRODUCTS);
      
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentIds));
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
  };

  const loadRecentlyViewed = async () => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (!stored) return;
      
      const recentIds: string[] = JSON.parse(stored);
      
      // Remove current product from display
      const displayIds = recentIds.filter(id => id !== currentProductId).slice(0, 6);
      
      if (displayIds.length === 0) return;
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_collections(
            collection:collections(
              id,
              name_en,
              name_pl,
              slug
            )
          )
        `)
        .in('id', displayIds)
        .eq('published', true);
      
      if (!error && data) {
        // Transform to include summary and collections array
        const transformed = data.map(p => ({
          ...p,
          summary: language === 'en' ? (p.summary_en || '') : (p.summary_pl || ''),
          collections: p.product_collections?.map((pc: any) => pc.collection) || [],
        }));

        // Sort by recently viewed order
        const sortedProducts = displayIds
          .map(id => transformed.find(p => p.id === id))
          .filter(Boolean);
        
        setProducts(sortedProducts);
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
          {language === 'pl' ? 'Ostatnio Oglądane' : 'Recently Viewed'}
        </h2>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {products.map((product, index) => (
              <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ProductCard
                    id={product.id}
                    name={language === 'en' ? product.name_en : product.name_pl}
                    fragrance=""
                    summary={product.summary}
                    description={language === 'en' ? product.description_en : product.description_pl}
                    category={product.category}
                    collections={product.collections}
                    preferredTag={product.preferred_card_tag}
                    price={{ pln: Number(product.price_pln), eur: Number(product.price_eur) }}
                    image={product.image_url}
                    sizes={[{ size: product.size, weight: product.weight || product.size, price: { pln: Number(product.price_pln), eur: Number(product.price_eur) } }]}
                  />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default RecentlyViewed;
