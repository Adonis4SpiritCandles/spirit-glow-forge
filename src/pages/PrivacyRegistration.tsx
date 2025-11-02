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
              {t('lastUpdated')}: {language === 'pl' ? '1 listopada 2025 r.' : '1 November 2025'}
            </p>
            <p className="mb-4">
              {language === 'en'
                ? 'This notice explains how SPIRIT CANDLE processes personal data when you create an account on our website. It supplements our Privacy Policy and should be read together with it.'
                : 'Niniejsza informacja wyjaśnia, w jaki sposób SPIRIT CANDLE przetwarza dane osobowe podczas zakładania konta w naszym sklepie internetowym. Jest uzupełnieniem Polityki prywatności i należy czytać ją łącznie z nią.'
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
              {language === 'en' ? '1. Data collected during registration' : '1. Dane zbierane podczas rejestracji'}
            </h2>
            <p className="mb-3">
              {language === 'en'
                ? 'When you register for an account, we collect the following information:'
                : 'Podczas zakładania konta zbieramy następujące informacje:'
              }
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>{language === 'en' ? 'Identity information' : 'Dane identyfikacyjne'}:</strong>{' '}
                {language === 'en' ? 'your name and surname' : 'imię i nazwisko'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Contact details' : 'Dane kontaktowe'}:</strong>{' '}
                {language === 'en' 
                  ? 'email address, phone number and billing/shipping addresses' 
                  : 'adres e-mail, numer telefonu oraz adres do fakturowania i wysyłki'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Account credentials' : 'Dane logowania'}:</strong>{' '}
                {language === 'en' 
                  ? 'a username and password (stored in encrypted form)' 
                  : 'nazwa użytkownika i hasło (przechowywane w zaszyfrowanej formie)'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Optional information' : 'Dane opcjonalne'}:</strong>{' '}
                {language === 'en' 
                  ? 'date of birth, language preference and marketing preferences if you choose to provide them' 
                  : 'data urodzenia, preferencje językowe i zgody marketingowe, jeśli zdecydujesz się je podać'}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '2. Purpose and legal basis' : '2. Cel i podstawa prawna przetwarzania'}
            </h2>
            <p className="mb-3">
              {language === 'en'
                ? 'We process this data for the following purposes:'
                : 'Dane rejestracyjne wykorzystujemy do następujących celów:'
              }
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>{language === 'en' ? 'Account creation and management' : 'Utworzenie i zarządzanie kontem'}:</strong>{' '}
                {language === 'en' 
                  ? 'to create your account, authenticate you and enable you to log in, view order history and manage your wishlist. The legal basis is performance of a contract (Art. 6 (1)(b) GDPR).' 
                  : 'w celu utworzenia konta, uwierzytelniania, umożliwienia logowania, wglądu w historię zamówień i zarządzania listą życzeń. Podstawa prawna: wykonanie umowy (art. 6 ust. 1 lit. b RODO).'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Customer service' : 'Obsługa klienta'}:</strong>{' '}
                {language === 'en' 
                  ? 'to provide support, respond to your enquiries and send important account information. The legal basis is our legitimate interest (Art. 6 (1)(f) GDPR) and performance of a contract.' 
                  : 'aby zapewnić wsparcie, odpowiadać na zapytania i wysyłać ważne informacje dotyczące konta. Podstawa prawna: nasz prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO) oraz wykonanie umowy.'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Personalisation' : 'Personalizacja'}:</strong>{' '}
                {language === 'en' 
                  ? 'to remember your preferences, suggest products and tailor your shopping experience. The legal basis is our legitimate interest.' 
                  : 'aby zapamiętać Twoje preferencje, proponować produkty i dostosowywać zakupy. Podstawa prawna: nasz prawnie uzasadniony interes.'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Marketing' : 'Marketing'}:</strong>{' '}
                {language === 'en' 
                  ? 'if you opt in, to send you newsletters and special offers. The legal basis is your consent (Art. 6 (1)(a) GDPR). You may withdraw your consent at any time.' 
                  : 'jeśli wyrazisz zgodę, wysyłanie newsletterów i specjalnych ofert. Podstawa prawna: zgoda (art. 6 ust. 1 lit. a RODO). Zgodę możesz wycofać w dowolnym momencie.'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Compliance' : 'Spełnienie obowiązków prawnych'}:</strong>{' '}
                {language === 'en' 
                  ? 'to meet our legal obligations, such as tax and accounting rules, and to prevent fraud. The legal basis is legal obligation (Art. 6 (1)(c) GDPR) and our legitimate interest.' 
                  : 'aby spełnić obowiązki wynikające z przepisów podatkowych, rachunkowych oraz w celu zapobiegania oszustwom. Podstawa prawna: obowiązek prawny (art. 6 ust. 1 lit. c RODO) i nasz prawnie uzasadniony interes.'}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '3. Data sharing' : '3. Udostępnianie danych'}
            </h2>
            <p>
              {language === 'en'
                ? 'We share registration data with trusted partners as described in our Privacy Policy, including payment processors, shipping providers, analytics and marketing partners. We do not sell your personal data.'
                : 'Dane rejestracyjne mogą być udostępniane zaufanym partnerom tak jak opisano w naszej Polityce prywatności, w tym dostawcom płatności, firmom kurierskim, partnerom analitycznym i marketingowym. Nie sprzedajemy Twoich danych osobowych.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '4. Data retention' : '4. Okres przechowywania'}
            </h2>
            <p>
              {language === 'en'
                ? 'Registration data is stored for as long as your account remains active. If you delete your account, we retain minimal information (such as order history) for up to six years to comply with legal obligations.'
                : 'Dane rejestracyjne przechowujemy tak długo, jak Twoje konto pozostaje aktywne. Po usunięciu konta przechowujemy minimalne informacje (np. historię zamówień) przez maksymalnie sześć lat w celu spełnienia obowiązków prawnych.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'en' ? '5. Your rights' : '5. Twoje prawa'}
            </h2>
            <p className="mb-3">
              {language === 'en'
                ? 'You have the rights set out in our Privacy Policy, including the right to access, rectify, delete and restrict the processing of your data, object to processing and withdraw consent.'
                : 'Przysługują Ci prawa opisane w naszej Polityce prywatności, w tym prawo dostępu, sprostowania, usunięcia i ograniczenia przetwarzania danych, sprzeciwu wobec przetwarzania oraz wycofania zgody.'
              }
            </p>
            <p>
              {language === 'en' 
                ? 'To exercise these rights, please use our' 
                : 'Aby skorzystać z tych praw, użyj naszego'
              }{' '}
              <a href="/data-request" className="text-primary hover:underline font-medium">
                {language === 'en' ? 'Data Request Form' : 'Formularza wniosku o dane'}
              </a>
              {' '}{language === 'en' ? 'or contact us at' : 'lub skontaktuj się z nami pod adresem'}{' '}
              <a href="mailto:m5moffice@proton.me" className="text-primary hover:underline">m5moffice@proton.me</a>.
            </p>
          </section>

          <section className="bg-muted/30 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">
              {language === 'en' ? '6. Contact' : '6. Kontakt'}
            </h2>
            <p className="mb-2">
              {language === 'en'
                ? 'If you have questions about this notice, please contact us at:'
                : 'Jeśli masz pytania dotyczące niniejszej informacji, skontaktuj się z nami:'
              }
            </p>
            <p className="mb-2">
              <strong>Email:</strong> <a href="mailto:m5moffice@proton.me" className="text-primary hover:underline">m5moffice@proton.me</a>
            </p>
            <p>
              <strong>{language === 'en' ? 'Address' : 'Adres'}:</strong> M5M Limited sp. z o.o., Grzybowska 2/31, 00-131 {language === 'en' ? 'Warsaw' : 'Warszawa'}, Poland
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyRegistration;
