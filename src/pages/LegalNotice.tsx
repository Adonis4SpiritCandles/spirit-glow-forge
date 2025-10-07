import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';

const LegalNotice = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('legalNotice')}</h1>
        
        <Card className="p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. {t('companyInformation')}</h2>
            <p className="mb-2"><strong>{t('companyName')}:</strong> M5M Limited sp. z o.o. oddział w Polsce</p>
            <p className="mb-2"><strong>{t('legalForm')}:</strong> {t('limitedLiability')}</p>
            <p className="mb-2"><strong>{t('registeredOffice')}:</strong> Grzybowska 2/31, 00-131 Warszawa, Poland</p>
            <p className="mb-2"><strong>{t('taxId')} (NIP):</strong> PL5252998035</p>
            <p className="mb-2"><strong>{t('email')}:</strong> m5moffice@proton.me</p>
            <p><strong>{t('phone')}:</strong> +48 729877557</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. {t('websiteOperator')}</h2>
            <p>{t('websiteOperatorDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. {t('hostingProvider')}</h2>
            <p className="mb-2"><strong>Supabase Inc.</strong></p>
            <p className="mb-2">970 Toa Payoh North, #07-04</p>
            <p className="mb-2">Singapore 318992</p>
            <p><a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://supabase.com</a></p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. {t('intellectualProperty')}</h2>
            <p>{t('intellectualPropertyDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. {t('disclaimer')}</h2>
            <p>{t('disclaimerDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. {t('externalLinks')}</h2>
            <p>{t('externalLinksDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. {t('applicableLaw')}</h2>
            <p>{t('legalNoticeApplicableLaw')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. {t('contactInformation')}</h2>
            <p className="mb-2">{t('legalNoticeContactIntro')}</p>
            <p className="mb-2">Email: m5moffice@proton.me</p>
            <p className="mb-2">Phone: +48 729877557</p>
            <p>Address: Grzybowska 2/31, 00-131 Warszawa, Poland</p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default LegalNotice;
