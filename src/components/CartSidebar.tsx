import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus, X, Eye } from "lucide-react";
import candleLit from "@/assets/candle-lit.png";

interface CartItem {
  id: string;
  name: string;
  price: { pln: number; eur: number };
  image: string;
  size: string;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  // Mock cart items - will be replaced with real cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Mystic Rose",
      price: { pln: 89, eur: 21 },
      image: candleLit,
      size: "180g",
      quantity: 2,
    },
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(items => items.filter(item => item.id !== id));
    } else {
      setCartItems(items => 
        items.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price.pln * item.quantity), 0);
  const totalEur = cartItems.reduce((sum, item) => sum + (item.price.eur * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
            {itemCount > 0 && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                {itemCount}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col text-center py-8">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-playfair text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Add some candles to get started</p>
            <Button asChild>
              <Link to="/shop" onClick={onClose}>
                Browse Collection
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
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-playfair font-semibold text-sm truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Size: {item.size}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="p-1 h-auto text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-semibold text-primary">
                              {item.price.pln} PLN
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              (~{item.price.eur} EUR)
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
                            <Link to={`/product/${item.id}`} onClick={onClose}>
                              <Eye className="h-3 w-3 mr-1" />
                              View Product
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
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{total} PLN</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span></span>
                  <span>~{totalEur} EUR</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <div className="text-right">
                  <div className="text-primary">{total} PLN</div>
                  <div className="text-xs text-muted-foreground">~{totalEur} EUR</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Checkout Now
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full"
                  onClick={onClose}
                >
                  <Link to="/cart">
                    View Full Cart
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