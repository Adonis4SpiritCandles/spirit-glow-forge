import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPLN, totalEUR, itemCount, loading } = useCart();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-playfair text-2xl font-semibold mb-4">Please Log In</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view your cart
          </p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="font-playfair text-3xl font-semibold mb-4">{t('emptyCart')}</h1>
            <p className="text-muted-foreground mb-8">{t('addSomeCandles')}</p>
            <Button asChild size="lg">
              <Link to="/shop">{t('browseCollection')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="font-playfair text-4xl font-semibold text-center mb-12">
          {t('shoppingCart')} ({itemCount} {t('items')})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="bg-card/80 backdrop-blur-sm border-border/40">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gradient-mystical rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image_url}
                        alt={language === 'en' ? item.product.name_en : item.product.name_pl}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-playfair font-semibold text-lg">
                            {language === 'en' ? item.product.name_en : item.product.name_pl}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('size')}: {item.product.size}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {t('category')}: {t(item.product.category)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-primary text-lg">
                            {item.product.price_pln} PLN
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            (~{item.product.price_eur} EUR)
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="mt-3 text-right">
                        <span className="text-sm text-muted-foreground">
                          {t('subtotal')}: 
                        </span>
                        <span className="font-semibold ml-2">
                          {item.product.price_pln * item.quantity} PLN
                        </span>
                      </div>

                      {/* View Product Link */}
                      <div className="mt-2">
                        <Link
                          to={`/product/${item.product.id}`}
                          className="text-sm text-primary hover:text-primary/80"
                        >
                          {t('viewProduct')} →
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-card/80 backdrop-blur-sm border-border/40 sticky top-4">
              <CardContent className="p-6">
                <h3 className="font-playfair text-xl font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t('subtotal')} ({itemCount} {t('items')})</span>
                    <span>{totalPLN} PLN</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span></span>
                    <span>~{totalEUR} EUR</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Shipping calculated at checkout</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-semibold text-lg mb-6">
                  <span>{t('total')}</span>
                  <div className="text-right">
                    <div className="text-primary">{totalPLN} PLN</div>
                    <div className="text-xs text-muted-foreground">~{totalEUR} EUR</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {t('checkoutNow')}
                  </Button>
                  <Button 
                    asChild
                    variant="outline" 
                    className="w-full"
                  >
                    <Link to="/shop">Continue Shopping</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;