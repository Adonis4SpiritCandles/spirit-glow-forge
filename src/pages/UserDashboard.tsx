import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import SEOManager from '@/components/SEO/SEOManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Navigate, useSearchParams } from 'react-router-dom';
import { User, Settings, ShoppingBag, CreditCard, Package, Truck, Eye, Save, Users, Award, Gift } from 'lucide-react';
import AdminOrderDetailsModal from '@/components/AdminOrderDetailsModal';
import { CarrierBadge } from '@/utils/carrierStyles';
import BadgeShowcase from '@/components/gamification/BadgeShowcase';
import ReferralDashboard from '@/components/gamification/ReferralDashboard';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';

interface LanguageOption {
  value: string;
  label: string;
}

const languageOptions: LanguageOption[] = [
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polski' },
];

interface BadgeType {
  label: string;
  variant: string;
  icon: React.ReactNode;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
  preferred_language: string;
  profile_image_url?: string;
  cover_image_url?: string;
  bio?: string;
  public_profile?: boolean;
}

interface Order {
  id: string;
  user_id: string;
  total_pln: number;
  total_eur: number;
  shipping_cost_pln?: number;
  shipping_cost_eur?: number;
  discount_pln?: number;
  discount_eur?: number;
  coupon_code?: string;
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
  const [activeTab, setActiveTab] = useState(tabParam || 'settings');
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

