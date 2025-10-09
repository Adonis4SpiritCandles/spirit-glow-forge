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
              {t('lastUpdated')}: {language === 'pl' ? '8 października 2025 r.' : '8 October 2025'}
            </p>
            <p className="mb-4">
              {language === 'pl' 
                ? 'Niniejsza Polityka plików cookie wyjaśnia, w jaki sposób SPIRIT CANDLE (prowadzona przez M5M Limited Sp. z o.o. oddział w Polsce, ul. Grzybowska 2/31, 00‑131 Warszawa, Polska) korzysta z plików cookie i podobnych technologii podczas Twojej wizyty na stronie www.spirit‑candle.com („Serwis"). Używamy plików cookie, aby personalizować treści, usprawniać korzystanie z serwisu, zapamiętywać Twoje preferencje, analizować ruch i wyświetlać odpowiednią reklamę.'
                : 'This Cookie Policy explains how SPIRIT CANDLE (operated by M5M Limited Sp. z o.o. oddział w Polsce, Grzybowska 2/31, 00‑131 Warsaw, Poland) uses cookies and similar technologies when you visit our website at www.spirit‑candle.com (the "Site"). We use cookies to personalise content and improve your browsing experience, remember your preferences, analyse traffic and deliver relevant marketing.'
              }
            </p>
            
            <Button onClick={openCookieSettings} className="mb-6">
              {t('manageCookiePreferences')}
            </Button>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. {t('whatAreCookies')}</h2>
            <p>
              {language === 'pl'
                ? 'Pliki cookie to niewielkie pliki tekstowe zapisywane na Twoim urządzeniu podczas odwiedzania stron internetowych. Pozwalają one stronie rozpoznać Twoje urządzenie i zapamiętać określone informacje, takie jak ustawienia językowe lub zawartość koszyka. Pliki cookie mogą być ustawiane przez nas (pliki cookie pierwszej kategorii) lub przez zaufane podmioty trzecie, których usługi integrujemy w Serwisie (pliki cookie stron trzecich).'
                : 'Cookies are small text files that are downloaded to your device when you visit a website. They allow the site to recognise your device and store information about your preferences or past actions. Cookies may be set by us (first‑party cookies) or by trusted third parties whose services we integrate on our Site (third‑party cookies).'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. {language === 'pl' ? 'Rodzaje plików cookie, których używamy' : 'Types of cookies we use'}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">2.1 {t('strictlyNecessaryCookies')}</h3>
                <p className="mb-2">{t('strictlyNecessaryDescription')}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. {language === 'pl' ? 'Lista plików cookie' : 'Cookie List'}</h2>
            <p className="mb-4">
              {language === 'pl'
                ? 'Poniższa tabela zawiera główne pliki cookie używane w naszym Serwisie wraz z dostawcą, celem, czasem przechowywania i kategorią.'
                : 'The table below lists the main cookies we use on our Site, their provider, purpose, duration and category.'
              }
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 p-2 text-left">{language === 'pl' ? 'Plik' : 'Cookie'}</th>
                    <th className="border border-gray-300 p-2 text-left">{language === 'pl' ? 'Dostawca' : 'Provider'}</th>
                    <th className="border border-gray-300 p-2 text-left">{language === 'pl' ? 'Cel' : 'Purpose'}</th>
                    <th className="border border-gray-300 p-2 text-left">{language === 'pl' ? 'Czas' : 'Duration'}</th>
                    <th className="border border-gray-300 p-2 text-left">{language === 'pl' ? 'Kategoria' : 'Category'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2"><code>cookie_consent</code></td>
                    <td className="border border-gray-300 p-2">SPIRIT CANDLE</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Przechowuje Twoje ustawienia cookies' : 'Stores your cookie preferences'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? '12 miesięcy' : '12 months'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Technicznie niezbędne' : 'Strictly necessary'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2"><code>language</code></td>
                    <td className="border border-gray-300 p-2">SPIRIT CANDLE</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Zapisuje wybrany język' : 'Saves your chosen language'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? '12 miesięcy' : '12 months'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Funkcjonalne' : 'Functional'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2"><code>cart</code></td>
                    <td className="border border-gray-300 p-2">SPIRIT CANDLE</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Przechowuje produkty w koszyku' : 'Stores shopping cart items'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? '7 dni' : '7 days'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Technicznie niezbędne' : 'Strictly necessary'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2"><code>_stripe_mid</code></td>
                    <td className="border border-gray-300 p-2">Stripe</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Wykrywanie oszustw podczas płatności' : 'Fraud detection during payments'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? '1 rok' : '1 year'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Technicznie niezbędne' : 'Strictly necessary'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2"><code>sb_auth_token</code></td>
                    <td className="border border-gray-300 p-2">Supabase</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Utrzymuje sesję uwierzytelnioną' : 'Maintains authenticated session'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Sesja' : 'Session'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Technicznie niezbędne' : 'Strictly necessary'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2"><code>_ga</code></td>
                    <td className="border border-gray-300 p-2">Google</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Rozróżnianie użytkowników (analityka)' : 'Distinguish users for analytics'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? '2 lata' : '2 years'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Analityczne' : 'Analytics'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2"><code>_fbp</code></td>
                    <td className="border border-gray-300 p-2">Meta</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Identyfikuje przeglądarki do reklam' : 'Identifies browsers for advertising'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? '3 miesiące' : '3 months'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Marketingowe' : 'Marketing'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2"><code>tt_cookie</code></td>
                    <td className="border border-gray-300 p-2">TikTok</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Mierzy skuteczność reklam' : 'Measures ad performance'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? '13 miesięcy' : '13 months'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Marketingowe' : 'Marketing'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2"><code>twq</code></td>
                    <td className="border border-gray-300 p-2">Twitter</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Śledzi konwersje z reklam' : 'Tracks ad conversions'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? '13 miesięcy' : '13 months'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Marketingowe' : 'Marketing'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2"><code>YSC</code></td>
                    <td className="border border-gray-300 p-2">YouTube</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Śledzi statystyki filmów' : 'Tracks video statistics'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Sesja' : 'Session'}</td>
                    <td className="border border-gray-300 p-2">{language === 'pl' ? 'Media społecznościowe' : 'Social media'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. {language === 'pl' ? 'Przekazywanie danych do krajów trzecich' : 'International data transfers'}</h2>
            <p>
              {language === 'pl'
                ? 'Niektórzy nasi partnerzy mają siedzibę poza Europejskim Obszarem Gospodarczym (EOG). Gdy my lub nasi dostawcy usług przekazujemy dane osobowe za granicę, stosujemy zabezpieczenia przewidziane w Rozdziale V RODO, takie jak standardowe klauzule umowne Komisji Europejskiej.'
                : 'Some of our partners are based outside the European Economic Area (EEA). When we or our service providers transfer personal data abroad, we rely on the safeguards provided in Chapter V of the GDPR. These include the European Commission\'s Standard Contractual Clauses and adequacy decisions.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. {language === 'pl' ? 'Usługi zewnętrzne' : 'Third‑party services'}</h2>
            <p className="mb-2">
              {language === 'pl'
                ? 'W naszym Serwisie korzystamy z usług dostarczanych przez zewnętrznych dostawców:'
                : 'Our Site integrates services provided by third parties:'
              }
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Analytics 4</strong> - {language === 'pl' ? 'Analityka strony' : 'Website analytics'}</li>
              <li><strong>Meta Pixel</strong> - {language === 'pl' ? 'Reklamy i konwersje' : 'Advertising and conversions'}</li>
              <li><strong>Stripe</strong> - {language === 'pl' ? 'Przetwarzanie płatności' : 'Payment processing'}</li>
              <li><strong>Supabase</strong> - {language === 'pl' ? 'Hosting i baza danych' : 'Hosting and database'}</li>
              <li><strong>Furgonetka</strong> - {language === 'pl' ? 'Agregator usług kurierskich' : 'Shipping aggregator'}</li>
              <li><strong>Resend</strong> - {language === 'pl' ? 'Usługa wysyłania e‑maili' : 'Email service'}</li>
              <li><strong>TikTok Pixel</strong> - {language === 'pl' ? 'Reklamy TikTok' : 'TikTok advertising'}</li>
              <li><strong>Twitter Pixel</strong> - {language === 'pl' ? 'Reklamy Twitter' : 'Twitter advertising'}</li>
              <li><strong>YouTube</strong> - {language === 'pl' ? 'Osadzone filmy' : 'Embedded videos'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. {t('managingCookies')}</h2>
            <p className="mb-4">{t('managingCookiesDesc')}</p>
            <Button onClick={openCookieSettings} variant="outline">
              {t('manageCookiePreferences')}
            </Button>
            <p className="mt-4">{t('browserSettingsInfo')}</p>
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
