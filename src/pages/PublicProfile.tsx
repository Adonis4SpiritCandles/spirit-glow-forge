import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MessageSquare, Award, Star, Heart, TrendingUp, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import BadgeShowcase from '@/components/gamification/BadgeShowcase';

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('public_profile', true)
        .single();

      if (profileError || !profileData) {
        throw new Error('Profile not found or not public');
      }

      setProfile(profileData);

      // Load user reviews with product details
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          products (
            id,
            name_en,
            name_pl,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setReviews(reviewsData || []);

      // Load comments with likes count
      const { data: commentsData } = await supabase
        .from('profile_comments')
        .select(`
          *,
          commenter:profiles!profile_comments_commenter_id_fkey(
            first_name,
            last_name,
            profile_image_url
          ),
          profile_comment_likes(count)
        `)
        .eq('profile_user_id', userId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      const commentsWithLikes = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { count } = await supabase
            .from('profile_comment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.id);

          const isLiked = user ? await supabase
            .from('profile_comment_likes')
            .select('id')
            .eq('comment_id', comment.id)
            .eq('user_id', user.id)
            .maybeSingle() : { data: null };

          return {
            ...comment,
            likesCount: count || 0,
            isLiked: !!isLiked.data,
          };
        })
      );

      setComments(commentsWithLikes);

      // Load purchased products
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (ordersData && ordersData.length > 0) {
        const { data: orderItemsData } = await supabase
          .from('order_items')
          .select('product_id')
          .in('order_id', ordersData.map(o => o.id));

        if (orderItemsData) {
          const productIds = [...new Set(orderItemsData.map(i => i.product_id))];
          
          const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds)
            .eq('published', true);
          
          setPurchasedProducts(productsData || []);
        }
      }

      // Load wishlist
      const { data: wishlistData } = await supabase
        .from('shared_wishlists')
        .select('items')
        .eq('user_id', userId)
        .maybeSingle();

      if (wishlistData?.items) {
        const items = Array.isArray(wishlistData.items) ? wishlistData.items : [];
        if (items.length > 0) {
          const { data: wishlistProductsData } = await supabase
            .from('products')
            .select('*')
            .in('id', items.map((i: any) => i.id))
            .eq('published', true);
          
          setWishlistProducts(wishlistProductsData || []);
        }
      }

      // Load leaderboard
      const { data: leaderboardData } = await supabase
        .from('loyalty_points')
        .select(`
          points,
          user_id,
          profiles (first_name, last_name, username, profile_image_url)
        `)
        .order('points', { ascending: false })
        .limit(10);

      setLeaderboard(leaderboardData || []);

      // Calculate user rank
      const { data: allUsers } = await supabase
        .from('loyalty_points')
        .select('user_id, points')
        .order('points', { ascending: false });

      const rank = allUsers?.findIndex(u => u.user_id === userId);
      setUserRank(rank !== undefined && rank >= 0 ? rank + 1 : null);

    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast({
        description: language === 'pl' ? 'Zaloguj się, aby polubić komentarze' : 'Please log in to like comments',
      });
      return;
    }

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    try {
      if (comment.isLiked) {
        // Unlike
        await supabase
          .from('profile_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('profile_comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
      }

      loadProfile(); // Refresh
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const submitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      console.log('Submitting comment:', {
        profile_user_id: userId,
        commenter_id: user.id,
        comment: newComment.trim(),
      });

      const { data, error } = await supabase.from('profile_comments').insert({
        profile_user_id: userId,
        commenter_id: user.id,
        comment: newComment.trim(),
      }).select();

      if (error) {
        console.error('Comment insert error:', error);
        throw error;
      }

      console.log('Comment inserted successfully:', data);
      setNewComment('');
      await loadProfile();

      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' 
          ? 'Komentarz został dodany' 
          : 'Comment has been added',
      });
    } catch (error: any) {
      console.error('Submit comment error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{language === 'pl' ? 'Ładowanie profilu...' : 'Loading profile...'}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {language === 'pl' ? 'Profil Nie Znaleziony' : 'Profile Not Found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'pl' 
                ? 'Ten profil nie istnieje lub nie jest publiczny.' 
                : 'This profile does not exist or is not public.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'pl' ? 'Strona Główna' : 'Home'}
                </Button>
              </Link>
              <Link to="/shop">
                <Button>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {language === 'pl' ? 'Sklep' : 'Shop'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image with Logo */}
      <div 
        className="h-80 bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-amber-900/40 relative flex items-center justify-center"
        style={
          profile.cover_image_url ? {
            backgroundImage: `linear-gradient(to right, rgba(120, 53, 15, 0.4), rgba(146, 64, 14, 0.3), rgba(120, 53, 15, 0.4)), url(${profile.cover_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}
        }
      >
        {/* Logo centrale sempre visibile */}
        <div className="absolute inset-0 flex items-start justify-center pt-12 pointer-events-none">
          <img 
            src="/assets/spirit-logo-transparent.png" 
            alt="Spirit Candles" 
            className="h-40 w-auto opacity-90"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))' }}
          />
        </div>
        
        {/* Back button */}
        <Link to="/" className="absolute top-4 left-4 z-10">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'pl' ? 'Powrót' : 'Back'}
          </Button>
        </Link>
      </div>

      <div className="container max-w-4xl mx-auto px-4 -mt-16 pb-12 relative z-10">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={profile.profile_image_url || '/assets/mini-spirit-logo.png'} />
                    <AvatarFallback>
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {profile.first_name} {profile.last_name}
                </h1>
                {profile.username && (
                  <p className="text-muted-foreground mb-4">@{profile.username}</p>
                )}
                {profile.bio && (
                  <p className="text-sm mb-4">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mini Badges */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5" />
              {language === 'pl' ? 'Odznaki' : 'Badges'}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {/* Questi badge verranno caricati dinamicamente */}
              <div className="flex flex-col items-center gap-1 p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer" title="Welcome Badge">
                <Award className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-center">Welcome</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="h-5 w-5" />
                {language === 'pl' ? 'Opinie' : 'Reviews'}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map(review => (
                  <Link to={`/product/${review.products?.id}`} key={review.id}>
                    <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition">
                      {review.products?.image_url && (
                        <img 
                          src={review.products.image_url} 
                          alt={language === 'en' ? review.products.name_en : review.products.name_pl}
                          className="w-20 h-20 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">
                          {language === 'en' ? review.products?.name_en : review.products?.name_pl}
                        </h4>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(review.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchased Products */}
        {purchasedProducts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                {language === 'pl' ? 'Zakupione Produkty' : 'Purchased Products'}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {purchasedProducts.map(product => (
                  <Link to={`/product/${product.id}`} key={product.id}>
                    <Card className="hover:shadow-lg transition overflow-hidden">
                      <img 
                        src={product.image_url} 
                        alt={language === 'en' ? product.name_en : product.name_pl}
                        className="w-full h-40 object-cover"
                      />
                      <CardContent className="p-3">
                        <p className="text-sm font-medium line-clamp-2">
                          {language === 'en' ? product.name_en : product.name_pl}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wishlist */}
        {wishlistProducts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Heart className="h-5 w-5" />
                {language === 'pl' ? 'Lista Życzeń' : 'Wishlist'}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlistProducts.map(product => (
                  <Link to={`/product/${product.id}`} key={product.id}>
                    <Card className="hover:shadow-lg transition overflow-hidden">
                      <img 
                        src={product.image_url} 
                        alt={language === 'en' ? product.name_en : product.name_pl}
                        className="w-full h-40 object-cover"
                      />
                      <CardContent className="p-3">
                        <p className="text-sm font-medium line-clamp-2">
                          {language === 'en' ? product.name_en : product.name_pl}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SpiritPoints Leaderboard */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {language === 'pl' ? 'Tablica Liderów SpiritPoints' : 'SpiritPoints Leaderboard'}
            </h2>
          </CardHeader>
          <CardContent>
            {/* User Points Counter */}
            <div className="mb-6 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'pl' ? 'SpiritPoints Zdobyte' : 'SpiritPoints Earned'}
              </p>
              <p className="text-4xl font-bold text-primary">
                {leaderboard.find(entry => entry.user_id === userId)?.points || 0}
              </p>
              {userRank && (
                <p className="text-sm text-muted-foreground mt-2">
                  {language === 'pl' ? 'Pozycja' : 'Rank'}: #{userRank}
                </p>
              )}
            </div>
            
            {/* Top 10 Leaderboard */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {language === 'pl' ? 'Top 10 Liderów' : 'Top 10 Leaders'}
              </h3>
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.user_id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.user_id === userId ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                  }`}
                >
                  <div className={`text-lg font-bold ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' : 'text-muted-foreground'
                  }`}>
                    #{index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.profiles?.profile_image_url || '/assets/mini-spirit-logo.png'} />
                    <AvatarFallback>
                      {entry.profiles?.first_name?.[0]}{entry.profiles?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {entry.profiles?.first_name} {entry.profiles?.last_name}
                    </p>
                    {entry.profiles?.username && (
                      <p className="text-xs text-muted-foreground">@{entry.profiles.username}</p>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {entry.points} SpiritPoints
                  </Badge>
                </div>
              ))}
            </div>
            {userRank && (
              <p className="text-sm text-center mt-4 text-muted-foreground">
                {language === 'pl' 
                  ? `Twoja pozycja: #${userRank}` 
                  : `Your rank: #${userRank}`}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {language === 'pl' ? 'Komentarze' : 'Comments'}
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Comment */}
            {user && (
              <div className="space-y-2">
                <Textarea
                  placeholder={language === 'pl' 
                    ? 'Napisz komentarz...' 
                    : 'Write a comment...'}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={submitComment} 
                  disabled={!newComment.trim() || submitting}
                  className="w-full sm:w-auto"
                >
                  {submitting 
                    ? (language === 'pl' ? 'Wysyłanie...' : 'Posting...')
                    : (language === 'pl' ? 'Dodaj komentarz' : 'Add Comment')}
                </Button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {language === 'pl' 
                    ? 'Brak komentarzy. Bądź pierwszym!' 
                    : 'No comments yet. Be the first!'}
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.commenter?.profile_image_url || '/assets/mini-spirit-logo.png'} />
                        <AvatarFallback>
                          {comment.commenter?.first_name?.[0]}
                          {comment.commenter?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {comment.commenter?.first_name} {comment.commenter?.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), 'PPp')}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{comment.comment}</p>
                        
                        {/* Like Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleLikeComment(comment.id)}
                          className="flex items-center gap-1 h-auto p-1"
                        >
                          <Heart className={`h-4 w-4 ${comment.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                          <span className="text-xs">{comment.likesCount || 0}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
