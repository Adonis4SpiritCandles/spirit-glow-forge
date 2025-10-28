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
  const { wishlistItems, removeFromWishlist, loading, loadWishlist } = useWishlist();
  const { user, initialLoadComplete } = useAuth();
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

      // Build alerts map from wishlist items (using stock_alert_enabled)
      const map: Record<string, boolean> = {};
      wishlistItems.forEach((wi: any) => { map[wi.product_id] = !!wi.stock_alert_enabled; });
      setAlerts(map);

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
      const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const { data, error } = await (supabase as any)
        .from('shared_wishlists')
        .insert([{ user_id: user!.id, is_public: true, share_token: token, items: productIds }])
        .select('share_token')
        .single();
      if (error) throw error;
      const shareUrl = `${window.location.origin}/wishlist/shared/${data.share_token}`;
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

      // Recreate wishlist row with updated alert flag
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user!.id)
        .eq('product_id', productId);

      const { error: insErr } = await (supabase as any)
        .from('wishlist')
        .insert([{ user_id: user!.id, product_id: productId, stock_alert_enabled: nowActive }]);
      if (insErr) throw insErr;

      // Refresh local list
      await loadWishlist();
    } catch (e) {
      console.error('Toggle alert failed', e);
    }
  };

  // Wait for auth to complete before deciding
  if (!initialLoadComplete || loading || productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect only after auth is ready and user is not logged in
  if (initialLoadComplete && !user) {
    return <Navigate to="/auth" replace />;
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
                <CardContent className="p-4 flex flex-col gap-3">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-playfair text-base sm:text-lg font-bold hover:text-primary transition-colors line-clamp-1">
                      {language === 'en' ? product.name_en : product.name_pl}
                    </h3>
                  </Link>
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="text-lg sm:text-xl font-bold text-primary">
                        {product.price_pln} PLN
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        ~{product.price_eur} EUR
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Bell className="w-3 h-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{t('alerts') || 'Alerts'}</span>
                        <Switch 
                          checked={!!alerts[product.id]} 
                          onCheckedChange={() => toggleAlert(product.id)} 
                          className="scale-75"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product.id)}
                        className="gap-1.5 text-xs sm:text-sm w-full sm:w-auto whitespace-nowrap"
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{t('addToCart')}</span>
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
