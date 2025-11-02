import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOManager from "@/components/SEO/SEOManager";
import { getFullUrl, generateAlternateUrls } from "@/utils/seoUtils";

const ShippingReturns = () => {
  const { t, language } = useLanguage();
  const pdfUrl = language === 'pl' 
    ? '/documents/dostawa-zwroty-pl.pdf' 
    : '/documents/shipping-returns-en.pdf';

  return (
    <>
      <SEOManager
        title={t('shippingReturnsTitle')}
        description={language === 'en'
          ? 'SPIRIT CANDLES shipping and returns policy. Learn about delivery times, shipping costs, return procedures and refunds.'
          : 'Polityka wysyłki i zwrotów SPIRIT CANDLES. Dowiedz się o czasach dostawy, kosztach wysyłki, procedurach zwrotów i zwrotach pieniędzy.'}
        url={getFullUrl('/shipping-returns', language)}
        alternateUrls={generateAlternateUrls('/shipping-returns')}
      />
      <main className="min-h-screen bg-gradient-mystical py-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-8 text-center">
          {t('shippingReturnsTitle')}
        </h1>

        <div className="mb-6 text-center">
          <Button asChild variant="outline">
            <a href={pdfUrl} download>
              <Download className="mr-2 h-4 w-4" />
              {t('downloadPDF')}
            </a>
          </Button>
        </div>

        <Card className="bg-card border-border/40 shadow-elegant">
          <CardContent className="p-8 space-y-8">
            <section>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'pl' ? 'Ostatnia aktualizacja: 1 listopada 2025' : 'Last updated: 1 November 2025'}
              </p>
            </section>

            {/* Shipping Information */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {language === 'pl' ? 'Informacje o dostawie' : 'Shipping information'}
              </CardTitle>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {language === 'pl'
                    ? 'Chcemy, aby produkty Spirit Candle dotarły do Ciebie szybko i bezpiecznie. Współpracujemy z polską platformą logistyczną Furgonetka, która oferuje różne metody doręczenia i przewoźników.'
                    : 'We want your Spirit Candle products to reach you quickly and safely. We partner with the Polish logistics platform Furgonetka to offer a variety of delivery methods and carriers.'
                  }
                </p>
                
                <h3 className="text-xl font-semibold text-foreground mt-4">{language === 'pl' ? 'Dostępne metody doręczenia' : 'Available delivery methods'}</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>{language === 'pl' ? 'Kurier do drzwi' : 'Door‑to‑door courier'}:</strong> {language === 'pl' ? 'DHL, InPost, UPS, FedEx, GLS, DPD' : 'Available via DHL, InPost, UPS, FedEx, GLS, DPD'}</li>
                  <li><strong>{language === 'pl' ? 'Punkty odbioru' : 'Pick‑up points'}:</strong> {language === 'pl' ? 'Odbierz w wybranym punkcie kurierskim' : 'Collect from a nearby courier point'}</li>
                  <li><strong>{language === 'pl' ? 'Paczkomaty' : 'Parcel lockers'}:</strong> {language === 'pl' ? 'Odbierz paczkę 24/7' : 'Collect your parcel 24/7'}</li>
                </ul>
              </div>
            </section>

            {/* Delivery Times */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {language === 'pl' ? 'Czasy dostawy' : 'Delivery times'}
              </CardTitle>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  {language === 'pl' 
                    ? 'Zamówienia wysyłamy w ciągu 1–3 dni roboczych. Czas dostawy zależy od lokalizacji:'
                    : 'We dispatch orders within 1–3 business days. Delivery times vary:'
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>{language === 'pl' ? 'Polska' : 'Poland'}:</strong> 1–3 {language === 'pl' ? 'dni robocze' : 'business days'}</li>
                  <li><strong>{language === 'pl' ? 'Unia Europejska' : 'European Union'}:</strong> 3–7 {language === 'pl' ? 'dni roboczych' : 'business days'}</li>
                  <li><strong>{language === 'pl' ? 'Pozostałe kraje' : 'Rest of the world'}:</strong> 7–14 {language === 'pl' ? 'dni roboczych' : 'business days'}</li>
                </ul>
              </div>
            </section>

            {/* Shipping Costs */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {language === 'pl' ? 'Koszty wysyłki' : 'Shipping costs'}
              </CardTitle>
              <p className="text-muted-foreground">
                {language === 'pl'
                  ? 'Koszt wysyłki zależy od lokalizacji, wagi i rozmiaru zamówienia. Dokładna opłata zostanie wyświetlona podczas finalizacji zamówienia.'
                  : 'Shipping costs depend on your location, weight and size of your order. The exact cost will be displayed at checkout.'
                }
              </p>
            </section>

            {/* Returns Policy */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {language === 'pl' ? 'Zwroty i wymiany' : 'Returns and exchanges'}
              </CardTitle>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {language === 'pl'
                    ? 'Możesz zwrócić produkty w terminie 14 dni od ich otrzymania. Zwrot jest możliwy tylko dla produktów nieużywanych, w oryginalnym opakowaniu.'
                    : 'You can return products within 14 days of receipt. To be eligible, items must be unused and in their original packaging.'
                  }
                </p>
                
                <h3 className="text-xl font-semibold text-foreground mt-4">{language === 'pl' ? 'Jak zgłosić zwrot' : 'How to initiate a return'}</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>{language === 'pl' ? 'Napisz do nas na' : 'Email us at'} <a href="mailto:m5moffice@proton.me" className="text-primary hover:underline">m5moffice@proton.me</a> {language === 'pl' ? 'w ciągu 14 dni' : 'within 14 days'}</li>
                  <li>{language === 'pl' ? 'Przekażemy instrukcje zwrotu' : 'We will provide return instructions'}</li>
                  <li>{language === 'pl' ? 'Spakuj produkty bezpiecznie' : 'Pack items securely'}</li>
                  <li>{language === 'pl' ? 'Wyślij przesyłką rejestrowaną' : 'Send via tracked service'}</li>
                </ol>
                <p className="mt-4">
                  {language === 'pl'
                    ? 'Po otrzymaniu i sprawdzeniu zwrotu poinformujemy Cię e‑mailem. Zwrot płatności nastąpi w ciągu 14 dni.'
                    : 'Once we receive your return, we will notify you and process your refund within 14 days.'
                  }
                </p>
              </div>
            </section>

            {/* Damaged Items */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {language === 'pl' ? 'Uszkodzone lub niewłaściwe produkty' : 'Damaged or incorrect items'}
              </CardTitle>
              <p className="text-muted-foreground">
                {language === 'pl'
                  ? 'Jeżeli przesyłka dotarła uszkodzona, skontaktuj się z nami w ciągu 7 dni z załączonymi zdjęciami. Zorganizujemy wymianę lub zwrot.'
                  : 'If your order is damaged or you receive the wrong item, contact us within 7 days with photos. We will arrange a replacement or refund.'
                }
              </p>
            </section>

            {/* Non-returnable */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {language === 'pl' ? 'Produkty nie podlegające zwrotom' : 'Non‑returnable items'}
              </CardTitle>
              <p className="text-muted-foreground">
                {language === 'pl'
                  ? 'Nie przyjmujemy zwrotów używanych świec ani produktów spersonalizowanych. Karty podarunkowe również nie podlegają zwrotowi.'
                  : 'We cannot accept returns of used candles or personalised items. Gift cards are also non‑returnable.'
                }
              </p>
            </section>

            {/* Contact */}
            <section className="bg-muted/30 p-6 rounded-lg">
              <CardTitle className="text-xl font-playfair mb-3 text-foreground">
                {t('needHelp')}
              </CardTitle>
              <p className="text-muted-foreground mb-4">
                {language === 'pl' ? 'W razie pytań napisz do nas:' : 'For questions about shipping or returns:'}
              </p>
              <p className="text-foreground font-semibold">
                Email: <a href="mailto:m5moffice@proton.me" className="text-primary hover:underline">m5moffice@proton.me</a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
      </main>
    </>
  );
};

export default ShippingReturns;