  const handleProfileUpdate = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: profile?.bio,
          public_profile: profile?.public_profile,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' 
          ? 'Profil został zaktualizowany' 
          : 'Profile has been updated',
      });
      
      loadUserData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
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
    
    if (order.status !== 'pending') {
      badges.push({ 
        label: t('paid') || 'Paid', 
        variant: 'bg-red-500 text-white',
        icon: null 
      });
    }
    
    if (order.status === 'completed') {
      badges.push({ 
        label: t('completed') || 'Completed', 
        variant: 'bg-yellow-500 text-white',
        icon: null 
      });
    }
    
    if (order.furgonetka_package_id && !order.tracking_number) {
      badges.push({ 
        label: t('shipmentCreated') || 'Shipment Created', 
        variant: 'bg-cyan-500 text-black font-semibold',
        icon: <Package className="w-3 h-3" /> 
      });
    }
    
    if (order.tracking_number && (order.carrier_name || order.carrier)) {
      badges.push({ 
        label: t('shipped') || 'Shipped', 
        variant: 'bg-green-500 text-white flex items-center gap-1',
        icon: <Truck className="w-3 h-3" /> 
      });
    }
    
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
    <>
      <SEOManager
        title={t('dashboard') || 'Dashboard'}
        description={language === 'en'
          ? 'Manage your SPIRIT CANDLES account, view orders, update profile settings, and track your rewards.'
          : 'Zarządzaj kontem SPIRIT CANDLES, przeglądaj zamówienia, aktualizuj ustawienia profilu i śledź nagrody.'}
        noindex={true}
        nofollow={true}
      />
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="w-full overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 mb-6">
              <TabsList className="inline-flex w-auto min-w-full lg:grid lg:grid-cols-6 lg:w-full gap-1">
                <TabsTrigger value="settings" className="flex items-center gap-2 whitespace-nowrap px-4 py-2.5">
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{t('settings')}</span>
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2 whitespace-nowrap px-4 py-2.5">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{language === 'pl' ? 'Profil' : 'Profile'}</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2 whitespace-nowrap px-4 py-2.5">
                  <ShoppingBag className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{t('orders')}</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2 whitespace-nowrap px-4 py-2.5">
                  <CreditCard className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{t('billing')}</span>
                </TabsTrigger>
                <TabsTrigger value="rewards" className="flex items-center gap-2 whitespace-nowrap px-4 py-2.5">
                  <Award className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{t('rewards') || 'Rewards'}</span>
                </TabsTrigger>
                <TabsTrigger value="referrals" className="flex items-center gap-2 whitespace-nowrap px-4 py-2.5">
                  <Gift className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{t('referrals') || 'Referrals'}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Settings Tab - Merged User Data content */}
            <TabsContent value="settings" className="mt-6 space-y-6">
              {/* Profile Image Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {language === 'pl' ? 'Zdjęcie Profilowe' : 'Profile Image'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
                        {profile?.profile_image_url ? (
                          <img 
                            src={profile.profile_image_url} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <img 
                              src="/assets/mini-spirit-logo.png" 
                              alt="Default" 
                              className="w-20 h-20 opacity-30"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-sm text-muted-foreground mb-3">
                        {language === 'pl' 
                          ? 'Prześlij zdjęcie profilowe, aby spersonalizować swoje konto' 
                          : 'Upload your profile picture to personalize your account'}
                      </p>
                      <ProfileImageUpload 
                        userId={user?.id || ''} 
                        currentImageUrl={profile?.profile_image_url}
                        imageType="profile"
                        onUploadComplete={() => loadUserData()}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {language === 'pl' ? 'Informacje Osobiste' : 'Personal Information'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'pl' 
                      ? 'Zarządzaj swoimi danymi osobowymi' 
                      : 'Manage your personal information'}
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
                          disabled
                          className="bg-muted cursor-not-allowed"
                          type="email"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === 'pl' ? 'Email nie może być zmieniony' : 'Email cannot be changed'}
                        </p>
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

              {/* Language Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'pl' ? 'Preferencje Językowe' : 'Language Preferences'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>{language === 'pl' ? 'Preferowany język' : 'Preferred Language'}</Label>
                    <Select 
                      value={profile?.preferred_language || 'en'}
                      onValueChange={updateLanguagePreference}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pl">Polski</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Profile Tab - NEW */}
            <TabsContent value="social" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {language === 'pl' ? 'Profil Publiczny' : 'Public Profile'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'pl' 
                      ? 'Zarządzaj swoim publicznym profilem społecznościowym' 
                      : 'Manage your public social profile'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image Section - Synced with User Data */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'pl' ? 'Zdjęcie Profilowe' : 'Profile Picture'}
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      {language === 'pl' 
                        ? 'Prześlij zdjęcie profilowe, aby spersonalizować swoje konto'
                        : 'Upload your profile picture to personalize your account'}
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
                          {profile?.profile_image_url ? (
                            <img 
                              src={profile.profile_image_url} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <img 
                                src="/assets/mini-spirit-logo.png" 
                                alt="Default" 
                                className="w-20 h-20 opacity-30"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <ProfileImageUpload 
                          userId={user?.id || ''} 
                          currentImageUrl={profile?.profile_image_url}
                          imageType="profile"
                          onUploadComplete={() => loadUserData()}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'pl' ? 'Obraz Okładki' : 'Cover Image'}
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      {language === 'pl' 
                        ? 'Prześlij obraz okładki dla swojego profilu publicznego (zalecany rozmiar: 1200x400px)'
                        : 'Upload a cover image for your public profile (recommended size: 1200x400px)'}
                    </p>
                    {profile?.cover_image_url && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                        <img 
                          src={profile.cover_image_url} 
                          alt="Cover" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <ProfileImageUpload
                      userId={user.id}
                      currentImageUrl={profile?.cover_image_url}
                      imageType="cover"
                      onUploadComplete={(url) => {
                        setProfile({ ...profile!, cover_image_url: url });
                        toast({
                          title: language === 'pl' ? 'Sukces' : 'Success',
                          description: language === 'pl' 
                            ? 'Obraz okładki został zaktualizowany' 
                            : 'Cover image has been updated',
                        });
                      }}
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'pl' ? 'Biografia' : 'Bio'}
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      {language === 'pl' 
                        ? 'Opowiedz innym o sobie (maksymalnie 500 znaków)'
                        : 'Tell others about yourself (max 500 characters)'}
                    </p>
                    <Textarea
                      value={profile?.bio || ''}
                      onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
                      placeholder={language === 'pl' 
                        ? 'Napisz coś o sobie...' 
                        : 'Write something about yourself...'}
                      maxLength={500}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {profile?.bio?.length || 0} / 500
                    </p>
                  </div>

                  {/* Public Profile Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <label className="text-sm font-medium">
                        {language === 'pl' ? 'Profil Publiczny' : 'Public Profile'}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {language === 'pl' 
                          ? 'Zezwól innym na przeglądanie twojego profilu'
                          : 'Allow others to view your profile'}
                      </p>
                    </div>
                    <Switch
                      checked={profile?.public_profile || false}
                      onCheckedChange={(checked) => 
                        setProfile({ ...profile!, public_profile: checked })
                      }
                    />
                  </div>

                  {/* Save Button */}
                  <Button onClick={handleProfileUpdate} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {language === 'pl' ? 'Zapisz Profil' : 'Save Profile'}
                  </Button>

                  {/* View Public Profile Button */}
                  {profile?.public_profile && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(`/profile/${user.id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {language === 'pl' ? 'Zobacz Mój Profil Publiczny' : 'View My Public Profile'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="mt-6">
              <BadgeShowcase />
            </TabsContent>

            <TabsContent value="referrals" className="mt-6">
              <ReferralDashboard />
            </TabsContent>

            {/* Orders Tab */}
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
                        const discountPLN = Number(order.discount_pln || 0);
                        const discountEUR = Number(order.discount_eur || 0);
                        const totalPLN = Number(order.total_pln).toFixed(2);
                        const totalEUR = Number(order.total_eur).toFixed(2);
                        const shippingCostPLN = Number(order.shipping_cost_pln || 0).toFixed(2);
                        const shippingCostEUR = Number(order.shipping_cost_eur || 0).toFixed(2);
                        const productsPLN = Number(order.total_pln - (order.shipping_cost_pln || 0) + discountPLN).toFixed(2);
                        const productsEUR = Number(order.total_eur - (order.shipping_cost_eur || 0) + discountEUR).toFixed(2);

                        return (
                          <Card key={order.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold">
                                      {t('order')} #{order.order_number || order.id.substring(0, 8)}
                                    </h3>
                                    {badges.map((badge, idx) => (
                                      <Badge key={idx} className={badge.variant}>
                                        {badge.icon && <span className="mr-1">{badge.icon}</span>}
                                        {badge.label}
                                      </Badge>
                                    ))}
                                    {(order.carrier_name || order.carrier) && (
                                      <CarrierBadge carrierName={order.carrier_name || order.carrier || ''} />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </p>
                                  <div className="text-sm space-y-1">
                                    <p>
                                      <span className="text-muted-foreground">{t('products')}: </span>
                                      <span className="font-medium">{productsPLN} PLN / {productsEUR} EUR</span>
                                    </p>
                                    {order.coupon_code && (
                                      <p className="text-green-600 dark:text-green-400">
                                        <span className="text-muted-foreground">{t('discount')}: </span>
                                        <span className="font-medium">
                                          -{discountPLN.toFixed(2)} PLN / -{discountEUR.toFixed(2)} EUR ({order.coupon_code})
                                        </span>
                                      </p>
                                    )}
                                    <p>
                                      <span className="text-muted-foreground">{t('shipping')}: </span>
                                      <span className="font-medium">{shippingCostPLN} PLN / {shippingCostEUR} EUR</span>
                                    </p>
                                    <p className="text-lg font-bold mt-2">
                                      <span className="text-muted-foreground">{t('total')}: </span>
                                      {totalPLN} PLN / {totalEUR} EUR
                                    </p>
                                  </div>
                                  {order.tracking_number && (
                                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                      <p className="text-xs font-medium text-muted-foreground mb-1">
                                        {t('trackingNumber')}
                                      </p>
                                      <p className="text-sm font-mono">{order.tracking_number}</p>
                                      {order.tracking_url && (
                                        <a
                                          href={order.tracking_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                                        >
                                          {t('trackPackage')} →
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setIsOrderModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  {t('viewDetails')}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
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
                  <CardTitle>{t('billingSettings')}</CardTitle>
                  <CardDescription>
                    {t('billingSettingsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{t('billingInfo')}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings')}</CardTitle>
                  <CardDescription>
                    {t('settingsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="language">{t('language')}</Label>
                    <Select value={language} onValueChange={updateLanguagePreference}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {selectedOrder && (
            <AdminOrderDetailsModal
              order={selectedOrder}
              isOpen={isOrderModalOpen}
              onClose={() => {
                setIsOrderModalOpen(false);
                setSelectedOrder(null);
                loadUserData();
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
