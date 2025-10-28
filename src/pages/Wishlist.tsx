import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, X, Share2, Bell } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [alerts, setAlerts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadProducts = async () => {
      if (wishlistItems.length === 0) {
        setProducts([]);
        setProductsLoading(false);
        setAlerts({});
        return;
      }

      const productIds = wishlistItems.map(item => item.product_id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (error) {
        console.error('Error loading products:', error);
      } else {
        setProducts(data || []);
      }

      // Load alert subscriptions
      if (user) {
        const { data: alertsData } = await supabase
          .from('wishlist_alerts')
          .select('product_id, active')
          .eq('user_id', user.id)
          .eq('alert_type', 'restock');
        const map: Record<string, boolean> = {};
        alertsData?.forEach(a => { map[a.product_id] = !!a.active; });
        setAlerts(map);
      }

      setProductsLoading(false);
    };

    loadProducts();
  }, [wishlistItems, user]);

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  const handleShare = async () => {
    try {
      const productIds = wishlistItems.map(i => i.product_id);
      const { data, error } = await supabase
        .from('shared_wishlists')
        .insert({ user_id: user!.id, items: productIds })
        .select('id')
        .single();
      if (error) throw error;
      const shareUrl = `${window.location.origin}/wishlist/shared/${data.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: t('linkCopied') || 'Link copiato', description: shareUrl });
    } catch (e: any) {
      console.error('Share wishlist failed', e);
      toast({ title: t('error') || 'Errore', description: e.message, variant: 'destructive' });
    }
  };

  const toggleAlert = async (productId: string) => {
    try {
      const nowActive = !alerts[productId];
      setAlerts(prev => ({ ...prev, [productId]: nowActive }));
      const { error } = await supabase
        .from('wishlist_alerts')
        .upsert({ user_id: user!.id, product_id: productId, alert_type: 'restock', active: nowActive }, { onConflict: 'user_id,product_id,alert_type' });
      if (error) throw error;
    } catch (e) {
      console.error('Toggle alert failed', e);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading || productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              {t('myWishlist')}
            </h1>
            <p className="text-muted-foreground">
              {wishlistItems.length} {wishlistItems.length === 1 ? t('item') : t('items')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" /> {t('share')}
            </Button>
            <Button asChild variant="secondary">
              <Link to="/shop">{t('browseCollection')}</Link>
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="animate-fade-in">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <h2 className="font-playfair text-2xl font-bold mb-2">{t('emptyWishlist')}</h2>
                <p className="text-muted-foreground mb-6">{t('startAddingFavorites')}</p>
                <Button asChild size="lg">
                  <Link to="/shop">{t('browseCollection')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <Card 
                key={product.id} 
                className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in hover:scale-[1.02]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeFromWishlist(product.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square bg-gradient-mystical overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={language === 'en' ? product.name_en : product.name_pl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </Link>
                <CardContent className="p-4 space-y-3">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-playfair text-lg font-bold hover:text-primary transition-colors">
                      {language === 'en' ? product.name_en : product.name_pl}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-primary">
                        {product.price_pln} PLN
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ~{product.price_eur} EUR
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Bell className="w-3 h-3" />
                        {t('alerts') || 'Alerts'}
                        <Switch checked={!!alerts[product.id]} onCheckedChange={() => toggleAlert(product.id)} />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product.id)}
                        className="gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t('addToCart')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
