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
import { ArrowLeft, MessageSquare, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
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

      // Load badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      setBadges(badgesData || []);

      // Load comments
      const { data: commentsData } = await supabase
        .from('profile_comments')
        .select(`
          *,
          commenter:profiles!profile_comments_commenter_id_fkey(
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .eq('profile_user_id', userId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);
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

  const submitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('profile_comments').insert({
        profile_user_id: userId,
        commenter_id: user.id,
        comment: newComment.trim(),
      });

      if (error) throw error;

      setNewComment('');
      await loadProfile();

      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' 
          ? 'Komentarz został dodany' 
          : 'Comment has been added',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-medium mb-4">
              {language === 'pl' ? 'Profil nie znaleziony' : 'Profile not found'}
            </p>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'pl' ? 'Powrót do strony głównej' : 'Back to home'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div 
        className="h-64 bg-gradient-to-r from-primary/20 to-primary/10 relative"
        style={profile.cover_image_url ? {
          backgroundImage: `url(${profile.cover_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        <Link to="/" className="absolute top-4 left-4">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'pl' ? 'Powrót' : 'Back'}
          </Button>
        </Link>
      </div>

      <div className="container max-w-4xl mx-auto px-4 -mt-20 pb-12">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={profile.profile_image_url} />
                <AvatarFallback className="text-3xl">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </AvatarFallback>
              </Avatar>

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

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {badges.slice(0, 5).map((badge) => (
                      <Badge key={badge.badge_id} variant="secondary" className="gap-1">
                        <Award className="h-3 w-3" />
                        {badge.badge_id}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
                  <div key={comment.id} className="flex gap-3 p-4 border rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.commenter?.profile_image_url} />
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
                      <p className="text-sm">{comment.comment}</p>
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
