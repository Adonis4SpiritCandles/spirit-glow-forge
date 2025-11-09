import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, Search, ShoppingCart, User, LogOut, Heart, LayoutDashboard, Settings as SettingsIcon, Package, ShoppingBag, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useCartContext } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useHeaderSettings } from '@/hooks/useHeaderSettings';
import { supabase } from '@/integrations/supabase/client';
import LanguageToggle from '@/components/LanguageToggle';
import SearchModal from '@/components/SearchModal';
import spiritLogoTransparent from '@/assets/spirit-logo-transparent.png';
import goldShieldIcon from '@/assets/gold-shield-admin-mini.png';
import iconLogoCandle from '@/assets/icon-logo-candle-transparent.png';
import goldShieldMiniIcon from '@/assets/gold-shield-admin-mini-2.png';
import NotificationBell from '@/components/NotificationBell';

const Header = ({ onCartOpen }: { onCartOpen?: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { language, t } = useLanguage();
  const { user, signOut } = useAuth();
  const { itemCount } = useCartContext();
  const { wishlistCount } = useWishlist();
  const { unseenCount, isAdmin } = useAdminNotifications();
  const { settings: headerSettings, loading: headerLoading } = useHeaderSettings();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // Load user profile to check role and profile image
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role, profile_image_url, first_name')
          .eq('user_id', user.id)
          .single();
        setUserProfile(data);
        setProfileImageUrl(data?.profile_image_url || null);
      } else {
        setUserProfile(null);
        setProfileImageUrl(null);
      }
    };
    
    loadUserProfile();
  }, [user]);

  // Build navigation items from database or fallback to defaults
  const navItems = headerSettings?.navigation_items
    ?.filter(item => item.is_active)
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      name: language === 'pl' ? item.label_pl : item.label_en,
      href: item.url
    })) || [
    { name: t('home'), href: '/' },
    { name: t('shop'), href: '/shop' },
    { name: t('collections'), href: '/collections' },
    { name: t('customize'), href: '/custom-candles' },
    { name: t('about'), href: '/about' },
    { name: t('contact'), href: '/contact' },
  ];

  // Get logo settings
  const logoUrl = headerSettings?.logo_url || iconLogoCandle;
  const logoHeight = headerSettings?.logo_height || 'h-8';
  
  // Feature flags from settings
  const showSearch = headerSettings?.show_search ?? true;
  const showWishlist = headerSettings?.show_wishlist ?? true;
  const showCart = headerSettings?.show_cart ?? true;
  const showLanguageToggle = headerSettings?.show_language_toggle ?? true;
  const stickyHeader = headerSettings?.sticky_header ?? true;
  const transparentOnScroll = headerSettings?.transparent_on_scroll ?? false;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className={`${stickyHeader ? 'sticky' : 'relative'} top-0 z-50 w-full border-b border-border/40 ${transparentOnScroll ? 'bg-background/80' : 'bg-background/95'} mystical-blur`}>
      <div className="container mx-auto px-4 lg:px-8">
        {/* Mobile Layout - TASK 2 COMPLETO */}
        <div className="flex md:hidden h-16 items-center justify-between relative">
          {/* LEFT SECTION: Language, Admin Icon, Burger Menu */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {showLanguageToggle && <LanguageToggle />}
            
            {user && userProfile?.role === 'admin' && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="relative">
                  <img src={goldShieldMiniIcon} alt="Admin" className="h-5 w-5" />
                  {unseenCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse"
                    >
                      {unseenCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex justify-center mb-6">
                    <img 
                      src={spiritLogoTransparent} 
                      alt="SPIRIT CANDLES" 
                      className="h-20 w-auto animate-glow-pulse"
                    />
                  </SheetTitle>
                  <SheetDescription className="sr-only">Menu Navigation</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-accent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* LINEA DIVISORIA */}
                  <div className="border-t border-border my-2" />
                  
                  {/* NUOVE VOCI SIDEBAR - TASK 4A */}
                  {showSearch && (
                    <Button 
                      variant="ghost" 
                      className="justify-start px-4"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSearchOpen(true);
                      }}
                    >
                      <Search className="h-5 w-5 mr-2" />
                      {t('search')}
                    </Button>
                  )}
                  
                  {showCart && (
                    <Button 
                      variant="ghost" 
                      className="justify-start px-4 relative" 
                      onClick={() => {
                        setIsMenuOpen(false);
                        onCartOpen?.();
                      }}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {t('cart')}
                      {itemCount > 0 && <Badge className="ml-auto">{itemCount}</Badge>}
                    </Button>
                  )}
                  
                  {user && showWishlist && (
                    <Button 
                      variant="ghost" 
                      className="justify-start px-4 relative" 
                      asChild
                    >
                      <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
                        <Heart className="h-5 w-5 mr-2" />
                        {t('wishlist')}
                        {wishlistCount > 0 && <Badge className="ml-auto">{wishlistCount}</Badge>}
                      </Link>
                    </Button>
                  )}
                  
                  {user && (
                    <Button 
                      variant="ghost" 
                      className="justify-start px-4" 
                      asChild
                    >
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <LayoutDashboard className="h-5 w-5 mr-2" />
                        {t('dashboard')}
                      </Link>
                    </Button>
                  )}
                  
                  {user && userProfile?.role === 'admin' && (
                    <Button 
                      variant="ghost" 
                      className="justify-start px-4 relative" 
                      asChild
                    >
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <img src={goldShieldMiniIcon} alt="Admin" className="h-5 w-5 mr-2" />
                        {t('admin')}
                        {unseenCount > 0 && <Badge className="ml-auto bg-red-500">{unseenCount}</Badge>}
                      </Link>
                    </Button>
                  )}
                  
                  {user ? (
                    <Button 
                      variant="ghost" 
                      className="justify-start px-4 text-destructive" 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      {t('logout')}
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="justify-start px-4" 
                      asChild
                    >
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <User className="h-5 w-5 mr-2" />
                        {t('login')}
                      </Link>
                    </Button>
                  )}
                  
                  {/* Language Selector */}
                  <div className="px-4 pt-4 border-t border-border">
                    <LanguageToggle />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* CENTER: Logo */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
            <img 
              src={logoUrl} 
              alt="SPIRIT CANDLES" 
              className={`${logoHeight} w-auto hover:scale-105 transition-all duration-700`}
              style={{
                filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))',
                animation: 'glow-soft 4s ease-in-out infinite'
              }}
            />
          </Link>

          {/* RIGHT SECTION: Notification Bell, Profile/Image Icon, Cart */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {user && <NotificationBell />}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="min-w-[36px] min-h-[36px]">
                    {profileImageUrl ? (
                      <img 
                        src={profileImageUrl} 
                        alt="Profile" 
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      {t('dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard?tab=orders" className="flex items-center cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      {t('myOrders')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user?.id}`} className="flex items-center cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      {t('spiritProfile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard?tab=settings" className="flex items-center cursor-pointer">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      {t('settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/shop" className="flex items-center cursor-pointer">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      {t('shop')}
                    </Link>
                  </DropdownMenuItem>
                  {showSearch && (
                    <DropdownMenuItem asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start px-2 h-auto py-2"
                        onClick={() => setIsSearchOpen(true)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {t('search')}
                      </Button>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <User className="h-5 w-5" />
                  <span className="text-xs">{t('login')}</span>
                </Button>
              </Link>
            )}
            
            {showCart && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={onCartOpen}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Tablet/Desktop Layout - TASK 1 COMPLETO */}
        <div className="hidden md:flex h-16 items-center justify-between">
          {/* Logo con margine sinistra */}
          <div className="flex items-center ml-3 md:ml-4">
            <Link to="/" className="md:mr-2 lg:mr-6">
              <img 
                src={logoUrl} 
                alt="SPIRIT CANDLES" 
                className={`${logoHeight} w-auto hover:scale-105 transition-all duration-700`}
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))',
                  animation: 'glow-soft 4s ease-in-out infinite'
                }}
              />
            </Link>
          </div>

          {/* Tablet Navigation (768px-1024px) - COMPATTO */}
          <nav className="hidden md:flex lg:hidden items-center space-x-1.5 mr-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-xs font-medium text-foreground/80 transition-colors hover:text-primary hover:scale-105 duration-300"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Navigation (1024px+) */}
          <nav className="hidden lg:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-[13px] lg:text-sm font-medium text-foreground/80 transition-colors hover:text-primary hover:scale-105 duration-300"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions - ULTRA COMPATTI */}
          <div className="flex items-center gap-0.5">
            {/* Language Toggle - ridotto */}
            {showLanguageToggle && <LanguageToggle />}
            
            {/* Search Button - SOLO DESKTOP (lg+) */}
            {showSearch && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden lg:flex"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            )}
            
            {/* Admin Button - Always visible if admin */}
            {user && userProfile?.role === 'admin' && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="relative">
                  <img src={goldShieldIcon} alt="Admin" className="h-3.5 w-3.5" />
                  {unseenCount > 0 && (
                    <Badge
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse"
                    >
                      {unseenCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            
            {/* Notification Bell */}
            {user && <NotificationBell />}
            
            {/* User Dropdown Menu - TASK 4B */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 relative min-w-[32px] min-h-[32px]">
                    {profileImageUrl ? (
                      <div className="relative">
                        <img 
                          src={profileImageUrl} 
                          alt="Profile" 
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <ChevronDown className="h-3 w-3 absolute -bottom-1 -right-1 bg-background rounded-full" />
                      </div>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5" />
                        <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {profileImageUrl && userProfile?.first_name && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                        {userProfile.first_name}
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {/* Search in dropdown - SOLO TABLET */}
                  {showSearch && (
                    <DropdownMenuItem asChild className="md:flex lg:hidden">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start px-2 h-auto py-2"
                        onClick={() => setIsSearchOpen(true)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {t('search')}
                      </Button>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      {t('dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard?tab=orders" className="flex items-center cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      {t('myOrders')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user?.id}`} className="flex items-center cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      {t('spiritProfile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard?tab=settings" className="flex items-center cursor-pointer">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      {t('settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/shop" className="flex items-center cursor-pointer">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      {t('shop')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  <User className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden lg:inline">{t('login')}</span>
                </Button>
              </Link>
            )}

            {showCart && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={onCartOpen}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {itemCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Search Modal */}
      {showSearch && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </header>
  );
};

export default Header;
