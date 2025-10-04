import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

export const useReviews = (productId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const { user } = useAuth();

  const loadReviews = async (prodId?: string) => {
    const targetId = prodId || productId;
    if (!targetId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', targetId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } else {
      // Load profile data separately for each review
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, username')
            .eq('user_id', review.user_id)
            .single();
          
          return {
            ...review,
            profiles: profileData || undefined
          };
        })
      );
      
      setReviews(reviewsWithProfiles);
      if (reviewsWithProfiles && reviewsWithProfiles.length > 0) {
        const avg = reviewsWithProfiles.reduce((sum, review) => sum + review.rating, 0) / reviewsWithProfiles.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(0);
      }
    }
    setLoading(false);
  };

  const addReview = async (prodId: string, rating: number, comment: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to leave a review",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: prodId,
        user_id: user.id,
        rating,
        comment: comment || null,
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: "Already reviewed",
          description: "You have already reviewed this product. You can edit your review instead.",
          variant: "destructive",
        });
      } else {
        console.error('Error adding review:', error);
        toast({
          title: "Error",
          description: "Failed to add review",
          variant: "destructive",
        });
      }
      return false;
    } else {
      toast({
        title: "Review added",
        description: "Thank you for your review!",
      });
      await loadReviews(prodId);
      return true;
    }
  };

  const updateReview = async (reviewId: string, rating: number, comment: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment: comment || null,
      })
      .eq('id', reviewId);

    if (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive",
      });
      return false;
    } else {
      toast({
        title: "Review updated",
        description: "Your review has been updated",
      });
      await loadReviews();
      return true;
    }
  };

  const deleteReview = async (reviewId: string) => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
      return false;
    } else {
      toast({
        title: "Review deleted",
        description: "Your review has been deleted",
      });
      await loadReviews();
      return true;
    }
  };

  const getUserReview = () => {
    if (!user) return null;
    return reviews.find(review => review.user_id === user.id);
  };

  useEffect(() => {
    if (productId) {
      loadReviews(productId);

      // Subscribe to real-time changes
      const channel = supabase
        .channel(`reviews_${productId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reviews',
            filter: `product_id=eq.${productId}`
          },
          () => {
            loadReviews(productId);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [productId, user]);

  return {
    reviews,
    loading,
    averageRating,
    reviewCount: reviews.length,
    addReview,
    updateReview,
    deleteReview,
    getUserReview,
    loadReviews,
  };
};
