import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('privacyPolicy')}</h1>
        
        <Card className="p-8 space-y-6">
          <section>
            <p className="text-sm text-muted-foreground mb-4">
              {t('lastUpdated')}: 07/01/2025
            </p>
            <p className="mb-4">{t('privacyIntro')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. {t('dataController')}</h2>
            <p className="mb-2">M5M Limited sp. z o.o. oddział w Polsce</p>
            <p className="mb-2">Grzybowska 2/31, 00-131 Warszawa, Poland</p>
            <p className="mb-2">NIP: PL5252998035</p>
            <p className="mb-2">Email: m5moffice@proton.me</p>
            <p>Phone: +48 729877557</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. {t('dataWeCollect')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('accountData')}:</strong> {t('accountDataDesc')}</li>
              <li><strong>{t('orderData')}:</strong> {t('orderDataDesc')}</li>
              <li><strong>{t('technicalData')}:</strong> {t('technicalDataDesc')}</li>
              <li><strong>{t('cookieData')}:</strong> {t('cookieDataDesc')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. {t('legalBasis')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('contractPerformance')}:</strong> {t('contractPerformanceDesc')}</li>
              <li><strong>{t('consent')}:</strong> {t('consentDesc')}</li>
              <li><strong>{t('legitimateInterest')}:</strong> {t('legitimateInterestDesc')}</li>
              <li><strong>{t('legalObligation')}:</strong> {t('legalObligationDesc')}</li>
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
            <p className="mb-2">{t('dataSharingIntro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('paymentProcessors')}:</strong> Stripe</li>
              <li><strong>{t('shippingProviders')}:</strong> Furgonetka</li>
              <li><strong>{t('analyticsServices')}:</strong> Google Analytics</li>
              <li><strong>{t('emailServices')}:</strong> Resend</li>
              <li><strong>{t('hostingServices')}:</strong> Supabase, Lovable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. {t('internationalTransfers')}</h2>
            <p>{t('internationalTransfersDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. {t('dataRetention')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('accountDataRetention')}</li>
              <li>{t('orderDataRetention')}</li>
              <li>{t('marketingDataRetention')}</li>
              <li>{t('cookieDataRetention')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. {t('yourRights')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('rightAccess')}:</strong> {t('rightAccessDesc')}</li>
              <li><strong>{t('rightRectification')}:</strong> {t('rightRectificationDesc')}</li>
              <li><strong>{t('rightErasure')}:</strong> {t('rightErasureDesc')}</li>
              <li><strong>{t('rightRestrict')}:</strong> {t('rightRestrictDesc')}</li>
              <li><strong>{t('rightPortability')}:</strong> {t('rightPortabilityDesc')}</li>
              <li><strong>{t('rightObject')}:</strong> {t('rightObjectDesc')}</li>
              <li><strong>{t('rightWithdraw')}:</strong> {t('rightWithdrawDesc')}</li>
            </ul>
            <p className="mt-4">
              {t('exerciseRights')}{' '}
              <Link to="/data-request" className="text-primary hover:underline">
                {t('dataRequestForm')}
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
            <p className="mb-2">Email: m5moffice@proton.me</p>
            <p className="mb-2">Phone: +48 729877557</p>
            <p>Address: Grzybowska 2/31, 00-131 Warszawa, Poland</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. {t('supervisoryAuthority')}</h2>
            <p>{t('supervisoryAuthorityDesc')}</p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
