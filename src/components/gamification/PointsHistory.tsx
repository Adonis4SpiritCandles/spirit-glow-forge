import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Award, ShoppingBag, Gift, Star, Plus, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PointsHistory {
  id: string;
  points_change: number;
  reason: string;
  action_type: 'earn' | 'spend' | 'bonus';
  reference_type: string | null;
  created_at: string;
}

export default function PointsHistory() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadPointsHistory();
    }
  }, [user]);

  const loadPointsHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('loyalty_points_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading points history:', error);
    } else if (data) {
      const typedData = data.map(item => ({
        ...item,
        action_type: item.action_type as 'earn' | 'spend' | 'bonus'
      }));
      setHistory(typedData);
      
      // Prepare chart data (cumulative points over time)
      const sortedData = [...typedData].reverse();
      let cumulative = 0;
      const chart = sortedData.map((item) => {
        cumulative += item.points_change;
        return {
          date: format(new Date(item.created_at), 'MMM dd'),
          points: cumulative,
        };
      });
      setChartData(chart);
    }
    setLoading(false);
  };

  const filteredHistory = filterType === 'all' 
    ? history 
    : history.filter(h => h.action_type === filterType);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'spend':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'bonus':
        return <Gift className="h-4 w-4 text-yellow-500" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getReferenceIcon = (refType: string | null) => {
    switch (refType) {
      case 'order':
        return <ShoppingBag className="h-4 w-4" />;
      case 'referral':
        return <Gift className="h-4 w-4" />;
      case 'badge':
        return <Award className="h-4 w-4" />;
      case 'review':
        return <Star className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cumulative Points Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {language === 'pl' ? 'Wykres Punktów' : 'Points Graph'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Points History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {language === 'pl' ? 'Historia Punktów' : 'Points History'}
            </CardTitle>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'pl' ? 'Wszystkie' : 'All'}</SelectItem>
                <SelectItem value="earn">{language === 'pl' ? 'Zdobyte' : 'Earned'}</SelectItem>
                <SelectItem value="spend">{language === 'pl' ? 'Wydane' : 'Spent'}</SelectItem>
                <SelectItem value="bonus">{language === 'pl' ? 'Bonusy' : 'Bonuses'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              {language === 'pl' ? 'Brak historii punktów' : 'No points history yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'pl' ? 'Data' : 'Date'}</TableHead>
                    <TableHead>{language === 'pl' ? 'Akcja' : 'Action'}</TableHead>
                    <TableHead>{language === 'pl' ? 'Powód' : 'Reason'}</TableHead>
                    <TableHead className="text-right">{language === 'pl' ? 'Punkty' : 'Points'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(item.created_at), 'dd MMM yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(item.action_type)}
                          {getReferenceIcon(item.reference_type)}
                          <Badge 
                            variant={item.action_type === 'earn' || item.action_type === 'bonus' ? 'default' : 'secondary'}
                          >
                            {item.action_type === 'earn' && (language === 'pl' ? 'Zdobyte' : 'Earned')}
                            {item.action_type === 'spend' && (language === 'pl' ? 'Wydane' : 'Spent')}
                            {item.action_type === 'bonus' && (language === 'pl' ? 'Bonus' : 'Bonus')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.reason}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={item.points_change > 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.points_change > 0 ? '+' : ''}{item.points_change}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
