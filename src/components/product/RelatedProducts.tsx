import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "@/components/ProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  category?: string;
}

const RelatedProducts = ({ currentProductId, category }: RelatedProductsProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { language } = useLanguage();

  useEffect(() => {
    loadRelatedProducts();
  }, [currentProductId, category]);

  const loadRelatedProducts = async () => {
    let query = supabase
      .from('products')
      .select(`
        *,
        collections(name_en, name_pl)
      `)
      .eq('published', true)
      .neq('id', currentProductId)
      .limit(6);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (!error && data) {
      // Transform to include summary and collection
      const transformed = data.map(p => ({
        ...p,
        summary: language === 'en' ? (p.summary_en || '') : (p.summary_pl || ''),
        collection: p.collections ? (language === 'en' ? p.collections.name_en : p.collections.name_pl) : null,
      }));
      setProducts(transformed);
    }
  };

  if (products.length === 0) return null;

  return (
    <section ref={ref} className="py-12 bg-background/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
          {language === 'pl' ? 'Mogą Ci Się Spodobać' : 'You May Also Like'}
        </h2>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {products.map((product, index) => (
              <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ProductCard
                    id={product.id}
                    name={language === 'en' ? product.name_en : product.name_pl}
                    fragrance=""
                    summary={product.summary}
                    description={language === 'en' ? product.description_en : product.description_pl}
                    category={product.category}
                    collection={product.collection}
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
      </motion.div>
    </section>
  );
};

export default RelatedProducts;
