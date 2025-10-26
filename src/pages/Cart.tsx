import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Minus, Plus, X, ArrowLeft, Eye } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPLN, totalEUR, itemCount, loading, clearCart } = useCart();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8">
        <Card className="max-w-md mx-auto text-center p-8">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="font-playfair text-2xl mb-4">{t('pleaseLogIn')}</CardTitle>
          <CardDescription className="mb-6">
            {t('needLoginCart')}
          </CardDescription>
          <Button asChild>
            <Link to="/auth">{t('login')}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="ghost" size="sm">
              <Link to="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('continueShopping')}
              </Link>
            </Button>
          </div>
          
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <CardTitle className="font-playfair text-3xl mb-4">{t('emptyCart')}</CardTitle>
              <CardDescription className="text-lg mb-8">
                {t('addSomeCandles')}
              </CardDescription>
              <Button asChild size="lg">
                <Link to="/shop">
                  {t('browseCollection')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('continueShopping')}
              </Link>
            </Button>
            <div>
              <h1 className="font-playfair text-3xl font-bold text-foreground">
                {t('shoppingCart')}
              </h1>
              <p className="text-muted-foreground">
                {itemCount} {t('items')} in your cart
              </p>
            </div>
          </div>
          
          {cartItems.length > 0 && (
            <Button variant="outline" onClick={clearCart}>
              {t('clearCart')}
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 bg-gradient-mystical rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.product.image_url}
                      alt={language === 'en' ? item.product.name_en : item.product.name_pl}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-playfair font-semibold text-lg">
                          {language === 'en' ? item.product.name_en : item.product.name_pl}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.product.category}
                        </p>
                        {item.product.size && (
                          <p className="text-sm text-muted-foreground">
                            {t('size')}: {item.product.size}
                          </p>
                        )}
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

                    <div className="flex justify-between items-center">
                      {/* Price */}
                      <div>
                        <div className="font-semibold text-primary text-lg">
                          {(item.product.price_pln * item.quantity).toFixed(2)} PLN
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ~{(item.product.price_eur * item.quantity).toFixed(2)} EUR
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Number(item.product.price_pln).toFixed(2)} PLN each
                        </div>
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

                    {/* View Product Link */}
                    <div className="mt-3">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-sm text-primary hover:text-primary/80"
                      >
                        <Link to={`/product/${item.product.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          {t('viewProduct')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="font-playfair">{t('orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t('subtotal')} ({itemCount} {t('items')})</span>
                    <span>{Number(totalPLN).toFixed(2)} PLN</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span></span>
                    <span>~{Number(totalEUR).toFixed(2)} EUR</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>{t('shipping')}</span>
                    <span className="text-success">{t('freeShipping')}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>{t('total')}</span>
                  <div className="text-right">
                    <div className="text-primary">{Number(totalPLN).toFixed(2)} PLN</div>
                    <div className="text-sm text-muted-foreground">~{Number(totalEUR).toFixed(2)} EUR</div>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                <Button 
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  <Link to="/checkout">{t('checkoutNow')}</Link>
                </Button>
                  <Button 
                    asChild
                    variant="outline" 
                    className="w-full"
                  >
                    <Link to="/shop">
                      {t('continueShopping')}
                    </Link>
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