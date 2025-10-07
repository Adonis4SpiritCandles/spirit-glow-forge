import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';

const TermsOfSale = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('termsOfSale')}</h1>
        
        <Card className="p-8 space-y-6">
          <section>
            <p className="text-sm text-muted-foreground mb-4">
              {t('lastUpdated')}: 07/01/2025
            </p>
            <p className="mb-4">{t('termsIntro')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. {t('seller')}</h2>
            <p className="mb-2">M5M Limited sp. z o.o. oddział w Polsce</p>
            <p className="mb-2">Grzybowska 2/31, 00-131 Warszawa, Poland</p>
            <p className="mb-2">NIP: PL5252998035</p>
            <p className="mb-2">Email: m5moffice@proton.me</p>
            <p>Phone: +48 729877557</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. {t('contractFormation')}</h2>
            <p>{t('contractFormationDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. {t('productInformation')}</h2>
            <p>{t('productInformationDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. {t('pricingPayment')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('pricesShownEUR')}</li>
              <li>{t('paymentMethods')}</li>
              <li>{t('paymentProcessedStripe')}</li>
              <li>{t('orderConfirmedPayment')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. {t('deliveryShipping')}</h2>
            <p className="mb-2">{t('deliveryShippingIntro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('shippingEUWide')}</li>
              <li>{t('deliveryTimes')}</li>
              <li>{t('shippingCostsCalculated')}</li>
              <li>{t('trackingProvided')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. {t('rightOfWithdrawal')}</h2>
            <p className="mb-4">{t('rightOfWithdrawalIntro')}</p>
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">{t('withdrawalPeriod')}</h3>
              <p>{t('withdrawalPeriodDesc')}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">{t('exercisingWithdrawal')}</h3>
              <p>{t('exercisingWithdrawalDesc')}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{t('returnConditions')}</h3>
              <p>{t('returnConditionsDesc')}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. {t('refunds')}</h2>
            <p>{t('refundsDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. {t('warranty')}</h2>
            <p>{t('warrantyDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. {t('liability')}</h2>
            <p>{t('liabilityDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. {t('disputeResolution')}</h2>
            <p className="mb-2">{t('disputeResolutionDesc')}</p>
            <p className="mb-2">{t('onlineDisputeResolution')}</p>
            <p><a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr</a></p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. {t('applicableLaw')}</h2>
            <p>{t('applicableLawDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. {t('contactInformation')}</h2>
            <p className="mb-2">Email: m5moffice@proton.me</p>
            <p className="mb-2">Phone: +48 729877557</p>
            <p>Address: Grzybowska 2/31, 00-131 Warszawa, Poland</p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfSale;
