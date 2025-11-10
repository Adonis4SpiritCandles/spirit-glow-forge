import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { exportData, ExportFormat, ExportData } from '@/utils/exportHelpers';
import { Download, Calendar as CalendarIcon, FileText, Database, Users, ShoppingCart, Package } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type ExportType = 'analytics' | 'referrals' | 'customers' | 'orders' | 'products';

const METRICS = {
  analytics: ['date', 'orders', 'revenue', 'customers', 'avg_order_value'],
  referrals: ['referrer_name', 'referrals_count', 'conversions', 'revenue', 'conversion_rate'],
  customers: ['name', 'email', 'total_orders', 'total_spent', 'loyalty_points', 'registered_at'],
  orders: ['order_number', 'customer', 'total', 'status', 'created_at', 'shipping_status'],
  products: ['name', 'category', 'price', 'stock', 'sold_count', 'revenue']
};

export default function AdminAdvancedExport() {
  const { language } = useLanguage();
  const [exportType, setExportType] = useState<ExportType>('analytics');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('xlsx');
  const [dateFrom, setDateFrom] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(METRICS[exportType]);
  const [loading, setLoading] = useState(false);

  const handleExportTypeChange = (value: ExportType) => {
    setExportType(value);
    setSelectedMetrics(METRICS[value]);
  };

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      let exportDataResult: ExportData | null = null;

      switch (exportType) {
        case 'analytics':
          exportDataResult = await fetchAnalyticsData();
          break;
        case 'referrals':
          exportDataResult = await fetchReferralsData();
          break;
        case 'customers':
          exportDataResult = await fetchCustomersData();
          break;
        case 'orders':
          exportDataResult = await fetchOrdersData();
          break;
        case 'products':
          exportDataResult = await fetchProductsData();
          break;
      }

      if (exportDataResult) {
        exportData(exportDataResult, exportFormat);
        toast.success(language === 'pl' ? 'Export completato!' : 'Export completed!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(language === 'pl' ? 'Errore durante export' : 'Error during export');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async (): Promise<ExportData> => {
    const { data: orders } = await supabase
      .from('orders')
      .select('created_at, total_pln, user_id')
      .gte('created_at', dateFrom.toISOString())
      .lte('created_at', dateTo.toISOString())
      .eq('exclude_from_stats', false);

    // Group by date
    const dateMap = new Map<string, { orders: number; revenue: number; customers: Set<string> }>();
    
    orders?.forEach(order => {
      const date = format(new Date(order.created_at), 'yyyy-MM-dd');
      if (!dateMap.has(date)) {
        dateMap.set(date, { orders: 0, revenue: 0, customers: new Set() });
      }
      const current = dateMap.get(date)!;
      current.orders += 1;
      current.revenue += order.total_pln;
      current.customers.add(order.user_id);
    });

    const rows = Array.from(dateMap.entries()).map(([date, data]) => {
      const row: any[] = [];
      if (selectedMetrics.includes('date')) row.push(date);
      if (selectedMetrics.includes('orders')) row.push(data.orders);
      if (selectedMetrics.includes('revenue')) row.push(data.revenue.toFixed(2));
      if (selectedMetrics.includes('customers')) row.push(data.customers.size);
      if (selectedMetrics.includes('avg_order_value')) row.push((data.revenue / data.orders).toFixed(2));
      return row;
    });

    return {
      headers: selectedMetrics.map(m => m.replace(/_/g, ' ').toUpperCase()),
      rows,
      filename: `analytics_${format(dateFrom, 'yyyy-MM-dd')}_${format(dateTo, 'yyyy-MM-dd')}`
    };
  };

  const fetchReferralsData = async (): Promise<ExportData> => {
    const { data: referralUsages } = await (supabase as any)
      .from('referral_usages')
      .select('*')
      .gte('created_at', dateFrom.toISOString())
      .lte('created_at', dateTo.toISOString());

    const referrerMap = new Map<string, { 
      name: string; 
      referrals: number; 
      conversions: number; 
      revenue: number 
    }>();

    // Get referrer profiles
    const referrerIds = [...new Set((referralUsages as any[] || []).map((u: any) => u.referrer_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', referrerIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    for (const usage of referralUsages as any[] || []) {
      const referrerId = usage.referrer_id;
      const profile = profileMap.get(referrerId);
      const name = profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown';
      
      if (!referrerMap.has(referrerId)) {
        referrerMap.set(referrerId, { name, referrals: 0, conversions: 0, revenue: 0 });
      }
      
      const current = referrerMap.get(referrerId)!;
      current.referrals += 1;
      if (usage.reward_claimed) current.conversions += 1;
    }

    const rows = Array.from(referrerMap.values()).map(data => {
      const row: any[] = [];
      if (selectedMetrics.includes('referrer_name')) row.push(data.name);
      if (selectedMetrics.includes('referrals_count')) row.push(data.referrals);
      if (selectedMetrics.includes('conversions')) row.push(data.conversions);
      if (selectedMetrics.includes('revenue')) row.push(data.revenue.toFixed(2));
      if (selectedMetrics.includes('conversion_rate')) {
        row.push(data.referrals > 0 ? ((data.conversions / data.referrals) * 100).toFixed(2) + '%' : '0%');
      }
      return row;
    });

    return {
      headers: selectedMetrics.map(m => m.replace(/_/g, ' ').toUpperCase()),
      rows,
      filename: `referrals_${format(dateFrom, 'yyyy-MM-dd')}_${format(dateTo, 'yyyy-MM-dd')}`
    };
  };

  const fetchCustomersData = async (): Promise<ExportData> => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .gte('created_at', dateFrom.toISOString())
      .lte('created_at', dateTo.toISOString());

    // Get orders for each profile
    const { data: orders } = await supabase
      .from('orders')
      .select('user_id, total_pln');

    const ordersByUser = new Map<string, any[]>();
    (orders || []).forEach(order => {
      if (!ordersByUser.has(order.user_id)) {
        ordersByUser.set(order.user_id, []);
      }
      ordersByUser.get(order.user_id)!.push(order);
    });

    const rows = (profiles as any[] || []).map((profile: any) => {
      const userOrders = ordersByUser.get(profile.user_id) || [];
      const totalOrders = userOrders.length;
      const totalSpent = userOrders.reduce((sum: number, o: any) => sum + o.total_pln, 0);
      
      const row: any[] = [];
      if (selectedMetrics.includes('name')) row.push(`${profile.first_name} ${profile.last_name}`);
      if (selectedMetrics.includes('email')) row.push(profile.email || 'N/A');
      if (selectedMetrics.includes('total_orders')) row.push(totalOrders);
      if (selectedMetrics.includes('total_spent')) row.push(totalSpent.toFixed(2));
      if (selectedMetrics.includes('loyalty_points')) row.push(profile.spirit_points || 0);
      if (selectedMetrics.includes('registered_at')) row.push(format(new Date(profile.created_at), 'yyyy-MM-dd'));
      return row;
    });

    return {
      headers: selectedMetrics.map(m => m.replace(/_/g, ' ').toUpperCase()),
      rows,
      filename: `customers_${format(dateFrom, 'yyyy-MM-dd')}_${format(dateTo, 'yyyy-MM-dd')}`
    };
  };

  const fetchOrdersData = async (): Promise<ExportData> => {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', dateFrom.toISOString())
      .lte('created_at', dateTo.toISOString())
      .eq('exclude_from_stats', false);

    // Get profiles for customer names
    const userIds = [...new Set((orders as any[] || []).map((o: any) => o.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', userIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    const rows = (orders as any[] || []).map((order: any) => {
      const profile = profileMap.get(order.user_id);
      const row: any[] = [];
      if (selectedMetrics.includes('order_number')) row.push(order.order_number);
      if (selectedMetrics.includes('customer')) {
        row.push(profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown');
      }
      if (selectedMetrics.includes('total')) row.push(order.total_pln.toFixed(2));
      if (selectedMetrics.includes('status')) row.push(order.status);
      if (selectedMetrics.includes('created_at')) row.push(format(new Date(order.created_at), 'yyyy-MM-dd HH:mm'));
      if (selectedMetrics.includes('shipping_status')) row.push(order.shipping_status || 'N/A');
      return row;
    });

    return {
      headers: selectedMetrics.map(m => m.replace(/_/g, ' ').toUpperCase()),
      rows,
      filename: `orders_${format(dateFrom, 'yyyy-MM-dd')}_${format(dateTo, 'yyyy-MM-dd')}`
    };
  };

  const fetchProductsData = async (): Promise<ExportData> => {
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('exclude_from_stats', false);

    // Get order items for sales data
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity, price_pln');

    const itemsByProduct = new Map<string, any[]>();
    (orderItems || []).forEach(item => {
      if (!itemsByProduct.has(item.product_id)) {
        itemsByProduct.set(item.product_id, []);
      }
      itemsByProduct.get(item.product_id)!.push(item);
    });

    const rows = (products as any[] || []).map((product: any) => {
      const items = itemsByProduct.get(product.id) || [];
      const soldCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const revenue = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price_pln), 0);
      
      const row: any[] = [];
      if (selectedMetrics.includes('name')) row.push(language === 'pl' ? product.name_pl : product.name_en);
      if (selectedMetrics.includes('category')) row.push(product.category || 'N/A');
      if (selectedMetrics.includes('price')) row.push(product.price_pln.toFixed(2));
      if (selectedMetrics.includes('stock')) row.push(product.quantity_in_stock || 0);
      if (selectedMetrics.includes('sold_count')) row.push(soldCount);
      if (selectedMetrics.includes('revenue')) row.push(revenue.toFixed(2));
      return row;
    });

    return {
      headers: selectedMetrics.map(m => m.replace(/_/g, ' ').toUpperCase()),
      rows,
      filename: `products_${format(new Date(), 'yyyy-MM-dd')}`
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'pl' ? 'Export Avanzato' : 'Advanced Export'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'pl' 
            ? 'Esporta dati con filtri personalizzabili in formato CSV, Excel o JSON'
            : 'Export data with customizable filters in CSV, Excel, or JSON format'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'pl' ? 'Configurazione' : 'Configuration'}</CardTitle>
            <CardDescription>
              {language === 'pl' ? 'Seleziona tipo di dati e formato' : 'Select data type and format'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Tipo di Dati' : 'Data Type'}</Label>
              <Select value={exportType} onValueChange={(v) => handleExportTypeChange(v as ExportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analytics">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Analytics
                    </div>
                  </SelectItem>
                  <SelectItem value="referrals">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Referrals
                    </div>
                  </SelectItem>
                  <SelectItem value="customers">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {language === 'pl' ? 'Clienti' : 'Customers'}
                    </div>
                  </SelectItem>
                  <SelectItem value="orders">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      {language === 'pl' ? 'Ordini' : 'Orders'}
                    </div>
                  </SelectItem>
                  <SelectItem value="products">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {language === 'pl' ? 'Prodotti' : 'Products'}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Formato Export' : 'Export Format'}</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'pl' ? 'Data Inizio' : 'Date From'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateFrom, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFrom} onSelect={(date) => date && setDateFrom(date)} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>{language === 'pl' ? 'Data Fine' : 'Date To'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateTo, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateTo} onSelect={(date) => date && setDateTo(date)} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'pl' ? 'Metriche da Esportare' : 'Metrics to Export'}</CardTitle>
            <CardDescription>
              {language === 'pl' ? 'Seleziona le colonne da includere' : 'Select columns to include'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {METRICS[exportType].map(metric => (
                <div key={metric} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric}
                    checked={selectedMetrics.includes(metric)}
                    onCheckedChange={() => toggleMetric(metric)}
                  />
                  <Label htmlFor={metric} className="cursor-pointer">
                    {metric.replace(/_/g, ' ').toUpperCase()}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleExport} 
            disabled={loading || selectedMetrics.length === 0}
            size="lg"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {loading 
              ? (language === 'pl' ? 'Esportazione...' : 'Exporting...') 
              : (language === 'pl' ? 'Esporta Dati' : 'Export Data')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
