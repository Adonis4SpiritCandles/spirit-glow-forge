import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface UserReviewsProps {
  userId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  product_id: string;
  product_name_en: string;
  product_name_pl: string;
  product_image: string;
}

const UserReviews = ({ userId }: UserReviewsProps) => {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [userId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          product_id,
          products (
            name_en,
            name_pl,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedReviews = data?.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        product_id: review.product_id,
        product_name_en: review.products?.name_en || '',
        product_name_pl: review.products?.name_pl || '',
        product_image: review.products?.image_url || '',
      })) || [];

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse p-4 border rounded-lg">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {language === 'pl' 
            ? 'Brak recenzji' 
            : 'No reviews yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
          <Link
            to={`/product/${review.product_id}`}
            className="flex gap-4 group"
          >
            <div className="w-16 h-16 rounded overflow-hidden bg-gradient-mystical flex-shrink-0">
              <img
                src={review.product_image}
                alt={language === 'en' ? review.product_name_en : review.product_name_pl}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                  {language === 'en' ? review.product_name_en : review.product_name_pl}
                </h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(review.created_at), 'PP')}
                </span>
              </div>
              
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-primary text-primary'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              
              {review.comment && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {review.comment}
                </p>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default UserReviews;