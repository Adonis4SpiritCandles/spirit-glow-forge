import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const LegalNotice = () => {
  const { t, language } = useLanguage();
  const pdfUrl = language === 'pl' 
    ? '/documents/nota-prawna-pl.pdf' 
    : '/documents/legal-notice-en.pdf';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('legalNotice')}</h1>
        
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
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{language === 'pl' ? 'Operator strony internetowej' : 'Website operator'}</h2>
            <p className="mb-4">
              {language === 'pl' 
                ? 'Strona www.spirit‑candle.com jest prowadzona przez M5M Limited Sp. z o.o. oddział w Polsce, z siedzibą pod adresem ul. Grzybowska 2/31, 00‑131 Warszawa, NIP 5252998035, REGON 528769795.'
                : 'The website www.spirit‑candle.com is operated by M5M Limited Sp. z o.o. oddział w Polsce, a company registered in Poland with its registered office at Grzybowska 2/31, 00‑131 Warsaw, VAT ID 5252998035 and REGON 528769795.'
              }
            </p>
            <p>
              {language === 'pl' ? 'Kontakt mailowy:' : 'Email address:'} <a href="mailto:m5moffice@proton.me" className="text-primary hover:underline">m5moffice@proton.me</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{language === 'pl' ? 'Prawa własności intelektualnej' : 'Intellectual property'}</h2>
            <p>
              {language === 'pl'
                ? 'Cała zawartość Serwisu, w tym teksty, logotypy, zdjęcia, grafiki, ikony i projekty produktów, stanowi własność Spirit Candle lub jego licencjodawców i podlega ochronie prawnej. Zabrania się kopiowania, rozpowszechniania, modyfikowania lub wykorzystywania materiałów bez uprzedniej zgody.'
                : 'All content on this Site, including text, logos, photographs, graphics, icons and product designs, is the property of Spirit Candle or its licensors and is protected by copyright, trademark and other intellectual property laws. You may not copy, reproduce, distribute or otherwise use any content without our prior written permission.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{language === 'pl' ? 'Zastrzeżenie odpowiedzialności' : 'Disclaimer'}</h2>
            <p>
              {language === 'pl'
                ? 'Dokładamy starań, aby informacje w Serwisie były aktualne i rzetelne. Nie gwarantujemy jednak ich kompletności ani wolności od błędów. Nie ponosimy odpowiedzialności za szkody wynikłe z korzystania z treści opublikowanych na stronie. Produkty sprzedawane za pośrednictwem Serwisu są przeznaczone do użytku osobistego i należy ich używać zgodnie z instrukcją.'
                : 'We take care to ensure that information on our Site is accurate and up‑to‑date. However, we do not guarantee that the content is always complete or free of errors. We are not responsible for damages arising from use of or reliance on the information provided. The products sold on this Site are intended for personal use only and should be used in accordance with the instructions provided.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{language === 'pl' ? 'Linki zewnętrzne' : 'External links'}</h2>
            <p>
              {language === 'pl'
                ? 'Serwis może zawierać linki do stron osób trzecich. Nie mamy wpływu na treść tych stron i nie ponosimy odpowiedzialności za ich zawartość ani praktyki dotyczące prywatności. Zamieszczenie linku nie oznacza rekomendacji. Zapoznaj się z regulaminem i polityką prywatności stron zewnętrznych, z których korzystasz.'
                : 'Our Site may contain links to third‑party websites. We have no control over the content of these websites and accept no responsibility for their content or privacy practices. The inclusion of a link does not imply endorsement by us. Please review the terms and privacy policies of third‑party sites you visit.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{language === 'pl' ? 'Prawo właściwe' : 'Governing law'}</h2>
            <p>
              {language === 'pl'
                ? 'Niniejsza Nota prawna podlega prawu polskiemu. Wszelkie spory wynikające z korzystania z Serwisu będą rozstrzygane przez sądy polskie, chyba że bezwzględnie obowiązujące przepisy konsumenckie stanowią inaczej.'
                : 'This Legal Notice is governed by the laws of Poland. Any disputes arising from or in connection with the use of this Site shall be subject to the exclusive jurisdiction of the courts of Poland, unless mandatory consumer protection regulations provide otherwise.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('contactUs')}</h2>
            <p>
              {language === 'pl' 
                ? 'W przypadku pytań dotyczących Noty prawnej prosimy o kontakt na adres'
                : 'If you have any questions about this Legal Notice, please contact us at'
              }{' '}
              <a href="mailto:m5moffice@proton.me" className="text-primary hover:underline">m5moffice@proton.me</a>.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default LegalNotice;
