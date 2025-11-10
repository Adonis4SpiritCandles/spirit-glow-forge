import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Mail, MousePointer, TrendingUp } from 'lucide-react';

export function EmailAnalytics() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalSent: 0,
    openRate: 0,
    clickRate: 0,
    conversions: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data } = await supabase
      .from('email_campaign_analytics' as any)
      .select('*');

    if (data) {
      const totalSent = data.length;
      const opened = data.filter((d: any) => d.opened_at).length;
      const clicked = data.filter((d: any) => d.clicked_at).length;
      const converted = data.filter((d: any) => d.converted_at).length;

      setStats({
        totalSent,
        openRate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (clicked / totalSent) * 100 : 0,
        conversions: converted
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{t('emailAnalytics')}</h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSent')}</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('openRate')}</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('clickRate')}</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clickRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('conversions')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversions}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}