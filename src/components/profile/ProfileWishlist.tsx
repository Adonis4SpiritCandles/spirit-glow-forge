import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileWishlistProps {
  userId: string;
}

export const ProfileWishlist = ({ userId }: ProfileWishlistProps) => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, [userId]);

  const loadWishlist = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        products:product_id (
          id,
          name_en,
          name_pl,
          price_pln,
          price_eur,
          image_url
        )
      `)
      .eq('user_id', userId);

    if (!error && data) {
      setWishlistProducts(data.filter(item => item.products));
    }
    setLoading(false);
  };

  const shareWishlist = () => {
    const url = `${window.location.origin}/profile/${userId}#wishlist`;
    navigator.clipboard.writeText(url);
    toast.success(language === 'pl' ? 'Link skopiowany!' : 'Link copied!');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-background/95">
        <CardContent className="p-8 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {language === 'pl' ? 'Lista życzeń jest pusta' : 'Wishlist is empty'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const shouldUseCarousel = isMobile ? wishlistProducts.length > 2 : wishlistProducts.length > 4;

  const ProductCard = ({ product }: { product: any }) => (
    <Link to={`/product/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-primary/30 h-full">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={product.image_url || '/assets/candle-wax.png'}
            alt={language === 'pl' ? product.name_pl : product.name_en}
            className="object-cover w-full h-full hover:scale-110 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-4">
          <h4 className="font-semibold text-center mb-2 line-clamp-2">
            {language === 'pl' ? product.name_pl : product.name_en}
          </h4>
          <p className="text-primary font-bold text-center">
            {product.price_pln} PLN · ~€{product.price_eur}
          </p>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <Card id="wishlist" className="backdrop-blur-sm bg-background/95">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-playfair font-bold">
            <Heart className="inline w-6 h-6 mr-2 text-primary" />
            {language === 'pl' ? 'Lista Życzeń' : 'Wishlist'}
          </h3>
          <Button variant="outline" size="sm" onClick={shareWishlist} className="gap-2">
            <Share2 className="w-4 h-4" />
            {language === 'pl' ? 'Udostępnij' : 'Share'}
          </Button>
        </div>

        {shouldUseCarousel ? (
          <Carousel className="w-full">
            <CarouselContent>
              {wishlistProducts.map((item) => (
                <CarouselItem key={item.id} className={isMobile ? 'basis-1/2' : 'md:basis-1/3 lg:basis-1/4'}>
                  <ProductCard product={item.products} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlistProducts.map((item) => (
              <ProductCard key={item.id} product={item.products} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileWishlist;
