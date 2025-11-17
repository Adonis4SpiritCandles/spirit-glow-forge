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
import { Download, Calendar as CalendarIcon, FileText, Database, Users, ShoppingCart, Package, Upload, Archive, Save, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

  // Backup functions
  const exportFullBackup = async (format: 'xlsx' | 'csv' | 'txt' | 'json') => {
    try {
      const backup: any = {};

      // Statistics (calculated from orders)
      const { data: ordersData } = await supabase.from('orders').select('*').eq('exclude_from_stats', false);
      backup.statistics = {
        totalOrders: ordersData?.length || 0,
        totalRevenue: ordersData?.reduce((sum, o) => sum + o.total_pln, 0) || 0,
        orders: ordersData || []
      };

      // Contacts
      const { data: contactsData } = await supabase.from('newsletter_subscribers').select('*');
      backup.contacts = contactsData || [];

      // Products
      const { data: productsData } = await supabase.from('products').select('*');
      backup.products = productsData || [];

      // Categories (collections)
      const { data: categoriesData } = await supabase.from('collections').select('*');
      backup.categories = categoriesData || [];

      // Social Media
      const { data: socialData } = await supabase.from('social_media').select('*');
      backup.social = socialData || [];

      // Coupons
      const { data: couponsData } = await supabase.from('coupons').select('*');
      backup.coupons = couponsData || [];

      // Emails (newsletter settings, etc.)
      const { data: newsletterSettings } = await supabase.from('newsletter_settings').select('*').single();
      backup.emails = newsletterSettings || {};

      // Chat Responses
      const { data: chatResponsesData } = await supabase.from('chat_responses').select('*');
      backup.chat = chatResponsesData || [];

      // Orders
      backup.orders = ordersData || [];

      // Collections
      backup.collections = categoriesData || [];

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `full_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(language === 'pl' ? 'Backup completo esportato' : 'Full backup exported');
      } else {
        // For other formats, export as structured data
        const exportDataResult: ExportData = {
          headers: ['Category', 'Count', 'Data'],
          rows: Object.entries(backup).map(([key, value]: [string, any]) => [
            key,
            Array.isArray(value) ? value.length : 1,
            JSON.stringify(value)
          ]),
          filename: `full_backup_${format(new Date(), 'yyyy-MM-dd')}`
        };
        exportData(exportDataResult, format as ExportFormat);
        toast.success(language === 'pl' ? 'Backup completo esportato' : 'Full backup exported');
      }
    } catch (error) {
      console.error('Export full backup error:', error);
      throw error;
    }
  };

  const restoreFullBackup = async (file: File) => {
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!confirm(language === 'pl' 
        ? 'Czy na pewno chcesz przywrócić pełny backup? To może nadpisać istniejące dane!'
        : 'Are you sure you want to restore full backup? This may overwrite existing data!')) {
        return;
      }

      setLoading(true);
      toast.info(language === 'pl' ? 'Przywracanie backupu...' : 'Restoring backup...');

      // Restore each category
      if (backup.products && Array.isArray(backup.products)) {
        const { error } = await supabase.from('products').upsert(backup.products, { onConflict: 'id' });
        if (error) throw error;
      }
      
      if (backup.contacts && Array.isArray(backup.contacts)) {
        const { error } = await supabase.from('newsletter_subscribers').upsert(backup.contacts, { onConflict: 'id' });
        if (error) throw error;
      }
      
      if (backup.categories && Array.isArray(backup.categories)) {
        const { error } = await supabase.from('collections').upsert(backup.categories, { onConflict: 'id' });
        if (error) throw error;
      }
      
      if (backup.social && Array.isArray(backup.social)) {
        const { error } = await supabase.from('social_media').upsert(backup.social, { onConflict: 'id' });
        if (error) throw error;
      }
      
      if (backup.coupons && Array.isArray(backup.coupons)) {
        const { error } = await supabase.from('coupons').upsert(backup.coupons, { onConflict: 'id' });
        if (error) throw error;
      }
      
      if (backup.emails && typeof backup.emails === 'object') {
        const { error } = await supabase.from('newsletter_settings').upsert(backup.emails, { onConflict: 'id' });
        if (error) throw error;
      }
      
      if (backup.chat && Array.isArray(backup.chat)) {
        const { error } = await supabase.from('chat_responses').upsert(backup.chat, { onConflict: 'id' });
        if (error) throw error;
      }
      
      if (backup.orders && Array.isArray(backup.orders)) {
        const { error } = await supabase.from('orders').upsert(backup.orders, { onConflict: 'id' });
        if (error) throw error;
      }

      toast.success(language === 'pl' ? 'Backup przywrócony pomyślnie' : 'Backup restored successfully');
    } catch (error: any) {
      console.error('Restore full backup error:', error);
      toast.error(language === 'pl' ? `Błąd przywracania: ${error.message}` : `Restore error: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const exportCategoryBackup = async (category: string, format: 'xlsx' | 'csv' | 'txt' | 'json') => {
    try {
      let data: any = null;

      switch (category) {
        case 'statistics':
          const { data: ordersStat } = await supabase.from('orders').select('*').eq('exclude_from_stats', false);
          data = {
            totalOrders: ordersStat?.length || 0,
            totalRevenue: ordersStat?.reduce((sum: number, o: any) => sum + o.total_pln, 0) || 0,
            orders: ordersStat || []
          };
          break;
        case 'contacts':
          const { data: contacts } = await supabase.from('newsletter_subscribers').select('*');
          data = contacts || [];
          break;
        case 'products':
          const { data: products } = await supabase.from('products').select('*');
          data = products || [];
          break;
        case 'categories':
          const { data: categories } = await supabase.from('collections').select('*');
          data = categories || [];
          break;
        case 'social':
          const { data: social } = await supabase.from('social_media').select('*');
          data = social || [];
          break;
        case 'coupons':
          const { data: coupons } = await supabase.from('coupons').select('*');
          data = coupons || [];
          break;
        case 'emails':
          const { data: newsletter } = await supabase.from('newsletter_settings').select('*').single();
          data = newsletter || {};
          break;
        case 'chat':
          const { data: chatResponses } = await supabase.from('chat_responses').select('*');
          data = chatResponses || [];
          break;
        case 'orders':
          const { data: orders } = await supabase.from('orders').select('*');
          data = orders || [];
          break;
        case 'collections':
          const { data: collections } = await supabase.from('collections').select('*');
          data = collections || [];
          break;
      }

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${category}_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(language === 'pl' ? `Backup ${category} esportato` : `${category} backup exported`);
      } else {
        // Convert to ExportData format
        const exportDataResult: ExportData = {
          headers: Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : ['data'],
          rows: Array.isArray(data) 
            ? data.map(item => Object.values(item))
            : [[JSON.stringify(data)]],
          filename: `${category}_backup_${format(new Date(), 'yyyy-MM-dd')}`
        };
        exportData(exportDataResult, format as ExportFormat);
        toast.success(language === 'pl' ? `Backup ${category} esportato` : `${category} backup exported`);
      }
    } catch (error) {
      console.error(`Export ${category} backup error:`, error);
      throw error;
    }
  };

  const restoreCategoryBackup = async (category: string, file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!confirm(language === 'pl' 
        ? `Czy na pewno chcesz przywrócić backup ${category}? To może nadpisać istniejące dane!`
        : `Are you sure you want to restore ${category} backup? This may overwrite existing data!`)) {
        return;
      }

      setLoading(true);
      toast.info(language === 'pl' ? `Przywracanie ${category}...` : `Restoring ${category}...`);
      
      let error: any = null;
      
      switch (category) {
        case 'statistics':
          // Statistics are calculated from orders, so restore orders if present
          if (data.orders && Array.isArray(data.orders)) {
            const result = await supabase.from('orders').upsert(data.orders, { onConflict: 'id' });
            error = result.error;
          }
          break;
        case 'contacts':
          if (Array.isArray(data)) {
            const result = await supabase.from('newsletter_subscribers').upsert(data, { onConflict: 'id' });
            error = result.error;
          }
          break;
        case 'products':
          if (Array.isArray(data)) {
            const result = await supabase.from('products').upsert(data, { onConflict: 'id' });
            error = result.error;
          }
          break;
        case 'categories':
          if (Array.isArray(data)) {
            const result = await supabase.from('collections').upsert(data, { onConflict: 'id' });
            error = result.error;
          }
          break;
        case 'social':
          if (Array.isArray(data)) {
            const result = await supabase.from('social_media').upsert(data, { onConflict: 'id' });
            error = result.error;
          }
          break;
        case 'coupons':
          if (Array.isArray(data)) {
            const result = await supabase.from('coupons').upsert(data, { onConflict: 'id' });
            error = result.error;
          }
          break;
        case 'emails':
          if (typeof data === 'object') {
            const result = await supabase.from('newsletter_settings').upsert(data, { onConflict: 'id' });
            error = result.error;
          }
          break;
        case 'chat':
          if (Array.isArray(data)) {
            const result = await supabase.from('chat_responses').upsert(data, { onConflict: 'id' });
            error = result.error;
          }
          break;
        case 'orders':
          if (Array.isArray(data)) {
            const result = await supabase.from('orders').upsert(data, { onConflict: 'id' });
            error = result.error;
          }
          break;
        case 'collections':
          if (Array.isArray(data)) {
            const result = await supabase.from('collections').upsert(data, { onConflict: 'id' });
            error = result.error;
          }
          break;
        default:
          throw new Error(`Unknown category: ${category}`);
      }
      
      if (error) throw error;
      
      toast.success(language === 'pl' ? `${category} przywrócony pomyślnie` : `${category} restored successfully`);
    } catch (error: any) {
      console.error(`Restore ${category} backup error:`, error);
      toast.error(language === 'pl' ? `Błąd przywracania: ${error.message}` : `Restore error: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'pl' ? 'Eksport / Kopia zapasowa' : 'Export / Backup'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'pl' 
            ? 'Eksportuj dane z konfigurowalnymi filtrami lub crea/ripristina backup completi'
            : 'Export data with customizable filters or create/restore complete backups'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'pl' ? 'Konfiguracja' : 'Configuration'}</CardTitle>
            <CardDescription>
              {language === 'pl' ? 'Wybierz typ danych i format' : 'Select data type and format'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Typ danych' : 'Data Type'}</Label>
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
                      {language === 'pl' ? 'Klienci' : 'Customers'}
                    </div>
                  </SelectItem>
                  <SelectItem value="orders">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      {language === 'pl' ? 'Zamówienia' : 'Orders'}
                    </div>
                  </SelectItem>
                  <SelectItem value="products">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {language === 'pl' ? 'Produkty' : 'Products'}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Format eksportu' : 'Export Format'}</Label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'pl' ? 'Data od' : 'Date From'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[150px] justify-start text-xs sm:text-sm truncate">
                      <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{format(dateFrom, 'PPP')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFrom} onSelect={(date) => date && setDateFrom(date)} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>{language === 'pl' ? 'Data do' : 'Date To'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[150px] justify-start text-xs sm:text-sm truncate">
                      <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{format(dateTo, 'PPP')}</span>
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
            <CardTitle>{language === 'pl' ? 'Metryki do eksportu' : 'Metrics to Export'}</CardTitle>
            <CardDescription>
              {language === 'pl' ? 'Wybierz kolumny do uwzględnienia' : 'Select columns to include'}
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

      {/* Backup Section */}
      <div className="space-y-6 mt-8">
        <h3 className="text-xl font-bold">
          {language === 'pl' ? 'Backup i Przywracanie' : 'Backup & Restore'}
        </h3>

        {/* Full Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              {language === 'pl' ? 'Backup Kompletny' : 'Full Backup'}
            </CardTitle>
            <CardDescription>
              {language === 'pl' 
                ? 'Eksportuj lub przywróć wszystkie dane systemu w jednym pliku'
                : 'Export or restore all system data in a single file'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await exportFullBackup('xlsx');
                  } catch (error) {
                    console.error('Export error:', error);
                    toast.error(language === 'pl' ? 'Błąd eksportu' : 'Export error');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await exportFullBackup('csv');
                  } catch (error) {
                    console.error('Export error:', error);
                    toast.error(language === 'pl' ? 'Błąd eksportu' : 'Export error');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await exportFullBackup('txt');
                  } catch (error) {
                    console.error('Export error:', error);
                    toast.error(language === 'pl' ? 'Błąd eksportu' : 'Export error');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                TXT
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await exportFullBackup('json');
                  } catch (error) {
                    console.error('Export error:', error);
                    toast.error(language === 'pl' ? 'Błąd eksportu' : 'Export error');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
            <div className="pt-4 border-t">
              <Label className="mb-2 block">
                {language === 'pl' ? 'Przywróć Backup Kompletny (JSON)' : 'Restore Full Backup (JSON)'}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setLoading(true);
                    try {
                      await restoreFullBackup(file);
                    } catch (error) {
                      console.error('Restore error:', error);
                      toast.error(language === 'pl' ? 'Błąd przywracania' : 'Restore error');
                    } finally {
                      setLoading(false);
                      e.target.value = '';
                    }
                  }}
                  disabled={loading}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Backups */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { 
              key: 'statistics', 
              label: language === 'pl' ? 'Statystyki' : 'Statistics', 
              icon: Database,
              description: language === 'pl' ? 'Eksportuj lub przywróć dane statystyczne' : 'Export or restore statistics data'
            },
            { 
              key: 'contacts', 
              label: language === 'pl' ? 'Kontakty' : 'Contacts', 
              icon: Users,
              description: language === 'pl' ? 'Eksportuj lub przywróć subskrybentów newslettera' : 'Export or restore newsletter subscribers'
            },
            { 
              key: 'products', 
              label: language === 'pl' ? 'Produkty' : 'Products', 
              icon: Package,
              description: language === 'pl' ? 'Eksportuj lub przywróć katalog produktów' : 'Export or restore product catalog'
            },
            { 
              key: 'categories', 
              label: language === 'pl' ? 'Kategorie' : 'Categories', 
              icon: FileText,
              description: language === 'pl' ? 'Eksportuj lub przywróć kategorie produktów' : 'Export or restore product categories'
            },
            { 
              key: 'social', 
              label: language === 'pl' ? 'Social Media' : 'Social Media', 
              icon: Users,
              description: language === 'pl' ? 'Eksportuj lub przywróć ustawienia mediów społecznościowych' : 'Export or restore social media settings'
            },
            { 
              key: 'coupons', 
              label: language === 'pl' ? 'Kupony' : 'Coupons', 
              icon: FileText,
              description: language === 'pl' ? 'Eksportuj lub przywróć kody kuponów' : 'Export or restore coupon codes'
            },
            { 
              key: 'emails', 
              label: language === 'pl' ? 'Emaile' : 'Emails', 
              icon: FileText,
              description: language === 'pl' ? 'Eksportuj lub przywróć ustawienia email' : 'Export or restore email settings'
            },
            { 
              key: 'chat', 
              label: language === 'pl' ? 'Odpowiedzi Chat' : 'Chat Responses', 
              icon: FileText,
              description: language === 'pl' ? 'Eksportuj lub przywróć zapisane odpowiedzi czatu' : 'Export or restore saved chat responses'
            },
            { 
              key: 'orders', 
              label: language === 'pl' ? 'Zamówienia' : 'Orders', 
              icon: ShoppingCart,
              description: language === 'pl' ? 'Eksportuj lub przywróć historię zamówień' : 'Export or restore order history'
            },
            { 
              key: 'collections', 
              label: language === 'pl' ? 'Kolekcje' : 'Collections', 
              icon: Archive,
              description: language === 'pl' ? 'Eksportuj lub przywróć kolekcje produktów' : 'Export or restore product collections'
            },
          ].map(({ key, label, icon: Icon, description }) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {label}
                </CardTitle>
                <CardDescription>
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await exportCategoryBackup(key, 'xlsx');
                      } catch (error) {
                        console.error('Export error:', error);
                        toast.error(language === 'pl' ? 'Błąd eksportu' : 'Export error');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await exportCategoryBackup(key, 'csv');
                      } catch (error) {
                        console.error('Export error:', error);
                        toast.error(language === 'pl' ? 'Błąd eksportu' : 'Export error');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await exportCategoryBackup(key, 'txt');
                      } catch (error) {
                        console.error('Export error:', error);
                        toast.error(language === 'pl' ? 'Błąd eksportu' : 'Export error');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    TXT
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await exportCategoryBackup(key, 'json');
                      } catch (error) {
                        console.error('Export error:', error);
                        toast.error(language === 'pl' ? 'Błąd eksportu' : 'Export error');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <Label className="mb-2 block">
                    {language === 'pl' ? `Przywróć Backup ${label} (JSON)` : `Restore ${label} Backup (JSON)`}
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'pl' 
                      ? `Wybierz plik JSON z backupem ${label.toLowerCase()} aby przywrócić dane`
                      : `Select a JSON backup file for ${label.toLowerCase()} to restore data`}
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setLoading(true);
                        try {
                          await restoreCategoryBackup(key, file);
                        } catch (error) {
                          console.error('Restore error:', error);
                          toast.error(language === 'pl' ? 'Błąd przywracania' : 'Restore error');
                        } finally {
                          setLoading(false);
                          e.target.value = '';
                        }
                      }}
                      disabled={loading}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
