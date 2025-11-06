import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import SEOManager from "@/components/SEO/SEOManager";
import { Parallax } from "react-parallax";

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadCollectionAndProducts();
    }
  }, [slug, language]);

  const loadCollectionAndProducts = async () => {
    try {
      // Load collection by slug
      const { data: collectionData, error: collError } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (collError) throw collError;
      setCollection(collectionData);

      // Load products in this collection
      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('collection_id', collectionData.id)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;

      // Transform for ProductCard with summary and collection
      const transformed = productsData.map(p => ({
        id: p.id,
        name: language === 'en' ? p.name_en : p.name_pl,
        summary: language === 'en' ? (p.summary_en || '') : (p.summary_pl || ''),
        description: language === 'en' ? (p.description_en || '') : (p.description_pl || ''),
        category: p.category,
        collection: collectionData ? (language === 'en' ? collectionData.name_en : collectionData.name_pl) : null,
        preferred_card_tag: p.preferred_card_tag,
        price: { pln: Number(p.price_pln), eur: Number(p.price_eur) },
        image: p.image_url,
        sizes: [{ size: p.size, weight: p.weight || p.size, price: { pln: Number(p.price_pln), eur: Number(p.price_eur) } }],
      }));

      setProducts(transformed);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg text-muted-foreground">
            {language === 'pl' ? 'Ładowanie...' : 'Loading...'}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-2xl font-playfair font-semibold mb-6 text-foreground">
            {language === 'pl' ? 'Kolekcja nie znaleziona' : 'Collection not found'}
          </p>
          <Link to="/collections">
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'pl' ? 'Powrót do Kolekcji' : 'Back to Collections'}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <SEOManager
        title={language === 'en' ? collection.name_en : collection.name_pl}
        description={language === 'en' ? collection.description_en : collection.description_pl}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section with Parallax */}
        <Parallax
          blur={0}
          bgImage={collection.image_url || '/assets/collection-bg.jpg'}
          bgImageAlt={language === 'en' ? collection.name_en : collection.name_pl}
          strength={400}
          className="relative"
        >
          <div className="h-[50vh] flex items-center justify-center relative">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            
            {/* Back button */}
            <div className="absolute top-8 left-8 z-10">
              <Link to="/collections">
                <Button variant="secondary" size="lg" className="backdrop-blur-sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'pl' ? 'Powrót' : 'Back'}
                </Button>
              </Link>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex justify-center gap-2 mb-6">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h1 className="text-5xl md:text-7xl font-playfair font-bold text-white mb-6 drop-shadow-2xl">
                  {language === 'en' ? collection.name_en : collection.name_pl}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-4 drop-shadow-lg">
                  {language === 'en' ? collection.description_en : collection.description_pl}
                </p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                >
                  <span className="text-white/80 text-sm font-medium">
                    {products.length} {language === 'pl' ? 'produktów' : 'products'}
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </Parallax>

        {/* Products Grid */}
        <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="container mx-auto px-4">
            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <p className="text-lg text-muted-foreground">
                  {language === 'pl' ? 'Brak produktów w tej kolekcji' : 'No products in this collection yet'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Decorative bottom section */}
        <section className="py-16 bg-gradient-to-t from-muted/30 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link to="/collections">
                <Button variant="outline" size="lg" className="group">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  {language === 'pl' ? 'Zobacz Wszystkie Kolekcje' : 'View All Collections'}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
