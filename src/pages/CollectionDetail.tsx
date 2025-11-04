import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import SEOManager from "@/components/SEO/SEOManager";

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

      // Transform for ProductCard
      const transformed = productsData.map(p => ({
        id: p.id,
        name: language === 'en' ? p.name_en : p.name_pl,
        fragrance: language === 'en' ? (p.description_en || '') : (p.description_pl || ''),
        price: { pln: Number(p.price_pln), eur: Number(p.price_eur) },
        image: p.image_url,
        description: language === 'en' ? (p.description_en || '') : (p.description_pl || ''),
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">{language === 'pl' ? 'Kolekcja nie znaleziona' : 'Collection not found'}</p>
          <Link to="/collections">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'pl' ? 'Powrót do Kolekcji' : 'Back to Collections'}
            </Button>
          </Link>
        </div>
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
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-background to-muted">
          <div className="container mx-auto px-4">
            <Link to="/collections">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'pl' ? 'Powrót do Kolekcji' : 'Back to Collections'}
              </Button>
            </Link>

            <div className="max-w-4xl">
              <h1 className="text-5xl font-playfair font-bold mb-4">
                {language === 'en' ? collection.name_en : collection.name_pl}
              </h1>
              <p className="text-xl text-muted-foreground">
                {language === 'en' ? collection.description_en : collection.description_pl}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                {products.length} {language === 'pl' ? 'produktów' : 'products'}
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                {language === 'pl' ? 'Brak produktów w tej kolekcji' : 'No products in this collection yet'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
