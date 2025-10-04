import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, Heart, Share2, Minus, Plus, Star, Shield, Leaf, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useReviews } from "@/hooks/useReviews";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductReviews from "@/components/ProductReviews";
import candleLit from "@/assets/candle-lit.png";
import candleUnlit from "@/assets/candle-unlit.png";
import candleWax from "@/assets/candle-wax.png";

// Sample product data - will be replaced with database data
const sampleProducts = [
  {
    id: "1",
    name: "Mystic Rose",
    fragrance: "Black Opium",
    price: { pln: 89, eur: 21 },
    image: candleLit,
    description: "A captivating blend of black coffee, white flowers, and vanilla with a mysterious edge that transforms any space into a luxurious sanctuary.",
    longDescription: "Inspired by the iconic Black Opium fragrance, our Mystic Rose candle captures the essence of mysterious femininity. The top notes of pink pepper and orange blossom give way to a heart of coffee and jasmine, while the base notes of vanilla, patchouli, and cedar wood create a warm, enveloping finish that lingers beautifully in your space.",
    sizes: [
      { size: "Small", weight: "180g", price: { pln: 89, eur: 21 }, burnTime: "40-45 hours" }
    ],
    isNew: true,
    waxType: "100% Natural Soy Wax",
    wick: "Cotton Wick",
    handPoured: true,
    moodTags: ["Mysterious", "Romantic", "Evening"],
    ingredients: ["Soy Wax", "Premium Fragrance Oils", "Cotton Wick"],
    careInstructions: [
      "Trim wick to 1/4 inch before each use",
      "Allow wax to melt evenly across surface",
      "Never burn for more than 4 hours at a time",
      "Keep away from drafts and flammable objects"
    ]
  }
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addProductToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { averageRating, reviewCount } = useReviews(id);
  const { t } = useLanguage();
  
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const isWishlisted = id ? isInWishlist(id) : false;

  // Find product by ID (in real app, this would be a database query)
  const product = sampleProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-playfair font-bold mb-4">{t('productNotFound')}</h1>
          <Button asChild>
            <Link to="/shop">{t('returnToShop')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    const size = product.sizes[selectedSize];
    const cartProduct = {
      id: product.id,
      name_en: product.name,
      name_pl: product.name,
      price_pln: size.price.pln,
      price_eur: size.price.eur,
      image_url: product.image,
      size: size.weight,
      category: product.fragrance || 'candle',
    };
    addProductToCart(cartProduct as any, quantity);
    toast({
      title: t('addedToCart'),
      description: `${product.name} (${size.weight}) x${quantity} has been added to your cart.`,
    });
  };

  const toggleWishlist = async () => {
    if (!id) return;
    
    if (isWishlisted) {
      await removeFromWishlist(id);
    } else {
      await addToWishlist(id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
        toast({
          title: t('shared'),
          description: t('productShared'),
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // Fallback to clipboard
          handleCopyLink();
        }
      }
    } else {
      // Fallback to clipboard
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: t('linkCopied'),
      description: t('productLinkCopied'),
    });
  };

  const selectedPrice = currentPrice;
  const totalPrice = { 
    pln: selectedPrice.pln * quantity, 
    eur: selectedPrice.eur * quantity 
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="p-0 h-auto hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('backToShop')}
            </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-mystical rounded-lg overflow-hidden">
              <img 
                src={product.image}
                alt={`${product.name} soy candle — ${product.fragrance}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-playfair font-bold text-foreground">
                  {product.name}
                </h1>
                {product.isNew && (
                  <Badge className="bg-primary text-primary-foreground">NEW</Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground italic mb-4">
                {t('inspiredBy')} {product.fragrance}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.round(averageRating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {averageRating > 0 ? `${averageRating.toFixed(1)} ` : ''}({reviewCount} {t('reviews')})
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {totalPrice.pln} PLN
              </div>
              <div className="text-lg text-muted-foreground">
                ~{totalPrice.eur} EUR
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <p className="text-foreground/80 leading-relaxed mb-4">
                {product.description}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.longDescription}
              </p>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">{t('size')}</h3>
              <div className="flex gap-3">
                {product.sizes.map((size, index) => (
                  <Button
                    key={index}
                    variant={selectedSize === index ? "default" : "outline"}
                    onClick={() => setSelectedSize(index)}
                    className="flex-1 py-6 flex flex-col items-center justify-center"
                  >
                    <span className="font-semibold">{size.weight}</span>
                    <span className="text-xs opacity-80">{size.burnTime}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">{t('quantity')}</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <Button 
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t('addToCart')} - {totalPrice.pln} PLN
                </Button>
                
                <Button 
                  size="lg"
                  className="w-full py-6"
                >
                  {t('buyNow')}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={toggleWishlist}
                    className="flex-1"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-current text-primary' : ''}`} />
                    {t('wishlist')}
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    {t('share')}
                  </Button>
                </div>
            </div>

            {/* Mood & Ambiance */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">{t('moodAndAmbiance')}</h3>
              <div className="flex flex-wrap gap-2">
                {product.moodTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-playfair text-xl font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  {t('productDetails')}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('waxType')}:</span>
                    <span className="font-medium">{product.waxType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('wick')}:</span>
                    <span className="font-medium">{product.wick}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('handPoured')}:</span>
                    <span className="font-medium">{product.handPoured ? t('yes') : t('no')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('burnTime')}:</span>
                    <span className="font-medium">{product.sizes[selectedSize].burnTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-playfair text-xl font-semibold mb-4 flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-primary" />
                  {t('naturalIngredients')}
                </h3>
                <ul className="space-y-2 text-sm">
                  {product.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Care Instructions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-playfair text-xl font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  {t('careInstructions')}
                </h3>
                <ul className="space-y-2 text-sm">
                  {product.careInstructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-1.5 flex-shrink-0"></div>
                      {instruction}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Inspiration Notice */}
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center">
                <strong>{t('inspirationNotice')}</strong> {t('fragranceReferences')}
              </p>
            </CardContent>
          </Card>

          {/* Product Reviews */}
          {id && <ProductReviews productId={id} />}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;