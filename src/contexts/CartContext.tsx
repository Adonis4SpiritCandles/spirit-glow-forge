import { createContext, useContext, ReactNode } from 'react';
import { useCart } from '@/hooks/useCart';

interface CartContextType {
  cartItems: any[];
  loading: boolean;
  itemCount: number;
  totalPLN: number;
  totalEUR: number;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  addProductToCart: (product: any, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const cart = useCart();

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
