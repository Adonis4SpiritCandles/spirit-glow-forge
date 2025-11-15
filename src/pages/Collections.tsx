import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Heart, Crown, Leaf, Flame, Wind, Moon, Sun, Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import candleLit from "@/assets/candle-lit.png";
import candleUnlit from "@/assets/candle-unlit.png";
import candleWax from "@/assets/candle-wax.png";
import SEOManager from "@/components/SEO/SEOManager";
import { generateBreadcrumbStructuredData, getFullUrl, generateAlternateUrls } from "@/utils/seoUtils";

const Collections = () => {
  const { t, language } = useLanguage();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [collectionsRef, collectionsInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [moodRef, moodInView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    loadCollections();
  }, [language]);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Count products for each collection using product_collections junction table
      const collectionsWithCount = await Promise.all(
        (data || []).map(async (col) => {
          // Count products using product_collections junction table
          const { data: productCollections, error: pcError } = await supabase
            .from('product_collections')
            .select('product_id', { count: 'exact', head: false })
            .eq('collection_id', col.id);

          if (pcError) {
            console.error(`Error counting products for collection ${col.id}:`, pcError);
          }

          // Get product IDs
          const productIds = productCollections?.map(pc => pc.product_id) || [];

          // Count only published products
          let productCount = 0;
          if (productIds.length > 0) {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .in('id', productIds)
              .eq('published', true);
            productCount = count || 0;
          }

          return {
            id: col.slug,
            collectionId: col.id, // Store actual collection ID for filtering
            name: language === 'en' ? col.name_en : col.name_pl,
            description: language === 'en' ? col.description_en : col.description_pl,
            icon: getIconComponent(col.icon_name),
            image: col.image_url || candleLit,
            productCount: productCount,
            gradient: col.gradient_classes || 'from-primary/20',
            featured: col.featured || false,
          };
        })
      );

      setCollections(collectionsWithCount);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setCollectionsLoading(false);
    }
  };

  const getIconComponent = (iconName: string | null) => {
    const icons: Record<string, any> = { Crown, Leaf, Heart, Sparkles };
    return icons[iconName || 'Sparkles'] || Sparkles;
  };

  useEffect(() => {
    const load = async () => {
      // Load products with their collections via product_collections junction table
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_collections(
            collection:collections(
              id,
              slug,
              name_en,
              name_pl
            )
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading products:', error);
        return;
      }

      if (data) {
        const mapped = data.map((p) => {
          // Extract collection slugs from product_collections
          const collectionSlugs = (p.product_collections || []).map((pc: any) => pc.collection?.slug).filter(Boolean);
          
          return {
            id: p.id,
            name: language === 'en' ? p.name_en : p.name_pl,
            fragrance: language === 'en' ? (p.description_en || '') : (p.description_pl || ''),
            price: { pln: Number(p.price_pln), eur: Number(p.price_eur) },
            image: p.image_url,
            description: language === 'en' ? (p.description_en || '') : (p.description_pl || ''),
            sizes: [{ size: p.size, weight: p.weight || p.size, price: { pln: Number(p.price_pln), eur: Number(p.price_eur) } }],
            collections: collectionSlugs, // Array of collection slugs
            collection: p.category, // Keep for backward compatibility if needed
          };
        });
        setProducts(mapped);
      }
    };
    load();

    const channel = supabase
      .channel('products-collections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_collections' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [language]);

  const moods = [
    { id: "energize", name: language === 'en' ? "Energize" : "Energiczny", icon: Sun, color: "text-amber-400" },
    { id: "relax", name: language === 'en' ? "Relax" : "Relaks", icon: Moon, color: "text-blue-400" },
    { id: "focus", name: language === 'en' ? "Focus" : "Skupienie", icon: Star, color: "text-purple-400" },
    { id: "romantic", name: language === 'en' ? "Romantic" : "Romantyczny", icon: Heart, color: "text-pink-400" },
    { id: "fresh", name: language === 'en' ? "Fresh" : "Świeży", icon: Wind, color: "text-green-400" },
    { id: "cozy", name: language === 'en' ? "Cozy" : "Przytulny", icon: Flame, color: "text-orange-400" },
  ];

  // Filter products by selected collection slug using collections array
  const filteredProducts = selectedCollection 
    ? products.filter(product => 
        (product.collections && product.collections.includes(selectedCollection)) ||
        product.collection === selectedCollection // Fallback for backward compatibility
      )
    : [];

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: getFullUrl('/', language) },
    { name: language === 'en' ? 'Collections' : 'Kolekcje', url: getFullUrl('/collections', language) }
  ]);

  const selectedCollectionName = collections.find(c => c.id === selectedCollection)?.name;

  return (
    <>
      <SEOManager
        title={selectedCollectionName || (language === 'en' ? 'Our Collections' : 'Nasze Kolekcje')}
        description={language === 'en'
          ? 'Explore SPIRIT CANDLES curated collections of luxury soy candles. From fresh scents to romantic evenings, find your perfect candle.'
          : 'Odkryj kolekcje luksusowych świec sojowych SPIRIT CANDLES. Od świeżych zapachów po romantyczne wieczory, znajdź idealną świecę.'}
        keywords={language === 'en'
          ? 'candle collections, luxury candles, scent collections, candle categories'
          : 'kolekcje świec, luksusowe świece, kolekcje zapachów, kategorie świec'}
        url={getFullUrl('/collections', language)}
        structuredData={breadcrumbData}
        alternateUrls={generateAlternateUrls('/collections')}
      />
      <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Hero Section */}
      <section ref={heroRef} className="relative py-24 bg-gradient-to-br from-background via-background to-muted overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"
        />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={heroInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={heroInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-playfair font-bold text-foreground mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-primary"
            >
              {t('ourCollections')}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-muted-foreground leading-relaxed mb-8"
            >
              {t('discoverCuratedCollections')}
            </motion.p>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={heroInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
              className="flex justify-center gap-4"
            >
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              <Star className="w-8 h-8 text-primary-glow animate-pulse delay-75" />
              <Sparkles className="w-8 h-8 text-primary animate-pulse delay-150" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Shop by Mood Section */}
      <section ref={moodRef} className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={moodInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
              {language === 'en' ? 'Shop by Mood' : 'Wybierz Według Nastroju'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Find the perfect candle for every moment and emotion' 
                : 'Znajdź idealną świecę na każdą chwilę i emocję'}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {moods.map((mood, index) => {
              const IconComponent = mood.icon;
              return (
                <motion.div
                  key={mood.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={moodInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    className={`cursor-pointer border-2 transition-all duration-300 ${
                      selectedMood === mood.id 
                        ? 'border-primary bg-primary/10 shadow-luxury' 
                        : 'border-border/40 hover:border-primary/40 hover:shadow-elegant'
                    }`}
                    onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <IconComponent className={`w-10 h-10 mx-auto mb-3 ${mood.color}`} />
                      <p className="font-medium text-foreground">{mood.name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Collections Grid with Stagger Animation */}
      <section ref={collectionsRef} className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {collections.map((collection, index) => {
              const IconComponent = collection.icon;
              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={collectionsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ scale: 1.02, rotateY: 2 }}
                  style={{ perspective: 1000 }}
                >
                  <Card 
                    className={`group overflow-hidden bg-gradient-to-br ${collection.gradient} border-border/40 hover:border-primary/60 transition-all duration-500 hover:shadow-luxury cursor-pointer h-full`}
                    onClick={() => setSelectedCollection(collection.id)}
                  >
                    <CardContent className="p-0 h-full">
                      <div className="flex flex-col lg:flex-row h-full">
                        {/* Collection Image */}
                        <div className="lg:w-1/2 aspect-square lg:aspect-auto lg:h-auto relative overflow-hidden min-h-[250px] md:min-h-[300px]">
                          <motion.img 
                            src={collection.image}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.15, rotate: 2 }}
                            transition={{ duration: 0.7 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
                        </div>
                        
                        {/* Collection Content */}
                        <div className="lg:w-1/2 p-6 md:p-8 flex flex-col justify-center min-h-[200px]">
                          <motion.div 
                            className="flex items-center gap-3 mb-4"
                            whileHover={{ x: 10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="p-3 bg-primary/20 rounded-full group-hover:bg-primary/30 transition-colors duration-300 flex-shrink-0">
                              <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                            {collection.featured && (
                              <Badge className="bg-primary text-primary-foreground animate-pulse flex-shrink-0">
                                {t('featured')}
                              </Badge>
                            )}
                          </motion.div>
                          
                          <h3 className="font-playfair text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300 break-words">
                            {collection.name}
                          </h3>
                          
                          <p className="text-muted-foreground mb-6 leading-relaxed text-sm md:text-base break-words">
                            {collection.description}
                          </p>
                          
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-auto">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {collection.productCount} {t('products')}
                            </span>
                            
                            <Button 
                              variant="ghost" 
                              className="text-primary hover:text-primary-glow p-0 h-auto group/btn whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/collections/${collection.id}`;
                              }}
                            >
                              {t('exploreCollectionPage')}
                              <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-2 transition-transform duration-300" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Selected Collection Products with Stagger */}
          <AnimatePresence mode="wait">
            {selectedCollection && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-12">
                  <motion.h2
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4"
                  >
                    {collections.find(c => c.id === selectedCollection)?.name}
                  </motion.h2>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedCollection(null)}
                    className="mb-8 hover:scale-105 transition-transform duration-300"
                  >
                    {t('backToAllCollections')}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                    >
                      <ProductCard {...product} />
                    </motion.div>
                  ))}
                </div>
                
                {filteredProducts.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground text-lg">
                      {t('moreProductsComingSoon')}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Call to Action */}
          {!selectedCollection && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={collectionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-16"
            >
              <h3 className="text-2xl md:text-3xl font-playfair font-bold text-foreground mb-4">
                {t('cantDecide')}
              </h3>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-6 shadow-luxury hover:shadow-mystical transition-all duration-300"
                >
                  <Link to="/shop">
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t('shopAllCandles')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>
      </div>
    </>
  );
};

export default Collections;
