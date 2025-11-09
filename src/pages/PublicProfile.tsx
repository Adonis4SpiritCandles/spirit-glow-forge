import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MessageSquare, Award, Star, Heart, TrendingUp, ShoppingBag, Settings, MessageCircle, Trash2, Pencil, Send, Smile, Image as ImageIcon, Gift, X, Users, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import BadgeShowcase from '@/components/gamification/BadgeShowcase';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';
import EmojiPicker from 'emoji-picker-react';
import GifPicker from '@/components/profile/GifPicker';
import { Progress } from '@/components/ui/progress';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface CommentType {
  id: string;
  comment: string;
  commenter_id: string;
  created_at: string;
  commenter_profile?: any;
  replies?: CommentType[];
  like_count?: number;
  average_rating?: number;
  rating_count?: number;
  user_liked?: boolean;
}

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [userRole, setUserRole] = useState<string>('user');
  const [commentsPage, setCommentsPage] = useState(1);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState<string | null>(null);
  const [spiritPoints, setSpiritPoints] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const COMMENTS_PER_PAGE = 10;

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadFollowData();
    }
  }, [userId, commentsPage, user?.id]);

  // Load user role
  useEffect(() => {
    if (user) {
      const loadUserRole = async () => {
        const { data } = await supabase
          .rpc('has_role', { 
            _user_id: user.id, 
            _role: 'admin' 
          });
        if (data === true) {
          setUserRole('admin');
        }
      };
      loadUserRole();
    }
  }, [user]);

  // Real-time subscription for comments with proper replies handling
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profile_comments_realtime_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_comments',
          filter: `profile_user_id=eq.${userId}`,
        },
        async (payload) => {
          const newComment: any = payload.new;
          
          // Load commenter profile
          const { data: commenterProfile } = await supabase
            .from('public_profile_directory')
            .select('*')
            .eq('user_id', newComment.commenter_id)
            .single();
          
          newComment.commenter_profile = commenterProfile || {
            profile_image_url: '/assets/mini-spirit-logo.png',
            first_name: 'User',
            last_name: '',
          };
          newComment.replies = [];
          newComment.like_count = 0;
          newComment.average_rating = 0;
          newComment.rating_count = 0;
          
          if (!newComment.parent_comment_id) {
            // Main comment
            setComments(prev => [newComment, ...prev]);
          } else {
            // Reply - add to parent's replies
            setComments(prev => prev.map(c => {
              if (c.id === newComment.parent_comment_id) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newComment]
                };
              }
              return c;
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profile_comments',
        },
        (payload) => {
          const updatedComment: any = payload.new;
          setComments(prev => prev.map(c => {
            if (c.id === updatedComment.id) {
              return { ...c, comment: updatedComment.comment, updated_at: updatedComment.updated_at };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map(r => 
                  r.id === updatedComment.id 
                    ? { ...r, comment: updatedComment.comment, updated_at: updatedComment.updated_at }
                    : r
                )
              };
            }
            return c;
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'profile_comments',
        },
        (payload) => {
          const deletedId = payload.old.id;
          setComments(prev => prev.filter(c => {
            if (c.id === deletedId) return false;
            if (c.replies) {
              c.replies = c.replies.filter(r => r.id !== deletedId);
            }
            return true;
          }));
        }
      )
      .subscribe();

    // Real-time for likes - optimized to update only counts
    const likesChannel = supabase
      .channel(`comment_likes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_comment_likes',
        },
        async (payload) => {
          const { comment_id } = payload.new as any;
          // Update like count for this comment
          const { data: likeData } = await supabase
            .from('profile_comment_likes')
            .select('id')
            .eq('comment_id', comment_id);
          
          setComments(prev => prev.map(c => {
            if (c.id === comment_id) {
              return { ...c, like_count: (likeData?.length || 0), user_liked: true };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map(r => 
                  r.id === comment_id 
                    ? { ...r, like_count: (likeData?.length || 0), user_liked: true }
                    : r
                )
              };
            }
            return c;
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'profile_comment_likes',
        },
        async (payload) => {
          const { comment_id } = payload.old as any;
          // Update like count for this comment
          const { data: likeData } = await supabase
            .from('profile_comment_likes')
            .select('id')
            .eq('comment_id', comment_id);
          
          setComments(prev => prev.map(c => {
            if (c.id === comment_id) {
              return { ...c, like_count: (likeData?.length || 0), user_liked: false };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map(r => 
                  r.id === comment_id 
                    ? { ...r, like_count: (likeData?.length || 0), user_liked: false }
                    : r
                )
              };
            }
            return c;
          }));
        }
      )
      .subscribe();

    // Real-time for ratings
    const ratingsChannel = supabase
      .channel(`comment_ratings_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_comment_ratings',
        },
        async (payload) => {
          const ratingData = payload.new || payload.old;
          if (!ratingData) return;
          
          const { comment_id } = ratingData as any;
          
          // Recalculate ratings for this comment
          const { data: ratings } = await supabase
            .from('profile_comment_ratings')
            .select('rating')
            .eq('comment_id', comment_id);
          
          if (ratings && ratings.length > 0) {
            const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
            
            setComments(prev => prev.map(c => {
              if (c.id === comment_id) {
                return { ...c, average_rating: avgRating, rating_count: ratings.length };
              }
              if (c.replies) {
                return {
                  ...c,
                  replies: c.replies.map(r => 
                    r.id === comment_id 
                      ? { ...r, average_rating: avgRating, rating_count: ratings.length }
                      : r
                  )
                };
              }
              return c;
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(ratingsChannel);
    };
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Load profile from public_profile_directory
      const { data: profileData, error: profileError } = await supabase
        .from('public_profile_directory')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      if (!profileData.public_profile && (!user || user.id !== userId)) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Get full profile details for the owner
      if (user && user.id === userId) {
        const { data: fullProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        setProfile({ ...profileData, ...fullProfile });
      } else {
        setProfile(profileData);
      }

      // Load spirit points
      const { data: loyaltyData } = await supabase
        .from('loyalty_points')
        .select('lifetime_points')
        .eq('user_id', userId)
        .single();
      
      setSpiritPoints(loyaltyData?.lifetime_points || 0);

      // Load comments with profiles
      const { data: commentsData } = await supabase
        .from('profile_comments')
        .select(`
          *,
          profile_comment_likes(count),
          profile_comment_ratings(rating)
        `)
        .eq('profile_user_id', userId)
        .is('parent_comment_id', null)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .range((commentsPage - 1) * COMMENTS_PER_PAGE, commentsPage * COMMENTS_PER_PAGE - 1);

      if (commentsData) {
        // Batch load all commenter profiles
        const commenterIds = commentsData.map(c => c.commenter_id);
        const { data: profiles } = await supabase
          .from('public_profile_directory')
          .select('*')
          .in('user_id', commenterIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        // Load replies for each comment
        for (const comment of commentsData) {
          const { data: repliesData } = await supabase
            .from('profile_comments')
            .select(`
              *,
              profile_comment_likes(count),
              profile_comment_ratings(rating)
            `)
            .eq('parent_comment_id', comment.id)
            .eq('is_visible', true)
            .order('created_at', { ascending: true });

          if (repliesData) {
            // Load reply commenter profiles
            const replyCommenterIds = repliesData.map(r => r.commenter_id);
            const { data: replyProfiles } = await supabase
              .from('public_profile_directory')
              .select('*')
              .in('user_id', replyCommenterIds);

            const replyProfileMap = new Map(replyProfiles?.map(p => [p.user_id, p]) || []);

            (comment as any).replies = repliesData.map((r: any) => ({
              ...r,
              commenter_profile: replyProfileMap.get(r.commenter_id) || {
                profile_image_url: '/assets/mini-spirit-logo.png',
                first_name: 'User',
                last_name: '',
              },
              like_count: r.profile_comment_likes?.[0]?.count || 0,
              average_rating: r.average_rating || 0,
              rating_count: r.rating_count || 0,
            }));
          }

          (comment as any).commenter_profile = profileMap.get(comment.commenter_id) || {
            profile_image_url: '/assets/mini-spirit-logo.png',
            first_name: 'User',
            last_name: '',
          };
          (comment as any).like_count = comment.profile_comment_likes?.[0]?.count || 0;
        }

        setComments(commentsData as any);
      }

      // Load reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*, products(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      setReviews(reviewsData || []);

      // Load purchased products
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id,
          order_items(
            product_id,
            products(*)
          )
        `)
        .eq('user_id', userId)
        .not('status', 'eq', 'pending');

      const uniqueProducts = new Map();
      ordersData?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          if (item.products && !uniqueProducts.has(item.products.id)) {
            uniqueProducts.set(item.products.id, item.products);
          }
        });
      });
      setPurchasedProducts(Array.from(uniqueProducts.values()).slice(0, 8));

      // Load wishlist
      const { data: wishlistData } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(8);

      setWishlistProducts(wishlistData?.map((w: any) => w.products).filter(Boolean) || []);

      // Load leaderboard
      const { data: leaderboardData } = await supabase
        .from('loyalty_points')
        .select(`
          *,
          profiles(first_name, last_name, username, profile_image_url, public_profile, user_id)
        `)
        .order('lifetime_points', { ascending: false })
        .limit(10);

      const publicLeaderboard = leaderboardData?.filter((entry: any) => entry.profiles?.public_profile) || [];
      setLeaderboard(publicLeaderboard);

      const rank = publicLeaderboard.findIndex((entry: any) => entry.user_id === userId) + 1;
      setUserRank(rank > 0 ? rank : null);

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFollowData = async () => {
    if (!userId) return;

    // Check if current user follows this profile
    if (user?.id && user.id !== userId) {
      const { data: followData } = await supabase
        .from('profile_follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();
      
      setIsFollowing(!!followData);
    }

    // Get followers count
    const { count: followersCount } = await supabase
      .from('profile_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    
    setFollowersCount(followersCount || 0);

    // Get following count
    const { count: followingCount } = await supabase
      .from('profile_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    
    setFollowingCount(followingCount || 0);
  };

  const handleFollowToggle = async () => {
    if (!user?.id || !userId) {
      toast({
        title: t('error'),
        description: t('pleaseLogin'),
        variant: 'destructive',
      });
      return;
    }

    if (user.id === userId) {
      toast({
        title: t('error'),
        description: language === 'pl' ? 'Nie możesz obserwować siebie' : 'You cannot follow yourself',
        variant: 'destructive',
      });
      return;
    }

    if (isFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('profile_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        toast({
          title: t('error'),
          description: t('error'),
          variant: 'destructive',
        });
        return;
      }

      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
      toast({
        title: t('success'),
        description: language === 'pl' ? 'Przestałeś obserwować' : 'Unfollowed successfully',
      });
    } else {
      // Follow
      const { error } = await supabase
        .from('profile_follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) {
        toast({
          title: t('error'),
          description: t('error'),
          variant: 'destructive',
        });
        return;
      }

      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      toast({
        title: t('success'),
        description: language === 'pl' ? 'Obserwujesz teraz tego użytkownika' : 'Following successfully',
      });
    }
  };

  const loadFollowersList = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('profile_follows')
      .select(`
        follower_id,
        profiles!profile_follows_follower_id_fkey (
          user_id,
          username,
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .eq('following_id', userId);

    if (error) {
      console.error('Error loading followers:', error);
      return;
    }

    setFollowersList(data?.map(f => f.profiles).filter(Boolean) || []);
  };

  const loadFollowingList = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('profile_follows')
      .select(`
        following_id,
        profiles!profile_follows_following_id_fkey (
          user_id,
          username,
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .eq('follower_id', userId);

    if (error) {
      console.error('Error loading following:', error);
      return;
    }

    setFollowingList(data?.map(f => f.profiles).filter(Boolean) || []);
  };

  const submitComment = async () => {
    if (!user) {
      toast({
        title: t('error'),
        description: t('pleaseLogin'),
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profile_comments')
        .insert({
          profile_user_id: userId,
          commenter_id: user.id,
          comment: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      toast({
        title: t('success'),
        description: t('commentAdded'),
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: t('error'),
        description: t('failedToAddComment'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (parentCommentId: string) => {
    if (!user) {
      toast({
        title: t('error'),
        description: t('pleaseLogin'),
        variant: 'destructive',
      });
      return;
    }

    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profile_comments')
        .insert({
          profile_user_id: userId,
          commenter_id: user.id,
          comment: replyText.trim(),
          parent_comment_id: parentCommentId,
        });

      if (error) throw error;

      setReplyText('');
      setReplyingTo(null);
      toast({
        title: t('success'),
        description: t('replyAdded'),
      });
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        title: t('error'),
        description: t('failedToAddReply'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;

    try {
      const { error } = await supabase
        .from('profile_comments')
        .update({ comment: editCommentText.trim(), updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .eq('commenter_id', user?.id);

      if (error) throw error;

      setEditingCommentId(null);
      setEditCommentText('');
      toast({
        title: t('success'),
        description: t('commentUpdated'),
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: t('error'),
        description: t('failedToUpdateComment'),
        variant: 'destructive',
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('profile_comments')
        .delete()
        .eq('id', commentId)
        .eq('commenter_id', user?.id);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('commentDeleted'),
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteComment'),
        variant: 'destructive',
      });
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) {
      toast({
        title: t('error'),
        description: t('pleaseLogin'),
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('profile_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('profile_comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const rateComment = async (commentId: string, rating: number) => {
    if (!user) {
      toast({
        title: t('error'),
        description: t('pleaseLogin'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('profile_comment_ratings')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase
          .from('profile_comment_ratings')
          .update({ rating })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('profile_comment_ratings')
          .insert({ comment_id: commentId, user_id: user.id, rating });
      }
    } catch (error) {
      console.error('Error rating comment:', error);
    }
  };

  const onEmojiClick = (emojiData: any, inputFor: 'comment' | 'reply' | 'edit') => {
    if (inputFor === 'comment') {
      setNewComment(prev => prev + emojiData.emoji);
    } else if (inputFor === 'reply') {
      setReplyText(prev => prev + emojiData.emoji);
    } else if (inputFor === 'edit') {
      setEditCommentText(prev => prev + emojiData.emoji);
    }
    setShowEmojiPicker(null);
  };

  const onGifSelect = (gifUrl: string, inputFor: 'comment' | 'reply') => {
    if (inputFor === 'comment') {
      setNewComment(prev => prev + `\n![gif](${gifUrl})`);
    } else if (inputFor === 'reply') {
      setReplyText(prev => prev + `\n![gif](${gifUrl})`);
    }
    setShowGifPicker(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile || (!profile.public_profile && (!user || user.id !== userId))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">{t('profileNotAvailable')}</h2>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{t('profileIsPrivate')}</p>
            {user && user.id === userId && (
              <Button asChild>
                <Link to="/dashboard?tab=social">{t('createYourProfile')}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div 
        className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-secondary/20"
        style={{
          backgroundImage: !profile.cover_image_url ? 'url(/assets/spirit-logo-transparent.png)' : undefined,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        {profile.cover_image_url && (
          <img
            src={profile.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        {isOwnProfile && !profile.cover_image_url && (
          <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2">
            <Button size="sm" variant="secondary" className="text-xs md:text-sm" asChild>
              <label className="cursor-pointer">
                {t('uploadCover')}
                <ProfileImageUpload
                  userId={userId!}
                  currentImageUrl={profile.cover_image_url}
                  onUploadComplete={() => loadProfile()}
                  imageType="cover"
                />
              </label>
            </Button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        {/* Edit Profile Button - Mobile Only (Top Left) */}
        {isOwnProfile && (
          <div className="md:hidden mb-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard?tab=social">
                <Settings className="mr-2 h-3 w-3" />
                <span className="text-xs">{t('editProfile')}</span>
              </Link>
            </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 -mt-12 md:-mt-20 mb-6 md:mb-8">
          <div className="relative">
            <Avatar className="h-20 w-20 md:h-32 md:w-32 border-4 border-background shadow-xl">
              <AvatarImage src={profile.profile_image_url || '/assets/mini-spirit-logo.png'} />
              <AvatarFallback className="text-2xl md:text-4xl">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && !profile.profile_image_url && (
              <ProfileImageUpload
                userId={userId!}
                currentImageUrl={profile.profile_image_url}
                onUploadComplete={() => loadProfile()}
                imageType="profile"
              />
            )}
          </div>

          <div className="flex-1 mt-0 md:mt-20 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row items-center md:items-center md:justify-between gap-2">
              <div className="flex flex-col items-center md:items-start">
                <h1 className="text-xl md:text-3xl font-bold truncate max-w-[280px] md:max-w-none">
                  {profile.first_name} {profile.last_name}
                </h1>
                {profile.username && (
                  <p className="text-xs md:text-base text-muted-foreground truncate max-w-[280px] md:max-w-none">
                    @{profile.username}
                  </p>
                )}
              </div>
              {isOwnProfile && (
                <Button variant="outline" asChild className="hidden md:flex">
                  <Link to="/dashboard?tab=social">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('editProfile')}
                  </Link>
                </Button>
              )}
            </div>
            
            {/* Follow Stats & Button */}
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-center md:justify-start mt-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    loadFollowersList();
                    setShowFollowersModal(true);
                  }}
                  className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-3"
                >
                  <span className="text-base md:text-lg font-bold">{followersCount}</span>
                  <span className="text-xs text-muted-foreground">{t('followers')}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    loadFollowingList();
                    setShowFollowingModal(true);
                  }}
                  className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-3"
                >
                  <span className="text-base md:text-lg font-bold">{followingCount}</span>
                  <span className="text-xs text-muted-foreground">{t('following')}</span>
                </Button>
              </div>
              
              {/* Follow button sotto contatori - solo mobile */}
              {!isOwnProfile && user?.id && (
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  className="md:hidden w-full max-w-[200px]"
                >
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  {isFollowing ? t('unfollow') : t('follow')}
                </Button>
              )}
              
              {/* Follow button a destra - solo desktop */}
              {!isOwnProfile && user?.id && (
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  className="hidden md:inline-flex ml-auto"
                >
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  {isFollowing ? t('unfollow') : t('follow')}
                </Button>
              )}
            </div>
            
            {profile.bio && (
              <p className="mt-4 text-muted-foreground">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* MOBILE: Riordino completo */}
        <div className="lg:hidden space-y-8">
          {/* 1. Badges */}
          <div className="order-1">
            <BadgeShowcase userId={userId || ''} />
          </div>

          {/* 2. Spirit Points Leaderboard (placeholder - da implementare con Your Points) */}
          <div className="order-2">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  {t('spiritPointsLeaderboard')}
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                  {language === 'pl' ? 'Leaderboard wkrótce dostępny' : 'Leaderboard coming soon'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 3. Spirit Posts */}
          <div className="order-3">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  {t('spiritPosts')}
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <div className="space-y-3 p-4 bg-accent/5 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.user_metadata?.profile_image_url || '/assets/mini-spirit-logo.png'} />
                        <AvatarFallback>
                          {user?.user_metadata?.first_name?.[0] || user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={t('writeComment')}
                          className="min-h-[80px] resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowEmojiPicker(showEmojiPicker === 'comment' ? null : 'comment');
                                  setShowGifPicker(null);
                                }}
                              >
                                <Smile className="h-4 w-4" />
                              </Button>
                              {showEmojiPicker === 'comment' && (
                                 <div className="absolute z-50 top-full mt-2">
                                  <EmojiPicker onEmojiClick={(emojiData) => onEmojiClick(emojiData, 'comment')} />
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowGifPicker(showGifPicker === 'comment' ? null : 'comment');
                                  setShowEmojiPicker(null);
                                }}
                              >
                                <Gift className="h-4 w-4" />
                              </Button>
                              {showGifPicker === 'comment' && (
                                <div className="absolute z-50 top-full mt-2">
                                  <GifPicker onSelectGif={(gifUrl) => onGifSelect(gifUrl, 'comment')} />
                                </div>
                              )}
                            </div>
                          </div>
                          <Button onClick={submitComment} disabled={submitting || !newComment.trim()}>
                            <Send className="h-4 w-4 mr-2" />
                            {t('post')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 4. Reviews */}
          {reviews.length > 0 && (
            <div className="order-4">{/* Reviews content */}</div>
          )}

          {/* 5. Purchased Products */}
          {purchasedProducts.length > 0 && (
            <div className="order-5">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    {t('purchasedProducts')} ({purchasedProducts.length})
                  </h2>
                </CardHeader>
                <CardContent>
                  {purchasedProducts.length > 2 ? (
                    <Carousel opts={{ align: "start", loop: true }} className="w-full">
                      <CarouselContent>
                        {purchasedProducts.map((product: any) => (
                          <CarouselItem key={product.id} className="basis-1/2">
                            <Link to={`/product/${product.id}`} className="group cursor-pointer block">
                              <div className="aspect-square relative overflow-hidden rounded-lg border">
                                <img
                                  src={product.image_url}
                                  alt={product.name_en}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <p className="text-xs mt-2 text-center truncate group-hover:text-primary transition-colors">
                                {language === 'en' ? product.name_en : product.name_pl}
                              </p>
                            </Link>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="-left-2" />
                      <CarouselNext className="-right-2" />
                    </Carousel>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {purchasedProducts.map((product: any) => (
                        <Link key={product.id} to={`/product/${product.id}`} className="group cursor-pointer">
                          <div className="aspect-square relative overflow-hidden rounded-lg border">
                            <img
                              src={product.image_url}
                              alt={product.name_en}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-xs mt-2 text-center truncate group-hover:text-primary transition-colors">
                            {language === 'en' ? product.name_en : product.name_pl}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* 6. Wishlist */}
          {wishlistProducts.length > 0 && (
            <div className="order-6">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Heart className="h-6 w-6 text-primary" />
                    {t('wishlist')} ({wishlistProducts.length})
                  </h2>
                </CardHeader>
                <CardContent>
                  {wishlistProducts.length > 2 ? (
                    <Carousel opts={{ align: "start", loop: true }} className="w-full">
                      <CarouselContent>
                        {wishlistProducts.map((product: any) => (
                          <CarouselItem key={product.id} className="basis-1/2">
                            <Link to={`/product/${product.id}`} className="group cursor-pointer block">
                              <div className="aspect-square relative overflow-hidden rounded-lg border">
                                <img
                                  src={product.image_url}
                                  alt={product.name_en}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <p className="text-xs mt-2 text-center truncate group-hover:text-primary transition-colors">
                                {language === 'en' ? product.name_en : product.name_pl}
                              </p>
                            </Link>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="-left-2" />
                      <CarouselNext className="-right-2" />
                    </Carousel>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {wishlistProducts.map((product: any) => (
                        <Link key={product.id} to={`/product/${product.id}`} className="group cursor-pointer">
                          <div className="aspect-square relative overflow-hidden rounded-lg border">
                            <img
                              src={product.image_url}
                              alt={product.name_en}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-xs mt-2 text-center truncate group-hover:text-primary transition-colors">
                            {language === 'en' ? product.name_en : product.name_pl}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* DESKTOP/TABLET: Grid con nuova struttura */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {/* COLONNA SINISTRA (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Spirit Points Leaderboard */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  {t('spiritPointsLeaderboard')}
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                  {language === 'pl' ? 'Leaderboard wkrótce dostępny' : 'Leaderboard coming soon'}
                </p>
              </CardContent>
            </Card>

            {/* 2. Purchased Products Carousel */}
            {purchasedProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    {t('purchasedProducts')} ({purchasedProducts.length})
                  </h2>
                </CardHeader>
                <CardContent>
                  {purchasedProducts.length > 2 ? (
                    <Carousel opts={{ align: "start", loop: true }} className="w-full">
                      <CarouselContent>
                        {purchasedProducts.map((product: any) => (
                          <CarouselItem key={product.id} className="basis-1/3">
                            <Link to={`/product/${product.id}`} className="group cursor-pointer block">
                              <div className="aspect-square relative overflow-hidden rounded-lg border">
                                <img
                                  src={product.image_url}
                                  alt={product.name_en}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <p className="text-xs mt-2 text-center truncate group-hover:text-primary transition-colors">
                                {language === 'en' ? product.name_en : product.name_pl}
                              </p>
                            </Link>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {purchasedProducts.map((product: any) => (
                        <Link key={product.id} to={`/product/${product.id}`} className="group cursor-pointer">
                          <div className="aspect-square relative overflow-hidden rounded-lg border">
                            <img
                              src={product.image_url}
                              alt={product.name_en}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-xs mt-2 text-center truncate group-hover:text-primary transition-colors">
                            {language === 'en' ? product.name_en : product.name_pl}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 3. Wishlist Products Carousel */}
            {wishlistProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Heart className="h-6 w-6 text-primary" />
                    {t('wishlist')} ({wishlistProducts.length})
                  </h2>
                </CardHeader>
                <CardContent>
                  {wishlistProducts.length > 2 ? (
                    <Carousel opts={{ align: "start", loop: true }} className="w-full">
                      <CarouselContent>
                        {wishlistProducts.map((product: any) => (
                          <CarouselItem key={product.id} className="basis-1/3">
                            <Link to={`/product/${product.id}`} className="group cursor-pointer block">
                              <div className="aspect-square relative overflow-hidden rounded-lg border">
                                <img
                                  src={product.image_url}
                                  alt={product.name_en}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <p className="text-xs mt-2 text-center truncate group-hover:text-primary transition-colors">
                                {language === 'en' ? product.name_en : product.name_pl}
                              </p>
                            </Link>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {wishlistProducts.map((product: any) => (
                        <Link key={product.id} to={`/product/${product.id}`} className="group cursor-pointer">
                          <div className="aspect-square relative overflow-hidden rounded-lg border">
                            <img
                              src={product.image_url}
                              alt={product.name_en}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-xs mt-2 text-center truncate group-hover:text-primary transition-colors">
                            {language === 'en' ? product.name_en : product.name_pl}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* COLONNA DESTRA (1/3) */}
          <div className="lg:col-span-1 space-y-8">
            {/* 1. Your Badges */}
            <BadgeShowcase userId={userId || ''} />

            {/* 2. Spirit Posts - da spostare qui */}
            {/* Placeholder per mantenere struttura */}

            {/* 3. Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Star className="h-6 w-6 text-primary" />
                    {t('reviews')} ({reviews.length})
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="border-b pb-4 last:border-0 hover:bg-accent/5 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Link to={`/product/${review.products?.id}`}>
                            <img
                              src={review.products?.image_url}
                              alt={review.products?.name_en}
                              className="w-16 h-16 rounded object-cover"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link to={`/product/${review.products?.id}`}>
                              <h3 className="font-semibold hover:text-primary transition-colors">
                                {language === 'en' ? review.products?.name_en : review.products?.name_pl}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-1 my-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(review.created_at), 'PPP')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Spirit Post Section - Visible to All */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  {t('spiritPosts')}
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment */}
                {user && (
                  <div className="space-y-3 p-4 bg-accent/5 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.user_metadata?.profile_image_url || '/assets/mini-spirit-logo.png'} />
                        <AvatarFallback>
                          {user?.user_metadata?.first_name?.[0] || user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={t('writeComment')}
                          className="min-h-[80px] resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowEmojiPicker(showEmojiPicker === 'comment' ? null : 'comment');
                                  setShowGifPicker(null);
                                }}
                              >
                                <Smile className="h-4 w-4" />
                              </Button>
                              {showEmojiPicker === 'comment' && (
                                 <div className="absolute z-50 top-full mt-2">
                                  <EmojiPicker onEmojiClick={(emojiData) => onEmojiClick(emojiData, 'comment')} />
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowGifPicker(showGifPicker === 'comment' ? null : 'comment');
                                  setShowEmojiPicker(null);
                                }}
                              >
                                <Gift className="h-4 w-4" />
                              </Button>
                              {showGifPicker === 'comment' && (
                                <div className="absolute z-50 top-full mt-2">
                                  <GifPicker onSelectGif={(gifUrl) => onGifSelect(gifUrl, 'comment')} />
                                </div>
                              )}
                            </div>
                          </div>
                          <Button onClick={submitComment} disabled={submitting || !newComment.trim()}>
                            <Send className="h-4 w-4 mr-2" />
                            {t('post')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-4 p-3 md:p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-all animate-fade-in">
                      <div className="flex items-start gap-2 md:gap-3">
                        <Link to={comment.commenter_profile?.public_profile ? `/profile/${comment.commenter_id}` : '#'}>
                          <Avatar className="h-8 w-8 md:h-10 md:w-10">
                            <AvatarImage src={comment.commenter_profile?.profile_image_url || '/assets/mini-spirit-logo.png'} />
                            <AvatarFallback className="text-xs md:text-sm">
                              {comment.commenter_profile?.first_name?.[0] || 'U'}
                              {comment.commenter_profile?.last_name?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <Link 
                                to={comment.commenter_profile?.public_profile ? `/profile/${comment.commenter_id}` : '#'}
                                className="font-semibold text-sm md:text-base hover:text-primary transition-colors truncate block"
                              >
                                {comment.commenter_profile?.first_name} {comment.commenter_profile?.last_name}
                              </Link>
                              {comment.commenter_profile?.username && (
                                <Link 
                                  to={comment.commenter_profile?.public_profile ? `/profile/${comment.commenter_id}` : '#'}
                                  className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors truncate block"
                                >
                                  @{comment.commenter_profile?.username}
                                </Link>
                              )}
                              <span className="text-[10px] md:text-xs text-muted-foreground block">
                                {format(new Date(comment.created_at), 'PPp')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {user && user.id === comment.commenter_id && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 md:h-8 md:w-8"
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditCommentText(comment.comment);
                                    }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteComment(comment.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {editingCommentId === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                className="min-h-[60px]"
                              />
                              <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                                  {t('saveEdit')}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditCommentText('');
                                  }}
                                >
                                  {t('cancelEdit')}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm">{comment.comment}</p>
                          )}

                          {/* Comment Actions - mobile optimized */}
                          <div className="flex items-center gap-2 md:gap-4 text-sm md:ml-0 ml-12">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikeComment(comment.id, !!comment.user_liked)}
                              className="gap-1 h-7 md:h-9 px-2"
                            >
                              <Heart className={`h-3 w-3 md:h-4 md:w-4 ${comment.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                              <span className="text-xs md:text-sm">{comment.like_count || 0}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="h-7 md:h-9 px-2"
                            >
                              <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              <span className="text-xs md:text-sm">{t('reply')}</span>
                            </Button>
                            <div className="flex items-center gap-0.5 md:gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 md:h-4 md:w-4 cursor-pointer transition-colors ${
                                    i < Math.round(comment.average_rating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300 hover:text-yellow-400'
                                  }`}
                                  onClick={() => user && rateComment(comment.id, i + 1)}
                                />
                              ))}
                              <span className="text-[10px] md:text-xs text-muted-foreground ml-0.5 md:ml-1">
                                ({comment.rating_count || 0})
                              </span>
                            </div>
                          </div>

                          {/* Reply Form */}
                          {replyingTo === comment.id && user && (
                            <div className="mt-3 p-3 bg-accent/5 rounded-lg border space-y-2">
                              <Textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={t('writeReply')}
                                className="min-h-[60px]"
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setShowEmojiPicker(showEmojiPicker === 'reply' ? null : 'reply');
                                        setShowGifPicker(null);
                                      }}
                                    >
                                      <Smile className="h-4 w-4" />
                                    </Button>
                                    {showEmojiPicker === 'reply' && (
                                      <div className="absolute z-50 top-full mt-2">
                                        <EmojiPicker onEmojiClick={(emojiData) => onEmojiClick(emojiData, 'reply')} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="relative">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setShowGifPicker(showGifPicker === 'reply' ? null : 'reply');
                                        setShowEmojiPicker(null);
                                      }}
                                    >
                                      <Gift className="h-4 w-4" />
                                    </Button>
                                    {showGifPicker === 'reply' && (
                                      <div className="absolute z-50 top-full mt-2">
                                        <GifPicker onSelectGif={(gifUrl) => onGifSelect(gifUrl, 'reply')} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => submitReply(comment.id)} disabled={submitting || !replyText.trim()}>
                                    <Send className="h-3 w-3 mr-1" />
                                    {t('reply')}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                  }}>
                                    {t('cancel')}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Nested Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 md:ml-8 ml-12 space-y-3 border-l-2 border-primary/20 pl-3 md:pl-4">
                              {comment.replies.map((reply: any) => (
                                <div key={reply.id} className="space-y-2 p-2 md:p-3 bg-gradient-to-r from-accent/5 to-transparent rounded-lg animate-fade-in">
                                  <div className="flex items-start gap-2 md:gap-3">
                                    <Link to={reply.commenter_profile?.public_profile ? `/profile/${reply.commenter_id}` : '#'}>
                                      <Avatar className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0">
                                        <AvatarImage src={reply.commenter_profile?.profile_image_url || '/assets/mini-spirit-logo.png'} />
                                        <AvatarFallback className="text-xs">
                                          {reply.commenter_profile?.first_name?.[0] || 'U'}
                                          {reply.commenter_profile?.last_name?.[0] || ''}
                                        </AvatarFallback>
                                      </Avatar>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                                        <div className="min-w-0">
                                          <Link 
                                            to={reply.commenter_profile?.public_profile ? `/profile/${reply.commenter_id}` : '#'}
                                            className="font-semibold text-xs md:text-sm hover:text-primary transition-colors truncate block"
                                          >
                                            {reply.commenter_profile?.first_name} {reply.commenter_profile?.last_name}
                                          </Link>
                                          {reply.commenter_profile?.username && (
                                            <Link 
                                              to={reply.commenter_profile?.public_profile ? `/profile/${reply.commenter_id}` : '#'}
                                              className="text-[10px] md:text-xs text-muted-foreground hover:text-primary transition-colors truncate block"
                                            >
                                              @{reply.commenter_profile?.username}
                                            </Link>
                                          )}
                                          <span className="text-[9px] md:text-xs text-muted-foreground block">
                                            {format(new Date(reply.created_at), 'PPp')}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {editingCommentId === reply.id ? (
                                        <div className="space-y-2 mt-2">
                                          <Textarea
                                            value={editCommentText}
                                            onChange={(e) => setEditCommentText(e.target.value)}
                                            className="min-h-[50px] text-sm"
                                          />
                                          <div className="flex items-center gap-2">
                                            <Button size="sm" onClick={() => handleEditComment(reply.id)} className="h-7 text-xs">
                                              {t('saveEdit')}
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              onClick={() => {
                                                setEditingCommentId(null);
                                                setEditCommentText('');
                                              }}
                                              className="h-7 text-xs"
                                            >
                                              {t('cancelEdit')}
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-xs md:text-sm mt-1 break-words">{reply.comment}</p>
                                      )}
                                      
                                      {/* Reply Actions - only like + edit/delete buttons */}
                                      <div className="flex items-center gap-2 mt-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleLikeComment(reply.id, !!reply.user_liked)}
                                          className="gap-1 h-6 md:h-7 px-1.5 md:px-2"
                                        >
                                          <Heart className={`h-3 w-3 ${reply.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                                          <span className="text-xs">{reply.like_count || 0}</span>
                                        </Button>
                                        {user && user.id === reply.commenter_id && (
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setEditingCommentId(reply.id);
                                                setEditCommentText(reply.comment);
                                              }}
                                              className="h-6 w-6 p-0"
                                            >
                                              <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => deleteComment(reply.id)}
                                              className="h-6 w-6 p-0"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>{t('noCommentsYet')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Spirit Points Display */}
            {isOwnProfile && (
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardHeader>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    {t('yourPoints')}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{spiritPoints}</p>
                    <p className="text-sm text-muted-foreground">{t('spiritPoints')}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('nextRewardProgress')}</span>
                      <span className="font-medium">{Math.min(100, (spiritPoints % 100))}%</span>
                    </div>
                    <Progress value={Math.min(100, (spiritPoints % 100))} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SpiritPoints Leaderboard */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {t('spiritPointsLeaderboard')}
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry: any, index: number) => (
                    <Link
                      key={entry.user_id}
                      to={`/profile/${entry.user_id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.profiles?.profile_image_url} />
                        <AvatarFallback>
                          {entry.profiles?.first_name?.[0]}
                          {entry.profiles?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {entry.profiles?.first_name} {entry.profiles?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.lifetime_points} {t('spiritPoints')}
                        </p>
                      </div>
                      {entry.user_id === userId && (
                        <Badge variant="secondary">{t('you')}</Badge>
                      )}
                    </Link>
                  ))}
                  {userRank && userRank > 10 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground text-center">
                        {t('yourRank')}: #{userRank}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Purchased Products */}
            {purchasedProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    {t('purchasedProducts')}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {purchasedProducts.slice(0, 4).map((product: any) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="group"
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-square">
                            <img
                              src={product.image_url}
                              alt={product.name_en}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <CardContent className="p-2">
                            <p className="text-xs font-medium text-center truncate group-hover:text-primary transition-colors">
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
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    {t('wishlist')}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {wishlistProducts.slice(0, 4).map((product: any) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="group"
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-square">
                            <img
                              src={product.image_url}
                              alt={product.name_en}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <CardContent className="p-2">
                            <p className="text-xs font-medium text-center truncate group-hover:text-primary transition-colors">
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
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      <Dialog open={showFollowersModal} onOpenChange={setShowFollowersModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('followers')} ({followersCount})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {followersList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {language === 'pl' ? 'Brak obserwujących' : 'No followers yet'}
              </p>
            ) : (
              followersList.map((follower: any) => (
                <div key={follower.user_id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={follower.profile_image_url} />
                    <AvatarFallback>
                      {follower.first_name?.[0]}{follower.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {follower.first_name} {follower.last_name}
                    </p>
                    {follower.username && (
                      <p className="text-sm text-muted-foreground">@{follower.username}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/profile/${follower.user_id}`}
                  >
                    {t('viewProfile')}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Following Modal */}
      <Dialog open={showFollowingModal} onOpenChange={setShowFollowingModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('following')} ({followingCount})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {followingList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {language === 'pl' ? 'Nie obserwujesz nikogo' : 'Not following anyone yet'}
              </p>
            ) : (
              followingList.map((following: any) => (
                <div key={following.user_id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={following.profile_image_url} />
                    <AvatarFallback>
                      {following.first_name?.[0]}{following.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {following.first_name} {following.last_name}
                    </p>
                    {following.username && (
                      <p className="text-sm text-muted-foreground">@{following.username}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/profile/${following.user_id}`}
                  >
                    {t('viewProfile')}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
