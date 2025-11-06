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
import { supabase } from '@/integrations/supabase/client';
import LanguageToggle from '@/components/LanguageToggle';
import SearchModal from '@/components/SearchModal';
import spiritLogo from '@/assets/spirit-logo.png';
import spiritLogoTransparent from '@/assets/spirit-logo-transparent.png';
import goldShieldIcon from '@/assets/gold-shield-admin-mini.png';
import iconLogoCandle from '@/assets/icon-logo-candle-transparent.png';
import goldShieldMiniIcon from '@/assets/gold-shield-admin-mini-2.png';

const Header = ({ onCartOpen }: { onCartOpen?: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { language, t } = useLanguage();
  const { user, signOut } = useAuth();
  const { itemCount } = useCartContext();
  const { wishlistCount } = useWishlist();
  const { unseenCount, isAdmin } = useAdminNotifications();
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

  const navItems = [
    { name: t('home'), href: '/' },
    { name: t('shop'), href: '/shop' },
    { name: t('collections'), href: '/collections' },
    { name: t('customize'), href: '/custom-candles' },
    { name: t('about'), href: '/about' },
    { name: t('contact'), href: '/contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 mystical-blur">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
           <div className="flex items-center space-x-4">
            <Link to="/">
              <img 
                src={iconLogoCandle} 
                alt="SPIRIT CANDLES" 
                className="h-9 w-auto hover:scale-105 transition-all duration-700"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))',
                  animation: 'glow-soft 4s ease-in-out infinite'
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary hover:scale-105 duration-300"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
            
            {/* Language Toggle */}
            <LanguageToggle />
            
            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  {/* Wishlist Button */}
                  <Link to="/wishlist">
                    <Button variant="ghost" size="sm" className="relative">
                      <Heart className="h-4 w-4" />
                      {wishlistCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                        >
                          {wishlistCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  
                  {/* Dashboard Button - For all users, solo icona su tablet */}
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="text-sm hidden xl:inline">{t('dashboard')}</span>
                    </Button>
                  </Link>
                  
                  {/* Admin Button - Outside dropdown, between dashboard and user menu */}
                  {userProfile?.role === 'admin' && (
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
                  
                  {/* User Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1 relative">
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
                            <User className="h-4 w-4" />
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
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center cursor-pointer">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          {t('dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/profile/${user?.id}`} className="flex items-center cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          {t('publicProfile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard?tab=settings" className="flex items-center cursor-pointer">
                          <SettingsIcon className="h-4 w-4 mr-2" />
                          {t('settings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard?tab=orders" className="flex items-center cursor-pointer">
                          <Package className="h-4 w-4 mr-2" />
                          {t('myOrders')}
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
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-1" />
                    {t('login')}
                  </Button>
                </Link>
              )}
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={onCartOpen}
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>

            {/* Mobile User Icon/Menu - Between Cart and Burger */}
            <div className="md:hidden">
              {user ? (
                <div className="flex items-center gap-2">
                  {/* Admin Shield Icon for Mobile */}
                  {userProfile?.role === 'admin' && (
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
                  
                  {/* User Dropdown Menu for Mobile */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-background z-[100]">
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center cursor-pointer">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          {t('dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard?tab=settings" className="flex items-center cursor-pointer">
                          <SettingsIcon className="h-4 w-4 mr-2" />
                          {t('settings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/profile/${user?.id}`} className="flex items-center cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          {t('publicProfile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard?tab=orders" className="flex items-center cursor-pointer">
                          <Package className="h-4 w-4 mr-2" />
                          {t('myOrders')}
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
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <User className="h-5 w-5" />
                    <span className="text-xs">{t('login')}</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
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
                  <SheetDescription className="sr-only">
                    Menu Navigation
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="border-t border-border pt-4 mt-4">
                    <Button 
                      variant="ghost"
                      className="w-full mb-2 justify-start"
                      onClick={() => {
                        setIsSearchOpen(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {t('search')}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mb-2 justify-start"
                      onClick={onCartOpen}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t('cart')}
                      {itemCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {itemCount}
                        </Badge>
                      )}
                    </Button>

                    {/* Auth Buttons Mobile */}
                    {user ? (
                      <>
                        <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="outline" className="w-full mb-2 justify-start">
                            <Heart className="h-4 w-4 mr-2" />
                            {t('wishlist')}
                            {wishlistCount > 0 && (
                              <Badge 
                                variant="destructive" 
                                className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                              >
                                {wishlistCount}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                        
                        <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="outline" className="w-full mb-2 justify-start">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            {t('dashboard')}
                          </Button>
                        </Link>
                        
                        {userProfile?.role === 'admin' && (
                          <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="outline" className="w-full mb-2 justify-start relative">
                              <img src={goldShieldIcon} alt="" className="h-4 w-4 mr-2" />
                              {t('admin')}
                              {unseenCount > 0 && (
                                <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                                  {unseenCount}
                                </Badge>
                              )}
                            </Button>
                          </Link>
                        )}
                        
                        <Button variant="ghost" className="w-full mb-2 justify-start" onClick={handleSignOut}>
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('logout')}
                        </Button>
                      </>
                    ) : (
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full mb-2 justify-start">
                          <User className="h-4 w-4 mr-2" />
                          {t('login')}
                        </Button>
                      </Link>
                    )}

                    <div className="flex justify-center">
                      <LanguageToggle />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};

export default Header;