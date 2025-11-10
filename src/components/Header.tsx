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
import NotificationCenter from '@/components/NotificationCenter';

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

  // Get logo settings with transparent fallback
  const logoUrl = headerSettings?.logo_url || spiritLogoTransparent;
  const logoHeight = headerSettings?.logo_height || 'h-8';
  const logoTransparentBg = headerSettings?.logo_transparent_bg ?? true;

  // Mobile & Tablet specific logo settings
  const mobileLogoUrl = headerSettings?.mobile_logo_url || iconLogoCandle;
  const mobileLogoHeight = headerSettings?.mobile_logo_height || 'h-14';
  const mobileAnim = headerSettings?.mobile_logo_animation || headerSettings?.logo_animation;
  const tabletLogoUrl = headerSettings?.tablet_logo_url || logoUrl;
  const tabletLogoHeight = headerSettings?.tablet_logo_height || logoHeight;
  const tabletAnim = headerSettings?.tablet_logo_animation || headerSettings?.logo_animation;
  
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
        {/* Mobile Layout - TASK 2: Cart → Admin → EN/PL || Logo || Bell → Profile → Burger */}
        <div className="flex md:hidden h-16 items-center justify-between relative">
          {/* LEFT SECTION: Cart, Admin (if admin), Language Toggle */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
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
            
            {showLanguageToggle && <LanguageToggle />}
          </div>
          
          {/* CENTER: Logo - Mobile with candle icon */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
            <img 
              src={mobileLogoUrl}
              alt="SPIRIT CANDLES" 
              className={`${mobileLogoHeight} w-auto hover:scale-105 transition-all duration-700`}
              style={{ 
                background: 'transparent',
                backgroundColor: 'transparent',
                filter: `drop-shadow(0 0 6px rgba(255, 255, 255, ${mobileAnim?.glow_intensity || '0.4'}))`,
                animation: mobileAnim?.enabled ? `glow-soft ${mobileAnim?.speed || '4s'} ease-in-out infinite` : 'none'
              }}
            />
          </Link>
          
          {/* RIGHT SECTION: Bell, Profile, Burger Menu */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {user && <NotificationCenter />}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
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
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{userProfile?.first_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      {t('dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  
                  {userProfile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <img src={goldShieldMiniIcon} alt="Admin" className="h-4 w-4" />
                        {t('admin')}
                        {unseenCount > 0 && <Badge className="ml-auto bg-red-500 text-white">{unseenCount}</Badge>}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard?tab=orders" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {t('myOrders')}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('spiritProfile')}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard?tab=settings" className="flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" />
                      {t('settings')}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/shop" className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      {t('shop')}
                    </Link>
                  </DropdownMenuItem>
                  
                  {showSearch && (
                    <DropdownMenuItem asChild>
                      <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2 w-full">
                        <Search className="h-4 w-4" />
                        {t('search')}
                      </button>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild className="flex items-center gap-1">
                <Link to="/auth">
                  <User className="h-5 w-5" />
                  <span className="text-xs">{t('login')}</span>
                </Link>
              </Button>
            )}
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto h-full overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
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
                <nav className="flex flex-col space-y-2 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-base font-normal text-foreground hover:text-primary transition-colors px-4 py-2.5 rounded-lg hover:bg-accent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* LINEA DIVISORIA */}
                  <div className="border-t border-border my-3" />
                  
                  {/* VOCI UTILITY - TASK 4: BOX STYLE */}
                  {showSearch && (
                    <div 
                      className={`flex items-center gap-2 rounded-xl border border-primary/30 bg-background/60 px-4 py-3 hover:bg-primary/5 transition hover:border-primary/50 cursor-pointer font-normal text-[15px]`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSearchOpen(true);
                      }}
                    >
                      <Search className="h-5 w-5" />
                      {t('search')}
                    </div>
                  )}
                  
                  {showCart && (
                    <div 
                      className={`flex items-center gap-2 rounded-xl border border-primary/30 bg-background/60 px-4 py-3 hover:bg-primary/5 transition hover:border-primary/50 cursor-pointer font-normal text-[15px] relative ${itemCount > 0 ? 'animate-pulse' : ''}`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        onCartOpen?.();
                      }}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {t('cart')}
                      {itemCount > 0 && <Badge className="ml-auto">{itemCount}</Badge>}
                    </div>
                  )}
                  
                  {user && showWishlist && (
                    <Link 
                      to="/wishlist" 
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-2 rounded-xl border border-primary/30 bg-background/60 px-4 py-3 hover:bg-primary/5 transition hover:border-primary/50 font-normal text-[15px] ${wishlistCount > 0 ? 'animate-pulse' : ''}`}
                    >
                      <Heart className="h-5 w-5" />
                      {t('wishlist')}
                      {wishlistCount > 0 && <Badge className="ml-auto">{wishlistCount}</Badge>}
                    </Link>
                  )}
                  
                  {user && (
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-primary/30 bg-background/60 px-4 py-3 hover:bg-primary/5 transition hover:border-primary/50 font-normal text-[15px]"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      {t('dashboard')}
                    </Link>
                  )}
                  
                  {user && userProfile?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-2 rounded-xl border border-primary/30 bg-background/60 px-4 py-3 hover:bg-primary/5 transition hover:border-primary/50 font-normal text-[15px] relative ${unseenCount > 0 ? 'animate-pulse' : ''}`}
                    >
                      <img src={goldShieldMiniIcon} alt="Admin" className="h-5 w-5" />
                      {t('admin')}
                      {unseenCount > 0 && <Badge className="ml-auto bg-red-500">{unseenCount}</Badge>}
                    </Link>
                  )}
                  
                  {user ? (
                    <div 
                      className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-background/60 px-4 py-3 hover:bg-destructive/10 transition hover:border-destructive/50 cursor-pointer font-normal text-[15px] text-destructive"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      {t('logout')}
                    </div>
                  ) : (
                    <Link 
                      to="/auth" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-primary/30 bg-background/60 px-4 py-3 hover:bg-primary/5 transition hover:border-primary/50 font-normal text-[15px]"
                    >
                      <User className="h-5 w-5" />
                      {t('login')}
                    </Link>
                  )}
                  
                  {/* Language Selector - CENTRATO SENZA LINEA */}
                  {showLanguageToggle && (
                    <div className="flex justify-center pt-4">
                      <LanguageToggle />
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Tablet/Desktop Layout - TASK 1: Spaziatura + icona Dashboard User */}
        <div className="hidden md:flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center ml-3 md:ml-4">
            <Link to="/" className="md:mr-4 lg:mr-6">
              {/* Tablet logo (md only) */}
              <img 
                src={tabletLogoUrl} 
                alt="SPIRIT CANDLES" 
                className={`${tabletLogoHeight} w-auto hover:scale-105 transition-all duration-700 hidden md:block lg:hidden ${!logoTransparentBg ? 'bg-background p-2 rounded' : ''}`}
                style={{
                  filter: `drop-shadow(0 0 6px rgba(255, 255, 255, ${tabletAnim?.glow_intensity || '0.4'}))`,
                  animation: tabletAnim?.enabled ? `glow-soft ${tabletAnim?.speed || '4s'} ease-in-out infinite` : 'none',
                  mixBlendMode: logoTransparentBg ? 'normal' : 'multiply'
                }}
              />
              {/* Desktop logo (lg and up) */}
              <img 
                src={logoUrl} 
                alt="SPIRIT CANDLES" 
                className={`${logoHeight} w-auto hover:scale-105 transition-all duration-700 hidden lg:block ${!logoTransparentBg ? 'bg-background p-2 rounded' : ''}`}
                style={{
                  filter: `drop-shadow(0 0 6px rgba(255, 255, 255, ${headerSettings?.logo_animation?.glow_intensity || '0.4'}))`,
                  animation: headerSettings?.logo_animation?.enabled ? `glow-soft ${headerSettings?.logo_animation?.speed || '4s'} ease-in-out infinite` : 'none',
                  mixBlendMode: logoTransparentBg ? 'normal' : 'multiply'
                }}
              />
            </Link>
          </div>

          {/* Tablet Navigation (768px-1024px) - TASK 1: Spazio aumentato */}
          <nav className="hidden md:flex lg:hidden items-center space-x-2.5 pl-2 max-w-[55%] mr-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-xs font-medium text-foreground/80 transition-colors hover:text-primary hover:scale-105 duration-300 truncate"
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

          {/* Right Actions - Tablet Navigation */}
          <div className="flex items-center gap-0.5">
            {showLanguageToggle && <LanguageToggle />}
            
            {/* Search icon removed from tablet - available in dropdown */}

            {user && showWishlist && (
              <Link to="/wishlist">
                <Button variant="ghost" size="sm" className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs"
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {user && userProfile?.role === 'admin' && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="relative">
                  <img src={goldShieldIcon} alt="Admin" className="h-4 w-4" />
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

            {user && <NotificationCenter />}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    {profileImageUrl ? (
                      <img 
                        src={profileImageUrl} 
                        alt="Profile" 
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{userProfile?.first_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      {t('dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  
                  {userProfile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <img src={goldShieldMiniIcon} alt="Admin" className="h-4 w-4" />
                        {t('admin')}
                        {unseenCount > 0 && <Badge className="ml-auto bg-red-500 text-white">{unseenCount}</Badge>}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard?tab=orders" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {t('myOrders')}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('spiritProfile')}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard?tab=settings" className="flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" />
                      {t('settings')}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/shop" className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      {t('shop')}
                    </Link>
                  </DropdownMenuItem>
                  
                  {showWishlist && (
                    <DropdownMenuItem className="md:flex lg:hidden" asChild>
                      <Link to="/wishlist" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        {t('wishlist')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {showSearch && (
                    <DropdownMenuItem className="md:flex lg:hidden" asChild>
                      <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2 w-full">
                        <Search className="h-4 w-4" />
                        {t('search')}
                      </button>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline text-sm">{t('login')}</span>
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
      </div>

      {isSearchOpen && (
        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
        />
      )}
    </header>
  );
};

export default Header;