import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Users, ShoppingCart, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminCustomerModal from '@/components/AdminCustomerModal';
import AdminStatistics from '@/components/AdminStatistics';
import AdminExport from '@/components/AdminExport';

interface Product {
  id: string;
  name_en: string;
  name_pl: string;
  description_en: string | null;
  description_pl: string | null;
  price_pln: number;
  price_eur: number;
  category: string;
  size: string;
  stock_quantity: number;
  weight?: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
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
  username?: string;
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
  
  // Product management state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name_en: '',
    name_pl: '',
    description_en: '',
    description_pl: '',
    price_pln: 0,
    price_eur: 0,
    category: '',
    size: '',
    weight: '',
    stock_quantity: 0,
    image_url: ''
  });

  // Customer modal state
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

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

  const saveProduct = async () => {
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productForm)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productForm]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Product created successfully" });
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name_en: product.name_en,
      name_pl: product.name_pl,
      description_en: product.description_en || '',
      description_pl: product.description_pl || '',
      price_pln: product.price_pln,
      price_eur: product.price_eur,
      category: product.category,
      size: product.size,
      weight: product.weight || '',
      stock_quantity: product.stock_quantity,
      image_url: product.image_url || ''
    });
    setShowProductForm(true);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      toast({ title: "Success", description: "Product deleted successfully" });
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCustomerView = (customer: Profile) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  // Image upload handler
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setProductForm({ ...productForm, image_url: publicUrl });
      
      toast({
        title: t('imageUploaded'),
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
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
            <TabsTrigger value="statistics">{t('statistics')}</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('products')}</CardTitle>
                  <CardDescription>{t('manageProductInventory')}</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name_en: '',
                    name_pl: '',
                    description_en: '',
                    description_pl: '',
                    price_pln: 0,
                    price_eur: 0,
                    category: '',
                    size: '',
                    weight: '',
                    stock_quantity: 0,
                    image_url: ''
                  });
                  setShowProductForm(true);
                }}>
                  {t('addProduct')}
                </Button>
              </CardHeader>
              <CardContent>
                {showProductForm && (
                  <div className="border rounded-lg p-6 mb-6 space-y-6 bg-muted/30">
                    <h3 className="font-playfair font-semibold text-lg">
                      {editingProduct ? t('editProductTitle') : t('addNewProduct')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>{t('nameEn')}</Label>
                        <Input
                          value={productForm.name_en}
                          onChange={(e) => setProductForm({ ...productForm, name_en: e.target.value })}
                          placeholder="Product name in English"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('namePl')}</Label>
                        <Input
                          value={productForm.name_pl}
                          onChange={(e) => setProductForm({ ...productForm, name_pl: e.target.value })}
                          placeholder="Nazwa produktu po polsku"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('pricePln')}</Label>
                        <Input
                          type="number"
                          value={productForm.price_pln}
                          onChange={(e) => setProductForm({ ...productForm, price_pln: parseInt(e.target.value) || 0 })}
                          placeholder="Price in PLN cents (e.g., 2500 = 25.00 PLN)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('priceEur')}</Label>
                        <Input
                          type="number"
                          value={productForm.price_eur}
                          onChange={(e) => setProductForm({ ...productForm, price_eur: parseInt(e.target.value) || 0 })}
                          placeholder="Price in EUR cents (e.g., 600 = 6.00 EUR)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('category')}</Label>
                        <Select 
                          value={productForm.category} 
                          onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="luxury">{t('luxury')}</SelectItem>
                            <SelectItem value="nature">{t('nature')}</SelectItem>
                            <SelectItem value="fresh">{t('fresh')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('size')}</Label>
                        <Input
                          value={productForm.size}
                          onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                          placeholder="e.g., 180g, 320g"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('productWeight')} <span className="text-muted-foreground">({t('optional')})</span></Label>
                        <Input
                          value={productForm.weight}
                          onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                          placeholder="e.g., 180g, 320g"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('stockQuantity')}</Label>
                        <Input
                          type="number"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm({ ...productForm, stock_quantity: parseInt(e.target.value) || 0 })}
                          placeholder="Available quantity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('uploadImage')}</Label>
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="flex-1"
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setProductForm({ ...productForm, image_url: '' })}
                          >
                            Clear
                          </Button>
                        </div>
                        {productForm.image_url && (
                          <div className="mt-2">
                            <img 
                              src={productForm.image_url} 
                              alt="Product preview" 
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label>{t('descriptionEn')}</Label>
                        <Textarea
                          value={productForm.description_en}
                          onChange={(e) => setProductForm({ ...productForm, description_en: e.target.value })}
                          placeholder="Product description in English"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('descriptionPl')}</Label>
                        <Textarea
                          value={productForm.description_pl}
                          onChange={(e) => setProductForm({ ...productForm, description_pl: e.target.value })}
                          placeholder="Opis produktu po polsku"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button onClick={saveProduct} size="lg">
                        {editingProduct ? t('updateProduct') : t('createProduct')}
                      </Button>
                      <Button variant="outline" onClick={() => setShowProductForm(false)} size="lg">
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price (PLN)</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Actions</TableHead>
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
                        <TableCell>{product.price_pln / 100} PLN</TableCell>
                        <TableCell>
                          <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                            {product.stock_quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.size}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => editProduct(product)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => deleteProduct(product.id)}
                            >
                              Delete
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
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          {profile.first_name} {profile.last_name}
                        </TableCell>
                        <TableCell>
                          {profile.username || 'Not set'}
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>
                          <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                            {profile.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCustomerView(profile)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('viewDetails')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <AdminStatistics stats={{
              totalProducts: stats.totalProducts,
              totalOrders: stats.totalOrders,
              totalCustomers: stats.totalCustomers,
              revenue: stats.revenue,
              monthlyOrders: [],
              categoryBreakdown: []
            }} />
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <AdminExport data={{
              products,
              orders,
              customers: profiles
            }} />
          </TabsContent>
        </Tabs>

        {/* Customer Modal */}
        <AdminCustomerModal 
          customer={selectedCustomer}
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;