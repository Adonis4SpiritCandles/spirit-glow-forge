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
              {t('lastUpdated')}: 07/01/2025
            </p>
            <p className="mb-4">{t('accessibilityIntro')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. {t('ourCommitment')}</h2>
            <p>{t('ourCommitmentDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. {t('accessibilityFeatures')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('keyboardNavigation')}</li>
              <li>{t('screenReaderCompatibility')}</li>
              <li>{t('textScaling')}</li>
              <li>{t('colorContrast')}</li>
              <li>{t('altTextImages')}</li>
              <li>{t('descriptiveLinks')}</li>
              <li>{t('responsiveDesign')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. {t('wcagCompliance')}</h2>
            <p>{t('wcagComplianceDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. {t('knownLimitations')}</h2>
            <p className="mb-2">{t('knownLimitationsIntro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('thirdPartyContent')}</li>
              <li>{t('complexInteractions')}</li>
            </ul>
            <p className="mt-2">{t('workingToImprove')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. {t('technicalSpecifications')}</h2>
            <p className="mb-2">{t('technicalSpecificationsIntro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>HTML5</li>
              <li>CSS3</li>
              <li>JavaScript (React)</li>
              <li>ARIA (Accessible Rich Internet Applications)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. {t('assistiveTechnologies')}</h2>
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
            <h2 className="text-2xl font-semibold mb-4">7. {t('feedback')}</h2>
            <p className="mb-2">{t('accessibilityFeedbackDesc')}</p>
            <p className="mb-2">Email: m5moffice@proton.me</p>
            <p className="mb-2">Phone: +48 729877557</p>
            <p>{t('respondAccessibility')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. {t('continuousImprovement')}</h2>
            <p>{t('continuousImprovementDesc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. {t('alternativeFormats')}</h2>
            <p>{t('alternativeFormatsDesc')}</p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default Accessibility;
