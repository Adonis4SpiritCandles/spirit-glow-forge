import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

const PrivacyPolicy = () => {
  const { t, language } = useLanguage();
  const pdfUrl = language === 'pl' 
    ? '/documents/polityka-prywatnosci-pl.pdf' 
    : '/documents/privacy-policy-en.pdf';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('privacyPolicy')}</h1>
        
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
              {language === 'pl' ? 'Ostatnia aktualizacja: 1 listopada 2025' : 'Last updated: 1 November 2025'}
            </p>
            <p className="mb-4">{t('privacyIntro')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. {t('dataController')}</h2>
            <p className="mb-2">M5M Limited sp. z o.o. oddział w Polsce</p>
            <p className="mb-2">Grzybowska 2/31, 00-131 Warszawa, Poland</p>
            <p className="mb-2">VAT / NIP: PL5252998035 – REGON: 528769795</p>
            <p className="mb-2">Email: m5moffice@proton.me</p>
            <p>Phone: +48 729877557</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. {t('dataWeCollect')}</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>{t('accountData')}:</strong> {t('accountDataDesc')}</li>
              <li><strong>{t('orderData')}:</strong> {t('orderDataDesc')}</li>
              <li><strong>{t('technicalData')}:</strong> {t('technicalDataDesc')}</li>
              <li><strong>{language === 'pl' ? 'Komunikacja' : 'Communications'}:</strong> {language === 'pl' ? 'Treść e-maili, czatów i korespondencji, w tym formularze kontaktowe i recenzje klientów' : 'Content of emails, chats and correspondence, including contact forms and customer reviews'}</li>
              <li><strong>{language === 'pl' ? 'Dane marketingowe i analityczne' : 'Marketing and analytics data'}:</strong> {language === 'pl' ? 'Preferencje komunikacji marketingowej, interakcje z newsletterem i reklamami, dane analityczne zebrane przez cookies' : 'Marketing communication preferences, newsletter and ad interactions, analytics data collected via cookies'}</li>
              <li><strong>{language === 'pl' ? 'Treści generowane przez użytkowników' : 'User-generated content'}:</strong> {language === 'pl' ? 'Recenzje produktów, oceny gwiazdkowe, komentarze i zdjęcia' : 'Product reviews, star ratings, comments and photos'}</li>
              <li><strong>{language === 'pl' ? 'Dane listy życzeń' : 'Wishlist data'}:</strong> {language === 'pl' ? 'Produkty dodane do listy życzeń' : 'Items added to your wishlist'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. {t('legalBasis')}</h2>
            <p className="mb-3">{language === 'pl' ? 'Przetwarzamy dane w oparciu o:' : 'We process data based on:'}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('contractPerformance')} (Art. 6(1)(b) GDPR):</strong> {t('contractPerformanceDesc')}</li>
              <li><strong>{t('consent')} (Art. 6(1)(a) i 7 GDPR):</strong> {t('consentDesc')}</li>
              <li><strong>{t('legitimateInterest')} (Art. 6(1)(f) GDPR):</strong> {t('legitimateInterestDesc')}</li>
              <li><strong>{t('legalObligation')} (Art. 6(1)(c) GDPR):</strong> {t('legalObligationDesc')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. {t('howWeUseData')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('processOrders')}</li>
              <li>{t('provideCommunication')}</li>
              <li>{t('improveServices')}</li>
              <li>{t('sendMarketing')}</li>
              <li>{t('fraudPrevention')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. {t('dataSharing')}</h2>
            <p className="mb-4">{language === 'pl' ? 'Udostępniamy dane zaufanym partnerom:' : 'We share your data with trusted partners:'}</p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Stripe, Inc.:</strong> {language === 'pl' ? 'Bezpieczne przetwarzanie płatności' : 'Secure payment processing'}. 
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center ml-2">
                  {language === 'pl' ? 'Polityka prywatności' : 'Privacy policy'} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <strong>Furgonetka (Furgonetka.pl):</strong> {language === 'pl' ? 'Platforma logistyczna łącząca kurierów: DHL, InPost, UPS, FedEx, GLS, DPD. Przewoźnicy otrzymują imię, adres i telefon w celu dostawy' : 'Logistics platform connecting carriers: DHL, InPost, UPS, FedEx, GLS, DPD. Carriers receive name, address and phone for delivery'}. 
                <a href="https://furgonetka.pl" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center ml-2">
                  furgonetka.pl <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <strong>Google LLC (Google Analytics 4):</strong> {language === 'pl' ? 'Analiza ruchu na stronie (cookies: _ga, _ga_*, _gid)' : 'Website analytics (cookies: _ga, _ga_*, _gid)'}. 
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center ml-2">
                  {language === 'pl' ? 'Polityka prywatności' : 'Privacy policy'} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <strong>Meta Platforms Ireland Ltd. (Meta Pixel):</strong> {language === 'pl' ? 'Reklamy (Facebook, Instagram), cookies: _fbp, fr' : 'Advertising (Facebook, Instagram), cookies: _fbp, fr'}. 
                <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center ml-2">
                  {language === 'pl' ? 'Polityka prywatności' : 'Privacy policy'} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <strong>TikTok Technology Limited (TikTok Pixel):</strong> {language === 'pl' ? 'Kampanie marketingowe TikTok' : 'TikTok marketing campaigns'}. 
                <a href="https://www.tiktok.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center ml-2">
                  {language === 'pl' ? 'Polityka prywatności' : 'Privacy policy'} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <strong>Twitter International Unlimited Company (Twitter Pixel):</strong> {language === 'pl' ? 'Reklamy Twitter/X' : 'Twitter/X advertising'}. 
                <a href="https://twitter.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center ml-2">
                  {language === 'pl' ? 'Polityka prywatności' : 'Privacy policy'} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <strong>Google LLC (YouTube):</strong> {language === 'pl' ? 'Osadzone filmy YouTube' : 'YouTube embedded videos'}. 
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center ml-2">
                  {language === 'pl' ? 'Polityka prywatności' : 'Privacy policy'} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <strong>Resend, Inc.:</strong> {language === 'pl' ? 'Wysyłka transakcyjnych i marketingowych e-maili' : 'Transactional and marketing email delivery'}. 
                <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center ml-2">
                  {language === 'pl' ? 'Polityka prywatności' : 'Privacy policy'} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <strong>Supabase Inc.:</strong> {language === 'pl' ? 'Hosting bazy danych i infrastruktury backend (serwery w UE)' : 'Database and backend infrastructure hosting (EU servers)'}. 
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center ml-2">
                  {language === 'pl' ? 'Polityka prywatności' : 'Privacy policy'} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <strong>Hostinger International Ltd.:</strong> {language === 'pl' ? 'Hosting infrastruktury strony internetowej' : 'Website infrastructure hosting'}. 
                <a href="https://www.hostinger.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center ml-2">
                  {language === 'pl' ? 'Polityka prywatności' : 'Privacy policy'} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. {t('internationalTransfers')}</h2>
            <p>{language === 'pl' ? 'Niektórzy partnerzy mają siedziby poza EOG. Stosujemy standardowe klauzule umowne Komisji Europejskiej (SCC) oraz inne zabezpieczenia z Rozdziału V RODO.' : 'Some partners are outside the EEA. We use Standard Contractual Clauses (SCC) and other safeguards per GDPR Chapter V.'}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. {t('dataRetention')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('accountDataRetention')}</li>
              <li>{language === 'pl' ? 'Dane zamówień: 6 lat (wymogi podatkowe)' : 'Order data: 6 years (tax requirements)'}</li>
              <li>{t('marketingDataRetention')}</li>
              <li>{t('cookieDataRetention')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. {t('yourRights')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('rightAccess')} (Art. 15 GDPR):</strong> {t('rightAccessDesc')}</li>
              <li><strong>{t('rightRectification')} (Art. 16 GDPR):</strong> {t('rightRectificationDesc')}</li>
              <li><strong>{t('rightErasure')} (Art. 17 GDPR):</strong> {t('rightErasureDesc')}</li>
              <li><strong>{t('rightRestrict')} (Art. 18 GDPR):</strong> {t('rightRestrictDesc')}</li>
              <li><strong>{t('rightPortability')} (Art. 20 GDPR):</strong> {t('rightPortabilityDesc')}</li>
              <li><strong>{t('rightObject')} (Art. 21 GDPR):</strong> {t('rightObjectDesc')}</li>
              <li><strong>{t('rightWithdraw')} (Art. 7(3) GDPR):</strong> {t('rightWithdrawDesc')}</li>
            </ul>
            <p className="mt-4">
              {language === 'pl' ? 'Aby skorzystać z praw, użyj' : 'To exercise your rights, use our'}{' '}
              <Link to="/data-request" className="text-primary hover:underline">
                {language === 'pl' ? 'formularza żądania danych' : 'Data Request Form'}
              </Link>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. {t('security')}</h2>
            <p>{t('securityDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. {t('childrenPrivacy')}</h2>
            <p>{t('childrenPrivacyDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. {t('policyChanges')}</h2>
            <p>{t('policyChangesDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. {t('contactUs')}</h2>
            <p className="mb-2">{t('privacyContactIntro')}</p>
            <p className="mb-2">Email: <a href="mailto:m5moffice@proton.me" className="text-primary hover:underline">m5moffice@proton.me</a></p>
            <p className="mb-2">Phone: +48 729877557</p>
            <p>Address: Grzybowska 2/31, 00-131 Warszawa, Poland</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. {t('supervisoryAuthority')}</h2>
            <p>{language === 'pl' ? 'Masz prawo złożyć skargę do organu nadzorczego:' : 'You have the right to lodge a complaint:'}</p>
            <p className="mt-2">
              <strong>{language === 'pl' ? 'Prezes Urzędu Ochrony Danych Osobowych (PUODO)' : 'President of the Personal Data Protection Office (PUODO)'}</strong><br/>
              ul. Stawki 2, 00-193 Warszawa, Poland<br/>
              <a href="https://uodo.gov.pl" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">
                uodo.gov.pl <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
