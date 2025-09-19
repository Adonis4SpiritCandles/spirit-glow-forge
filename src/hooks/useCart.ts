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
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
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

  // Local cart helpers (fallback when products aren't in DB or for guests)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('local_cart');
      if (saved) setLocalCartItems(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to parse local cart');
    }
  }, []);

  const persistLocalCart = (items: CartItem[]) => {
    setLocalCartItems(items);
    localStorage.setItem('local_cart', JSON.stringify(items));
  };

  const addProductToCart = (product: Product, quantity: number = 1) => {
    // Use product.id as the local cart item id
    const existing = localCartItems.find((i) => i.product_id === product.id);
    let updated: CartItem[];
    if (existing) {
      updated = localCartItems.map((i) =>
        i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      updated = [
        ...localCartItems,
        {
          id: product.id, // local id = product id
          product_id: product.id,
          quantity,
          product,
        },
      ];
    }
    persistLocalCart(updated);
    toast({ title: 'Added to cart', description: 'Item has been added to your cart' });
  };

  const updateQuantityLocal = (localId: string, newQuantity: number) => {
    if (newQuantity <= 0) return removeFromCartLocal(localId);
    const updated = localCartItems.map((i) =>
      i.id === localId ? { ...i, quantity: newQuantity } : i
    );
    persistLocalCart(updated);
  };

  const removeFromCartLocal = (localId: string) => {
    const updated = localCartItems.filter((i) => i.id !== localId);
    persistLocalCart(updated);
  };

  // Update item quantity
  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeFromCart(cartItemId);
      return;
    }

    // Fallback to local cart if this id doesn't exist in DB cart
    const isDbItem = cartItems.some((i) => i.id === cartItemId);
    if (!isDbItem) {
      updateQuantityLocal(cartItemId, newQuantity);
      return;
    }

    // Optimistic update - update local state immediately
    setCartItems(prev => prev.map(item => 
      item.id === cartItemId ? { ...item, quantity: newQuantity } : item
    ));

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', cartItemId);

    if (error) {
      console.error('Error updating quantity:', error);
      // Revert optimistic update on error
      loadCartItems();
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: string) => {
    // Fallback to local cart if this id doesn't exist in DB cart
    const isDbItem = cartItems.some((i) => i.id === cartItemId);
    if (!isDbItem) {
      removeFromCartLocal(cartItemId);
      return;
    }

    // Optimistic update - remove from local state immediately
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      console.error('Error removing from cart:', error);
      // Revert optimistic update on error
      loadCartItems();
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    // Always clear local cart
    persistLocalCart([]);

    if (!user) {
      setCartItems([]);
      return;
    }

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

  // Calculate totals using DB cart if available, otherwise local cart
  const itemsForTotals = cartItems.length > 0 ? cartItems : localCartItems;

  const totalPLN = itemsForTotals.reduce((sum, item) => 
    sum + (item.product.price_pln * item.quantity), 0
  );
  
  const totalEUR = itemsForTotals.reduce((sum, item) => 
    sum + (item.product.price_eur * item.quantity), 0
  );
  
  const itemCount = itemsForTotals.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      setCartItems([]);
    }
  }, [user]);

  return {
    cartItems: cartItems.length > 0 ? cartItems : localCartItems,
    loading,
    addToCart,
    addProductToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalPLN,
    totalEUR,
    itemCount,
    loadCartItems,
  };
};