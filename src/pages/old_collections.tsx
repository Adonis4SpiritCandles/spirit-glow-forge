import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Heart, Crown, Leaf } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import candleLit from "@/assets/candle-lit.png";
import candleUnlit from "@/assets/candle-unlit.png";
import candleWax from "@/assets/candle-wax.png";

// Products loaded from Supabase

const Collections = () => {
  const { t, language } = useLanguage();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (data) {
        const mapped = data.map((p) => ({
          id: p.id,
          name: language === 'en' ? p.name_en : p.name_pl,
          fragrance: language === 'en' ? (p.description_en || '') : (p.description_pl || ''),
          price: { pln: Number(p.price_pln), eur: Number(p.price_eur) },
          image: p.image_url,
          description: language === 'en' ? (p.description_en || '') : (p.description_pl || ''),
          sizes: [{ size: p.size, weight: p.weight || p.size, price: { pln: Number(p.price_pln), eur: Number(p.price_eur) } }],
          collection: p.category,
        }));
        setProducts(mapped);
      }
    };
    load();

    const channel = supabase
      .channel('products-collections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [language]);

  const collections = [
    {
      id: "luxury",
      name: t('luxuryCollection'),
      description: t('luxuryCollectionDesc'),
      icon: Crown,
      image: candleLit,
      productCount: 12,
      color: "from-amber-500/20 to-yellow-500/20",
      featured: true,
    },
    {
      id: "fresh",
      name: t('freshAndClean'),
      description: t('freshDesc'),
      icon: Leaf,
      image: candleUnlit,
      productCount: 8,
      color: "from-green-500/20 to-emerald-500/20",
    },
    {
      id: "romantic",
      name: t('romanticEvening'),
      description: t('romanticDesc'),
      icon: Heart,
      image: candleWax,
      productCount: 10,
      color: "from-rose-500/20 to-pink-500/20",
    },
    {
      id: "bestsellers",
      name: t('bestSellers'),
      description: t('bestSellersDesc'),
      icon: Sparkles,
      image: candleLit,
      productCount: 6,
      color: "from-purple-500/20 to-violet-500/20",
      featured: true,
    },
  ];

const filteredProducts = selectedCollection 
  ? products.filter(product => product.collection === selectedCollection)
  : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-6">
              {t('ourCollections')}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {t('discoverCuratedCollections')}
            </p>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {collections.map((collection) => {
              const IconComponent = collection.icon;
              return (
                <Card 
                  key={collection.id}
                  className={`group overflow-hidden bg-gradient-to-br ${collection.color} border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-luxury hover:scale-[1.02] cursor-pointer`}
                  onClick={() => setSelectedCollection(collection.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Collection Image */}
                      <div className="md:w-1/2 aspect-square md:aspect-auto relative overflow-hidden">
                        <img 
                          src={collection.image}
                          alt={collection.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-background/10 group-hover:bg-background/5 transition-colors duration-300"></div>
                      </div>
                      
                      {/* Collection Content */}
                      <div className="md:w-1/2 p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-primary/20 rounded-full">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          {collection.featured && (
                            <Badge className="bg-primary text-primary-foreground">
                              {t('featured')}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-playfair text-2xl font-bold text-foreground mb-3">
                          {collection.name}
                        </h3>
                        
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {collection.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {collection.productCount} {t('products')}
                          </span>
                          
                          <Button 
                            variant="ghost" 
                            className="text-primary hover:text-primary/80 p-0 h-auto"
                          >
                            {t('exploreCollectionPage')}
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Collection Products */}
          {selectedCollection && (
            <div className="animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-playfair font-bold text-foreground mb-4">
                  {collections.find(c => c.id === selectedCollection)?.name}
                </h2>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedCollection(null)}
                  className="mb-8"
                >
                  {t('backToAllCollections')}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {t('moreProductsComingSoon')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Call to Action */}
          {!selectedCollection && (
            <div className="text-center mt-16">
              <h3 className="text-2xl font-playfair font-bold text-foreground mb-4">
                {t('cantDecide')}
              </h3>
              <Button 
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 shadow-luxury hover:scale-105 transition-all duration-300"
              >
                <Link to="/shop">
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('shopAllCandles')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Collections;