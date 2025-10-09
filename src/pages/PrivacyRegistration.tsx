import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const PrivacyRegistration = () => {
  const { t, language } = useLanguage();

  const pdfLink = language === 'en' 
    ? '/documents/privacy-policy-registration-en.pdf'
    : '/documents/polityka-prywatnosci-rejestracji-pl.pdf';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-4xl font-bold">
            {language === 'en' ? 'Privacy Notice for Account Registration' : 'Polityka prywatności rejestracji'}
          </h1>
          <a 
            href={pdfLink}
            download
            className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg"
          >
            <Download className="h-4 w-4" />
            {language === 'en' ? 'Download PDF' : 'Pobierz PDF'}
          </a>
        </div>
        
        <Card className="p-8 space-y-6">
          <section>
            <p className="text-sm text-muted-foreground mb-4">
              {t('lastUpdated')}: 07/01/2025
            </p>
            <p className="mb-4">
              {language === 'en'
                ? 'This Privacy Notice applies specifically to the creation of a customer account on SPIRIT CANDLES. By registering an account, you provide us with certain personal data as described below.'
                : 'Niniejsza Informacja o Prywatności dotyczy szczególnie tworzenia konta klienta w SPIRIT CANDLES. Rejestrując konto, dostarczasz nam określone dane osobowe opisane poniżej.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '1. Data Controller' : '1. Administrator Danych'}
            </h2>
            <p className="mb-2"><strong>{language === 'en' ? 'Company' : 'Firma'}:</strong> M5M Limited sp. z o.o. oddział w Polsce</p>
            <p className="mb-2"><strong>{language === 'en' ? 'Address' : 'Adres'}:</strong> Grzybowska 2/31, 00-131 Warszawa, Poland</p>
            <p className="mb-2"><strong>NIP:</strong> PL5252998035</p>
            <p className="mb-2"><strong>Email:</strong> m5moffice@proton.me</p>
            <p><strong>{language === 'en' ? 'Phone' : 'Telefon'}:</strong> +48 729877557</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '2. Categories of Data Collected' : '2. Kategorie Zbieranych Danych'}
            </h2>
            <p className="mb-3">
              {language === 'en'
                ? 'When you create an account, we collect:'
                : 'Podczas tworzenia konta zbieramy:'
              }
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{language === 'en' ? 'Account Information' : 'Informacje o koncie'}:</strong> {language === 'en' ? 'Email address, password (encrypted), username' : 'Adres e-mail, hasło (zaszyfrowane), nazwa użytkownika'}</li>
              <li><strong>{language === 'en' ? 'Profile Data' : 'Dane profilu'}:</strong> {language === 'en' ? 'First name, last name, preferred language' : 'Imię, nazwisko, preferowany język'}</li>
              <li><strong>{language === 'en' ? 'Technical Data' : 'Dane techniczne'}:</strong> {language === 'en' ? 'IP address, browser type, device information, registration timestamp' : 'Adres IP, typ przeglądarki, informacje o urządzeniu, znacznik czasowy rejestracji'}</li>
              <li><strong>{language === 'en' ? 'Consent Records' : 'Zapisy zgód'}:</strong> {language === 'en' ? 'Marketing consent, newsletter subscription status, consent timestamps' : 'Zgoda marketingowa, status subskrypcji newslettera, znaczniki czasowe zgód'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '3. Purposes of Processing' : '3. Cele Przetwarzania'}
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{language === 'en' ? 'Creating and managing your customer account' : 'Tworzenie i zarządzanie Twoim kontem klienta'}</li>
              <li>{language === 'en' ? 'Providing access to order history and account features' : 'Zapewnienie dostępu do historii zamówień i funkcji konta'}</li>
              <li>{language === 'en' ? 'Personalizing your shopping experience' : 'Personalizacja doświadczenia zakupowego'}</li>
              <li>{language === 'en' ? 'Sending order confirmations and account notifications' : 'Wysyłanie potwierdzeń zamówień i powiadomień o koncie'}</li>
              <li>{language === 'en' ? 'Marketing communications (only with your consent)' : 'Komunikacja marketingowa (tylko za Twoją zgodą)'}</li>
              <li>{language === 'en' ? 'Fraud prevention and account security' : 'Zapobieganie oszustwom i bezpieczeństwo konta'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '4. Legal Basis' : '4. Podstawa Prawna'}
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{language === 'en' ? 'Contract Performance' : 'Wykonanie umowy'}:</strong> {language === 'en' ? 'Account creation is necessary to provide you with our services' : 'Utworzenie konta jest niezbędne do świadczenia naszych usług'}</li>
              <li><strong>{language === 'en' ? 'Consent' : 'Zgoda'}:</strong> {language === 'en' ? 'Marketing emails and optional features' : 'E-maile marketingowe i opcjonalne funkcje'}</li>
              <li><strong>{language === 'en' ? 'Legitimate Interest' : 'Prawnie uzasadniony interes'}:</strong> {language === 'en' ? 'Security, fraud prevention, service improvement' : 'Bezpieczeństwo, zapobieganie oszustwom, ulepszanie usług'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '5. Third Parties' : '5. Strony Trzecie'}
            </h2>
            <p className="mb-3">
              {language === 'en'
                ? 'Your account data may be shared with:'
                : 'Twoje dane konta mogą być udostępniane:'
              }
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase Inc.</strong>: {language === 'en' ? 'Database hosting and authentication' : 'Hosting bazy danych i uwierzytelnianie'}</li>
              <li><strong>Resend, Inc.</strong>: {language === 'en' ? 'Email delivery service' : 'Usługa dostarczania e-mail'}</li>
              <li><strong>Stripe, Inc.</strong>: {language === 'en' ? 'Payment processing (if you make purchases)' : 'Przetwarzanie płatności (jeśli dokonujesz zakupów)'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '6. Retention Period' : '6. Okres Przechowywania'}
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{language === 'en' ? 'Active Account' : 'Aktywne konto'}:</strong> {language === 'en' ? 'Data retained while account is active' : 'Dane przechowywane podczas gdy konto jest aktywne'}</li>
              <li><strong>{language === 'en' ? 'After Account Deletion' : 'Po usunięciu konta'}:</strong> {language === 'en' ? 'Data deleted within 30 days (except where legal retention applies)' : 'Dane usuwane w ciągu 30 dni (z wyjątkiem obowiązków prawnych)'}</li>
              <li><strong>{language === 'en' ? 'Order History' : 'Historia zamówień'}:</strong> {language === 'en' ? 'Retained for 10 years (tax/legal requirements)' : 'Przechowywane przez 10 lat (wymogi podatkowe/prawne)'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '7. Your Rights' : '7. Twoje Prawa'}
            </h2>
            <p className="mb-3">
              {language === 'en'
                ? 'Under GDPR, you have the following rights regarding your account data:'
                : 'Zgodnie z RODO masz następujące prawa dotyczące danych swojego konta:'
              }
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('rightAccess')}:</strong> {t('rightAccessDesc')}</li>
              <li><strong>{t('rightRectification')}:</strong> {t('rightRectificationDesc')}</li>
              <li><strong>{t('rightErasure')}:</strong> {t('rightErasureDesc')}</li>
              <li><strong>{t('rightPortability')}:</strong> {t('rightPortabilityDesc')}</li>
              <li><strong>{t('rightObject')}:</strong> {t('rightObjectDesc')}</li>
              <li><strong>{t('rightWithdraw')}:</strong> {t('rightWithdrawDesc')}</li>
            </ul>
            <p className="mt-4">
              {t('exerciseRights')} <a href="/data-request" className="text-primary hover:underline font-medium">{t('dataRequestForm')}</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '8. Security' : '8. Bezpieczeństwo'}
            </h2>
            <p>
              {language === 'en'
                ? 'We implement industry-standard security measures to protect your account data, including encryption of passwords, secure HTTPS connections, and regular security audits.'
                : 'Wdrażamy branżowe standardy bezpieczeństwa w celu ochrony danych Twojego konta, w tym szyfrowanie haseł, bezpieczne połączenia HTTPS i regularne audyty bezpieczeństwa.'
              }
            </p>
          </section>

          <section className="bg-muted/30 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">
              {t('contactInformation')}
            </h2>
            <p className="mb-2">
              {language === 'en'
                ? 'For questions about your account data or to exercise your rights:'
                : 'W przypadku pytań dotyczących danych konta lub skorzystania z praw:'
              }
            </p>
            <p className="mb-2">Email: m5moffice@proton.me</p>
            <p className="mb-2">{t('phone')}: +48 729877557</p>
            <p>{language === 'en' ? 'Address' : 'Adres'}: Grzybowska 2/31, 00-131 Warszawa, Poland</p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyRegistration;
