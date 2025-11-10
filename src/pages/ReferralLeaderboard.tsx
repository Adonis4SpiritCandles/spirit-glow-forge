import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, Star, TrendingUp, Gift, Share2, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import SEOManager from '@/components/SEO/SEOManager';

interface LeaderboardEntry {
  user_id: string;
  total_referrals: number;
  total_points: number;
  rank: number;
  profile: any;
}

export default function ReferralLeaderboard() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadLeaderboard();
    if (user) loadUserReferralCode();
  }, [period, user]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_spirit_leaderboard', {
        time_period: period,
        limit_count: period === 'all' ? 25 : 10
      });

      if (error) throw error;
      setLeaderboard(data || []);

      if (user) {
        const userEntry = data?.find((entry: any) => entry.user_id === user.id);
        setUserRank(userEntry?.rank || null);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReferralCode = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('referral_short_code')
      .eq('user_id', user.id)
      .single();
    
    if (data?.referral_short_code) {
      setReferralCode(data.referral_short_code);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(language === 'pl' ? 'Link skopiowany!' : 'Link copied!');
  };

  const getPodiumPosition = (rank: number) => {
    if (rank === 1) return 'md:order-2 md:scale-110';
    if (rank === 2) return 'md:order-1';
    if (rank === 3) return 'md:order-3';
    return '';
  };

  const getTrophyColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return (
        <div className={`text-4xl ${getTrophyColor(rank)}`}>
          <Trophy className="h-12 w-12" />
        </div>
      );
    }
    return (
      <div className="text-2xl font-bold text-muted-foreground">
        #{rank}
      </div>
    );
  };

  return (
    <>
      <SEOManager
        title={language === 'pl' ? 'Ranking Polecających - Spirit Candles' : 'Referral Leaderboard - Spirit Candles'}
        description={language === 'pl' 
          ? 'Zobacz najlepszych polecających w programie Spirit Candles. Zdobywaj punkty, osiągaj nagrody i wspinaj się na szczyt rankingu!' 
          : 'See the top referrers in the Spirit Candles program. Earn points, unlock rewards, and climb to the top of the leaderboard!'}
      />

      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/20 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-12 w-12 text-primary animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold">{language === 'pl' ? 'Ranking Polecających' : 'Referral Leaderboard'}</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'pl' 
                ? 'Polecaj znajomym i zdobywaj punkty. Najlepsi polecający otrzymują ekskluzywne nagrody!' 
                : 'Refer friends and earn points. Top referrers get exclusive rewards!'}
            </p>
          </div>

          {/* User's Referral Card */}
          {user && referralCode && (
            <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  {language === 'pl' ? 'Twój Link Poleceń' : 'Your Referral Link'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                      <code className="flex-1 text-sm">{`${window.location.origin}?ref=${referralCode}`}</code>
                      <Button size="sm" variant="ghost" onClick={copyReferralLink}>
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {userRank && (
                    <Badge variant="outline" className="text-lg py-2 px-4">
                      {language === 'pl' ? 'Twoja pozycja' : 'Your Rank'}: #{userRank}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Period Selector */}
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="week">{language === 'pl' ? 'Tydzień' : 'Week'}</TabsTrigger>
              <TabsTrigger value="month">{language === 'pl' ? 'Miesiąc' : 'Month'}</TabsTrigger>
              <TabsTrigger value="all">{language === 'pl' ? 'Wszyscy' : 'All Time'}</TabsTrigger>
            </TabsList>

            <TabsContent value={period} className="mt-8">
              {loading ? (
                <div className="text-center py-12">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>
              ) : leaderboard.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{language === 'pl' ? 'Brak danych w tym okresie' : 'No data for this period'}</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Top 3 Podium */}
                  {period !== 'all' && leaderboard.length >= 3 && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                      {leaderboard.slice(0, 3).map((entry) => (
                        <Card 
                          key={entry.user_id} 
                          className={`${getPodiumPosition(entry.rank)} border-2 ${entry.rank === 1 ? 'border-yellow-500' : entry.rank === 2 ? 'border-gray-400' : 'border-orange-600'}`}
                        >
                          <CardContent className="pt-6 text-center space-y-4">
                            {getRankBadge(entry.rank)}
                            <Link to={`/profile/${entry.user_id}`}>
                              <Avatar className="h-20 w-20 mx-auto border-4 border-background ring-2 ring-primary/20">
                                <AvatarImage src={entry.profile.profile_image_url} />
                                <AvatarFallback>{entry.profile.first_name[0]}{entry.profile.last_name[0]}</AvatarFallback>
                              </Avatar>
                            </Link>
                            <div>
                              <h3 className="font-bold text-lg">{entry.profile.first_name} {entry.profile.last_name}</h3>
                              <p className="text-sm text-muted-foreground">@{entry.profile.username}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                              <div>
                                <p className="text-2xl font-bold text-primary">{entry.total_referrals}</p>
                                <p className="text-xs text-muted-foreground">{language === 'pl' ? 'Polecenia' : 'Referrals'}</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-secondary">{entry.total_points}</p>
                                <p className="text-xs text-muted-foreground">{language === 'pl' ? 'Punkty' : 'Points'}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Full Leaderboard */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{language === 'pl' ? 'Pełny Ranking' : 'Full Rankings'}</CardTitle>
                      <CardDescription>
                        {period === 'week' && (language === 'pl' ? 'Top 10 tego tygodnia' : 'Top 10 this week')}
                        {period === 'month' && (language === 'pl' ? 'Top 10 tego miesiąca' : 'Top 10 this month')}
                        {period === 'all' && (language === 'pl' ? 'Top 25 wszech czasów' : 'Top 25 all time')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {leaderboard.map((entry) => (
                          <Link 
                            key={entry.user_id} 
                            to={`/profile/${entry.user_id}`}
                            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                          >
                            <div className={`text-2xl font-bold w-12 text-center ${getTrophyColor(entry.rank)}`}>
                              {entry.rank <= 3 ? <Trophy className="h-6 w-6 mx-auto" /> : `#${entry.rank}`}
                            </div>
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={entry.profile.profile_image_url} />
                              <AvatarFallback>{entry.profile.first_name[0]}{entry.profile.last_name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">{entry.profile.first_name} {entry.profile.last_name}</h4>
                              <p className="text-sm text-muted-foreground">@{entry.profile.username}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-primary font-bold">
                                <TrendingUp className="h-4 w-4" />
                                {entry.total_referrals}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="h-3 w-3" />
                                {entry.total_points} pts
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* How It Works */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                {language === 'pl' ? 'Jak To Działa' : 'How It Works'}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold">{language === 'pl' ? '1. Udostępnij Link' : '1. Share Your Link'}</h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'pl' ? 'Podziel się swoim unikalnym linkiem z przyjaciółmi' : 'Share your unique link with friends'}
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold">{language === 'pl' ? '2. Zdobywaj Punkty' : '2. Earn Points'}</h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'pl' ? 'Otrzymuj punkty za każde udane polecenie' : 'Get points for each successful referral'}
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold">{language === 'pl' ? '3. Wspinaj Się' : '3. Climb the Ranks'}</h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'pl' ? 'Zdobywaj nagrody i osiągaj szczyty rankingu!' : 'Unlock rewards and reach the top!'}
                </p>
              </div>
            </CardContent>
          </Card>

          {!user && (
            <div className="text-center mt-8">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  <Star className="h-5 w-5" />
                  {language === 'pl' ? 'Dołącz Do Programu' : 'Join the Program'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
