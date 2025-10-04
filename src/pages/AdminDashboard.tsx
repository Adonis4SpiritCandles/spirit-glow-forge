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
import { Package, Users, ShoppingCart, TrendingUp, Eye, Edit, Trash2, Truck, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminCustomerModal from '@/components/AdminCustomerModal';
import AdminStatistics from '@/components/AdminStatistics';
import AdminExport from '@/components/AdminExport';
import AdminOrderDetailsModal from '@/components/AdminOrderDetailsModal';
import ShipmentConfirmationModal from '@/components/ShipmentConfirmationModal';

interface Product {
  id: string;
  name_en: string;
  name_pl: string;
  description_en: string | null;
  description_pl: string | null;
  price_pln: number | string;
  price_eur: number | string;
  category: string;
  size: string;
  stock_quantity: number;
  weight?: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  published?: boolean;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_pln: number;
  total_eur: number;
  shipping_cost_pln?: number;
  shipping_cost_eur?: number;
  carrier_name?: string;
  created_at: string;
  order_number?: number;
  shipping_status?: string;
  tracking_number?: string;
  carrier?: string;
  shipping_label_url?: string;
  furgonetka_package_id?: string;
  shipping_address?: any;
  service_id?: number;
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
    price_pln: '', // keep as string to allow comma or dot while typing
    price_eur: '', // keep as string to allow comma or dot while typing
    category: '',
    size: '180g',
    weight: '',
    stock_quantity: 0,
    image_url: ''
  });

  // Customer modal state
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Order details modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Shipping management state
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [selectedOrderForShipment, setSelectedOrderForShipment] = useState<Order | null>(null);
  const [creatingShipment, setCreatingShipment] = useState(false);

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

      setProducts(productsData || []);

      // Load orders with profile data - using a separate query to avoid relation issues
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch profile data for each order
      if (ordersData && ordersData.length > 0) {
        const userIds = [...new Set(ordersData.map(o => o.user_id))];
        const { data: profilesForOrders } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', userIds);

        // Attach profile data to orders
        const ordersWithProfiles = ordersData.map(order => ({
          ...order,
          profiles: profilesForOrders?.find(p => p.user_id === order.user_id)
        }));
        
        setOrders(ordersWithProfiles as Order[]);
      } else {
        setOrders([]);
      }

      // Load profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

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

  // Parse price with robust validation
  const parsePrice = (value: string): number => {
    const sanitized = String(value).trim().replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(sanitized);
    if (isNaN(parsed) || parsed < 0) return 0;
    return Number(parsed.toFixed(2));
  };

  const saveProduct = async () => {
    try {
      const pricePln = parsePrice(productForm.price_pln);
      const priceEur = parsePrice(productForm.price_eur);
      
      if (pricePln === 0 || priceEur === 0) {
        toast({
          title: "Error",
          description: "Please enter valid prices",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        ...productForm,
        price_pln: pricePln,
        price_eur: priceEur,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        
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
      price_pln: Number(product.price_pln).toFixed(2),
      price_eur: Number(product.price_eur).toFixed(2),
      category: product.category,
      size: product.size || '180g',
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

  const togglePublish = async (productId: string, publish: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ published: publish })
        .eq('id', productId);

      if (error) throw error;
      toast({ title: "Success", description: publish ? "Product published" : "Product unpublished" });
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

  // Open shipment confirmation modal
  const openShipmentModal = (order: Order) => {
    setSelectedOrderForShipment(order);
    setIsShipmentModalOpen(true);
  };

  // Create Furgonetka shipment
  const createShipment = async (
    orderId: string, 
    dimensions?: { width: number; height: number; length: number }, 
    weight?: number
  ) => {
    setCreatingShipment(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const body: any = { orderId };
      if (dimensions) body.dimensions = dimensions;
      if (weight) body.weight = weight;

      const response = await supabase.functions.invoke('create-furgonetka-shipment', {
        body
      });

      if (response.error) throw response.error;

      // Check if response indicates failure
      if (response.data?.ok === false) {
        const errorDetails = response.data.errors?.map((e: any) => 
          e.message || e.error || JSON.stringify(e)
        ).join('; ') || response.data.error || 'Validation failed';
        
        throw new Error(`Furgonetka error: ${errorDetails}`);
      }

      toast({
        title: "Success",
        description: `Shipment created with tracking number: ${response.data.trackingNumber}`,
      });

      setIsShipmentModalOpen(false);
      setSelectedOrderForShipment(null);
      loadDashboardData();
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create shipment',
        variant: "destructive",
      });
    } finally {
      setCreatingShipment(false);
    }
  };

  const downloadLabel = async (labelUrl: string) => {
    window.open(labelUrl, '_blank');
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
            <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
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
                    price_pln: '',
                    price_eur: '',
                    category: '',
                    size: '180g',
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
                          type="text"
                          value={productForm.price_pln}
                          onChange={(e) => {
                            setProductForm({ ...productForm, price_pln: e.target.value });
                          }}
                          placeholder="Prezzo in PLN (es. 108,24)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('priceEur')}</Label>
                        <Input
                          type="text"
                          value={productForm.price_eur}
                          onChange={(e) => {
                            setProductForm({ ...productForm, price_eur: e.target.value });
                          }}
                          placeholder="Prezzo in EUR (es. 12,30)"
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
                        <Select 
                          value={productForm.size}
                          onValueChange={(value) => setProductForm({ ...productForm, size: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border z-50">
                            <SelectItem value="180g">180g</SelectItem>
                            <SelectItem value="320g">320g</SelectItem>
                            <SelectItem value="180g + 320g">180g + 320g</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('productWeight')}</Label>
                        <Input
                          value={productForm.weight}
                          onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                          placeholder="e.g., 180g"
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
                        <TableCell>{Number(product.price_pln).toFixed(2)} PLN</TableCell>
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
                              variant={product.published ? "secondary" : "default"}
                              onClick={() => togglePublish(product.id, !product.published)}
                            >
                              {product.published ? 'Unpublish' : 'Publish'}
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
                <CardDescription>Manage customer orders and shipping</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shipping</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <>
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
                           <TableCell>
                             {order.total_pln} PLN
                             <br />
                             <span className="text-xs text-muted-foreground">
                               ({(order.total_pln - (order.shipping_cost_pln || 0))} + {order.shipping_cost_pln || 0} shipping)
                             </span>
                           </TableCell>
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
                            {order.tracking_number ? (
                              <div className="space-y-1">
                                <Badge variant="outline" className="mb-1">
                                  {order.carrier}
                                </Badge>
                                <div className="text-xs">
                                  <span className="font-mono">{order.tracking_number}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {order.shipping_status || 'pending'}
                                </Badge>
                              </div>
                            ) : (
                              <Badge variant="outline">No shipment</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsOrderDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                disabled={order.status === 'completed'}
                              >
                                Complete
                              </Button>
                              {order.tracking_number ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => order.shipping_label_url && downloadLabel(order.shipping_label_url)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Label
                                </Button>
                               ) : (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => openShipmentModal(order)}
                                  disabled={order.status !== 'completed'}
                                >
                                  <Truck className="h-4 w-4 mr-1" />
                                  Create Shipment
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </>
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

          <TabsContent value="warehouse">
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Management / Zarządzanie Magazynem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Stock Overview */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Stock Overview / Przegląd Zapasów</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">Total Items / Przedmioty Ogółem</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-orange-600">
                            {products.filter(p => (p.stock_quantity || 0) < 10).length}
                          </div>
                          <p className="text-sm text-muted-foreground">Low Stock Alerts / Niski Stan</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-red-600">
                            {products.filter(p => (p.stock_quantity || 0) === 0).length}
                          </div>
                          <p className="text-sm text-muted-foreground">Out of Stock / Brak Towaru</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Stock Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Product Stock Levels / Poziomy Zapasów Produktów</h3>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product / Produkt</TableHead>
                            <TableHead>Size / Rozmiar</TableHead>
                            <TableHead>Category / Kategoria</TableHead>
                            <TableHead className="text-right">Stock / Zapas</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                            <TableHead>Published / Opublikowany</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.name_en}</TableCell>
                              <TableCell>{product.size || "-"}</TableCell>
                              <TableCell>{product.category}</TableCell>
                              <TableCell className="text-right">
                                <span className={`font-semibold ${
                                  (product.stock_quantity || 0) === 0 
                                    ? "text-red-600" 
                                    : (product.stock_quantity || 0) < 10 
                                    ? "text-orange-600" 
                                    : "text-green-600"
                                }`}>
                                  {product.stock_quantity || 0}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {(product.stock_quantity || 0) === 0 ? (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Out of Stock</span>
                                ) : (product.stock_quantity || 0) < 10 ? (
                                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Low Stock</span>
                                ) : (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">In Stock</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {product.published ? (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Yes / Tak</span>
                                ) : (
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">No / Nie</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
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

        {/* Order Details Modal */}
        <AdminOrderDetailsModal
          order={selectedOrder}
          isOpen={isOrderDetailsOpen}
          onClose={() => setIsOrderDetailsOpen(false)}
        />

        {/* Shipment Confirmation Modal */}
        <ShipmentConfirmationModal
          order={selectedOrderForShipment}
          isOpen={isShipmentModalOpen}
          onClose={() => {
            setIsShipmentModalOpen(false);
            setSelectedOrderForShipment(null);
          }}
          onConfirm={createShipment}
          isLoading={creatingShipment}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;