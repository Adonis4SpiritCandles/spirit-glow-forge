import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import spiritLogo from "@/assets/spirit-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  
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
              {t('brandDescription')}
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="p-2" asChild>
                <a href="https://www.facebook.com/profile.php?id=61571360287880" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="p-2" asChild>
                <a href="https://www.instagram.com/spirit_candle_official/" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="p-2" asChild>
                <a href="https://x.com/SpiritCandlePL" target="_blank" rel="noopener noreferrer">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </Button>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h3 className="font-playfair font-semibold text-foreground">{t('shop')}</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/shop" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('allCandles')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/collections" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('collections')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/shop?filter=new" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('newArrivals')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/shop?filter=bestseller" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('bestSellers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="font-playfair font-semibold text-foreground">{t('supportSection')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="font-playfair font-semibold text-foreground">{t('legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('cookiePolicy')}
                </Link>
              </li>
              <li>
                <Link to="/terms-of-sale" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('termsOfSale')}
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('shippingAndReturns')}
                </Link>
              </li>
              <li>
                <Link to="/legal-notice" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('legalNotice')}
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('accessibility')}
                </Link>
              </li>
              <li>
                <Link to="/data-request" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('dataRequest')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-registration" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('privacyRegistration')}
                </Link>
              </li>
              <li>
                <Link to="/all-notices" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('allNotices')}
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => window.SC_openCookiePreferences?.()} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  {t('manageCookies')}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-playfair font-semibold text-foreground">{t('contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p>M5M Limited Sp. z o.o. oddział w Polsce</p>
                  <p>SPIRIT CANDLE</p>
                  <p>Grzybowska 2/31, 00‑131 Warszawa</p>
                  <p>NIP: 5252998035, REGON: 528769795</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">+48 729877557</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">m5moffice@proton.me</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{t('availableInLanguages')}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col gap-6">
          {/* Copyright & Designer */}
          <div className="text-sm text-muted-foreground text-center">
            <p>© 2025 SPIRIT CANDLES Site{t('designedBy')}</p>
            <p>{t('designedBy')}</p>
            <p className="mt-1">
              {t('by')}{' '}
              <a 
                href="https://www.tiktok.com/@adonis4u" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                AdoniS4U
                <svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              {' '}·{' '}
              <a 
                href="https://www.facebook.com/adonismickael/" 
                target="_blank"
                rel="noopener noreferrer" 
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <Facebook className="w-4 h-4 inline" />
              </a>
              {' '}·{' '}
              <a 
                href="https://www.linkedin.com/in/antonio-adonis-gagliardi/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Adonis Mickael Gagliardi
              </a>
            </p>
          </div>
          
          {/* Disclaimers */}
          <div className="text-xs text-muted-foreground text-center">
            <p className="mb-2">
              <strong>{t('inspirationNotice')}:</strong>
              {t('inspirationNoticeText')}
            </p>
            <p>
              {t('independentBrand')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;