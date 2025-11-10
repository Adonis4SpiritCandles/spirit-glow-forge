import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Trash2, Ban, CheckCircle, MessageCircle, Users, TrendingUp, Star } from 'lucide-react';

export default function AdminSocialModeration() {
  const { language } = useLanguage();
  const [comments, setComments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProfiles: 0,
    totalComments: 0,
    totalFollowers: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load comments
      const { data: commentsData } = await supabase
        .from('profile_comments')
        .select(`
          *,
          commenter:public_profile_directory!profile_comments_commenter_id_fkey(first_name, last_name),
          profile:public_profile_directory!profile_comments_profile_user_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      setComments(commentsData || []);

      // Load users
      const { data: usersData } = await supabase
        .from('public_profile_directory')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(usersData || []);

      // Load stats
      const { count: profilesCount } = await supabase
        .from('public_profile_directory')
        .select('*', { count: 'exact', head: true });

      const { count: commentsCount } = await supabase
        .from('profile_comments')
        .select('*', { count: 'exact', head: true });

      const { count: followersCount } = await supabase
        .from('profile_follows')
        .select('*', { count: 'exact', head: true });

      // Load reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (first_name, last_name),
          products:product_id (name_en, name_pl)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      setReviews(reviewsData || []);

      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalProfiles: profilesCount || 0,
        totalComments: commentsCount || 0,
        totalFollowers: followersCount || 0,
        totalReviews: reviewsCount || 0
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm(language === 'pl' ? 'Czy na pewno usunąć komentarz?' : 'Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profile_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success(language === 'pl' ? 'Komentarz usunięty' : 'Comment deleted');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleUserBan = async (userId: string, currentBanStatus: boolean) => {
    const action = currentBanStatus ? 'unban' : 'ban';
    if (!confirm(language === 'pl' 
      ? `Czy na pewno ${action === 'ban' ? 'zablokować' : 'odblokować'} tego użytkownika?`
      : `Are you sure you want to ${action} this user?`
    )) {
      return;
    }

    try {
      const { error } = await supabase
        .from('public_profile_directory')
        .update({ banned: !currentBanStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(language === 'pl' 
        ? `Użytkownik ${action === 'ban' ? 'zablokowany' : 'odblokowany'}`
        : `User ${action}ned`
      );
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm(language === 'pl' ? 'Czy na pewno usunąć recenzję?' : 'Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast.success(language === 'pl' ? 'Recenzja usunięta' : 'Review deleted');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {language === 'pl' ? 'Moderacja profili społecznościowych' : 'Social Profile Moderation'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'pl' ? 'Zarządzaj komentarzami i użytkownikami' : 'Manage comments and users'}
        </p>
      </div>

      <Tabs defaultValue="comments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comments" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            {language === 'pl' ? 'Komentarze' : 'Comments'}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            {language === 'pl' ? 'Użytkownicy' : 'Users'}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="h-4 w-4" />
            {language === 'pl' ? 'Recenzje' : 'Reviews'}
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {language === 'pl' ? 'Statystyki' : 'Statistics'}
          </TabsTrigger>
        </TabsList>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'pl' ? 'Wszystkie komentarze' : 'All Comments'}</CardTitle>
              <CardDescription>
                {language === 'pl' ? 'Moderuj komentarze na profilach' : 'Moderate profile comments'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'pl' ? 'Komentarz' : 'Comment'}</TableHead>
                      <TableHead>{language === 'pl' ? 'Autor' : 'Author'}</TableHead>
                      <TableHead>{language === 'pl' ? 'Profil' : 'Profile'}</TableHead>
                      <TableHead>{language === 'pl' ? 'Data' : 'Date'}</TableHead>
                      <TableHead className="text-right">{language === 'pl' ? 'Akcje' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                        <TableCell>
                          {comment.commenter?.first_name} {comment.commenter?.last_name}
                        </TableCell>
                        <TableCell>
                          {comment.profile?.first_name} {comment.profile?.last_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(comment.created_at), 'PPp')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteComment(comment.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'pl' ? 'Zarządzanie użytkownikami' : 'User Management'}</CardTitle>
              <CardDescription>
                {language === 'pl' ? 'Blokuj lub odblokuj użytkowników' : 'Ban or unban users'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'pl' ? 'Użytkownik' : 'User'}</TableHead>
                    <TableHead>{language === 'pl' ? 'Bio' : 'Bio'}</TableHead>
                    <TableHead>{language === 'pl' ? 'Status' : 'Status'}</TableHead>
                    <TableHead className="text-right">{language === 'pl' ? 'Akcje' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.profile_image_url && (
                            <img 
                              src={user.profile_image_url} 
                              alt={user.first_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span>{user.first_name} {user.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{user.bio || '-'}</TableCell>
                      <TableCell>
                        {user.banned ? (
                          <Badge variant="destructive">{language === 'pl' ? 'Zablokowany' : 'Banned'}</Badge>
                        ) : (
                          <Badge variant="secondary">{language === 'pl' ? 'Aktywny' : 'Active'}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={user.banned ? 'default' : 'destructive'}
                          size="sm"
                          onClick={() => toggleUserBan(user.user_id, user.banned)}
                          className="gap-2"
                        >
                          {user.banned ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              {language === 'pl' ? 'Odblokuj' : 'Unban'}
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4" />
                              {language === 'pl' ? 'Zablokuj' : 'Ban'}
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'pl' ? 'Wszystkie recenzje' : 'All Reviews'}</CardTitle>
              <CardDescription>
                {language === 'pl' ? 'Moderuj recenzje produktów' : 'Moderate product reviews'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'pl' ? 'Recenzja' : 'Review'}</TableHead>
                      <TableHead>{language === 'pl' ? 'Ocena' : 'Rating'}</TableHead>
                      <TableHead>{language === 'pl' ? 'Autor' : 'Author'}</TableHead>
                      <TableHead>{language === 'pl' ? 'Produkt' : 'Product'}</TableHead>
                      <TableHead>{language === 'pl' ? 'Data' : 'Date'}</TableHead>
                      <TableHead className="text-right">{language === 'pl' ? 'Akcje' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="max-w-xs truncate">{review.comment || '-'}</TableCell>
                        <TableCell>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {review.profiles?.first_name} {review.profiles?.last_name}
                        </TableCell>
                        <TableCell>
                          {language === 'pl' ? review.products?.name_pl : review.products?.name_en}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(review.created_at), 'PPp')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReview(review.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{language === 'pl' ? 'Profile' : 'Profiles'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalProfiles}</div>
                <p className="text-xs text-muted-foreground">{language === 'pl' ? 'Wszystkie profile' : 'Total profiles'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{language === 'pl' ? 'Komentarze' : 'Comments'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalComments}</div>
                <p className="text-xs text-muted-foreground">{language === 'pl' ? 'Wszystkie komentarze' : 'Total comments'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{language === 'pl' ? 'Obserwacje' : 'Followers'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalFollowers}</div>
                <p className="text-xs text-muted-foreground">{language === 'pl' ? 'Wszystkie obserwacje' : 'Total follows'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{language === 'pl' ? 'Recenzje' : 'Reviews'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalReviews}</div>
                <p className="text-xs text-muted-foreground">{language === 'pl' ? 'Wszystkie recenzje' : 'Total reviews'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
