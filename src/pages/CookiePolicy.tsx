import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const CookiePolicy = () => {
  const { t, language } = useLanguage();
  const pdfUrl = language === 'pl' 
    ? '/documents/polityka-plikow-cookie-pl.pdf' 
    : '/documents/cookie-policy-en.pdf';

  const openCookieSettings = () => {
    if (window.SC_openCookiePreferences) {
      window.SC_openCookiePreferences();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('cookiePolicy')}</h1>
        
        <div className="mb-6 text-center">
          <Button asChild variant="outline">
            <a href={pdfUrl} download>
              <Download className="mr-2 h-4 w-4" />
              {t('downloadPDF')}
            </a>
          </Button>
        </div>
        
        <Card className="p-8 space-y-6">
          <section>
            <p className="text-sm text-muted-foreground mb-4">
              {t('lastUpdated')}: 07/01/2025
            </p>
            <p className="mb-4">{t('cookiePolicyIntro')}</p>
            
            <Button onClick={openCookieSettings} className="mb-6">
              {t('manageCookiePreferences')}
            </Button>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. {t('whatAreCookies')}</h2>
            <p>{t('whatAreCookiesDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. {t('cookiesWeUse')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('strictlyNecessaryCookies')}</h3>
                <p className="mb-2">{t('strictlyNecessaryDescription')}</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>scConsent</strong>: {t('scConsentDesc')}</li>
                  <li><strong>sb-*-auth-token</strong>: {t('authTokenDesc')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">{t('functionalCookies')}</h3>
                <p className="mb-2">{t('functionalDescription')}</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>language</strong>: {t('languageCookieDesc')}</li>
                  <li><strong>cart</strong>: {t('cartCookieDesc')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">{t('analyticsCookies')}</h3>
                <p className="mb-2">{t('analyticsDescription')}</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>_ga, _ga_*</strong>: {t('googleAnalyticsDesc')}</li>
                  <li><strong>_gid</strong>: {t('gidDesc')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">{t('marketingCookies')}</h3>
                <p className="mb-2">{t('marketingDescription')}</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>_fbp</strong>: {t('facebookPixelDesc')}</li>
                  <li><strong>fr</strong>: {t('facebookRetargetingDesc')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. {t('thirdPartyCookies')}</h2>
            <p className="mb-2">{t('thirdPartyCookiesDesc')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Analytics</strong>: {t('googleAnalyticsThirdParty')}</li>
              <li><strong>Meta (Facebook)</strong>: {t('metaThirdParty')}</li>
              <li><strong>Stripe</strong>: {t('stripeThirdParty')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. {t('managingCookies')}</h2>
            <p className="mb-4">{t('managingCookiesDesc')}</p>
            <Button onClick={openCookieSettings} variant="outline">
              {t('manageCookiePreferences')}
            </Button>
            <p className="mt-4">{t('browserSettingsInfo')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. {t('cookieConsent')}</h2>
            <p>{t('cookieConsentDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. {t('cookieDuration')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('sessionCookies')}:</strong> {t('sessionCookiesDesc')}</li>
              <li><strong>{t('persistentCookies')}:</strong> {t('persistentCookiesDesc')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. {t('updatesCookiePolicy')}</h2>
            <p>{t('updatesCookiePolicyDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. {t('contactUs')}</h2>
            <p className="mb-2">{t('cookiePolicyContactIntro')}</p>
            <p>Email: m5moffice@proton.me</p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicy;
