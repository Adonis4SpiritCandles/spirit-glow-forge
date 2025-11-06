import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCartContext } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";

interface ProductCardProps {
  id: string;
  name: string;
  fragrance: string;
  price: {
    pln: number;
    eur: number;
  };
  image: string;
  summary?: string;
  description: string;
  sizes: Array<{
    size: string;
    weight: string;
    price: { pln: number; eur: number };
  }>;
  isNew?: boolean;
  isBestseller?: boolean;
  category?: string;
  collection?: string | null;
  preferredTag?: 'category' | 'collection';
}

const ProductCard = ({ 
  id, 
  name, 
  fragrance, 
  price, 
  image, 
  summary,
  description, 
  sizes, 
  isNew, 
  isBestseller,
  category,
  collection,
  preferredTag = 'category'
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(0);
  const { toast } = useToast();
  const { addProductToCart } = useCartContext();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const isWishlisted = isInWishlist(id);
  
  // Determine which tag to display
  const displayTag = preferredTag === 'collection' && collection 
    ? collection 
    : category || collection;

  // Safe guards for props shape
  const hasSizes = Array.isArray(sizes) && sizes.length > 0;
  const selected = hasSizes ? sizes[Math.min(selectedSize, Math.max(0, sizes.length - 1))] : undefined;
  const displayPrice = selected?.price || price;

  const handleAddToCart = () => {
    const hasSizes = Array.isArray(sizes) && sizes.length > 0;
    const selected = hasSizes ? sizes[selectedSize] : undefined;
    const displayPrice = selected?.price || price;
    const weight = selected?.weight || (hasSizes ? String(selected?.size || '') : 'standard');

    // Map to cart Product shape
    const cartProduct = {
      id,
      name_en: name,
      name_pl: name,
      price_pln: Number(displayPrice?.pln ?? 0),
      price_eur: Number(displayPrice?.eur ?? 0),
      image_url: image,
      size: weight,
      category: fragrance || "candle",
    };
    addProductToCart(cartProduct as any, 1);
    toast({
      title: t('addedToCartTitle'),
      description: `${name} (${weight})`,
    });
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast({
        title: t('pleaseLogin') || 'Please log in',
        description: t('loginToWishlist') || 'You need to be logged in to use wishlist',
        variant: 'destructive',
      });
      return;
    }

    if (isWishlisted) {
      await removeFromWishlist(id);
    } else {
      await addToWishlist(id);
    }
  };

  return (
    <Card 
      className="group bg-card border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-luxury flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-mystical aspect-square flex-shrink-0">
          <img 
            src={image}
            alt={`${name} soy candle — ${fragrance}`}
            className="w-full h-full object-cover transition-transform duration-700"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <Badge className="bg-primary text-primary-foreground text-xs font-medium">
                NEW
              </Badge>
            )}
            {isBestseller && (
              <Badge variant="secondary" className="text-xs font-medium">
                BESTSELLER
              </Badge>
            )}
          </div>

          {/* Action Buttons - Wishlist */}
          <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleWishlist}
              className="w-10 h-10 p-0 rounded-full shadow-lg bg-white/95 hover:bg-white"
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
              />
            </Button>
          </div>

          {/* View Product Overlay - No blur */}
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-all duration-300 z-10 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <Button 
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-luxury"
            >
              <Link to={`/product/${id}`}>
                <Eye className="w-4 h-4 mr-2" />
                {t('viewProduct')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1">
          <div className="space-y-2 flex flex-col flex-1">
            {/* Titolo */}
            <h3 className="font-playfair text-lg font-semibold text-foreground line-clamp-1">
              {name}
            </h3>

            {/* Tag Collection o Category */}
            {displayTag && (
              <Badge variant="outline" className="self-start text-xs">
                {displayTag}
              </Badge>
            )}

            {/* Summary - CORSIVO, margini ridotti */}
            {summary && (
              <p className="text-sm text-muted-foreground italic leading-snug line-clamp-2 min-h-[2.5rem] -mt-1">
                {summary}
              </p>
            )}

            {/* Description - GRASSETTO BIANCO, spazio fisso 4 righe */}
            <div className="flex-1 min-h-[5.5rem]">
              <p className="text-base font-bold text-foreground leading-relaxed line-clamp-4">
                {description}
              </p>
            </div>

            {/* Size Selection */}
            {hasSizes && (
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size, index) => (
                  <Button
                    key={index}
                    variant={selectedSize === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(index)}
                    className="text-xs font-medium"
                  >
                    {size.weight}
                  </Button>
                ))}
              </div>
            )}

            {/* Price & Add to Cart - always at bottom */}
            <div className="flex items-center justify-between gap-2 mt-auto pt-2">
              <div className="space-y-1 flex-shrink-0">
                <div className="text-lg font-semibold text-primary whitespace-nowrap">
                  {language === 'pl' 
                    ? `${Number(displayPrice?.pln ?? 0).toFixed(2)} PLN`
                    : `€${Number(displayPrice?.eur ?? 0).toFixed(2)}`
                  }
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {language === 'pl' 
                    ? `~€${Number(displayPrice?.eur ?? 0).toFixed(2)}`
                    : `~${Number(displayPrice?.pln ?? 0).toFixed(2)} PLN`
                  }
                </div>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm flex-shrink-0 min-w-fit"
              >
                <ShoppingCart className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">{t('addToCart')}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;