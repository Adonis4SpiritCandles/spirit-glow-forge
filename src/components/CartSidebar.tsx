import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus, X, Eye } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const { cartItems, updateQuantity, removeFromCart, totalPLN, totalEUR, itemCount, loading } = useCartContext();
  const { t, language } = useLanguage();
  const { user } = useAuth();


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('shoppingCart')}
            {itemCount > 0 && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                {itemCount}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {!user ? (
          <div className="flex-1 flex items-center justify-center flex-col text-center py-8">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-playfair text-xl font-semibold mb-2">Please Log In</h3>
            <p className="text-muted-foreground mb-6">You need to be logged in to view your cart</p>
            <Button asChild>
              <Link to="/auth" onClick={onClose}>
                {t('login')}
              </Link>
            </Button>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col text-center py-8">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-playfair text-xl font-semibold mb-2">{t('emptyCart')}</h3>
            <p className="text-muted-foreground mb-6">{t('addSomeCandles')}</p>
            <Button asChild>
              <Link to="/shop" onClick={onClose}>
                {t('browseCollection')}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-card rounded-lg p-4 border border-border/40">
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 bg-gradient-mystical rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.product.image_url}
                          alt={language === 'en' ? item.product.name_en : item.product.name_pl}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-playfair font-semibold text-sm truncate">
                              {language === 'en' ? item.product.name_en : item.product.name_pl}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {t('size')}: {item.product.size}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 h-auto text-muted-foreground hover:text-destructive"
                            aria-label={t('removed')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-semibold text-primary">
                              {item.product.price_pln * item.quantity} PLN
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              (~{item.product.price_eur * item.quantity} EUR)
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* View Product Link */}
                        <div className="mt-2">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                          >
                            <Link to={`/product/${item.product.id}`} onClick={onClose}>
                              <Eye className="h-3 w-3 mr-1" />
                              {t('viewProduct')}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('subtotal')} ({itemCount} {t('items')})</span>
                  <span>{totalPLN} PLN</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span></span>
                  <span>~{totalEUR} EUR</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>{t('total')}</span>
                <div className="text-right">
                  <div className="text-primary">{totalPLN} PLN</div>
                  <div className="text-xs text-muted-foreground">~{totalEUR} EUR</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                  onClick={onClose}
                >
                  <Link to="/checkout">{t('checkoutNow')}</Link>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full"
                  onClick={onClose}
                >
                  <Link to="/cart">
                    {t('viewFullCart')}
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;