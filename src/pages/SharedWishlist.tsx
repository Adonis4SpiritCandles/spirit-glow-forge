import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const SharedWishlist = () => {
  const { token } = useParams<{ token: string }>();
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const { data: shared } = await (supabase as any)
        .from('shared_wishlists')
        .select('items')
        .eq('share_token', token)
        .eq('is_public', true)
        .maybeSingle();

      const itemsJson = (shared as any)?.items as any[] | undefined;
      const productIds: string[] = Array.isArray(itemsJson) ? (itemsJson as string[]) : [];
      if (!productIds.length) { setLoading(false); return; }

      const { data: prods } = await (supabase as any)
        .from('products')
        .select('*')
        .in('id', productIds as any);
      setProducts(prods || []);
      setLoading(false);
    };
    load();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground">
            {t('sharedWishlist') || 'Shared Wishlist'}
          </h1>
          <Button asChild variant="secondary"><Link to="/shop">{t('browseCollection')}</Link></Button>
        </div>
        {products.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12 text-center text-muted-foreground">
              {t('emptyWishlist')}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square bg-gradient-mystical overflow-hidden">
                    <img src={product.image_url} alt={language === 'en' ? product.name_en : product.name_pl} className="w-full h-full object-cover" />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/product/${product.id}`} className="font-semibold hover:text-primary">
                    {language === 'en' ? product.name_en : product.name_pl}
                  </Link>
                  <div className="text-sm text-muted-foreground">{product.price_pln} PLN · ~{product.price_eur} EUR</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedWishlist;
