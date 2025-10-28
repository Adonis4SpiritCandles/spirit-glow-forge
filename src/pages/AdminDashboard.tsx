import { useState, useEffect, useRef } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Users, ShoppingCart, TrendingUp, Eye, Edit, Trash2, Truck, Download, ExternalLink, Copy, RefreshCw, BarChart3, X, Bell } from 'lucide-react';
import furgonetkaIco from '@/assets/furgonetka-logo-ico.png';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminCustomerModal from '@/components/AdminCustomerModal';
import AdminEditCustomerModal from '@/components/AdminEditCustomerModal';
import AdminDeleteOrderDialog from '@/components/AdminDeleteOrderDialog';
import AdminStatistics from '@/components/AdminStatistics';
import AdminExport from '@/components/AdminExport';
import AdminOrderDetailsModal from '@/components/AdminOrderDetailsModal';
import ShipmentConfirmationModal from '@/components/ShipmentConfirmationModal';
import AdminSocialMedia from '@/components/admin/AdminSocialMedia';
import AdminCoupons from '@/components/admin/AdminCoupons';
import AdminCollections from '@/components/admin/AdminCollections';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';

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
  discount_pln?: number;
  discount_eur?: number;
  coupon_code?: string;
  carrier_name?: string;
  created_at: string;
  deleted_at?: string | null;
  order_number?: number;
  shipping_status?: string;
  tracking_number?: string;
  carrier?: string;
  shipping_label_url?: string;
  furgonetka_package_id?: string;
  shipping_address?: any;
  service_id?: number;
  exclude_from_stats?: boolean;
  admin_seen?: boolean;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    preferred_language?: string;
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
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { unseenCount, markOrdersAsSeen, loadUnseenCount } = useAdminNotifications();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deletedOrders, setDeletedOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0,
  });
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  
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
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Order delete state
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleteOrderDialogOpen, setIsDeleteOrderDialogOpen] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  // Order details modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Shipping management state
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [selectedOrderForShipment, setSelectedOrderForShipment] = useState<Order | null>(null);
  const [creatingShipment, setCreatingShipment] = useState(false);

  // Warehouse inline stock edit
  const [editingStock, setEditingStock] = useState<{ [key: string]: number }>({});
  
  // Product edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Bulk actions state
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // Tabs state (controlled for mobile select)
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'trash' | 'customers' | 'warehouse' | 'statistics' | 'export' | 'social'>('products');

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
        setupRealtimeSubscription();
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  // Setup realtime subscription for new orders
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('new-orders-admin')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order received:', payload);
          setNewOrdersCount(prev => prev + 1);
          toast({
            title: t('newOrderNotification'),
            description: `Order #${payload.new.order_number}`,
            action: (
              <Button variant="outline" size="sm" onClick={() => {
                loadDashboardData();
              }}>
                {t('viewInDashboard')}
              </Button>
            ),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadDashboardData = async () => {
    try {
      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      setProducts(productsData || []);

      // Load orders with profile data - filter out soft-deleted orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Load deleted orders separately
      await loadDeletedOrders();

      // Fetch profile data for each order
      if (ordersData && ordersData.length > 0) {
        const userIds = [...new Set(ordersData.map(o => o.user_id))];
        const { data: profilesForOrders } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email, preferred_language')
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

      // Calculate stats - filter by exclude_from_stats
      const activeOrders = ordersData?.filter(o => !o.exclude_from_stats) || [];
      const activeProducts = productsData?.filter(p => !p.exclude_from_stats) || [];
      const activeProfiles = profilesData?.filter(p => !p.exclude_from_stats) || [];
      const revenue = activeOrders.reduce((sum, order) => sum + order.total_pln, 0);
      
      setStats({
        totalProducts: activeProducts.length,
        totalOrders: activeOrders.length,
        totalCustomers: activeProfiles.length,
        revenue,
      });

      // Count new orders not seen by admin
      const unseenOrders = ordersData?.filter(o => !o.admin_seen) || [];
      setNewOrdersCount(unseenOrders.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const loadDeletedOrders = async () => {
    try {
      const { data: deletedOrdersData } = await supabase
        .from('orders')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (deletedOrdersData && deletedOrdersData.length > 0) {
        const userIds = [...new Set(deletedOrdersData.map(o => o.user_id))];
        const { data: profilesForOrders } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email, preferred_language')
          .in('user_id', userIds);

        const ordersWithProfiles = deletedOrdersData.map(order => ({
          ...order,
          profiles: profilesForOrders?.find(p => p.user_id === order.user_id)
        }));
        
        setDeletedOrders(ordersWithProfiles as Order[]);
      } else {
        setDeletedOrders([]);
      }
    } catch (error) {
      console.error('Error loading deleted orders:', error);
    }
  };

  const restoreOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ deleted_at: null })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('orderRestored'),
      });
      
      loadDashboardData();
      loadDeletedOrders();
    } catch (error: any) {
      console.error('Error restoring order:', error);
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const permanentDeleteOrder = async (orderId: string) => {
    if (!confirm(t('permanentDeleteConfirm'))) return;

    try {
      // Fetch order for email before deletion
      const { data: orderRow } = await supabase
        .from('orders')
        .select('id, order_number, user_id')
        .eq('id', orderId)
        .single();

      let profileEmail: string | null = null;
      let preferredLanguage: string = 'en';
      if (orderRow?.user_id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('email, preferred_language')
          .eq('user_id', orderRow.user_id)
          .single();
        profileEmail = (prof as any)?.email || null;
        preferredLanguage = (prof as any)?.preferred_language || 'en';
      }

      // Delete order items first (foreign key constraint)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Delete order permanently
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      // Send cancellation email
      try {
        if (profileEmail) {
          await supabase.functions.invoke('send-order-cancelled', {
            body: {
              orderId,
              orderNumber: orderRow?.order_number,
              userEmail: profileEmail,
              preferredLanguage,
            }
          });
        }
      } catch (emailErr) {
        console.error('Failed to send order cancelled email:', emailErr);
      }

      toast({
        title: t('success'),
        description: t('orderPermanentlyDeleted'),
      });
      
      loadDeletedOrders();
    } catch (error: any) {
      console.error('Error permanently deleting order:', error);
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
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

  // Get intelligent shipping status display
  const getShippingStatusDisplay = (order: Order) => {
    const { t } = useLanguage();
    
    // Stage 4: Tracking available - Show "Tracking Number" badge and tracking details
    if (order.tracking_number && order.carrier) {
      return {
        badge: <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs drop-shadow-md flex items-center gap-1">
          <Truck className="h-3 w-3" />
          {t('trackingNumber')}
        </Badge>,
        details: (
          <div className="space-y-1 text-xs mt-1">
            <div className="font-mono text-xs md:text-sm font-semibold">{order.tracking_number}</div>
            <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 flex items-center gap-1">
              <Truck className="h-3 w-3" />
              {t('shipped')}
            </Badge>
          </div>
        )
      };
    }

    // Stage 3: Shipment created but no tracking yet
    if (order.furgonetka_package_id && !order.tracking_number) {
      return {
        badge: <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-[10px] px-1.5 py-0.5 whitespace-nowrap h-auto">{t('furgonetkaPayMiss')}</Badge>,
        details: null
      };
    }

    // Stage 2: Order completed but no shipment created
    if (order.status === 'completed' && !order.furgonetka_package_id) {
      return {
        badge: <Badge variant="default" className="bg-cyan-400 hover:bg-cyan-500 text-[10px] px-1.5 py-0.5 whitespace-nowrap h-auto text-black font-semibold shadow">{t('awaitingFurgonetkaSubmission')}</Badge>,
        details: null
      };
    }

    // Stage 1: Order paid but not completed
    if (order.status === 'paid' || (order.status !== 'pending' && order.status !== 'completed')) {
      return {
        badge: <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-[10px] px-1.5 py-0.5 whitespace-nowrap h-auto">{t('awaitingShipmentConfirmation')}</Badge>,
        details: null
      };
    }

    // Default: No shipment
    return {
      badge: <Badge variant="outline" className="text-[10px]">{t('noShipmentCreated')}</Badge>,
      details: null
    };
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
        toast({ 
          title: t('success'), 
          description: language === 'en' ? 'Product updated successfully' : 'Produkt zaktualizowany pomyślnie'
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        
        if (error) throw error;
        toast({ 
          title: t('success'), 
          description: language === 'en' ? 'Product created successfully' : 'Produkt utworzony pomyślnie'
        });
      }
      
      setShowProductForm(false);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: t('error'),
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
    setIsEditModalOpen(true);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      toast({ 
        title: t('success'), 
        description: language === 'en' ? 'Product deleted successfully' : 'Produkt usunięty pomyślnie'
      });
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: t('error'),
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
      toast({ 
        title: t('success'), 
        description: publish 
          ? (language === 'en' ? 'Product published' : 'Produkt opublikowany')
          : (language === 'en' ? 'Product unpublished' : 'Produkt ukryty')
      });
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCustomerView = (customer: Profile) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleCustomerEdit = (customer: Profile) => {
    setSelectedCustomer(customer);
    setIsEditCustomerModalOpen(true);
  };

  const toggleUserRole = async (profile: Profile) => {
    const newRole = profile.role === 'admin' ? 'user' : 'admin';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: t('success'),
        description: newRole === 'admin' ? t('promoteToAdmin') : t('demoteToUser'),
      });

      loadDashboardData();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteOrderDialogOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    setIsDeletingOrder(true);
    try {
      // Soft delete: set deleted_at timestamp
      const { error } = await supabase
        .from('orders')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', orderToDelete.id);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('orderMovedToTrash'),
      });

      setIsDeleteOrderDialogOpen(false);
      setOrderToDelete(null);
      loadDashboardData();
    } catch (error: any) {
      console.error('Error soft deleting order:', error);
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeletingOrder(false);
    }
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
        title: t('success'),
        description: t('shipmentCreatedSuccess'),
        className: "bg-green-500 text-white shadow-lg",
      });

      // Send "order accepted" email to customer
      try {
        if (selectedOrderForShipment?.profiles?.email) {
          await supabase.functions.invoke('send-order-accepted', {
            body: {
              orderId,
              orderNumber: selectedOrderForShipment.order_number,
              userEmail: selectedOrderForShipment.profiles.email,
              preferredLanguage: (selectedOrderForShipment as any).profiles?.preferred_language || 'en',
              carrierName: selectedOrderForShipment.carrier_name || selectedOrderForShipment.carrier || 'Furgonetka',
            }
          });
        }
      } catch (emailErr) {
        console.error('Failed to send order accepted email:', emailErr);
      }

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
    if (!labelUrl) {
      toast({
        title: "Error",
        description: "No label URL available",
        variant: "destructive",
      });
      return;
    }
    window.open(labelUrl, '_blank');
  };

  // Bulk actions handlers
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const bulkCompleteOrders = async () => {
    const ordersToComplete = orders.filter(
      o => selectedOrders.includes(o.id) && o.status === 'paid'
    );

    if (ordersToComplete.length === 0) {
      toast({
        title: t('error'),
        description: t('noPaidOrders'),
        variant: 'destructive',
      });
      return;
    }

    setIsBulkOperating(true);
    let successCount = 0;

    for (const order of ordersToComplete) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', order.id);

        // Send email notification
        if (order.profiles?.email) {
          try {
            await supabase.functions.invoke('send-status-update', {
              body: {
                orderId: order.id,
                orderNumber: order.order_number,
                userEmail: order.profiles.email,
                preferredLanguage: order.profiles.preferred_language || 'en',
                updateType: 'completed'
              }
            });
          } catch (emailError) {
            console.error(`Failed to send email for order ${order.id}:`, emailError);
          }
        }
        successCount++;
      } catch (error) {
        console.error(`Failed to complete order ${order.id}:`, error);
      }
    }

    toast({
      title: t('success'),
      description: `${successCount} ${t('ordersCompleted')}`,
    });

    loadDashboardData();
    setSelectedOrders([]);
    setIsBulkOperating(false);
  };

  const bulkSyncTracking = async () => {
    const ordersToSync = orders.filter(
      o => selectedOrders.includes(o.id) && o.furgonetka_package_id
    );

    if (ordersToSync.length === 0) {
      toast({
        title: t('error'),
        description: t('noOrdersWithTracking'),
        variant: 'destructive',
      });
      return;
    }

    setIsBulkOperating(true);
    let successCount = 0;

    for (const order of ordersToSync) {
      try {
        await supabase.functions.invoke('sync-furgonetka-tracking', {
          body: { orderId: order.id }
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to sync ${order.id}:`, error);
      }
    }

    toast({
      title: t('success'),
      description: `${successCount}/${ordersToSync.length} ${t('ordersSynced')}`,
    });

    loadDashboardData();
    setSelectedOrders([]);
    setIsBulkOperating(false);
  };

  const bulkDeleteOrders = async () => {
    if (!confirm(t('bulkDeleteConfirm'))) return;

    setIsBulkOperating(true);
    let successCount = 0;

    for (const orderId of selectedOrders) {
      try {
        await supabase
          .from('orders')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', orderId);
        successCount++;
      } catch (error) {
        console.error(`Failed to delete order ${orderId}:`, error);
      }
    }

    toast({
      title: t('success'),
      description: `${successCount} ${t('ordersDeleted')}`,
    });

    loadDashboardData();
    setSelectedOrders([]);
    setIsBulkOperating(false);
  };

  const bulkExcludeFromStats = async () => {
    if (selectedOrders.length === 0) {
      toast({ title: t('error'), description: language === 'pl' ? 'Wybierz co najmniej jedno zamówienie' : 'Select at least one order', variant: 'destructive' });
      return;
    }
    
    // Check if all selected orders are already excluded
    const selectedOrdersData = orders.filter(o => selectedOrders.includes(o.id));
    const allExcluded = selectedOrdersData.every(o => o.exclude_from_stats);
    
    // Toggle: if all excluded, restore them; otherwise exclude them
    const newExcludeStatus = !allExcluded;
    
    setIsBulkOperating(true);
    let successCount = 0;
    for (const orderId of selectedOrders) {
      try {
        await supabase.from('orders').update({ exclude_from_stats: newExcludeStatus }).eq('id', orderId);
        successCount++;
      } catch (error) {
        console.error(`Failed to toggle stats for ${orderId}:`, error);
      }
    }
    
    const successMessage = newExcludeStatus
      ? (language === 'pl' ? `Wykluczono ${successCount} zamówień ze statystyk` : `${successCount} orders excluded from stats`)
      : (language === 'pl' ? `Przywrócono ${successCount} zamówień do statystyk` : `${successCount} orders restored to stats`);
    
    toast({ title: t('success'), description: successMessage });
    loadDashboardData();
    setSelectedOrders([]);
    setIsBulkOperating(false);
  };

  const manualSyncAll = async () => {
    try {
      toast({
        title: t('syncing'),
        description: t('syncingAllOrders'),
      });

      await supabase.functions.invoke('auto-sync-tracking');

      toast({
        title: t('success'),
        description: t('syncTriggered'),
      });

      setTimeout(() => loadDashboardData(), 3000);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetDemoOrders = async () => {
    if (!confirm(t('resetDemoOrdersConfirm'))) return;

    try {
      toast({
        title: t('processing'),
        description: t('resettingOrders'),
      });

      const { data, error } = await supabase.functions.invoke('admin-reset-orders');

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('ordersResetSuccess'),
      });

      loadDashboardData();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('ordersResetError'),
        variant: 'destructive',
      });
    }
  };

  const toggleOrderStatsExclusion = async (orderId: string, currentlyExcluded: boolean) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ exclude_from_stats: !currentlyExcluded })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('statsUpdated'),
      });

      loadDashboardData();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const markOrderAsSeen = async (orderId: string) => {
    try {
      await supabase
        .from('orders')
        .update({ admin_seen: true })
        .eq('id', orderId);
      
      setNewOrdersCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking order as seen:', error);
    }
  };

  // Update stock quantity for a product
  const updateStockQuantity = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
      
      loadDashboardData();
      setEditingStock({ ...editingStock, [productId]: newStock });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
              <CardTitle className="text-sm font-medium">{t('revenue')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.revenue.toFixed(2)} PLN</div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions Bar */}
        {selectedOrders.length > 0 && (
          <div className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground p-4 z-50 shadow-lg animate-in slide-in-from-top">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-medium">
                {selectedOrders.length} {t('ordersSelected')}
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={bulkCompleteOrders}
                  disabled={isBulkOperating}
                >
                  {t('bulkComplete')}
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={bulkSyncTracking}
                  disabled={isBulkOperating}
                >
                  {t('bulkSyncTracking')}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={bulkDeleteOrders}
                  disabled={isBulkOperating}
                >
                  {t('bulkDelete')}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedOrders([])}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  {t('clearSelection')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
          {/* Mobile: compact selector instead of horizontal scroll */}
          <div className="sm:hidden">
            <Select value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
              <SelectTrigger>
                <SelectValue placeholder={t('products')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="products">{t('products')}</SelectItem>
                <SelectItem value="collections">{language === 'pl' ? 'Kolekcje' : 'Collections'}</SelectItem>
                <SelectItem value="orders">{t('orders')}</SelectItem>
                <SelectItem value="trash">{t('ordersTrash')}</SelectItem>
                <SelectItem value="customers">{t('customers')}</SelectItem>
                <SelectItem value="warehouse">{t('warehouse')}</SelectItem>
                <SelectItem value="coupons">{language === 'pl' ? 'Kupony' : 'Coupons'}</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="statistics">{t('statistics')}</SelectItem>
                <SelectItem value="export">Export</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Tablet/Desktop: wrapped tabs, no horizontal scroll */}
          <TabsList className="hidden sm:flex flex-wrap justify-start gap-1 px-2 py-1">
            <TabsTrigger value="products" className="text-xs sm:text-sm flex-shrink-0">{t('products')}</TabsTrigger>
            <TabsTrigger value="collections" className="text-xs sm:text-sm flex-shrink-0">{language === 'pl' ? 'Kolekcje' : 'Collections'}</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm flex-shrink-0">{t('orders')}</TabsTrigger>
            <TabsTrigger value="trash" className="text-xs sm:text-sm flex-shrink-0">{t('ordersTrash')}</TabsTrigger>
            <TabsTrigger value="customers" className="text-xs sm:text-sm flex-shrink-0">{t('customers')}</TabsTrigger>
            <TabsTrigger value="warehouse" className="text-xs sm:text-sm flex-shrink-0">{t('warehouse')}</TabsTrigger>
            <TabsTrigger value="coupons" className="text-xs sm:text-sm flex-shrink-0">{language === 'pl' ? 'Kupony' : 'Coupons'}</TabsTrigger>
            <TabsTrigger value="social" className="text-xs sm:text-sm flex-shrink-0">Social Media</TabsTrigger>
            <TabsTrigger value="statistics" className="text-xs sm:text-sm flex-shrink-0">{t('statistics')}</TabsTrigger>
            <TabsTrigger value="export" className="text-xs sm:text-sm flex-shrink-0">Export</TabsTrigger>
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
                            {t('clear')}
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
                      <TableHead>{t('name')}</TableHead>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead>{t('pricePln')}</TableHead>
                      <TableHead>{t('stock')}</TableHead>
                      <TableHead>{t('size')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
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
                              {t('edit')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={product.published ? "secondary" : "default"}
                              onClick={() => togglePublish(product.id, !product.published)}
                            >
                              {product.published ? t('unpublish') : t('publish')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => deleteProduct(product.id)}
                            >
                              {t('delete')}
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

          <TabsContent value="collections" className="space-y-4">
            <AdminCollections />
          </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('orders')}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">{t('manageCustomerOrders')}</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={bulkExcludeFromStats}
                      disabled={selectedOrders.length === 0}
                      className="w-full sm:w-auto order-first sm:order-none bg-black text-white hover:bg-black/90 text-[10px] sm:text-xs px-2 sm:px-3 py-1 h-8"
                    >
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <X className="w-2 h-2 sm:w-3 sm:h-3 -ml-0.5 mr-1" />
                      {(() => {
                        const selectedOrdersData = orders.filter(o => selectedOrders.includes(o.id));
                        const allExcluded = selectedOrdersData.every(o => o.exclude_from_stats);
                        return (
                          <>
                            <span className="hidden sm:inline">
                              {allExcluded ? t('includeInStats') : t('excludeFromStats')}
                            </span>
                            <span className="sm:hidden">
                              {allExcluded ? t('restoreInStat') : t('excludeFromStat')}
                            </span>
                          </>
                        );
                      })()}
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetDemoOrders} className="w-full sm:w-auto text-[10px] sm:text-xs px-2 sm:px-3 py-1 h-8">
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">{t('resetDemoOrders')}</span>
                      <span className="sm:hidden">{t('resetAllOrders')}</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={manualSyncAll} className="w-full sm:w-auto text-[10px] sm:text-xs px-2 sm:px-3 py-1 h-8">
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">{t('syncAllTracking')}</span>
                      <span className="sm:hidden">{t('syncTrackingNum')}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Unseen Orders Alert */}
                  {unseenCount > 0 && (
                    <Alert className="mb-6 bg-gradient-to-r from-amber-900/20 via-amber-800/20 to-amber-900/20 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20 animate-fade-in backdrop-blur-sm">
                      <Bell className="h-5 w-5 text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <strong className="text-lg font-semibold text-amber-200 drop-shadow-md flex items-center gap-2">
                            🔔 {t('newOrdersToConfirm')}
                          </strong>
                          <p className="text-amber-100/90 mt-2 font-medium">
                            {t('youHaveXOrders').replace('{count}', unseenCount.toString())}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const unseenOrders = orders.filter(o => !o.admin_seen && o.status === 'paid').map(o => o.id);
                              markOrdersAsSeen(unseenOrders);
                              loadUnseenCount();
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-md hover:shadow-lg transition-all"
                          >
                            {t('markAllAsSeen')}
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <TooltipProvider>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={selectedOrders.length === orders.length && orders.length > 0}
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead className="text-xs">Order #</TableHead>
                            <TableHead className="text-xs">Order ID</TableHead>
                            <TableHead className="text-xs min-w-[200px] max-w-[250px]">{t('customer')}</TableHead>
                            <TableHead className="text-xs">{t('total')}</TableHead>
                            <TableHead className="text-xs">{t('status')}</TableHead>
                            <TableHead className="text-xs min-w-[180px]">{t('shipping')}</TableHead>
                            <TableHead className="text-xs">{t('created')}</TableHead>
                            <TableHead className="text-xs min-w-[140px]">{t('actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {orders.map((order) => {
                          const shippingStatus = getShippingStatusDisplay(order);
                          const totalPLN = order.total_pln;
                          const shippingCostPLN = order.shipping_cost_pln || 0;
                          const productsPLN = totalPLN - shippingCostPLN;
                          const shippingName = order.shipping_address?.first_name && order.shipping_address?.last_name
                            ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
                            : null;

                          return (
                            <TableRow key={order.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedOrders.includes(order.id)}
                                  onCheckedChange={() => toggleOrderSelection(order.id)}
                                />
                              </TableCell>
                              {/* Order Number */}
                              <TableCell className="font-semibold text-sm">
                                SPIRIT-{String(order.order_number).padStart(5, '0')}
                              </TableCell>

                            {/* Order ID with Tooltip */}
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-pointer group">
                                    <span className="font-mono text-sm hidden md:inline">
                                      {order.id.slice(0, 8)}...
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 md:hidden"
                                      onClick={() => {
                                        navigator.clipboard.writeText(order.id);
                                        toast({ title: t('orderIdCopied') });
                                      }}
                                    >
                                      {t('viewOrderId')}
                                    </Button>
                                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline" 
                                      onClick={() => {
                                        navigator.clipboard.writeText(order.id);
                                        toast({ title: t('orderIdCopied') });
                                      }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-mono text-xs">{order.id}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>

                            {/* Customer with Shipping Info */}
                            <TableCell className="max-w-[250px]">
                              <div className="space-y-1">
                                <div className="font-medium text-sm">
                                  {order.profiles?.first_name} {order.profiles?.last_name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {order.profiles?.email}
                                </div>
                                {order.shipping_address && (
                                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs space-y-0.5">
                                    <div className="font-semibold text-[10px] text-muted-foreground uppercase">
                                      {t('shippingInfo')}
                                    </div>
                                    <div className="font-medium">
                                      {order.shipping_address.first_name} {order.shipping_address.last_name}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {order.shipping_address.city} {order.shipping_address.postal_code}
                                    </div>
                                    {order.shipping_address.phone && (
                                      <div className="text-muted-foreground">
                                        📞 {order.shipping_address.phone}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            {/* Total with compact format */}
                            <TableCell>
                              <div className="whitespace-nowrap">
                                <div className="font-semibold text-primary">{totalPLN.toFixed(2)} PLN</div>
                                <div className="text-xs text-muted-foreground">
                                  ({productsPLN.toFixed(2)} + {shippingCostPLN.toFixed(2)})
                                </div>
                              </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Badge 
                                variant={
                                  order.status === 'completed' ? 'default' :
                                  order.status === 'paid' ? 'secondary' :
                                  order.status === 'pending' ? 'outline' : 'destructive'
                                }
                                className={`text-[9px] px-1.5 py-0.5 h-auto ${
                                  order.status === 'paid' ? 'bg-red-500 hover:bg-red-600 text-white drop-shadow-md' :
                                  order.status === 'completed' ? 'bg-green-500 hover:bg-green-600 text-white drop-shadow-md' : ''
                                }`}
                              >
                                {order.status === 'completed' ? t('complete') : order.status}
                              </Badge>
                            </TableCell>

                            {/* Shipping Status */}
                            <TableCell className="min-w-[180px]">
                              <div className="space-y-1">
                                {shippingStatus.badge}
                                {shippingStatus.details}
                              </div>
                            </TableCell>

                            {/* Creation Date */}
                            <TableCell className="text-sm">
                              {new Date(order.created_at).toLocaleDateString()}
                            </TableCell>

                             {/* Actions - Organized in Grid */}
                            <TableCell>
                              <div className="flex flex-col gap-1 w-fit">
                                {/* Row 1 */}
                                <div className="flex gap-1">
                                   <Button
                                     size="sm"
                                     variant="ghost"
                                     className="h-7 text-[10px] px-2"
                                     onClick={() => {
                                       setSelectedOrder(order);
                                       setIsOrderDetailsOpen(true);
                                       markOrderAsSeen(order.id);
                                     }}
                                   >
                                     <Eye className="h-3 w-3" />
                                   </Button>
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     className="h-7 text-[9px] px-1.5"
                                     onClick={() => updateOrderStatus(order.id, 'completed')}
                                     disabled={order.status === 'completed'}
                                   >
                                     {t('complete')}
                                   </Button>
                                </div>
                                
                                {/* Row 2 */}
                                <div className="flex gap-1">
                                  {order.shipping_label_url || order.furgonetka_package_id ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-[10px] px-1.5 flex items-center gap-1 bg-white hover:bg-gray-100 text-black border-gray-300"
                                      disabled
                                    >
                                      <img src={furgonetkaIco} alt="Furgonetka" className="h-4 w-4" />
                                      <span>{t('doneButton')}</span>
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-7 text-[9px] px-1 whitespace-nowrap flex items-center gap-0.5 bg-white hover:bg-gray-100 text-black"
                                      onClick={() => openShipmentModal(order)}
                                      disabled={order.status !== 'completed'}
                                    >
                                      <span className="order-1">{t('sendTo')}</span>
                                      <img src={furgonetkaIco} alt="Furgonetka" className="h-3.5 w-3.5 order-2" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 text-[10px] px-2"
                                    onClick={() => handleDeleteOrder(order)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TooltipProvider>
                </div>

                {/* Mobile Card-Based View */}
                <div className="md:hidden space-y-4">
                  {orders.map((order) => {
                    const shippingStatus = getShippingStatusDisplay(order);
                    const totalPLN = order.total_pln;
                    const shippingCostPLN = order.shipping_cost_pln || 0;
                    const productsPLN = totalPLN - shippingCostPLN;
                    const shippingName = order.shipping_address?.first_name && order.shipping_address?.last_name
                      ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
                      : null;

                    return (
                      <Card key={order.id} className="p-4">
                        <div className="space-y-3">
                          {/* Header with Checkbox */}
                          <div className="flex items-center gap-2 mb-2">
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={() => toggleOrderSelection(order.id)}
                            />
                          </div>

                          {/* Order Info */}
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-sm">
                                SPIRIT-{String(order.order_number).padStart(5, '0')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge 
                              variant={
                                order.status === 'completed' ? 'default' :
                                order.status === 'paid' ? 'secondary' :
                                order.status === 'pending' ? 'outline' : 'destructive'
                              }
                              className={
                                order.status === 'paid' ? 'bg-red-500 hover:bg-red-600 text-white drop-shadow-md' :
                                order.status === 'completed' ? 'bg-green-500 hover:bg-green-600 text-white drop-shadow-md' : ''
                              }
                            >
                              {order.status === 'completed' ? t('complete') : order.status}
                            </Badge>
                          </div>

                          {/* Customer */}
                          <div className="text-sm border-t pt-2">
                            <div className="font-medium">
                              {order.profiles?.first_name} {order.profiles?.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.profiles?.email}
                            </div>
                            
                            {/* Shipping info box */}
                            {order.shipping_address && (
                              <div className="mt-2 p-2 bg-muted/50 rounded text-xs space-y-0.5">
                                <div className="font-semibold text-[10px] text-muted-foreground uppercase">
                                  {t('shippingInfo')}
                                </div>
                                <div className="font-medium">
                                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                                </div>
                                <div className="text-muted-foreground">
                                  {order.shipping_address.city} {order.shipping_address.postal_code}
                                </div>
                                {order.shipping_address.phone && (
                                  <div className="text-muted-foreground">
                                    📞 {order.shipping_address.phone}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Total */}
                          <div className="flex justify-between text-sm border-t pt-2">
                            <span className="text-muted-foreground">{t('total')}:</span>
                            <div className="text-right">
                              <div className="font-semibold">{totalPLN.toFixed(2)} PLN</div>
                              <div className="text-xs text-muted-foreground">
                                ({productsPLN.toFixed(2)} + {shippingCostPLN.toFixed(2)})
                              </div>
                            </div>
                          </div>

                          {/* Shipping Status */}
                          <div className="border-t pt-2">
                            <div className="text-xs text-muted-foreground mb-1">{t('shipping')}:</div>
                            {shippingStatus.badge}
                            {shippingStatus.details && <div className="mt-1">{shippingStatus.details}</div>}
                          </div>

                          {/* Actions */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsOrderDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {t('details')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="default"
                              className="w-full text-xs bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              disabled={order.status === 'completed'}
                            >
                              {t('complete')}
                            </Button>
                            {order.shipping_label_url || order.furgonetka_package_id ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full text-xs bg-white hover:bg-gray-100 text-black border-gray-300 flex items-center justify-center gap-1.5"
                                disabled
                              >
                                <img src={furgonetkaIco} alt="Furgonetka" className="h-3 w-3" />
                                <span>{t('doneButton')}</span>
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="default"
                                className="w-full text-xs bg-white hover:bg-gray-100 text-black flex items-center justify-center gap-1.5"
                                onClick={() => openShipmentModal(order)}
                                disabled={order.status !== 'completed'}
                              >
                                <span>{t('sendTo')}</span>
                                <img src={furgonetkaIco} alt="Furgonetka" className="h-3 w-3" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="w-full text-xs"
                              onClick={() => handleDeleteOrder(order)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              {t('delete')}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trash" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('ordersTrash')}</CardTitle>
                <CardDescription>{t('deletedOrdersDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {deletedOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'pl' ? 'Brak usuniętych zamówień' : 'No deleted orders'}
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Order #</TableHead>
                            <TableHead className="text-xs">{t('customer')}</TableHead>
                            <TableHead className="text-xs">{t('total')}</TableHead>
                            <TableHead className="text-xs">{t('status')}</TableHead>
                            <TableHead className="text-xs">{language === 'pl' ? 'Usunięto' : 'Deleted'}</TableHead>
                            <TableHead className="text-xs">{t('actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deletedOrders.map((order) => {
                            const totalPLN = order.total_pln;
                            return (
                              <TableRow key={order.id}>
                                <TableCell className="font-semibold text-sm">
                                  SPIRIT-{String(order.order_number).padStart(5, '0')}
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-0.5">
                                    <div className="font-medium text-sm">
                                      {order.profiles?.first_name} {order.profiles?.last_name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {order.profiles?.email}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {totalPLN.toFixed(2)} PLN
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{order.status}</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {order.deleted_at ? new Date(order.deleted_at).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs"
                                      onClick={() => restoreOrder(order.id)}
                                    >
                                      {t('restore')}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-8 text-xs"
                                      onClick={() => permanentDeleteOrder(order.id)}
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      {t('deletePermanently')}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                      {deletedOrders.map((order) => {
                        const totalPLN = order.total_pln;
                        return (
                          <Card key={order.id} className="p-4 border-destructive/50">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-semibold text-sm">
                                    SPIRIT-{String(order.order_number).padStart(5, '0')}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {language === 'pl' ? 'Usunięto' : 'Deleted'}: {order.deleted_at ? new Date(order.deleted_at).toLocaleDateString() : '-'}
                                  </div>
                                </div>
                                <Badge variant="outline">{order.status}</Badge>
                              </div>

                              <div className="text-sm border-t pt-2">
                                <div className="font-medium">
                                  {order.profiles?.first_name} {order.profiles?.last_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {order.profiles?.email}
                                </div>
                              </div>

                              <div className="flex justify-between text-sm border-t pt-2">
                                <span className="text-muted-foreground">{t('total')}:</span>
                                <span className="font-semibold">{totalPLN.toFixed(2)} PLN</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="w-full text-xs"
                                  onClick={() => restoreOrder(order.id)}
                                >
                                  {t('restore')}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="w-full text-xs"
                                  onClick={() => permanentDeleteOrder(order.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  {t('deletePermanently')}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('customers')}</CardTitle>
                <CardDescription>{t('manageCustomerOrders')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('name')}</TableHead>
                      <TableHead>{t('username')}</TableHead>
                      <TableHead>{t('email')}</TableHead>
                      <TableHead>{t('role')}</TableHead>
                      <TableHead>{t('joinDate')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          {profile.first_name} {profile.last_name}
                        </TableCell>
                        <TableCell>
                          {profile.username || t('notSet')}
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
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCustomerView(profile)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t('viewDetails')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCustomerEdit(profile)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {t('edit')}
                            </Button>
                            <Button
                              size="sm"
                              variant={profile.role === 'admin' ? 'secondary' : 'default'}
                              onClick={() => toggleUserRole(profile)}
                            >
                              {profile.role === 'admin' ? t('demoteToUser') : t('promoteToAdmin')}
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
                            <TableHead className="w-12"></TableHead>
                            <TableHead>{t('product')} / Produkt</TableHead>
                            <TableHead>{t('actions')} / {t('actions')}</TableHead>
                            <TableHead>{t('size')} / Rozmiar</TableHead>
                            <TableHead>{t('category')} / Kategoria</TableHead>
                            <TableHead className="text-right">{t('stockQuantity')} / Zapas</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                            <TableHead>{t('published')} / Opublikowany</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                {product.image_url ? (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name_en}
                                    className="w-10 h-10 object-cover rounded border"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-muted rounded border flex items-center justify-center">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{product.name_en}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => editProduct(product)}
                                    title={`${t('editProductDetails')} / ${t('editProductDetails')}`}
                                    className="h-8 px-2"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    <span className="text-xs">{t('editProductDetails')}</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(`/product/${product.id}`, '_blank')}
                                    title={`${t('viewProductPage')} / ${t('viewProductPage')}`}
                                    className="h-8 px-2"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    <span className="text-xs">{t('viewProductPage')}</span>
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>{product.size || "-"}</TableCell>
                              <TableCell>
                                <Link 
                                  to={`/collections?category=${product.category}`}
                                  className="hover:underline text-primary"
                                >
                                  {product.category}
                                </Link>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Input
                                    type="number"
                                    value={editingStock[product.id] ?? product.stock_quantity ?? 0}
                                    onChange={(e) => setEditingStock({ ...editingStock, [product.id]: parseInt(e.target.value) || 0 })}
                                    className="w-20 text-right"
                                    min={0}
                                  />
                                  {editingStock[product.id] !== undefined && editingStock[product.id] !== product.stock_quantity && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => updateStockQuantity(product.id, editingStock[product.id])}
                                    >
                                      Save
                                    </Button>
                                  )}
                                </div>
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

          <TabsContent value="coupons" className="space-y-4">
            <AdminCoupons />
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <AdminExport data={{
              products,
              orders,
              customers: profiles
            }} />
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <AdminSocialMedia />
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
          onTrackingUpdated={() => {
            loadDashboardData();
            // Refresh the selected order
            if (selectedOrder) {
              const updatedOrder = orders.find(o => o.id === selectedOrder.id);
              if (updatedOrder) setSelectedOrder(updatedOrder);
            }
          }}
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

        {/* Product Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-playfair text-2xl">
                {t('editProductTitle')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
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
                    onChange={(e) => setProductForm({ ...productForm, price_pln: e.target.value })}
                    placeholder="Prezzo in PLN (es. 108,24)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('priceEur')}</Label>
                  <Input
                    type="text"
                    value={productForm.price_eur}
                    onChange={(e) => setProductForm({ ...productForm, price_eur: e.target.value })}
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
                <div className="space-y-2 md:col-span-2">
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
              <div className="flex gap-4 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={saveProduct}>
                  {t('updateProduct')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Customer Modal */}
        <AdminEditCustomerModal
          customer={selectedCustomer}
          isOpen={isEditCustomerModalOpen}
          onClose={() => {
            setIsEditCustomerModalOpen(false);
            setSelectedCustomer(null);
          }}
          onSuccess={loadDashboardData}
        />

        {/* Delete Order Dialog */}
        <AdminDeleteOrderDialog
          isOpen={isDeleteOrderDialogOpen}
          onClose={() => {
            setIsDeleteOrderDialogOpen(false);
            setOrderToDelete(null);
          }}
          onConfirm={confirmDeleteOrder}
          isLoading={isDeletingOrder}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;