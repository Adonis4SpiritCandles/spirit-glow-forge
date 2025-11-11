import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Package, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Plus, Edit } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Product {
  id: string;
  name_en: string;
  name_pl: string;
  stock_quantity: number;
  category: string;
}

interface InventoryAlert {
  id: string;
  product_id: string;
  alert_type: string;
  threshold: number;
  is_active: boolean;
  last_triggered_at: string | null;
  products?: Product;
}

interface StockMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  notes: string;
  created_at: string;
  products?: Product;
}

interface ReorderHistory {
  id: string;
  product_id: string;
  quantity_ordered: number;
  supplier: string;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date: string | null;
  status: string;
  notes: string;
  products?: Product;
}

export default function InventoryTracking() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [reorders, setReorders] = useState<ReorderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);

  useEffect(() => {
    loadData();

    // Real-time subscriptions
    const productsChannel = supabase
      .channel('inventory-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadProducts)
      .subscribe();

    const alertsChannel = supabase
      .channel('inventory-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_alerts' }, loadAlerts)
      .subscribe();

    const movementsChannel = supabase
      .channel('stock-movements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stock_movements' }, loadMovements)
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(movementsChannel);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadAlerts(), loadMovements(), loadReorders()]);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name_en, name_pl, stock_quantity, category')
      .eq('published', true)
      .order('stock_quantity', { ascending: true });
    if (data) setProducts(data);
  };

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('inventory_alerts')
      .select('*, products(name_en, name_pl, stock_quantity)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setAlerts(data as any);
  };

  const loadMovements = async () => {
    const { data } = await supabase
      .from('stock_movements')
      .select('*, products(name_en, name_pl)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setMovements(data as any);
  };

  const loadReorders = async () => {
    const { data } = await supabase
      .from('reorder_history')
      .select('*, products(name_en, name_pl)')
      .order('order_date', { ascending: false })
      .limit(20);
    if (data) setReorders(data as any);
  };

  const createReorder = async (formData: any) => {
    const { error } = await supabase.from('reorder_history').insert([formData]);
    if (error) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'Nie udało się utworzyć zamówienia' : 'Failed to create reorder',
        variant: 'destructive'
      });
    } else {
      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' ? 'Zamówienie zostało utworzone' : 'Reorder created successfully'
      });
      setReorderDialogOpen(false);
      loadReorders();
    }
  };

  const getStockStatusBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> {language === 'pl' ? 'Brak' : 'Out of Stock'}</Badge>;
    }
    if (stock < 10) {
      return <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700"><AlertTriangle className="h-3 w-3" /> {language === 'pl' ? 'Niski' : 'Low'}</Badge>;
    }
    return <Badge variant="outline" className="gap-1 border-green-500 text-green-700"><CheckCircle className="h-3 w-3" /> {language === 'pl' ? 'Dostępny' : 'In Stock'}</Badge>;
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'restock': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'sale': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'return': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'adjustment': return <Package className="h-4 w-4 text-orange-600" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{language === 'pl' ? 'Zarządzanie Magazynem' : 'Inventory Management'}</h2>
        <p className="text-muted-foreground">{language === 'pl' ? 'Monitoruj zapasy, alerty i zamówienia' : 'Monitor stock levels, alerts, and reorders'}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{language === 'pl' ? 'Przegląd' : 'Overview'}</TabsTrigger>
          <TabsTrigger value="alerts">{language === 'pl' ? 'Alerty' : 'Alerts'} {alerts.length > 0 && <Badge className="ml-2">{alerts.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="movements">{language === 'pl' ? 'Ruchy' : 'Movements'}</TabsTrigger>
          <TabsTrigger value="reorders">{language === 'pl' ? 'Zamówienia' : 'Reorders'}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{language === 'pl' ? 'Wszystkie Produkty' : 'Total Products'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{language === 'pl' ? 'Brak w magazynie' : 'Out of Stock'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{products.filter(p => p.stock_quantity === 0).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{language === 'pl' ? 'Niski stan' : 'Low Stock'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{language === 'pl' ? 'Aktywne Alerty' : 'Active Alerts'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'pl' ? 'Stan Magazynu' : 'Stock Status'}</CardTitle>
              <CardDescription>{language === 'pl' ? 'Bieżący stan wszystkich produktów' : 'Current status of all products'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{language === 'pl' ? product.name_pl : product.name_en}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{language === 'pl' ? 'Ilość' : 'Quantity'}</p>
                        <p className="font-bold">{product.stock_quantity}</p>
                      </div>
                      {getStockStatusBadge(product.stock_quantity)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/admin?tab=products&edit=${product.id}`, '_blank')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'pl' ? 'Alerty Magazynowe' : 'Stock Alerts'}</CardTitle>
              <CardDescription>{language === 'pl' ? 'Produkty wymagające uwagi' : 'Products requiring attention'}</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{language === 'pl' ? 'Brak aktywnych alertów' : 'No active alerts'}</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="font-medium">{language === 'pl' ? alert.products?.name_pl : alert.products?.name_en}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.alert_type === 'low_stock' && `${language === 'pl' ? 'Niski stan: poniżej' : 'Low stock: below'} ${alert.threshold}`}
                          {alert.alert_type === 'out_of_stock' && (language === 'pl' ? 'Brak w magazynie' : 'Out of stock')}
                        </p>
                      </div>
                      <Badge variant="outline">{alert.products?.stock_quantity || 0}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'pl' ? 'Historia Ruchów' : 'Movement History'}</CardTitle>
              <CardDescription>{language === 'pl' ? 'Ostatnie zmiany w stanie magazynu' : 'Recent stock changes'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {movements.map(movement => (
                  <div key={movement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getMovementIcon(movement.movement_type)}
                    <div className="flex-1">
                      <p className="font-medium">{language === 'pl' ? movement.products?.name_pl : movement.products?.name_en}</p>
                      <p className="text-sm text-muted-foreground">{movement.notes}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${movement.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                      </p>
                      <p className="text-xs text-muted-foreground">{format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reorders" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{language === 'pl' ? 'Historia Zamówień' : 'Reorder History'}</h3>
              <p className="text-sm text-muted-foreground">{language === 'pl' ? 'Zarządzaj zamówieniami do dostawców' : 'Manage supplier orders'}</p>
            </div>
            <Dialog open={reorderDialogOpen} onOpenChange={setReorderDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> {language === 'pl' ? 'Nowe Zamówienie' : 'New Reorder'}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === 'pl' ? 'Utwórz Zamówienie' : 'Create Reorder'}</DialogTitle>
                  <DialogDescription>{language === 'pl' ? 'Zamów produkty od dostawcy' : 'Order products from supplier'}</DialogDescription>
                </DialogHeader>
                {/* Reorder form would go here */}
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {reorders.map(reorder => (
                  <div key={reorder.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{language === 'pl' ? reorder.products?.name_pl : reorder.products?.name_en}</p>
                      <p className="text-sm text-muted-foreground">{reorder.supplier}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{reorder.quantity_ordered} {language === 'pl' ? 'szt.' : 'pcs'}</p>
                      <Badge variant={reorder.status === 'delivered' ? 'default' : 'outline'}>
                        {reorder.status === 'pending' && (language === 'pl' ? 'Oczekuje' : 'Pending')}
                        {reorder.status === 'shipped' && (language === 'pl' ? 'Wysłane' : 'Shipped')}
                        {reorder.status === 'delivered' && (language === 'pl' ? 'Dostarczone' : 'Delivered')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
