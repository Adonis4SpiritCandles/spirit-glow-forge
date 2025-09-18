import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Menu, Search, User, LogOut } from "lucide-react";
import spiritLogo from "@/assets/spirit-logo.png";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

const Header = ({ onCartOpen }: { onCartOpen?: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();

  const navItems = [
    { name: t('home'), href: '/' },
    { name: t('shop'), href: '/shop' },
    { name: t('collections'), href: '/collections' },
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
                src={spiritLogo} 
                alt="SPIRIT CANDLES" 
                className="h-8 w-auto candle-glow hover:scale-105 transition-transform duration-300"
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
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button>
            
            {/* Language Toggle */}
            <LanguageToggle />
            
            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      {t('dashboard')}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-1" />
                    {t('logout')}
                  </Button>
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

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>
                    <img 
                      src={spiritLogo} 
                      alt="SPIRIT CANDLES" 
                      className="h-8 w-auto"
                    />
                  </SheetTitle>
                  <SheetDescription>
                    Reborn Your Nature
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
                    <Button variant="outline" className="w-full mb-2">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative w-full justify-center mb-2"
                      onClick={onCartOpen}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {t('cart')}
                      {itemCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {itemCount}
                        </Badge>
                      )}
                    </Button>

                    {/* Auth Buttons Mobile */}
                    {user ? (
                      <>
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="outline" className="w-full mb-2">
                            <User className="h-4 w-4 mr-2" />
                            {t('dashboard')}
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full mb-2" onClick={handleSignOut}>
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('logout')}
                        </Button>
                      </>
                    ) : (
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full mb-2">
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
    </header>
  );
};

export default Header;