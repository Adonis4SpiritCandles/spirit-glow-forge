import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const ProductCarousel = () => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();

    // Subscribe to product changes
    const channel = supabase
      .channel('product-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-secondary">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
            {t('featuredCollection')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('featuredCollectionDescription')}
          </p>
        </div>

        {/* Desktop Carousel with Navigation */}
        <div className="hidden lg:block relative">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full max-w-7xl mx-auto"
          >
            <CarouselContent className="-ml-6">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-6 basis-1/3">
                  <ProductCard
                    id={product.id}
                    name={language === 'en' ? product.name_en : product.name_pl}
                    fragrance={language === 'en' ? product.description_en : product.description_pl}
price={{ pln: Number(product.price_pln), eur: Number(product.price_eur) }}
                    image={product.image_url}
                    description={language === 'en' ? product.description_en : product.description_pl}
                    sizes={[{ size: product.size, weight: product.weight, price: { pln: product.price_pln, eur: product.price_eur } }]}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 -translate-x-12" />
            <CarouselNext className="right-0 translate-x-12" />
          </Carousel>
        </div>

        {/* Mobile Carousel with Embla */}
        <div className="lg:hidden">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-[85%] sm:basis-[70%]">
                  <ProductCard
                    id={product.id}
                    name={language === 'en' ? product.name_en : product.name_pl}
                    fragrance={language === 'en' ? product.description_en : product.description_pl}
                    price={{ pln: Number(product.price_pln), eur: Number(product.price_eur) }}
                    image={product.image_url}
                    description={language === 'en' ? product.description_en : product.description_pl}
                    sizes={[{ size: product.size, weight: product.weight, price: { pln: product.price_pln, eur: product.price_eur } }]}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button 
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 shadow-luxury hover:scale-105 transition-all duration-300"
          >
            <Link to="/collections">
              {t('exploreFullCollection')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;