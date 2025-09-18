import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name_en: string;
  name_pl: string;
  price_pln: number;
  price_eur: number;
  category: string;
  size: string;
  stock_quantity: number;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_pln: number;
  total_eur: number;
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0,
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin role:', error);
        setLoading(false);
        return;
      }

      const adminRole = data?.role === 'admin';
      setIsAdmin(adminRole);
      setLoading(false);

      if (adminRole) {
        loadDashboardData();
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    try {
      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Load orders without profile data for now - fix relation later
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Load profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
      setOrders(ordersData || []);
      setProfiles(profilesData || []);

      // Calculate stats
      const revenue = ordersData?.reduce((sum, order) => sum + order.total_pln, 0) || 0;
      setStats({
        totalProducts: productsData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalCustomers: profilesData?.length || 0,
        revenue,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      loadDashboardData();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <h2 className="font-playfair text-2xl font-semibold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access the admin dashboard.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-playfair text-3xl font-semibold mb-8">{t('adminDashboard')}</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('products')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('orders')}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('customers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.revenue} PLN</div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">{t('products')}</TabsTrigger>
            <TabsTrigger value="orders">{t('orders')}</TabsTrigger>
            <TabsTrigger value="customers">{t('customers')}</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('products')}</CardTitle>
                <CardDescription>Manage your product inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price (PLN)</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name_en}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.price_pln} PLN</TableCell>
                        <TableCell>
                          <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                            {product.stock_quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.size}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('orders')}</CardTitle>
                <CardDescription>Manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {order.profiles?.first_name} {order.profiles?.last_name}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {order.profiles?.email}
                          </span>
                        </TableCell>
                        <TableCell>{order.total_pln} PLN</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              order.status === 'completed' ? 'default' :
                              order.status === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              disabled={order.status === 'completed'}
                            >
                              Complete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('customers')}</CardTitle>
                <CardDescription>View and manage customers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Join Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          {profile.first_name} {profile.last_name}
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>
                          <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                            {profile.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(profile.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;