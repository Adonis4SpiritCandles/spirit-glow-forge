import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import SEOManager from '@/components/SEO/SEOManager';
import { getFullUrl, generateAlternateUrls } from '@/utils/seoUtils';

const TermsOfSale = () => {
  const { t, language } = useLanguage();
  const pdfUrl = language === 'pl' 
    ? '/documents/regulamin-sprzedazy-pl.pdf' 
    : '/documents/terms-of-sale-en.pdf';

  return (
    <>
      <SEOManager
        title={t('termsOfSale')}
        description={language === 'en'
          ? 'Read SPIRIT CANDLES Terms of Sale. Learn about ordering, payment, delivery, returns and refund policies.'
          : 'Przeczytaj Regulamin Sprzedaży SPIRIT CANDLES. Dowiedz się o zamówieniach, płatnościach, dostawie, zwrotach i polityce zwrotów.'}
        url={getFullUrl('/terms-of-sale', language)}
        alternateUrls={generateAlternateUrls('/terms-of-sale')}
      />
      <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('termsOfSale')}</h1>
        
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
            <p className="mb-4">
              {language === 'pl'
                ? 'Niniejszy regulamin określa warunki zakupu produktów od SPIRIT CANDLE za pośrednictwem strony www.spirit‑candle.com. Składając zamówienie, akceptujesz postanowienia Regulaminu.'
                : 'These Terms of Sale govern your purchase of products from SPIRIT CANDLE through www.spirit‑candle.com. By placing an order, you agree to be bound by these Terms.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. {language === 'pl' ? 'Dane sprzedawcy' : 'Seller information'}</h2>
            <p className="mb-2">M5M Limited Sp. z o.o. oddział w Polsce</p>
            <p className="mb-2">Grzybowska 2/31, 00‑131 {language === 'pl' ? 'Warszawa' : 'Warsaw'}, {language === 'pl' ? 'Polska' : 'Poland'}</p>
            <p className="mb-2">NIP: 5252998035, REGON: 528769795</p>
            <p>Email: <a href="mailto:m5moffice@proton.me" className="text-primary hover:underline">m5moffice@proton.me</a></p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. {language === 'pl' ? 'Produkty i ceny' : 'Products and pricing'}</h2>
            <p>
              {language === 'pl'
                ? 'Oferujemy luksusowe świece sojowe i akcesoria. Wszystkie ceny zawierają podatek VAT. Mogą wystąpić niewielkie różnice w kolorze lub zapachu. Koszty dostawy zostaną doliczone podczas finalizacji zamówienia.'
                : 'We sell luxury soy candles and accessories. All prices include VAT. Minor variations in colour or scent may occur. Shipping fees will be added at checkout.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. {language === 'pl' ? 'Składanie zamówienia i zawarcie umowy' : 'Ordering and contract formation'}</h2>
            <p>
              {language === 'pl'
                ? 'Aby złożyć zamówienie, dodaj produkty do koszyka i przejdź do kasy. Klikając „Złóż zamówienie" składasz wiążącą ofertę zakupu. Po przyjęciu zamówienia otrzymasz automatyczny e‑mail z potwierdzeniem. Umowa zostaje zawarta w chwili wysłania towaru.'
                : 'To place an order, add products to your cart and proceed to checkout. By clicking "Place Order", you make a binding offer. After we receive your order, you will receive an automatic confirmation. The contract is formed when we dispatch your goods.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. {language === 'pl' ? 'Płatność' : 'Payment'}</h2>
            <p>
              {language === 'pl'
                ? 'Akceptujemy bezpieczne płatności online za pośrednictwem Stripe. Zapłata następuje w chwili składania zamówienia. Nie przechowujemy danych karty; są one przetwarzane bezpośrednio przez Stripe.'
                : 'We accept secure online payments via Stripe. Payment is due immediately. We do not store your card details; they are processed directly by Stripe.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. {language === 'pl' ? 'Dostawa i wysyłka' : 'Delivery and shipping'}</h2>
            <p>
              {language === 'pl'
                ? 'Wysyłamy produkty na cały świat z magazynu w Polsce. Opcje dostawy dostarcza Furgonetka (DHL, InPost, UPS, FedEx, GLS, DPD). Dostępne: dostawa do drzwi, odbiór w punkcie, paczkomaty. Wysyłamy w ciągu 1–3 dni roboczych.'
                : 'We ship worldwide from Poland. Shipping options via Furgonetka (DHL, InPost, UPS, FedEx, GLS, DPD). Available: door-to-door, pick-up points, parcel lockers. Orders dispatched within 1–3 business days.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. {language === 'pl' ? 'Prawo do odstąpienia od umowy' : 'Right of withdrawal'}</h2>
            <p>
              {language === 'pl'
                ? 'Konsumenci w UE mają 14 dni kalendarzowych od otrzymania towaru na odstąpienie od umowy bez podawania przyczyny. Poinformuj nas mailowo. Zwrot powinien obejmować nienaruszone produkty w oryginalnym opakowaniu. Zwrot pieniędzy nastąpi w ciągu 14 dni.'
                : 'EU consumers have 14 calendar days from receipt to withdraw without reason. Email us within the period. Return unused goods in original packaging. Refund within 14 days.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. {language === 'pl' ? 'Zwroty i reklamacje' : 'Returns and refunds'}</h2>
            <p>
              {language === 'pl'
                ? 'Jeżeli produkt jest wadliwy lub uszkodzony, skontaktuj się z nami w ciągu 7 dni od dostawy. Zwrócimy pieniądze albo wyślemy wymianę.'
                : 'If your product is defective or damaged, contact us within 7 days. We will refund or send a replacement.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. {language === 'pl' ? 'Gwarancja i odpowiedzialność' : 'Warranty and liability'}</h2>
            <p>
              {language === 'pl'
                ? 'Zapewniamy, że produkty są zgodne z umową. Łączna odpowiedzialność jest ograniczona do ceny zakupu.'
                : 'We warrant products conform to contract. Total liability limited to purchase price.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. {language === 'pl' ? 'Dane osobowe' : 'Personal data'}</h2>
            <p>
              {language === 'pl' ? 'Przetwarzamy dane zgodnie z' : 'We process data per our'}{' '}
              <a href={language === 'pl' ? '/polityka-prywatnosci' : '/privacy-policy'} className="text-primary hover:underline">
                {language === 'pl' ? 'Polityką Prywatności' : 'Privacy Policy'}
              </a> {language === 'pl' ? 'i' : 'and'}{' '}
              <a href={language === 'pl' ? '/polityka-plikow-cookie' : '/cookie-policy'} className="text-primary hover:underline">
                {language === 'pl' ? 'Polityką plików cookie' : 'Cookie Policy'}
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. {language === 'pl' ? 'Rozstrzyganie sporów i prawo właściwe' : 'Dispute resolution and governing law'}</h2>
            <p className="mb-2">
              {language === 'pl'
                ? 'Regulamin podlega prawu polskiemu. Platforma ODR:'
                : 'These Terms are governed by Polish law. ODR platform:'
              }{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>

          <section>
            <p>
              {language === 'pl' ? 'Pytania? Kontakt:' : 'Questions? Contact:'}{' '}
              <a href="mailto:m5moffice@proton.me" className="text-primary hover:underline">m5moffice@proton.me</a>
            </p>
          </section>
        </Card>
      </div>
      </div>
    </>
  );
};

export default TermsOfSale;
