import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TrendingUp, Users, ShoppingCart, DollarSign, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AnalyticsData {
  salesByPeriod: Array<{ date: string; sales: number; revenue: number }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  conversionRate: number;
  activeUsers: number;
  newRegistrations: number;
  avgOrderValue: number;
  totalRevenue: number;
  totalOrders: number;
}

export default function AdminAdvancedAnalytics() {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  
  // Reset functionality state
  const [resetMode, setResetMode] = useState<'totals' | 'delete'>('totals');
  const [resetType, setResetType] = useState<'orders' | 'revenue' | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetDateFrom, setResetDateFrom] = useState<string>('');
  const [resetDateTo, setResetDateTo] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);
  const [data, setData] = useState<AnalyticsData>({
    salesByPeriod: [],
    topProducts: [],
    conversionRate: 0,
    activeUsers: 0,
    newRegistrations: 0,
    avgOrderValue: 0,
    totalRevenue: 0,
    totalOrders: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const confirmReset = async () => {
    setIsResetting(true);
    try {
      if (resetMode === 'delete' && resetType) {
        // Delete orders in date range
        let query = supabase.from('orders').delete();
        if (resetDateFrom) {
          query = query.gte('created_at', resetDateFrom);
        }
        if (resetDateTo) {
          query = query.lte('created_at', resetDateTo);
        }
        const { error } = await query;
        if (error) throw error;
      }
      // Reload analytics (will recalculate)
      await loadAnalytics();
      setShowResetDialog(false);
      toast.success(language === 'pl' ? 'Reset zakończony' : 'Reset completed');
    } catch (error: any) {
      toast.error(language === 'pl' ? `Błąd: ${error.message}` : `Error: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), days);

      // Sales by period
      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total_pln, status')
        .gte('created_at', startDate.toISOString())
        .eq('exclude_from_stats', false);

      // Group by date
      const salesMap = new Map<string, { sales: number; revenue: number }>();
      orders?.forEach(order => {
        const date = format(new Date(order.created_at), 'MMM dd');
        if (!salesMap.has(date)) {
          salesMap.set(date, { sales: 0, revenue: 0 });
        }
        const current = salesMap.get(date)!;
        current.sales += 1;
        current.revenue += order.total_pln;
      });

      const salesByPeriod = Array.from(salesMap.entries()).map(([date, data]) => ({
        date,
        ...data
      }));

      // Top products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          quantity,
          price_pln,
          products:product_id (
            name_en,
            name_pl
          )
        `);

      const productMap = new Map<string, { quantity: number; revenue: number }>();
      orderItems?.forEach((item: any) => {
        const name = language === 'pl' ? item.products?.name_pl : item.products?.name_en;
        if (name && !productMap.has(name)) {
          productMap.set(name, { quantity: 0, revenue: 0 });
        }
        if (name) {
          const current = productMap.get(name)!;
          current.quantity += item.quantity;
          current.revenue += item.price_pln * item.quantity;
        }
      });

      const topProducts = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Active users (logged in last 7 days)
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_sign_in_at', subDays(new Date(), 7).toISOString());

      // New registrations
      const { count: newRegistrations } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Conversion rate
      const conversionRate = orders && orders.length > 0 && activeUsers 
        ? ((orders.length / activeUsers) * 100) 
        : 0;

      // Avg order value
      const totalRevenue = orders?.reduce((sum, o) => sum + o.total_pln, 0) || 0;
      const avgOrderValue = orders && orders.length > 0 ? totalRevenue / orders.length : 0;

      setData({
        salesByPeriod,
        topProducts,
        conversionRate: Math.round(conversionRate * 10) / 10,
        activeUsers: activeUsers || 0,
        newRegistrations: newRegistrations || 0,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalRevenue,
        totalOrders: orders?.length || 0
      });
    } catch (error) {
      console.error('Analytics error:', error);
      toast.error(language === 'pl' ? 'Błąd ładowania analytics' : 'Failed to load analytics');
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
          {language === 'pl' ? 'Zaawansowana analityka' : 'Advanced Analytics'}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant={period === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('7d')}
          >
            {language === 'pl' ? '7 dni' : '7 Days'}
          </Button>
          <Button
            variant={period === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('30d')}
          >
            {language === 'pl' ? '30 dni' : '30 Days'}
          </Button>
          <Button
            variant={period === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('90d')}
          >
            {language === 'pl' ? '90 dni' : '90 Days'}
          </Button>
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          {/* Reset Buttons */}
          <div className="h-6 w-px bg-border mx-1" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setResetType('orders');
              setShowResetDialog(true);
            }}
            className="gap-2 text-xs"
          >
            <X className="h-3 w-3" />
            <span className="hidden sm:inline">{language === 'pl' ? 'Reset Zamówień' : 'Reset Orders'}</span>
            <span className="sm:hidden">{language === 'pl' ? 'Reset' : 'Reset'}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setResetType('revenue');
              setShowResetDialog(true);
            }}
            className="gap-2 text-xs"
          >
            <X className="h-3 w-3" />
            <span className="hidden sm:inline">{language === 'pl' ? 'Reset Revenue' : 'Reset Revenue'}</span>
            <span className="sm:hidden">{language === 'pl' ? 'Revenue' : 'Revenue'}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {language === 'pl' ? 'Zamówienia ogółem' : 'Total Orders'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'pl' ? 'w ostatnich' : 'in the last'} {period === '7d' ? '7' : period === '30d' ? '30' : '90'} {language === 'pl' ? 'dniach' : 'days'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {language === 'pl' ? 'Suma przychodów' : 'Total Revenue'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRevenue.toFixed(2)} PLN</div>
            <p className="text-xs text-muted-foreground">
              {language === 'pl' ? 'Średnia wartość zamówienia:' : 'Avg order value:'} {data.avgOrderValue.toFixed(2)} PLN
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              {language === 'pl' ? 'Użytkownicy aktywni' : 'Active Users'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'pl' ? 'Nowe rejestracje:' : 'New registrations:'} {data.newRegistrations}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {language === 'pl' ? 'Współczynnik konwersji' : 'Conversion Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {language === 'pl' ? 'Zamówienia / Aktywni użytkownicy' : 'Orders / Active users'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'pl' ? 'Sprzedaż wg okresu' : 'Sales by Period'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.salesByPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(39, 39, 42)',
                    border: '1px solid rgb(63, 63, 70)',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{
                    color: 'rgb(250, 250, 250)',
                    fontWeight: '600'
                  }}
                  itemStyle={{
                    color: 'rgb(250, 204, 21)',
                    fontWeight: '500'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#D4AF37" name={language === 'pl' ? 'Sprzedaż' : 'Sales'} />
                <Line type="monotone" dataKey="revenue" stroke="#228B22" name="Revenue (PLN)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'pl' ? 'Najlepiej sprzedające się produkty' : 'Top Selling Products'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topProducts.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(39, 39, 42)',
                    border: '1px solid rgb(63, 63, 70)',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{
                    color: 'rgb(250, 250, 250)',
                    fontWeight: '600'
                  }}
                  itemStyle={{
                    color: 'rgb(250, 204, 21)',
                    fontWeight: '500'
                  }}
                />
                <Bar dataKey="revenue" fill="#D4AF37" name="Revenue (PLN)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'pl' ? 'Top 10 produktów wg przychodu' : 'Top 10 Products by Revenue'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-accent">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{product.revenue.toFixed(2)} PLN</div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'pl' ? 'Ilość:' : 'Qty:'} {product.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {language === 'pl' ? 'Reset Analytics' : 'Reset Analytics'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div>
                <p className="mb-3 font-medium">
                  {resetType === 'orders' 
                    ? (language === 'pl' ? 'Reset Zamówień' : 'Reset Total Orders')
                    : (language === 'pl' ? 'Reset Revenue' : 'Reset Total Revenue')}
                </p>
                
                <RadioGroup value={resetMode} onValueChange={(value: 'totals' | 'delete') => setResetMode(value)} className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 border rounded-md">
                    <RadioGroupItem value="totals" id="analytics-mode-totals" />
                    <Label htmlFor="analytics-mode-totals" className="flex-1 cursor-pointer">
                      <div className="font-medium">{language === 'pl' ? 'Reset Solo Totali' : 'Reset Totals Only'}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {language === 'pl' 
                          ? 'Azzera solo conteggio/statistiche (mantiene ordini)'
                          : 'Reset only count/statistics (keeps orders)'}
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-md border-red-500/50 bg-red-500/5">
                    <RadioGroupItem value="delete" id="analytics-mode-delete" />
                    <Label htmlFor="analytics-mode-delete" className="flex-1 cursor-pointer">
                      <div className="font-medium text-red-600">{language === 'pl' ? 'Reset Completo (con eliminazione)' : 'Complete Reset (with deletion)'}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {language === 'pl' 
                          ? 'Azzera statistiche ED elimina ordini selezionati'
                          : 'Reset statistics AND delete selected orders'}
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {(resetMode === 'delete' || resetType === 'revenue') && (
                  <div className="mt-4 space-y-3 pt-3 border-t">
                    <Label className="text-sm font-medium">
                      {language === 'pl' ? 'Zakres dat' : 'Date Range'}
                      {resetType === 'revenue' && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="analytics-reset-date-from" className="text-xs">
                          {language === 'pl' ? 'Od' : 'From'}
                        </Label>
                        <Input
                          id="analytics-reset-date-from"
                          type="date"
                          value={resetDateFrom}
                          onChange={(e) => setResetDateFrom(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="analytics-reset-date-to" className="text-xs">
                          {language === 'pl' ? 'Do' : 'To'}
                        </Label>
                        <Input
                          id="analytics-reset-date-to"
                          type="date"
                          value={resetDateTo}
                          onChange={(e) => setResetDateTo(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {resetMode === 'delete' && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                    <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {language === 'pl' 
                        ? 'UWAGA: Ta akcja jest nieodwracalna! Zamówienia zostaną trwale usunięte.'
                        : 'WARNING: This action is irreversible! Orders will be permanently deleted.'}
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>
              {language === 'pl' ? 'Anuluj' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReset}
              disabled={isResetting}
              className={resetMode === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isResetting 
                ? (language === 'pl' ? 'Resetowanie...' : 'Resetting...')
                : (language === 'pl' ? 'Potwierdź Reset' : 'Confirm Reset')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
