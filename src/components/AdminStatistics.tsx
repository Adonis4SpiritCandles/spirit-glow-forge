import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Package, Users, ShoppingCart, RefreshCw, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

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

  const handleReset = () => {
    if (confirm(language === 'pl' ? 'Czy na pewno chcesz odświeżyć statystyki?' : 'Are you sure you want to refresh statistics?')) {
      handleRefresh();
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
      {/* Header with Refresh/Reset buttons */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{t('statistics')}</h2>
        <div className="flex items-center gap-2">
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            {language === 'pl' ? 'Reset' : 'Reset'}
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
    </div>
  );
};

export default AdminStatistics;