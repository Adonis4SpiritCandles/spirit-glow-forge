import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Cookie, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useCookieConsent, CookieConsent } from '@/hooks/useCookieConsent';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

// Types for consent categories and services
interface Service {
  key: string;
  name: string;
  description: string;
  link: string;
  provider: string;
}

interface Category {
  key: keyof CookieConsent;
  name: string;
  description: string;
  services: Service[];
  required?: boolean;
}

export const CookieBanner = () => {
  const { showBanner, acceptAll, rejectAll, saveCustom, consent } = useCookieConsent();
  const { t, language } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [customConsent, setCustomConsent] = useState<CookieConsent>({
    strictlyNecessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (consent) {
      setCustomConsent(consent);
    }
  }, [consent]);

  const toggleCategory = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Define categories with services
  const categories: Category[] = [
    {
      key: 'strictlyNecessary',
      name: t('strictlyNecessaryCookies'),
      description: t('strictlyNecessaryDescription'),
      services: [
        {
          key: 'supabase',
          name: t('supabaseService'),
          description: t('supabaseServiceDesc'),
          link: 'https://supabase.com/privacy',
          provider: 'Supabase Inc.',
        },
        {
          key: 'stripe',
          name: t('stripeService'),
          description: t('stripeServiceDesc'),
          link: 'https://stripe.com/privacy',
          provider: 'Stripe, Inc.',
        },
        {
          key: 'hostinger',
          name: t('hostingerService'),
          description: t('hostingerServiceDesc'),
          link: 'https://www.hostinger.com/privacy',
          provider: 'Hostinger International Ltd.',
        },
      ],
      required: true,
    },
    {
      key: 'functional',
      name: t('functionalCookies'),
      description: t('functionalDescription'),
      services: [
        {
          key: 'furgonetka',
          name: t('furgonetkaService'),
          description: t('furgonetkaServiceDesc'),
          link: 'https://furgonetka.pl/en/privacy',
          provider: 'Furgonetka sp. z o.o.',
        },
        {
          key: 'resend',
          name: t('resendService'),
          description: t('resendServiceDesc'),
          link: 'https://resend.com/privacy',
          provider: 'Resend, Inc.',
        },
      ],
    },
    {
      key: 'analytics',
      name: t('analyticsCookies'),
      description: t('analyticsDescription'),
      services: [
        {
          key: 'ga4',
          name: t('ga4Service'),
          description: t('ga4ServiceDesc'),
          link: 'https://policies.google.com/privacy',
          provider: 'Google LLC',
        },
      ],
    },
    {
      key: 'marketing',
      name: t('marketingCookies'),
      description: t('marketingDescription'),
      services: [
        {
          key: 'metaPixel',
          name: t('metaPixelService'),
          description: t('metaPixelServiceDesc'),
          link: 'https://www.facebook.com/privacy/policy',
          provider: 'Meta Platforms Ireland Ltd.',
        },
        {
          key: 'tiktok',
          name: t('tiktokService'),
          description: t('tiktokServiceDesc'),
          link: 'https://www.tiktok.com/legal/privacy-policy?lang=en',
          provider: 'TikTok Technology Limited',
        },
        {
          key: 'twitter',
          name: t('twitterService'),
          description: t('twitterServiceDesc'),
          link: 'https://twitter.com/en/privacy',
          provider: 'Twitter International Unlimited Company',
        },
      ],
    },
  ];

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Cookie className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">{t('cookieBannerTitle')}</h2>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            {t('cookieBannerDescription')}{' '}
            <Link to="/cookie-policy" className="text-primary hover:underline">
              {t('cookiePolicy')}
            </Link>{' '}
            {t('and')}{' '}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              {t('privacyPolicy')}
            </Link>
            .
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={acceptAll} size="lg" className="flex-1 min-w-[120px]">
              {t('acceptAllCookies')}
            </Button>
            <Button onClick={rejectAll} variant="outline" size="lg" className="flex-1 min-w-[120px]">
              {t('rejectAllCookies')}
            </Button>
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              size="lg"
              className="flex-1 min-w-[120px]"
            >
              {t('customizeSettings')}
              {showDetails ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
            </Button>
          </div>

          {/* Detailed Settings */}
          {showDetails && (
            <div className="space-y-3 pt-4 border-t animate-in fade-in-50 duration-300">
              {categories.map((cat) => {
                const isOpen = expanded[cat.key];
                const checked = customConsent[cat.key] ?? cat.required ?? false;
                
                return (
                  <div key={cat.key} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => toggleCategory(cat.key)}
                    >
                      <div className="flex-1 pr-4">
                        <h3 className="font-semibold text-base">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {!cat.required ? (
                          <Checkbox
                            id={cat.key}
                            checked={checked}
                            onCheckedChange={(value) => {
                              setCustomConsent({ ...customConsent, [cat.key]: !!value });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">{t('alwaysOn')}</span>
                        )}
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Toggle details"
                        >
                          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    {isOpen && (
                      <div className="px-4 pb-4 space-y-3 border-t bg-muted/20">
                        {cat.services.map((svc) => (
                          <div key={svc.key} className="flex items-start justify-between gap-3 pt-3">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{svc.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {svc.description}
                              </p>
                              <a
                                href={svc.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {t('learnMore')}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            {!cat.required && (
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  setCustomConsent({ ...customConsent, [cat.key]: !!value });
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-4 w-4 mt-1"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Save Custom Button */}
              <Button
                onClick={() => saveCustom(customConsent)}
                className="w-full"
                size="lg"
              >
                {t('savePreferences')}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
