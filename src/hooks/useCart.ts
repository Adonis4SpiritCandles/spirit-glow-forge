import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name_en: string;
  name_pl: string;
  price_pln: number;
  price_eur: number;
  image_url: string;
  size: string;
  category: string;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart items from database
  const loadCartItems = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:products(*)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading cart items:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        product_id: productId,
        quantity,
      }, {
        onConflict: 'user_id,product_id',
      });

    if (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
      loadCartItems();
    }
  };

  // Update item quantity
  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeFromCart(cartItemId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', cartItemId);

    if (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } else {
      loadCartItems();
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } else {
      loadCartItems();
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error", 
        description: "Failed to clear cart",
        variant: "destructive",
      });
    } else {
      setCartItems([]);
    }
  };

  // Calculate totals
  const totalPLN = cartItems.reduce((sum, item) => 
    sum + (item.product.price_pln * item.quantity), 0
  );
  
  const totalEUR = cartItems.reduce((sum, item) => 
    sum + (item.product.price_eur * item.quantity), 0
  );
  
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      setCartItems([]);
    }
  }, [user]);

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalPLN,
    totalEUR,
    itemCount,
    loadCartItems,
  };
};