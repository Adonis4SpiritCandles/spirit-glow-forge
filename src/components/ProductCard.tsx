import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  id: string;
  name: string;
  fragrance: string;
  price: {
    pln: number;
    eur: number;
  };
  image: string;
  description: string;
  sizes: Array<{
    size: string;
    weight: string;
    price: { pln: number; eur: number };
  }>;
  isNew?: boolean;
  isBestseller?: boolean;
}

const ProductCard = ({ 
  id, 
  name, 
  fragrance, 
  price, 
  image, 
  description, 
  sizes, 
  isNew, 
  isBestseller 
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();
  const { addProductToCart } = useCart();

  const handleAddToCart = () => {
    const size = sizes[selectedSize];
    // Map to cart Product shape
    const cartProduct = {
      id,
      name_en: name,
      name_pl: name,
      price_pln: size.price.pln,
      price_eur: size.price.eur,
      image_url: image,
      size: size.weight,
      category: fragrance || "candle",
    };
    addProductToCart(cartProduct as any, 1);
    toast({
      title: "Added to Cart",
      description: `${name} (${size.weight}) has been added to your cart.`,
    });
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${name} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
    });
  };

  return (
    <Card 
      className="group bg-card border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-luxury"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-mystical aspect-square">
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

          {/* Action Buttons */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleWishlist}
              className="w-10 h-10 p-0 rounded-full shadow-elegant"
            >
              <Heart 
                className={`h-4 w-4 ${isWishlisted ? 'fill-current text-primary' : ''}`} 
              />
            </Button>
          </div>

          {/* View Product Overlay */}
          <div className={`absolute inset-0 bg-background/80 mystical-blur flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <Button 
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-luxury"
            >
              <Link to={`/product/${id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="space-y-3">
            <div>
              <h3 className="font-playfair text-lg font-semibold text-foreground">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground italic">
                Inspired by {fragrance}
              </p>
            </div>

            <p className="text-sm text-foreground/80 line-clamp-2">
              {description}
            </p>

            {/* Size Selection */}
            <div className="flex gap-2">
              {sizes.map((size, index) => (
                <Button
                  key={index}
                  variant={selectedSize === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSize(index)}
                  className="text-xs"
                >
                  {size.weight}
                </Button>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-lg font-semibold text-primary">
                  {sizes[selectedSize].price.pln} PLN
                </div>
                <div className="text-xs text-muted-foreground">
                  ~{sizes[selectedSize].price.eur} EUR
                </div>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;