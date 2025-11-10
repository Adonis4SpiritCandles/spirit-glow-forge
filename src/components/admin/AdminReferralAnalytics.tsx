import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, TrendingUp, Gift, DollarSign, RefreshCw, Award } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  conversionRate: number;
  totalRewards: number;
  topReferrers: Array<{
    user_id: string;
    first_name: string;
    last_name: string;
    profile_image_url: string;
    referral_count: number;
    completed_count: number;
    total_points: number;
  }>;
  timelineData: Array<{
    date: string;
    referrals: number;
    completed: number;
  }>;
}

export default function AdminReferralAnalytics() {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    completedReferrals: 0,
    conversionRate: 0,
    totalRewards: 0,
    topReferrers: [],
    timelineData: []
  });

  useEffect(() => {
    loadReferralAnalytics();
  }, [period]);

  const loadReferralAnalytics = async () => {
    setLoading(true);
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), days);

      // Get all referrals
      const { data: referrals } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:referrer_id (
            user_id,
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .gte('created_at', startDate.toISOString());

      // Calculate stats
      const totalReferrals = referrals?.length || 0;
      const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
      const conversionRate = totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0;
      const totalRewards = referrals?.filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.reward_points || 0), 0) || 0;

      // Top referrers
      const referrerMap = new Map<string, {
        user: any;
        referral_count: number;
        completed_count: number;
        total_points: number;
      }>();

      for (const ref of referrals || []) {
        const referrerId = ref.referrer_id;
        if (!referrerMap.has(referrerId)) {
          referrerMap.set(referrerId, {
            user: ref.referrer,
            referral_count: 0,
            completed_count: 0,
            total_points: 0
          });
        }
        const current = referrerMap.get(referrerId)!;
        current.referral_count += 1;
        if (ref.status === 'completed') {
          current.completed_count += 1;
          current.total_points += ref.reward_points || 0;
        }
      }

      const topReferrers = Array.from(referrerMap.entries())
        .map(([user_id, data]) => ({
          user_id,
          first_name: data.user?.first_name || '',
          last_name: data.user?.last_name || '',
          profile_image_url: data.user?.profile_image_url || '',
          referral_count: data.referral_count,
          completed_count: data.completed_count,
          total_points: data.total_points
        }))
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 10);

      // Timeline data
      const timelineMap = new Map<string, { referrals: number; completed: number }>();
      referrals?.forEach(ref => {
        const date = format(new Date(ref.created_at), 'MMM dd');
        if (!timelineMap.has(date)) {
          timelineMap.set(date, { referrals: 0, completed: 0 });
        }
        const current = timelineMap.get(date)!;
        current.referrals += 1;
        if (ref.status === 'completed') {
          current.completed += 1;
        }
      });

      const timelineData = Array.from(timelineMap.entries()).map(([date, data]) => ({
        date,
        ...data
      }));

      setStats({
        totalReferrals,
        completedReferrals,
        conversionRate: Math.round(conversionRate * 10) / 10,
        totalRewards,
        topReferrers,
        timelineData
      });
    } catch (error) {
      console.error('Referral analytics error:', error);
      toast.error(language === 'pl' ? 'Błąd ładowania referral analytics' : 'Failed to load referral analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {language === 'pl' ? 'Referral Analytics' : 'Referral Analytics'}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant={period === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('7d')}
          >
            7d
          </Button>
          <Button
            variant={period === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('30d')}
          >
            30d
          </Button>
          <Button
            variant={period === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('90d')}
          >
            90d
          </Button>
          <Button variant="outline" size="sm" onClick={loadReferralAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              {language === 'pl' ? 'Referral Totali' : 'Total Referrals'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="h-4 w-4" />
              {language === 'pl' ? 'Completati' : 'Completed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {language === 'pl' ? 'Tasso Conversione' : 'Conversion Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {language === 'pl' ? 'Punti Totali' : 'Total Points'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRewards}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'pl' ? 'Timeline Conversioni' : 'Conversion Timeline'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="referrals" stroke="#D4AF37" name={language === 'pl' ? 'Referral' : 'Referrals'} />
                <Line type="monotone" dataKey="completed" stroke="#228B22" name={language === 'pl' ? 'Completati' : 'Completed'} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Referrers Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'pl' ? 'Top 5 Referrer per Punti' : 'Top 5 Referrers by Points'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topReferrers.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="first_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_points" fill="#D4AF37" name={language === 'pl' ? 'Punti' : 'Points'} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {language === 'pl' ? 'Top 10 Referrer' : 'Top 10 Referrers'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topReferrers.map((referrer, index) => (
              <div key={referrer.user_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </span>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={referrer.profile_image_url || '/assets/mini-spirit-logo.png'} />
                    <AvatarFallback>{referrer.first_name[0]}{referrer.last_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{referrer.first_name} {referrer.last_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'pl' ? 'Referral:' : 'Referrals:'} {referrer.referral_count} | 
                      {language === 'pl' ? ' Completati:' : ' Completed:'} {referrer.completed_count}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{referrer.total_points} pts</div>
                  <Badge variant="secondary" className="text-xs">
                    {language === 'pl' ? 'Tasso:' : 'Rate:'} {referrer.referral_count > 0 ? Math.round((referrer.completed_count / referrer.referral_count) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
