import { supabase } from '@/integrations/supabase/client';

// Helper function to update existing components to use real product data
export const fetchProducts = async (category?: string) => {
  let query = supabase.from('products').select('*');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data || [];
};