import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';


interface PurchasedProductsProps {
  userId: string;
}

interface PurchasedProduct {
  product_id: string;
  product_name_en: string;
  product_name_pl: string;
  product_image: string;
  quantity: number;
  purchase_date: string;
}

const PurchasedProducts = ({ userId }: PurchasedProductsProps) => {
  const { language } = useLanguage();
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadPurchasedProducts();
  }, [userId]);

  const loadPurchasedProducts = async () => {
    setLoading(true);
    try {
      // Query orders and order_items for this user
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          order_items (
            quantity,
            products (
              id,
              name_en,
              name_pl,
              image_url
            )
          )
        `)
        .eq('user_id', userId)
        .in('status', ['completed', 'delivered'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Process and flatten the data
      const productMap = new Map<string, PurchasedProduct>();
      
      data?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          if (item.products) {
            const product = item.products;
            const existing = productMap.get(product.id);
            
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              productMap.set(product.id, {
                product_id: product.id,
                product_name_en: product.name_en,
                product_name_pl: product.name_pl,
                product_image: product.image_url,
                quantity: item.quantity,
                purchase_date: order.created_at,
              });
            }
          }
        });
      });

      setProducts(Array.from(productMap.values()));
    } catch (error) {
      console.error('Error loading purchased products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-muted rounded-lg mb-2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {language === 'pl' 
            ? 'Brak zakupionych produktów' 
            : 'No purchased products yet'}
        </p>
      </div>
    );
  }

  return (
    ((isMobile && products.length > 2) || (!isMobile && products.length > 4)) ? (
      <Carousel className="w-full">
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.product_id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Link to={`/product/${product.product_id}`} className="group block">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-mystical mb-2 transition-transform duration-300 group-hover:scale-105 border border-primary/30">
                  <img
                    src={product.product_image}
                    alt={language === 'en' ? product.product_name_en : product.product_name_pl}
                    className="w-full h-full object-cover"
                  />
                  {product.quantity > 1 && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      ×{product.quantity}
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm text-center line-clamp-2 group-hover:text-primary transition-colors">
                  {language === 'en' ? product.product_name_en : product.product_name_pl}
                </h3>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.product_id}
            to={`/product/${product.product_id}`}
            className="group"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-mystical mb-2 transition-transform duration-300 group-hover:scale-105 border border-primary/30">
              <img
                src={product.product_image}
                alt={language === 'en' ? product.product_name_en : product.product_name_pl}
                className="w-full h-full object-cover"
              />
              {product.quantity > 1 && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  ×{product.quantity}
                </div>
              )}
            </div>
            <h3 className="font-medium text-sm text-center line-clamp-2 group-hover:text-primary transition-colors">
              {language === 'en' ? product.product_name_en : product.product_name_pl}
            </h3>
          </Link>
        ))}
      </div>
    )
  );

};

export default PurchasedProducts;