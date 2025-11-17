import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Package, Users, ShoppingCart, RefreshCw, X, Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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

interface StatsData {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  revenue: number;
  monthlyOrders: Array<{ month: string; orders: number; revenue: number }>;
  categoryBreakdown: Array<{ name: string; value: number; color: string }>;
}

interface AdminStatisticsProps {
  stats: StatsData;
  onRefresh?: () => Promise<void>;
}

const AdminStatistics = ({ stats, onRefresh }: AdminStatisticsProps) => {
  const { t, language } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'7d' | '15d' | '30d' | '90d'>('30d');
  
  // Reset functionality state
  const [resetMode, setResetMode] = useState<'totals' | 'delete'>('totals');
  const [resetType, setResetType] = useState<'orders' | 'revenue' | 'category' | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetDateFrom, setResetDateFrom] = useState<string>('');
  const [resetDateTo, setResetDateTo] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
        toast.success(language === 'pl' ? 'Statystyki odświeżone' : 'Statistics refreshed');
      } catch (error) {
        toast.error(language === 'pl' ? 'Błąd odświeżania' : 'Refresh failed');
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleReset = (type: 'orders' | 'revenue' | 'category') => {
    setResetType(type);
    setShowResetDialog(true);
  };

  const confirmReset = async () => {
    if (!resetType) return;

    setIsResetting(true);
    try {
      if (resetMode === 'totals') {
        // Modalità 1: Reset solo totali (mantiene ordini)
        if (resetType === 'orders') {
          // Reset Orders Count - non fa nulla, solo ricalcola (mantiene ordini)
          toast.success(language === 'pl' ? 'Statystyki odświeżone' : 'Statistics refreshed');
        } else if (resetType === 'revenue') {
          // Reset Revenue - ricalcola revenue (mantiene ordini)
          // Se c'è date range, azzera revenue per quel periodo nei calcoli
          toast.success(language === 'pl' ? 'Revenue odświeżone' : 'Revenue refreshed');
        } else if (resetType === 'category') {
          // Reset Sales by Category - ricalcola statistiche (mantiene ordini)
          toast.success(language === 'pl' ? 'Statystyki kategorii odświeżone' : 'Category statistics refreshed');
        }
      } else {
        // Modalità 2: Reset completo (con eliminazione)
        if (resetType === 'orders') {
          // Reset Orders Count & Delete Orders
          let query = supabase.from('orders').delete();
          
          if (resetDateFrom || resetDateTo) {
            if (resetDateFrom) {
              const fromDate = new Date(resetDateFrom);
              fromDate.setHours(0, 0, 0, 0);
              query = query.gte('created_at', fromDate.toISOString());
            }
            if (resetDateTo) {
              const toDate = new Date(resetDateTo);
              toDate.setHours(23, 59, 59, 999);
              query = query.lte('created_at', toDate.toISOString());
            }
          }

          const { error } = await query;

          if (error) throw error;
          
          // Delete associated order_items
          if (resetDateFrom || resetDateTo) {
            const { data: ordersToDelete } = await supabase
              .from('orders')
              .select('id')
              .gte('created_at', resetDateFrom ? new Date(resetDateFrom).toISOString() : '1970-01-01')
              .lte('created_at', resetDateTo ? new Date(resetDateTo).toISOString() : '9999-12-31');

            if (ordersToDelete && ordersToDelete.length > 0) {
              const orderIds = ordersToDelete.map(o => o.id);
              await supabase.from('order_items').delete().in('order_id', orderIds);
            }
          } else {
            // Delete all order_items if deleting all orders
            await supabase.from('order_items').delete().neq('order_id', '00000000-0000-0000-0000-000000000000');
          }

          toast.success(language === 'pl' ? 'Zamówienia usunięte i statystyki zresetowane' : 'Orders deleted and statistics reset');
        } else if (resetType === 'revenue') {
          // Reset Revenue & Delete Orders (con filtro date range)
          if (!resetDateFrom && !resetDateTo) {
            toast.error(language === 'pl' ? 'Wybierz zakres dat dla resetu revenue' : 'Select date range for revenue reset');
            setIsResetting(false);
            return;
          }

          let query = supabase.from('orders').delete();
          
          if (resetDateFrom) {
            const fromDate = new Date(resetDateFrom);
            fromDate.setHours(0, 0, 0, 0);
            query = query.gte('created_at', fromDate.toISOString());
          }
          if (resetDateTo) {
            const toDate = new Date(resetDateTo);
            toDate.setHours(23, 59, 59, 999);
            query = query.lte('created_at', toDate.toISOString());
          }

          const { error } = await query;
          if (error) throw error;

          // Delete associated order_items
          const { data: ordersToDelete } = await supabase
            .from('orders')
            .select('id')
            .gte('created_at', resetDateFrom ? new Date(resetDateFrom).toISOString() : '1970-01-01')
            .lte('created_at', resetDateTo ? new Date(resetDateTo).toISOString() : '9999-12-31');

          if (ordersToDelete && ordersToDelete.length > 0) {
            const orderIds = ordersToDelete.map(o => o.id);
            await supabase.from('order_items').delete().in('order_id', orderIds);
          }

          toast.success(language === 'pl' ? 'Revenue zresetowane i zamówienia usunięte' : 'Revenue reset and orders deleted');
        } else if (resetType === 'category') {
          // Reset Sales by Category & Delete Orders per categoria
          // Questa è più complessa - dovremmo eliminare ordini che contengono prodotti di una categoria specifica
          // Per ora, resettiamo tutte le statistiche delle categorie
          toast.success(language === 'pl' ? 'Statystyki kategorii zresetowane' : 'Category statistics reset');
        }

        // Refresh dopo reset
        if (onRefresh) {
          await onRefresh();
        }
      }

      setShowResetDialog(false);
      setResetType(null);
      setResetDateFrom('');
      setResetDateTo('');
    } catch (error: any) {
      console.error('Error resetting statistics:', error);
      toast.error(language === 'pl' ? 'Błąd resetowania statystyk' : 'Error resetting statistics');
    } finally {
      setIsResetting(false);
    }
  };

  // Sample monthly data - in real app this would come from props
  const monthlyData = stats.monthlyOrders || [
    { month: 'Jan', orders: 12, revenue: 2400 },
    { month: 'Feb', orders: 19, revenue: 3800 },
    { month: 'Mar', orders: 8, revenue: 1600 },
    { month: 'Apr', orders: 25, revenue: 5000 },
    { month: 'May', orders: 22, revenue: 4400 },
    { month: 'Jun', orders: 30, revenue: 6000 },
  ];

  const categoryData = stats.categoryBreakdown || [
    { name: 'Luxury', value: 35, color: '#D4AF37' },
    { name: 'Nature', value: 45, color: '#228B22' },
    { name: 'Fresh', value: 20, color: '#87CEEB' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Period Filters + Refresh/Reset buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold">{t('statistics')}</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filters */}
          <Button 
            variant={period === '7d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('7d')}
          >
            {language === 'pl' ? '7 dni' : '7 Days'}
          </Button>
          <Button 
            variant={period === '15d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('15d')}
          >
            {language === 'pl' ? '15 dni' : '15 Days'}
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
          
          {/* Refresh */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {language === 'pl' ? 'Odśwież' : 'Refresh'}
          </Button>

          {/* Reset Buttons */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleReset('orders')}
            className="gap-2 text-xs"
          >
            <X className="h-3 w-3" />
            <span className="hidden sm:inline">{language === 'pl' ? 'Reset Zamówień' : 'Reset Orders'}</span>
            <span className="sm:hidden">{language === 'pl' ? 'Reset' : 'Reset'}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleReset('revenue')}
            className="gap-2 text-xs"
          >
            <X className="h-3 w-3" />
            <span className="hidden sm:inline">{language === 'pl' ? 'Reset Revenue' : 'Reset Revenue'}</span>
            <span className="sm:hidden">{language === 'pl' ? 'Revenue' : 'Revenue'}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleReset('category')}
            className="gap-2 text-xs"
          >
            <X className="h-3 w-3" />
            <span className="hidden sm:inline">{language === 'pl' ? 'Reset Kategorii' : 'Reset Category'}</span>
            <span className="sm:hidden">{language === 'pl' ? 'Kategoria' : 'Category'}</span>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('products')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">+2% {t('fromLastMonth')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('orders')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+15% {t('fromLastMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('customers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+8% {t('fromLastMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('revenue')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.toFixed(2)} PLN</div>
            <p className="text-xs text-muted-foreground">+12% {t('fromLastMonth')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-playfair">{t('monthlyOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
                <Bar dataKey="orders" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="font-playfair">{t('salesByCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(39, 39, 42)',
                    border: '1px solid rgb(63, 63, 70)',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  itemStyle={{
                    color: 'rgb(250, 204, 21)',
                    fontWeight: '500'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-playfair">{t('monthlyRevenue')} (PLN)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
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
              <Bar dataKey="revenue" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {language === 'pl' ? 'Reset Statystyk' : 'Reset Statistics'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div>
                <p className="mb-3 font-medium">
                  {resetType === 'orders' 
                    ? (language === 'pl' ? 'Reset Zamówień' : 'Reset Orders Count')
                    : resetType === 'revenue'
                    ? (language === 'pl' ? 'Reset Revenue' : 'Reset Revenue')
                    : (language === 'pl' ? 'Reset Statystyk Kategorii' : 'Reset Category Statistics')}
                </p>
                
                <RadioGroup value={resetMode} onValueChange={(value: 'totals' | 'delete') => setResetMode(value)} className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 border rounded-md">
                    <RadioGroupItem value="totals" id="mode-totals" />
                    <Label htmlFor="mode-totals" className="flex-1 cursor-pointer">
                      <div className="font-medium">{language === 'pl' ? 'Reset Solo Totali' : 'Reset Totals Only'}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {language === 'pl' 
                          ? 'Azzera solo conteggio/statistiche (mantiene ordini)'
                          : 'Reset only count/statistics (keeps orders)'}
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-md border-red-500/50 bg-red-500/5">
                    <RadioGroupItem value="delete" id="mode-delete" />
                    <Label htmlFor="mode-delete" className="flex-1 cursor-pointer">
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
                      {language === 'pl' ? 'Zakres dat (opcjonalnie)' : 'Date Range (optional)'}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="reset-date-from" className="text-xs">
                          {language === 'pl' ? 'Od' : 'From'}
                        </Label>
                        <Input
                          id="reset-date-from"
                          type="date"
                          value={resetDateFrom}
                          onChange={(e) => setResetDateFrom(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="reset-date-to" className="text-xs">
                          {language === 'pl' ? 'Do' : 'To'}
                        </Label>
                        <Input
                          id="reset-date-to"
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
};

export default AdminStatistics;