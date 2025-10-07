import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, Cookie, ChevronDown, ChevronUp } from 'lucide-react';
import { useCookieConsent, CookieConsent } from '@/hooks/useCookieConsent';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

export const CookieBanner = () => {
  const { showBanner, acceptAll, rejectAll, saveCustom } = useCookieConsent();
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [customConsent, setCustomConsent] = useState<CookieConsent>({
    strictlyNecessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
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
            <div className="space-y-4 pt-4 border-t animate-in fade-in-50 duration-300">
              {/* Strictly Necessary */}
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="strictly-necessary"
                    checked={true}
                    disabled
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="strictly-necessary" className="text-base font-semibold cursor-not-allowed">
                      {t('strictlyNecessaryCookies')} ({t('alwaysActive')})
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('strictlyNecessaryDescription')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Functional */}
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="functional"
                    checked={customConsent.functional}
                    onCheckedChange={(checked) =>
                      setCustomConsent({ ...customConsent, functional: !!checked })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="functional" className="text-base font-semibold cursor-pointer">
                      {t('functionalCookies')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('functionalDescription')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="analytics"
                    checked={customConsent.analytics}
                    onCheckedChange={(checked) =>
                      setCustomConsent({ ...customConsent, analytics: !!checked })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="analytics" className="text-base font-semibold cursor-pointer">
                      {t('analyticsCookies')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('analyticsDescription')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Marketing */}
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="marketing"
                    checked={customConsent.marketing}
                    onCheckedChange={(checked) =>
                      setCustomConsent({ ...customConsent, marketing: !!checked })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="marketing" className="text-base font-semibold cursor-pointer">
                      {t('marketingCookies')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('marketingDescription')}
                    </p>
                  </div>
                </div>
              </div>

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
