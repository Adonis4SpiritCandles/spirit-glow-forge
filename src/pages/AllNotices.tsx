import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FileText, Cookie, ShoppingCart, Truck, Scale, Shield, Download } from 'lucide-react';

const AllNotices = () => {
  const { t, language } = useLanguage();
  const allNoticesPdfUrl = language === 'pl' 
    ? '/documents/all-notices-pl.pdf' 
    : '/documents/all-notices-en.pdf';

  const notices = [
    {
      titleEn: 'Privacy Policy',
      titlePl: 'Polityka Prywatności',
      descEn: 'Complete privacy policy with sections for data collection, legal bases, GDPR rights, international data transfers, and third-party services.',
      descPl: 'Pełna polityka prywatności z sekcjami dotyczącymi zbierania danych, podstaw prawnych, praw RODO, międzynarodowych transferów danych i usług stron trzecich.',
      link: '/privacy-policy',
      pdfEn: '/documents/privacy-policy-en.pdf',
      pdfPl: '/documents/polityka-prywatnosci-pl.pdf',
      icon: Shield,
    },
    {
      titleEn: 'Cookie Policy',
      titlePl: 'Polityka plików cookie',
      descEn: 'Updated with sections for "International Data Transfers" and "Third-Party Services" including details about TikTok, Twitter, YouTube. Complete cookie table with name, provider, purpose, duration, and category.',
      descPl: 'Zaktualizowana o sekcje "Transfery międzynarodowe" i "Usługi trzech stron" z szczegółami dotyczącymi TikTok, Twitter, YouTube. Pełna tabela plików cookie z nazwą, dostawcą, celem, czasem trwania i kategorią.',
      link: '/cookie-policy',
      pdfEn: '/documents/cookie-policy-en.pdf',
      pdfPl: '/documents/polityka-plikow-cookie-pl.pdf',
      icon: Cookie,
    },
    {
      titleEn: 'Terms of Sale',
      titlePl: 'Regulamin sprzedaży',
      descEn: 'Sales terms with sections for seller, order placement, payments, shipping, withdrawal rights, and responsibilities.',
      descPl: 'Warunki sprzedaży z sekcjami dotyczącymi sprzedającego, składania zamówień, płatności, wysyłki, praw odstąpienia i odpowiedzialności.',
      link: '/terms-of-sale',
      pdfEn: '/documents/terms-of-sale-en.pdf',
      pdfPl: '/documents/regulamin-sprzedazy-pl.pdf',
      icon: ShoppingCart,
    },
    {
      titleEn: 'Shipping & Returns',
      titlePl: 'Dostawa i zwroty',
      descEn: 'Shipping policy with delivery options and times.',
      descPl: 'Polityka wysyłki z opcjami dostawy i czasami.',
      link: '/shipping-returns',
      pdfEn: '/documents/shipping-returns-en.pdf',
      pdfPl: '/documents/dostawa-zwroty-pl.pdf',
      icon: Truck,
    },
    {
      titleEn: 'Legal Notice',
      titlePl: 'Nota prawna',
      descEn: 'Legal notice with company data, disclaimers, applicable law.',
      descPl: 'Nota prawna z danymi firmy, zastrzeżeniami, obowiązującym prawem.',
      link: '/legal-notice',
      pdfEn: '/documents/legal-notice-en.pdf',
      pdfPl: '/documents/nota-prawna-pl.pdf',
      icon: Scale,
    },
    {
      titleEn: 'Accessibility',
      titlePl: 'Deklaracja dostępności',
      descEn: 'Accessibility statement with WCAG 2.1 AA measures, contacts, and "Limitations and Alternatives" sections.',
      descPl: 'Deklaracja dostępności ze środkami WCAG 2.1 AA, kontaktami i sekcjami "Ograniczenia i alternatywy".',
      link: '/accessibility',
      pdfEn: '/documents/accessibility-en.pdf',
      pdfPl: '/documents/dostepnosc-pl.pdf',
      icon: FileText,
    },
    {
      titleEn: 'Data Request',
      titlePl: 'Wniosek o dane',
      descEn: 'Form to exercise GDPR rights.',
      descPl: 'Formularz do skorzystania z praw RODO.',
      link: '/data-request',
      pdfEn: '/documents/data-request-en.pdf',
      pdfPl: '/documents/wniosek-o-dane-pl.pdf',
      icon: FileText,
    },
    {
      titleEn: 'Privacy Notice for Registration',
      titlePl: 'Polityka prywatności rejestracji',
      descEn: 'Specific privacy notice for account creation with categories of data collected, purposes, legal bases, third parties, and retention periods.',
      descPl: 'Specjalna informacja o prywatności dla tworzenia konta z kategoriami zbieranych danych, celami, podstawami prawnymi, stronami trzecimi i okresami przechowywania.',
      link: '/privacy-registration',
      pdfEn: '/documents/privacy-policy-registration-en.pdf',
      pdfPl: '/documents/polityka-prywatnosci-rejestracji-pl.pdf',
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">
          {language === 'en' ? 'All Notices' : 'Wszystkie informacje'}
        </h1>
        <p className="text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
          {language === 'en' 
            ? 'Complete list of all legal information, privacy policies, and terms. Access our comprehensive documentation in your preferred language.'
            : 'Pełna lista wszystkich informacji prawnych, polityk prywatności i warunków. Uzyskaj dostęp do naszej kompleksowej dokumentacji w preferowanym języku.'
          }
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((notice, index) => {
            const Icon = notice.icon;
            const title = language === 'en' ? notice.titleEn : notice.titlePl;
            const desc = language === 'en' ? notice.descEn : notice.descPl;
            const pdf = language === 'en' ? notice.pdfEn : notice.pdfPl;

            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{title}</h2>
                    <p className="text-sm text-muted-foreground mb-4">{desc}</p>
                    <div className="flex gap-3">
                      <Link 
                        to={notice.link}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        {language === 'en' ? 'View online' : 'Zobacz online'}
                      </Link>
                      <a 
                        href={pdf}
                        download
                        className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        {language === 'en' ? 'Download PDF' : 'Pobierz PDF'}
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-12 p-6 bg-muted/30">
          <h3 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Need Help?' : 'Potrzebujesz pomocy?'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'en'
              ? 'If you have questions about any of our policies or need information in an alternative format, please contact us:'
              : 'Jeśli masz pytania dotyczące którejkolwiek z naszych polityk lub potrzebujesz informacji w innym formacie, skontaktuj się z nami:'
            }
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <p><strong>Email:</strong> m5moffice@proton.me</p>
            <p><strong>{language === 'en' ? 'Phone' : 'Telefon'}:</strong> +48 729877557</p>
            <p><strong>{language === 'en' ? 'Address' : 'Adres'}:</strong> Grzybowska 2/31, 00-131 Warszawa, Poland</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AllNotices;
