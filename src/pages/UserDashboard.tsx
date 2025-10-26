import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Navigate, useSearchParams } from 'react-router-dom';
import { User, Settings, ShoppingBag, CreditCard, Package, Truck, Eye } from 'lucide-react';
import AdminOrderDetailsModal from '@/components/AdminOrderDetailsModal';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
  preferred_language: string;
}

interface Order {
  id: string;
  user_id: string;
  total_pln: number;
  total_eur: number;
  shipping_cost_pln?: number;
  shipping_cost_eur?: number;
  carrier_name?: string;
  status: string;
  created_at: string;
  order_number?: number;
  shipping_address: any;
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  shipping_status?: string;
  shipping_label_url?: string;
  furgonetka_package_id?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setEditForm({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        username: profileData.username || '',
        email: profileData.email || ''
      });

      // Load user orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const updates: any = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        username: editForm.username,
        email: editForm.email
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setIsEditing(false);
      loadUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateLanguagePreference = async (lang: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: lang })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Language preference updated",
      });
      
      loadUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getOrderBadges = (order: Order) => {
    const badges = [];
    
    // Stage 1: Paid - Payment successful
    if (order.status !== 'pending') {
      badges.push({ 
        label: t('paid') || 'Paid', 
        variant: 'bg-red-500 text-white',
        icon: null 
      });
    }
    
    // Stage 2: Completed - Admin accepted order
    if (order.status === 'completed') {
      badges.push({ 
        label: t('completed') || 'Completed', 
        variant: 'bg-yellow-500 text-white',
        icon: null 
      });
    }
    
    // Stage 3: Shipment Created
    if (order.furgonetka_package_id && !order.tracking_number) {
      badges.push({ 
        label: t('shipmentCreated') || 'Shipment Created', 
        variant: 'bg-blue-500 text-white',
        icon: <Package className="w-3 h-3" /> 
      });
    }
    
    // Stage 4: Shipped - Tracking available
    if (order.tracking_number && order.carrier) {
      badges.push({ 
        label: t('shipped') || 'Shipped', 
        variant: 'bg-green-500 text-white',
        icon: <Truck className="w-3 h-3" /> 
      });
    }
    
    // Stage 5: Delivered
    if (order.shipping_status === 'delivered') {
      badges.push({ 
        label: t('delivered') || 'Delivered', 
        variant: 'bg-green-600 text-white',
        icon: <Package className="w-3 h-3" /> 
      });
    }
    
    return badges;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">
            {t('dashboard') || 'Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {t('welcomeBackUser')}, {profile?.first_name || profile?.username}!
          </p>
        </div>

        <Tabs defaultValue={tabParam || "profile"} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('profile')}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {t('orders')}
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t('billing')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t('settings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('profileInformation')}</CardTitle>
                <CardDescription>
                  {t('viewAndEdit')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">{t('firstName')}</label>
                        <Input
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          placeholder={t('firstName')}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t('lastName')}</label>
                        <Input
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          placeholder={t('lastName')}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('username')}</label>
                      <Input
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        placeholder={t('username')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('email')}</label>
                      <Input
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder={t('email')}
                        type="email"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={updateProfile}>{t('saveChanges')}</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('firstName')}</label>
                        <p className="text-foreground">{profile?.first_name || t('notSet')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('lastName')}</label>
                        <p className="text-foreground">{profile?.last_name || t('notSet')}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t('username')}</label>
                      <p className="text-foreground">{profile?.username || t('notSet')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t('email')}</label>
                      <p className="text-foreground">{profile?.email}</p>
                    </div>
                    <Button onClick={() => setIsEditing(true)}>{t('editProfile')}</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('orderHistory')}</CardTitle>
                <CardDescription>
                  {t('orderHistoryDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t('noOrders')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const badges = getOrderBadges(order);
                      const totalPLN = order.total_pln / 100;
                      const totalEUR = order.total_eur;
                      const shippingCostPLN = (order.shipping_cost_pln || 0) / 100;
                      const shippingCostEUR = order.shipping_cost_eur || 0;
                      const productsPLN = totalPLN - shippingCostPLN;
                      const productsEUR = totalEUR - shippingCostEUR;

                      return (
                        <div key={order.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">Order #SPIRIT-{String(order.order_number).padStart(5, '0')}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-wrap justify-end">
                              {badges.map((badge, index) => (
                                <Badge key={index} className={`${badge.variant} flex items-center gap-1`}>
                                  {badge.icon}
                                  {badge.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        <div className="space-y-2 border-t pt-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{t('products')}:</span>
                              <span>{productsPLN.toFixed(2)} PLN / {productsEUR} EUR</span>
                            </div>
                          {(order.shipping_cost_pln || 0) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{t('shipping')}:</span>
                              <span>{shippingCostPLN.toFixed(2)} PLN / {shippingCostEUR} EUR</span>
                            </div>
                          )}
                          {order.carrier_name && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{t('carrier')}:</span>
                              <Badge variant="outline">{order.carrier_name}</Badge>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold pt-2 border-t">
                            <span>{t('total')}:</span>
                            <span>{totalPLN.toFixed(2)} PLN / {totalEUR} EUR</span>
                          </div>
                        </div>
                        {order.tracking_number && order.carrier && (
                          <div className="border-t pt-3 mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{t('shippingInformation')}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">{t('carrier')}:</span>
                                <Badge variant="default" className="ml-2 bg-green-500">{order.carrier}</Badge>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t('status')}:</span>
                                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                                  {t('shipped')}
                                </Badge>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-muted-foreground">{t('trackingNumb')}:</span>
                                {order.tracking_url ? (
                                  <a 
                                    href={order.tracking_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2 font-mono text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors inline-block"
                                  >
                                    {order.tracking_number}
                                  </a>
                                ) : (
                                  <code className="ml-2 font-mono text-xs bg-muted px-2 py-1 rounded">
                                    {order.tracking_number}
                                  </code>
                                )}
                              </div>
                            </div>
                            {order.tracking_url && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(order.tracking_url, '_blank')}
                                className="w-full mt-2"
                              >
                                {t('trackPackage')}
                              </Button>
                            )}
                          </div>
                        )}
                        <div className="border-t pt-3 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsOrderModalOpen(true);
                            }}
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t('viewDetails') || 'View Details'}
                          </Button>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('billing')}</CardTitle>
                <CardDescription>
                  {t('paymentHistory') || 'View your payment history'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {t('billingDescription') || 'All payments are processed securely through Stripe. Your payment history is linked to your orders.'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('viewOrdersForPayments') || 'View the Orders tab to see your complete payment history.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Account Status</h3>
                      <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                        {profile?.role === 'admin' ? 'Administrator' : 'User'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Preferred Language</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Choose your preferred language for emails and the website.
                      </p>
                      <Select 
                        value={profile?.preferred_language || 'en'} 
                        onValueChange={(value) => updateLanguagePreference(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="pl">Polski</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      <AdminOrderDetailsModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        onTrackingUpdated={() => {
          loadUserData();
        }}
      />
    </div>
  );
};

export default UserDashboard;