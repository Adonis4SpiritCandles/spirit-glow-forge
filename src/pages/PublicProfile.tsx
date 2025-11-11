import { useState, useEffect, Suspense, lazy, Component } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MessageCircle, Settings, Send, Users, Star, Award, Smile, Image as ImageIcon, Trophy, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';

const BadgeShowcase = lazy(() => import('@/components/gamification/BadgeShowcase'));
const GifPicker = lazy(() => import('@/components/profile/GifPicker'));
const CommentReactions = lazy(() => import('@/components/profile/CommentReactions'));
const PurchasedProducts = lazy(() => import('@/components/profile/PurchasedProducts'));
const UserReviews = lazy(() => import('@/components/profile/UserReviews'));
const ReferralDashboard = lazy(() => import('@/components/gamification/ReferralDashboard'));
const ProfileWishlist = lazy(() => import('@/components/profile/ProfileWishlist'));

// Simple ErrorBoundary for badge showcase
class BadgeErrorBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface CommentType {
  id: string;
  comment: string;
  commenter_id: string;
  created_at: string;
  commenter_profile?: any;
}

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [replies, setReplies] = useState<Record<string, CommentType[]>>({});
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyLoading, setReplyLoading] = useState<string | null>(null);
  const [spiritPoints, setSpiritPoints] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadFollowData();
      subscribeToRealtimeUpdates();
    }

    // Load current user profile for role check
    if (user) {
      const loadCurrentUser = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        setCurrentUser(data);
      };
      loadCurrentUser();
    }

    return () => {
      if (userId) {
        supabase.removeChannel(supabase.channel(`profile_comments_${userId}`));
        supabase.removeChannel(supabase.channel(`profile_follows_${userId}`));
      }
    };
  }, [userId, user?.id]);

  const loadProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Load profile from public_profile_directory
      const { data: profileData, error: profileError } = await supabase
        .from('public_profile_directory')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      if (!profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

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
          .maybeSingle();
        
        setProfile({ ...profileData, ...fullProfile });
      } else {
        setProfile(profileData);
      }

      // Load spirit points
      const { data: loyaltyData } = await supabase
        .from('loyalty_points')
        .select('points, lifetime_points')
        .eq('user_id', userId)
        .maybeSingle();

      setSpiritPoints(loyaltyData?.points || 0);

      // Load comments
      const { data: commentsData } = await supabase
        .from('profile_comments')
        .select('*')
        .eq('profile_user_id', userId)
        .is('parent_comment_id', null)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (commentsData && commentsData.length > 0) {
        // Load commenter profiles
        const commenterIds = commentsData.map(c => c.commenter_id);
        const { data: profiles } = await supabase
          .from('public_profile_directory')
          .select('*')
          .in('user_id', commenterIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const enrichedComments = commentsData.map((comment: any) => ({
          ...comment,
          commenter_profile: profileMap.get(comment.commenter_id) || {
            profile_image_url: '/assets/mini-spirit-logo.png',
            first_name: 'User',
            last_name: '',
          },
        }));

        setComments(enrichedComments);

        // Load replies for these comments
        const parentIds = commentsData.map((c: any) => c.id);
        const { data: repliesData } = await supabase
          .from('profile_comments')
          .select('*')
          .in('parent_comment_id', parentIds)
          .eq('is_visible', true)
          .order('created_at', { ascending: true });

        if (repliesData && repliesData.length > 0) {
          // load profiles for repliers
          const replierIds = Array.from(new Set(repliesData.map((r: any) => r.commenter_id)));
          const { data: replierProfiles } = await supabase
            .from('public_profile_directory')
            .select('*')
            .in('user_id', replierIds);
          const replierMap = new Map(replierProfiles?.map(p => [p.user_id, p]) || []);

          const grouped: Record<string, CommentType[]> = {};
          repliesData.forEach((r: any) => {
            const withProfile = {
              ...r,
              commenter_profile: replierMap.get(r.commenter_id) || {},
            } as CommentType;
            if (!grouped[r.parent_comment_id]) grouped[r.parent_comment_id] = [];
            grouped[r.parent_comment_id].push(withProfile);
          });
          setReplies(grouped);
        } else {
          setReplies({});
        }
      } else {
        setComments([]);
        setReplies({});
      }

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

  const subscribeToRealtimeUpdates = () => {
    if (!userId) return;

    // Subscribe to new comments
    const commentsChannel = supabase
      .channel(`profile_comments_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_comments',
          filter: `profile_user_id=eq.${userId}`
        },
        () => {
          console.debug('[Profile Realtime] New comment received, reloading');
          loadProfile();
        }
      )
      .subscribe();

    // Subscribe to follow changes
    const followsChannel = supabase
      .channel(`profile_follows_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_follows',
          filter: `following_id=eq.${userId}`
        },
        async (payload) => {
          console.debug('[Profile Realtime] Follow change:', payload);
          if (payload.eventType === 'INSERT') {
            setFollowersCount(prev => prev + 1);
            if ((payload.new as any).follower_id === user?.id) {
              setIsFollowing(true);
            }
          } else if (payload.eventType === 'DELETE') {
            setFollowersCount(prev => Math.max(0, prev - 1));
            if ((payload.old as any).follower_id === user?.id) {
              setIsFollowing(false);
            }
          }
        }
      )
      .subscribe();
  };

  const loadFollowData = async () => {
    if (!userId) return;

    try {
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
    } catch (error) {
      console.error('Error loading follow data:', error);
    }
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

    try {
      const { data, error } = await supabase.rpc('toggle_follow', { target_user_id: userId });
      if (error) throw error;
      const action = (data as any)?.action;

      if (action === 'unfollowed') {
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast({
          title: t('success'),
          description: language === 'pl' ? 'Przestałeś obserwować' : 'Unfollowed successfully',
        });
      } else if (action === 'followed') {
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast({
          title: t('success'),
          description: language === 'pl' ? 'Obserwujesz teraz tego użytkownika' : 'Following successfully',
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: t('error'),
        description: t('error'),
        variant: 'destructive',
      });
    }
  };

  const submitComment = async () => {
    if (!user) {
      toast({ title: t('error'), description: t('pleaseLogin'), variant: 'destructive' });
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      // Extract mentions (@username)
      const mentionRegex = /@(\w+)/g;
      const mentions = [...newComment.matchAll(mentionRegex)].map(m => m[1]);

      const { error } = await supabase
        .from('profile_comments')
        .insert({
          profile_user_id: userId,
          commenter_id: user.id,
          comment: newComment.trim(),
          parent_comment_id: null,
        });
      if (error) throw error;

      // Send mention notifications
      if (mentions.length > 0) {
        for (const username of mentions) {
          const { data: mentionedUser } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('username', username)
            .single();

          if (mentionedUser) {
            await supabase.from('profile_notifications').insert({
              user_id: mentionedUser.user_id,
              profile_user_id: userId,
              actor_id: user.id,
              type: 'mention',
              comment_id: null,
              read: false,
            });
          }
        }
      }

      setNewComment('');
      toast({ title: t('success'), description: t('commentAdded') });
      await loadProfile();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({ title: t('error'), description: t('failedToAddComment'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (parentCommentId: string) => {
    if (!user) {
      toast({ title: t('error'), description: t('pleaseLogin'), variant: 'destructive' });
      return;
    }
    const text = replyText[parentCommentId]?.trim();
    if (!text) return;

    setReplyLoading(parentCommentId);
    try {
      // Extract mentions
      const mentionRegex = /@(\w+)/g;
      const mentions = [...text.matchAll(mentionRegex)].map(m => m[1]);

      const { error } = await supabase
        .from('profile_comments')
        .insert({
          profile_user_id: userId,
          commenter_id: user.id,
          comment: text,
          parent_comment_id: parentCommentId,
        });
      if (error) throw error;

      // Send mention notifications
      if (mentions.length > 0) {
        for (const username of mentions) {
          const { data: mentionedUser } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('username', username)
            .single();

          if (mentionedUser) {
            await supabase.from('profile_notifications').insert({
              user_id: mentionedUser.user_id,
              profile_user_id: userId,
              actor_id: user.id,
              type: 'mention',
              comment_id: parentCommentId,
              read: false,
            });
          }
        }
      }

      setReplyText(prev => ({ ...prev, [parentCommentId]: '' }));
      setReplyOpenId(null);
      toast({ title: t('success'), description: t('replyAdded') });
      await loadProfile();
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({ title: t('error'), description: t('failedToAddComment'), variant: 'destructive' });
    } finally {
      setReplyLoading(null);
    }
  };

  // Edit and delete comment functions
  const startEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditContent(currentContent);
  };

  const updateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from('profile_comments')
      .update({ comment: editContent, updated_at: new Date().toISOString() })
      .eq('id', commentId);

    if (error) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'Nie udało się zaktualizować' : 'Failed to update',
        variant: 'destructive',
      });
    } else {
      setEditingCommentId(null);
      setEditContent('');
      loadProfile();
      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' ? 'Komentarz zaktualizowany' : 'Comment updated',
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm(language === 'pl' ? 'Czy na pewno usunąć?' : 'Are you sure you want to delete?')) {
      return;
    }

    const { error } = await supabase
      .from('profile_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'Nie udało się usunąć' : 'Failed to delete',
        variant: 'destructive',
      });
    } else {
      loadProfile();
      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' ? 'Komentarz usunięty' : 'Comment deleted',
      });
    }
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
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" asChild>
          <Link to="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Link>
        </Button>
      </div>

      {/* Cover Image */}
      <div 
        className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-secondary/20"
        style={{
          backgroundImage: profile.cover_image_url ? `url(${profile.cover_image_url})` : 'url(/assets/spirit-logo-transparent.png)',
          backgroundSize: profile.cover_image_url ? 'cover' : 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-20 mb-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={profile.profile_image_url || '/assets/mini-spirit-logo.png'} />
              <AvatarFallback className="text-4xl">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 mt-0 md:mt-20 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row items-center md:items-center md:justify-between gap-4">
              <div className="flex flex-col items-center md:items-start">
                <h1 className="text-3xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h1>
                {profile.username && (
                  <p className="text-base text-muted-foreground">
                    @{profile.username}
                  </p>
                )}
              </div>
              {isOwnProfile && (
                <Button variant="outline" asChild>
                  <Link to="/dashboard?tab=social">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('editProfile')}
                  </Link>
                </Button>
              )}
            </div>
            
            {/* Follow Stats & Button */}
            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start mt-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-2xl font-bold">{followersCount}</span>
                  <p className="text-sm text-muted-foreground">{t('followers')}</p>
                </div>
                
                <div className="text-center">
                  <span className="text-2xl font-bold">{followingCount}</span>
                  <p className="text-sm text-muted-foreground">{t('following')}</p>
                </div>

                <div className="text-center">
                  <span className="text-2xl font-bold flex items-center gap-1">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    {spiritPoints}
                  </span>
                  <p className="text-sm text-muted-foreground">{t('points')}</p>
                </div>
              </div>
              
              {!isOwnProfile && user?.id && (
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {isFollowing ? t('unfollow') : t('follow')}
                </Button>
              )}
            </div>
            
            {profile.bio && (
              <p className="mt-4 text-muted-foreground">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Badges Section */}
        <Card className="mt-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              {language === 'pl' ? 'Odznaki' : 'Badges'}
            </h2>
          </CardHeader>
          <CardContent>
            <BadgeErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">{language === 'pl' ? 'Nie można załadować odznak' : 'Unable to load badges'}</div>}>
              <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg"></div>}>
                <BadgeShowcase userId={userId!} variant="mini" />
              </Suspense>
            </BadgeErrorBoundary>
          </CardContent>
        </Card>

        {/* Spirit Posts */}
        <Card className="mt-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              {t('spiritPosts')}
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <div className="space-y-3 p-4 bg-accent/5 rounded-lg border">
                {/* Desktop/Tablet - with avatar */}
                <div className={`${isMobile ? 'hidden' : 'flex'} items-start gap-3`}>
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
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" type="button">
                            <Smile className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 border-0" align="start">
                          <EmojiPicker
                            onEmojiClick={(emoji: EmojiClickData) => {
                              setNewComment(prev => prev + emoji.emoji);
                            }}
                            width="100%"
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" type="button">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px]" align="start">
                          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                            <GifPicker
                              onSelectGif={(gifUrl) => {
                                setNewComment(prev => prev + ` ${gifUrl}`);
                              }}
                            />
                          </Suspense>
                        </PopoverContent>
                      </Popover>

                      <Button onClick={submitComment} disabled={submitting || !newComment.trim()} className="ml-auto">
                        <Send className="h-4 w-4 mr-2" />
                        {t('post')}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mobile - no avatar, buttons below */}
                <div className={`${isMobile ? 'flex' : 'hidden'} flex-col space-y-2`}>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('writeComment')}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" type="button">
                            <Smile className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 border-0" align="start">
                          <EmojiPicker
                            onEmojiClick={(emoji: EmojiClickData) => {
                              setNewComment(prev => prev + emoji.emoji);
                            }}
                            width="100%"
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" type="button">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[90vw]" align="start">
                          <Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
                            <GifPicker
                              onSelectGif={(gifUrl) => {
                                setNewComment(prev => prev + ` ${gifUrl}`);
                              }}
                            />
                          </Suspense>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button onClick={submitComment} disabled={submitting || !newComment.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      {t('post')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {language === 'pl' ? 'Brak postów' : 'No posts yet'}
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} id={`comment-${comment.id}`} className="p-4 bg-card rounded-lg border transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <Link to={comment.commenter_profile?.public_profile ? `/profile/${comment.commenter_id}` : '#'}>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.commenter_profile?.profile_image_url || '/assets/mini-spirit-logo.png'} />
                          <AvatarFallback>
                            {comment.commenter_profile?.first_name?.[0] || 'U'}
                            {comment.commenter_profile?.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-1`}>
                              <Link 
                                to={comment.commenter_profile?.public_profile ? `/profile/${comment.commenter_id}` : '#'}
                                className={`font-semibold hover:text-primary transition-colors ${isMobile ? 'text-xs leading-tight truncate' : 'text-base'}`}
                              >
                                {comment.commenter_profile?.first_name} {comment.commenter_profile?.last_name}
                              </Link>
                              {comment.commenter_profile?.username && (
                                <>
                                  {!isMobile && <span className="text-muted-foreground">•</span>}
                                  <Link
                                    to={comment.commenter_profile?.public_profile ? `/profile/${comment.commenter_id}` : '#'}
                                    className={`text-muted-foreground hover:text-primary transition-colors ${isMobile ? 'text-[10px] leading-tight truncate' : 'text-sm'}`}
                                  >
                                    @{comment.commenter_profile?.username}
                                  </Link>
                                </>
                              )}
                              {!isMobile && <span className="text-muted-foreground">•</span>}
                              <span className={`text-muted-foreground ${isMobile ? 'text-[9px] leading-tight' : 'text-xs'}`}>
                                {(() => {
                                  const d = new Date(comment.created_at as any);
                                  return isNaN(d.getTime()) ? '' : (isMobile ? format(d, 'MMM d') : format(d, 'PPp'));
                                })()}
                              </span>
                            </div>
                          </div>

                          {/* Edit/Delete for owner or admin */}
                          {user && (comment.commenter_id === user.id || currentUser?.role === 'admin') && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditComment(comment.id, comment.comment)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteComment(comment.id)}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Edit mode */}
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2 mt-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[60px] resize-none md:text-sm text-xs"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => updateComment(comment.id)}>
                                {language === 'pl' ? 'Zapisz' : 'Save'}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>
                                {language === 'pl' ? 'Anuluj' : 'Cancel'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Display GIF if present */}
                            {(() => {
                              const gifMatch = comment.comment.match(/https?:\/\/[^\s]*\.gif(\?[^\s]*)?/i);
                              const textContent = gifMatch ? comment.comment.replace(gifMatch[0], '').trim() : comment.comment;
                              
                              return (
                                <>
                                  {gifMatch && (
                                    <div className="mt-2 mb-2">
                                      <img 
                                        src={gifMatch[0]} 
                                        alt="GIF" 
                                        className={`rounded-lg ${isMobile ? 'max-w-full h-auto' : 'max-w-md'}`}
                                        style={{ maxHeight: isMobile ? '200px' : '300px', objectFit: 'contain' }}
                                      />
                                    </div>
                                  )}
                                  {textContent && (
                                    <p className="mt-2 whitespace-pre-wrap break-words md:text-base text-xs">{textContent}</p>
                                  )}
                                </>
                              );
                            })()}
                            
                            {/* Reaction Buttons and Reply Button */}
                            <div className={`mt-3 ${isMobile ? 'flex items-center justify-end gap-2 w-full' : 'flex items-center flex-wrap gap-2'}`}>
                              <Suspense fallback={<div className="h-8 w-32 bg-muted animate-pulse rounded" />}>
                                <CommentReactions commentId={comment.id} />
                              </Suspense>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`text-xs h-7 px-2 ${isMobile ? '' : 'ml-auto'}`}
                                onClick={() => setReplyOpenId(replyOpenId === comment.id ? null : comment.id)}
                              >
                                {language === 'pl' ? 'Odpowiedz' : 'Reply'}
                              </Button
                              >
                            </div>
                          </>
                        )}

                        {/* Replies */}
                        <div className="mt-4 md:pl-4 pl-6 border-l md:ml-0 ml-2">
                          {(replies[comment.id] || []).map((reply) => (
                            <div key={reply.id} id={`comment-${reply.id}`} className="p-3 mb-2 rounded bg-muted/20">
                              <div className="flex items-start gap-2">
                                <Link to={reply.commenter_profile?.public_profile ? `/profile/${reply.commenter_id}` : '#'}>
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={reply.commenter_profile?.profile_image_url || '/assets/mini-spirit-logo.png'} />
                                    <AvatarFallback>
                                      {reply.commenter_profile?.first_name?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                </Link>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                     <div className="flex-1 min-w-0">
                                      <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-1`}>
                                        <Link
                                          to={reply.commenter_profile?.public_profile ? `/profile/${reply.commenter_id}` : '#'}
                                          className={`font-medium hover:text-primary transition-colors ${isMobile ? 'text-[11px] leading-tight truncate' : 'text-sm'}`}
                                        >
                                          {reply.commenter_profile?.first_name} {reply.commenter_profile?.last_name}
                                        </Link>
                                        {reply.commenter_profile?.username && (
                                          <>
                                            {!isMobile && <span className="text-muted-foreground text-xs">•</span>}
                                            <Link
                                              to={reply.commenter_profile?.public_profile ? `/profile/${reply.commenter_id}` : '#'}
                                              className={`text-muted-foreground hover:text-primary transition-colors ${isMobile ? 'text-[10px] leading-tight truncate' : 'text-xs'}`}
                                            >
                                              @{reply.commenter_profile?.username}
                                            </Link>
                                          </>
                                        )}
                                        {!isMobile && <span className="text-muted-foreground text-xs">•</span>}
                                        <span className={`text-muted-foreground ${isMobile ? 'text-[8px] leading-tight' : 'text-xs'}`}>
                                          {(() => { 
                                            const d = new Date(reply.created_at as any); 
                                            return isNaN(d.getTime()) ? '' : (isMobile ? format(d, 'MMM d') : format(d, 'PPp')); 
                                          })()}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Edit/Delete for owner or admin */}
                                    {user && (reply.commenter_id === user.id || currentUser?.role === 'admin') && (
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => startEditComment(reply.id, reply.comment)}
                                          className="h-6 w-6 p-0"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteComment(reply.id)}
                                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Edit mode for reply */}
                                   {editingCommentId === reply.id ? (
                                    <div className="space-y-2 mt-2">
                                      <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="min-h-[50px] resize-none text-xs"
                                      />
                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={() => updateComment(reply.id)}>
                                          {language === 'pl' ? 'Zapisz' : 'Save'}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>
                                          {language === 'pl' ? 'Anuluj' : 'Cancel'}
                                        </Button>
                                      </div>
                                    </div>
                                   ) : (
                                     <>
                                       {/* Display GIF if present in reply */}
                                       {(() => {
                                         const gifMatch = reply.comment.match(/https?:\/\/[^\s]*\.gif(\?[^\s]*)?/i);
                                         const textContent = gifMatch ? reply.comment.replace(gifMatch[0], '').trim() : reply.comment;
                                         
                                         return (
                                           <>
                                             {gifMatch && (
                                               <div className="mt-1 mb-1">
                                                 <img 
                                                   src={gifMatch[0]} 
                                                   alt="GIF" 
                                                   className={`rounded-lg ${isMobile ? 'max-w-full h-auto' : 'max-w-sm'}`}
                                                   style={{ maxHeight: isMobile ? '150px' : '200px', objectFit: 'contain' }}
                                                 />
                                               </div>
                                             )}
                                             {textContent && (
                                               <div className="mt-1 text-sm whitespace-pre-wrap md:text-sm text-[11px]">{textContent}</div>
                                             )}
                                           </>
                                         );
                                       })()}
                                     </>
                                   )}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Reply form - Desktop/Tablet */}
                          {user && !isMobile && replyOpenId === comment.id && (
                            <div className="flex items-start gap-2 mt-2">
                              <Textarea
                                value={replyText[comment.id] || ''}
                                onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                placeholder={t('writeReply')}
                                className="min-h-[60px] resize-none text-sm"
                              />
                              <div className="flex flex-col gap-1">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" type="button">
                                      <Smile className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0 border-0" align="start">
                                    <EmojiPicker
                                      onEmojiClick={(emoji: EmojiClickData) => {
                                        setReplyText(prev => ({ ...prev, [comment.id]: (prev[comment.id] || '') + emoji.emoji }));
                                      }}
                                      width="100%"
                                    />
                                  </PopoverContent>
                                </Popover>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" type="button">
                                      <ImageIcon className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[400px]" align="start">
                                    <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                                      <GifPicker
                                        onSelectGif={(gifUrl) => {
                                          setReplyText(prev => ({ ...prev, [comment.id]: (prev[comment.id] || '') + ` ${gifUrl}` }));
                                        }}
                                      />
                                    </Suspense>
                                  </PopoverContent>
                                </Popover>
                                <Button size="sm" disabled={replyLoading === comment.id || !(replyText[comment.id] || '').trim()} onClick={() => submitReply(comment.id)}>
                                  {replyLoading === comment.id ? t('loading') : t('reply')}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Reply form - Mobile (Dialog) */}
                          {user && isMobile && (
                            <Dialog open={replyOpenId === comment.id} onOpenChange={(open) => setReplyOpenId(open ? comment.id : null)}>
                              <DialogContent className="max-w-[90vw]">
                                <DialogHeader>
                                  <DialogTitle>{language === 'pl' ? 'Odpowiedz' : 'Reply'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3">
                                  <Textarea
                                    value={replyText[comment.id] || ''}
                                    onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                    placeholder={t('writeReply')}
                                    className="min-h-[100px] resize-none text-sm"
                                  />
                                  <div className="flex items-center gap-2">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" type="button">
                                          <Smile className="h-4 w-4" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-full p-0 border-0" align="start">
                                        <EmojiPicker
                                          onEmojiClick={(emoji: EmojiClickData) => {
                                            setReplyText(prev => ({ ...prev, [comment.id]: (prev[comment.id] || '') + emoji.emoji }));
                                          }}
                                          width="100%"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" type="button">
                                          <ImageIcon className="h-4 w-4" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[90vw]" align="start">
                                        <Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
                                          <GifPicker
                                            onSelectGif={(gifUrl) => {
                                              setReplyText(prev => ({ ...prev, [comment.id]: (prev[comment.id] || '') + ` ${gifUrl}` }));
                                            }}
                                          />
                                        </Suspense>
                                      </PopoverContent>
                                    </Popover>
                                    <Button 
                                      className="ml-auto" 
                                      disabled={replyLoading === comment.id || !(replyText[comment.id] || '').trim()} 
                                      onClick={() => submitReply(comment.id)}
                                    >
                                      {replyLoading === comment.id ? t('loading') : t('reply')}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>


        {/* Purchased Products Section */}
        <Card className="mt-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              {language === 'pl' ? 'Zakupione Produkty' : 'Purchased Products'}
            </h2>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-center py-4">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>}>
              <PurchasedProducts userId={userId!} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Wishlist Section */}
        <Suspense fallback={<div className="text-center py-4 mt-8">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>}>
          <div className="mt-8">
            <ProfileWishlist userId={userId!} />
          </div>
        </Suspense>

        {/* Reviews Section */}
        <Card className="mt-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              {language === 'pl' ? 'Recenzje' : 'Reviews'}
            </h2>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-center py-4">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>}>
              <UserReviews userId={userId!} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
