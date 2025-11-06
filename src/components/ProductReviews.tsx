import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, Edit, Trash2 } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { reviews, averageRating, reviewCount, addReview, updateReview, deleteReview, getUserReview } = useReviews(productId);
  const { user } = useAuth();
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const userReview = getUserReview();

  const handleSubmit = async () => {
    if (!user) return;

    const success = isEditing && editingReviewId
      ? await updateReview(editingReviewId, rating, comment)
      : await addReview(productId, rating, comment);

    if (success) {
      setRating(5);
      setComment('');
      setIsEditing(false);
      setEditingReviewId(null);
    }
  };

  const handleEdit = (review: any) => {
    setRating(review.rating);
    setComment(review.comment || '');
    setIsEditing(true);
    setEditingReviewId(review.id);
  };

  const handleCancelEdit = () => {
    setRating(5);
    setComment('');
    setIsEditing(false);
    setEditingReviewId(null);
  };

  const renderStars = (value: number, interactive: boolean = false, size: string = 'w-5 h-5') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= value ? 'fill-primary text-primary' : 'text-muted-foreground'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={interactive ? () => setRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 mt-12">
      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">{averageRating.toFixed(1)}</div>
              <div className="flex mb-1">{renderStars(Math.round(averageRating))}</div>
              <div className="text-sm text-muted-foreground">
                {reviewCount} {t('reviews')}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-playfair text-2xl font-bold mb-4">{t('customerReviews')}</h3>
              <p className="text-muted-foreground">
                {reviewCount === 0
                  ? t('noReviewsYet')
                  : t('basedOnReviews').replace('{count}', reviewCount.toString())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review */}
      {user && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-playfair text-xl font-semibold mb-4">
              {isEditing ? t('editReview') : t('writeReview')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('yourRating')}</label>
                {renderStars(rating, true, 'w-8 h-8')}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('yourReview')}</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('shareYourThoughts')}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit}>
                  {isEditing ? t('updateReview') : t('submitReview')}
                </Button>
                {isEditing && (
                  <Button variant="outline" onClick={handleCancelEdit}>
                    {t('cancel')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-playfair text-2xl font-bold">{t('allReviews')}</h3>
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">{t('noReviewsYet')}</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.profiles?.profile_image_url || '/assets/mini-spirit-logo.png'} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(review.profiles?.first_name?.[0] || review.profiles?.username?.[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        {review.profiles?.user_id && review.profiles?.public_profile ? (
                          <Link to={`/profile/${review.profiles.user_id}`} className="hover:text-primary transition-colors">
                            <h4 className="font-semibold">
                              {review.profiles?.first_name && review.profiles?.last_name
                                ? `${review.profiles.first_name} ${review.profiles.last_name}`
                                : review.profiles?.username || t('anonymous')}
                            </h4>
                          </Link>
                        ) : (
                          <h4 className="font-semibold">
                            {review.profiles?.first_name && review.profiles?.last_name
                              ? `${review.profiles.first_name} ${review.profiles.last_name}`
                              : review.profiles?.username || t('anonymous')}
                          </h4>
                        )}
                        
                        {review.profiles?.username && (
                          review.profiles?.user_id && review.profiles?.public_profile ? (
                            <Link to={`/profile/${review.profiles.user_id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                              @{review.profiles.username}
                            </Link>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              @{review.profiles.username}
                            </p>
                          )
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating, false, 'w-4 h-4')}
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {user && review.user_id === user.id && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(review)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReview(review.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-foreground/80 mt-2">{review.comment}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
