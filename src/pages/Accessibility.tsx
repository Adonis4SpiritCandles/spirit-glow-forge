import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const Accessibility = () => {
  const { t, language } = useLanguage();
  const pdfUrl = language === 'pl' 
    ? '/documents/dostepnosc-pl.pdf' 
    : '/documents/accessibility-en.pdf';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('accessibilityStatement')}</h1>
        
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
              {t('lastUpdated')}: {language === 'pl' ? '1 listopada 2025 r.' : '1 November 2025'}
            </p>
            <p className="mb-4">
              {language === 'pl'
                ? 'W Spirit Candle dokładamy wszelkich starań, aby nasza strona była dostępna dla wszystkich użytkowników, w tym osób z niepełnosprawnościami. Dążymy do spełnienia wytycznych WCAG 2.1 na poziomie AA i stale udoskonalamy doświadczenia użytkowników.'
                : 'At Spirit Candle we are committed to ensuring that our website is accessible to all users, including those with disabilities. We strive to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA and continuously improve the user experience for everyone.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{language === 'pl' ? 'Działania wspierające dostępność' : 'Measures to support accessibility'}</h2>
            <p className="mb-2">{language === 'pl' ? 'Wprowadziliśmy następujące rozwiązania:' : 'We have taken the following steps:'}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{language === 'pl' ? 'Semantyczny HTML i poprawna struktura nagłówków dla czytników ekranu' : 'Semantic HTML and proper heading structure for screen reader compatibility'}</li>
              <li>{language === 'pl' ? 'Opisy alternatywne (alt) dla obrazów' : 'Descriptive alternative text for images'}</li>
              <li>{language === 'pl' ? 'Kontrast kolorów i skalowanie czcionki' : 'High‑contrast colours and scalable typography'}</li>
              <li>{language === 'pl' ? 'Menu i elementy dostępne z klawiatury' : 'Keyboard‑navigable menus and interactive elements'}</li>
              <li>{language === 'pl' ? 'Wyraźne znaczniki fokusu' : 'Clear focus indicators'}</li>
              <li>{language === 'pl' ? 'Formularze z etykietami i komunikatami o błędach' : 'Forms with labels and error messages'}</li>
              <li>{language === 'pl' ? 'Regularne audyty dostępności' : 'Regular accessibility audits'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{language === 'pl' ? 'Informacje zwrotne i kontakt' : 'Feedback and contact'}</h2>
            <p className="mb-2">
              {language === 'pl'
                ? 'Zachęcamy do przesyłania uwag na temat dostępności naszego Serwisu. Jeśli napotkasz bariery lub masz propozycje, skontaktuj się z nami:'
                : 'We welcome your feedback on the accessibility of our Site. If you encounter barriers or have suggestions, please contact us:'
              }
            </p>
            <p className="mb-2">Email: <a href="mailto:m5moffice@proton.me" className="text-primary hover:underline">m5moffice@proton.me</a></p>
            <p>
              {language === 'pl'
                ? 'Odpowiadamy na zgłoszenia dotyczące dostępności w ciągu 14 dni.'
                : 'We aim to respond to accessibility feedback within 14 days.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{language === 'pl' ? 'Ograniczenia i alternatywy' : 'Limitations and alternatives'}</h2>
            <p>
              {language === 'pl'
                ? 'Pomimo starań, niektóre starsze strony lub treści zewnętrzne mogą nie spełniać w pełni standardów dostępności. W przypadku trudności udostępnimy potrzebne treści w alternatywnym formacie na życzenie.'
                : 'While we strive to make all content accessible, some legacy pages or third‑party content may not fully meet accessibility standards. If you experience difficulty, we will provide content in an alternative format upon request.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{language === 'pl' ? 'Status zgodności' : 'Compliance status'}</h2>
            <p>
              {language === 'pl'
                ? 'Nasza strona częściowo spełnia wymagania WCAG 2.1 na poziomie AA. Pracujemy nad poprawą zgodności i usunięciem pozostałych barier. Niniejsza deklaracja będzie aktualizowana.'
                : 'Our Site partially complies with WCAG 2.1 Level AA. We are working to improve compliance and address remaining issues. This statement will be reviewed regularly.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('technicalSpecifications')}</h2>
            <p className="mb-2">{t('technicalSpecificationsIntro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>HTML5</li>
              <li>CSS3</li>
              <li>JavaScript (React)</li>
              <li>ARIA (Accessible Rich Internet Applications)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('assistiveTechnologies')}</h2>
            <p className="mb-2">{t('assistiveTechnologiesDesc')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>JAWS</li>
              <li>NVDA</li>
              <li>VoiceOver</li>
              <li>TalkBack</li>
              <li>{t('screenMagnifiers')}</li>
              <li>{t('speechRecognition')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('continuousImprovement')}</h2>
            <p>{t('continuousImprovementDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('alternativeFormats')}</h2>
            <p>{t('alternativeFormatsDesc')}</p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default Accessibility;
