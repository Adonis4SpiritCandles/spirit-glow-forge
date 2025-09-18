import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import spiritLogo from "@/assets/spirit-logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/40">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src={spiritLogo} 
                alt="SPIRIT CANDLES" 
                className="h-8 w-auto candle-glow"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Luxury soy candles inspired by the world's most beloved fragrances. 
              Hand-poured with natural ingredients to reborn your nature.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="p-2">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h3 className="font-playfair font-semibold text-foreground">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/shop" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  All Candles
                </Link>
              </li>
              <li>
                <Link 
                  to="/collections" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link 
                  to="/shop?filter=new" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link 
                  to="/shop?filter=bestseller" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="font-playfair font-semibold text-foreground">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-playfair font-semibold text-foreground">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p>Via Roma 123</p>
                  <p>00100 Roma, Italy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">+39 06 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">info@spiritcandles.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Available in EN / PL</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 SPIRIT CANDLES. All rights reserved.
          </div>
          
          <div className="text-xs text-muted-foreground text-center md:text-right">
            <p className="mb-1">
              <strong>Inspiration Notice:</strong> Fragrance references are inspirations only.
            </p>
            <p>
              SPIRIT CANDLES is not affiliated with or endorsed by the original trademark owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;