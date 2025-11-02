import { useState } from "react";
import { Search, Package, Truck, RotateCcw, Flame, User, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOManager from "@/components/SEO/SEOManager";
import { generateBreadcrumbStructuredData, getFullUrl, generateAlternateUrls } from "@/utils/seoUtils";

const FAQ = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: getFullUrl('/', language) },
    { name: 'FAQ', url: getFullUrl('/faq', language) }
  ]);

  const faqCategories = [
    {
      icon: <Package className="w-5 h-5 text-primary" />,
      title: language === 'pl' ? 'Produkty i Materiały' : 'Products & Materials',
      faqs: [
        {
          question: language === 'pl' ? 'Jakiego wosku używacie w swoich świecach?' : 'What type of wax do you use in your candles?',
          answer: language === 'pl' 
            ? 'Używamy 100% naturalnego wosku sojowego, który jest ekologiczny, odnawialny i pali się czystszym płomieniem niż wosk parafinowy. Wosk sojowy jest również biodegradowalny i wegetariański.'
            : 'We use 100% natural soy wax, which is eco-friendly, renewable, and burns cleaner than paraffin wax. Soy wax is also biodegradable and vegan-friendly.'
        },
        {
          question: t('howLongBurn'),
          answer: t('burnTimeAnswer') + (language === 'pl' 
            ? ' Dla optymalnego spalania zawsze obcinaj knot do 5mm przed każdym użyciem i pal świecę przez co najmniej 2-3 godziny podczas pierwszego użycia.'
            : ' For optimal burning, always trim the wick to 5mm before each use and burn the candle for at least 2-3 hours during first use.')
        },
        {
          question: t('areEcoFriendly'),
          answer: t('ecoAnswer') + (language === 'pl'
            ? ' Nasze opakowania są również w 100% recyclingu i używamy ekologicznych materiałów w całym naszym procesie produkcyjnym.'
            : ' Our packaging is also 100% recyclable and we use eco-friendly materials throughout our production process.')
        },
        {
          question: language === 'pl' ? 'Czy Wasze świece są bezpieczne dla zwierząt?' : 'Are your candles pet-safe?',
          answer: language === 'pl'
            ? 'Tak! Nasze świece są wykonane z nietoksycznych składników i są bezpieczne dla zwierząt domowych. Jednak zawsze zalecamy trzymanie płonących świec poza zasięgiem zwierząt i nigdy nie zostawianie ich bez nadzoru.'
            : 'Yes! Our candles are made from non-toxic ingredients and are safe for pets. However, we always recommend keeping burning candles out of reach of pets and never leaving them unattended.'
        }
      ]
    },
    {
      icon: <Truck className="w-5 h-5 text-primary" />,
      title: language === 'pl' ? 'Zamówienia i Płatności' : 'Orders & Payments',
      faqs: [
        {
          question: language === 'pl' ? 'Jakie metody płatności akceptujecie?' : 'What payment methods do you accept?',
          answer: language === 'pl'
            ? 'Akceptujemy wszystkie główne karty kredytowe i debetowe (Visa, Mastercard, American Express), a także płatności za pomocą Apple Pay i Google Pay przez naszą bezpieczną bramkę płatności Stripe.'
            : 'We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as Apple Pay and Google Pay through our secure Stripe payment gateway.'
        },
        {
          question: language === 'pl' ? 'Czy mogę zmodyfikować lub anulować moje zamówienie?' : 'Can I modify or cancel my order?',
          answer: language === 'pl'
            ? 'Możesz zmodyfikować lub anulować swoje zamówienie w ciągu 2 godzin od złożenia zamówienia. Po tym czasie Twoje zamówienie jest już w trakcie realizacji. Skontaktuj się z nami natychmiast pod adresem m5moffice@proton.me, jeśli potrzebujesz dokonać zmian.'
            : 'You can modify or cancel your order within 2 hours of placing it. After this time, your order is already being processed. Please contact us immediately at m5moffice@proton.me if you need to make changes.'
        },
        {
          question: language === 'pl' ? 'Czy otrzymam potwierdzenie zamówienia?' : 'Will I receive an order confirmation?',
          answer: language === 'pl'
            ? 'Tak! Po złożeniu zamówienia natychmiast otrzymasz e-mail z potwierdzeniem zamówienia zawierający szczegóły zamówienia i numer zamówienia. Jeśli nie otrzymasz tego e-maila, sprawdź folder spam lub skontaktuj się z nami.'
            : 'Yes! You will receive an order confirmation email immediately after placing your order, containing your order details and order number. If you don\'t receive this email, please check your spam folder or contact us.'
        }
      ]
    },
    {
      icon: <Truck className="w-5 h-5 text-primary" />,
      title: language === 'pl' ? 'Wysyłka i Dostawa' : 'Shipping & Delivery',
      faqs: [
        {
          question: t('shipInternationally'),
          answer: t('shippingAnswer') + (language === 'pl'
            ? ' Zamówienia krajowe zazwyczaj docierają w ciągu 2-4 dni roboczych, a zamówienia międzynarodowe w ciągu 5-10 dni roboczych.'
            : ' Domestic orders typically arrive within 2-4 business days, while international orders take 5-10 business days.')
        },
        {
          question: language === 'pl' ? 'Ile kosztuje wysyłka?' : 'How much does shipping cost?',
          answer: language === 'pl'
            ? 'Koszty wysyłki są obliczane przy kasie w oparciu o lokalizację i wagę zamówienia. Oferujemy darmową wysyłkę dla zamówień powyżej 200 PLN w Polsce.'
            : 'Shipping costs are calculated at checkout based on your location and order weight. We offer free shipping on orders over 200 PLN within Poland.'
        },
        {
          question: language === 'pl' ? 'Jak mogę śledzić moje zamówienie?' : 'How can I track my order?',
          answer: language === 'pl'
            ? 'Po wysłaniu zamówienia otrzymasz e-mail z numerem śledzenia. Możesz również śledzić swoje zamówienie, logując się na swoje konto i przechodząc do sekcji "Moje Zamówienia".'
            : 'Once your order ships, you\'ll receive an email with a tracking number. You can also track your order by logging into your account and going to the "My Orders" section.'
        },
        {
          question: language === 'pl' ? 'Co się stanie, jeśli moja przesyłka zostanie uszkodzona podczas transportu?' : 'What if my package arrives damaged?',
          answer: language === 'pl'
            ? 'Starannie pakujemy wszystkie zamówienia, ale jeśli Twoja świeca dotrze uszkodzona, skontaktuj się z nami w ciągu 48 godzin pod adresem m5moffice@proton.me ze zdjęciami uszkodzenia. Niezwłocznie wyślemy zamiennik lub zwrot pieniędzy.'
            : 'We carefully package all orders, but if your candle arrives damaged, please contact us within 48 hours at m5moffice@proton.me with photos of the damage. We\'ll promptly send a replacement or refund.'
        }
      ]
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-primary" />,
      title: language === 'pl' ? 'Zwroty i Zwroty Pieniędzy' : 'Returns & Refunds',
      faqs: [
        {
          question: language === 'pl' ? 'Jaka jest Wasza polityka zwrotów?' : 'What is your return policy?',
          answer: language === 'pl'
            ? 'Możesz zwrócić nieużywane, nieodpalone świece w oryginalnym opakowaniu w ciągu 30 dni od otrzymania. Zwroty są akceptowane tylko wtedy, gdy produkt jest w stanie, który można odsprzedać. Koszt wysyłki zwrotnej ponosi klient, chyba że produkt jest wadliwy.'
            : 'You can return unused, unburned candles in their original packaging within 30 days of receipt. Returns are only accepted if the product is in resellable condition. Return shipping costs are borne by the customer unless the product is defective.'
        },
        {
          question: language === 'pl' ? 'Jak długo trwa zwrot pieniędzy?' : 'How long does a refund take?',
          answer: language === 'pl'
            ? 'Po otrzymaniu i sprawdzeniu zwrotu przetworzymy zwrot pieniędzy w ciągu 5-7 dni roboczych. Zwrot pieniędzy zostanie zwrócony na oryginalną metodę płatności.'
            : 'Once we receive and inspect your return, we\'ll process the refund within 5-7 business days. The refund will be credited back to your original payment method.'
        },
        {
          question: language === 'pl' ? 'Czy mogę wymienić świecę na inną?' : 'Can I exchange a candle for a different one?',
          answer: language === 'pl'
            ? 'Tak! Jeśli chcesz wymienić swoją świecę na inny zapach lub rozmiar, skontaktuj się z nami pod adresem m5moffice@proton.me, a my pomożemy Ci w procesie wymiany.'
            : 'Yes! If you\'d like to exchange your candle for a different scent or size, please contact us at m5moffice@proton.me and we\'ll help you with the exchange process.'
        }
      ]
    },
    {
      icon: <Flame className="w-5 h-5 text-primary" />,
      title: language === 'pl' ? 'Pielęgnacja Produktu' : 'Product Care',
      faqs: [
        {
          question: language === 'pl' ? 'Jak sprawić, by moja świeca paliła się dłużej?' : 'How do I make my candle last longer?',
          answer: language === 'pl'
            ? 'Zawsze obcinaj knot do 5mm przed każdym użyciem. Pal świecę przez co najmniej 2-3 godziny podczas pierwszego użycia, aby utworzyć równomierny roztopiony basen. Unikaj palenia świecy dłużej niż 4 godziny na raz.'
            : 'Always trim the wick to 5mm before each use. Burn the candle for at least 2-3 hours during first use to create an even melt pool. Avoid burning the candle for more than 4 hours at a time.'
        },
        {
          question: language === 'pl' ? 'Co powinienem zrobić z pustym słoikiem po świecy?' : 'What should I do with my empty candle jar?',
          answer: language === 'pl'
            ? 'Nasze słoiki na świece można wykorzystać ponownie! Wyczyść pozostały wosk, umieszczając słoik w zamrażalniku na kilka godzin, a następnie wyskrobiąc wosk. Użyj słoika jako pojemnika do przechowywania, doniczki lub jako świecznika na nową świecę.'
            : 'Our candle jars are reusable! Clean out the remaining wax by placing the jar in the freezer for a few hours, then scraping out the wax. Use the jar as a storage container, planter, or as a holder for a new candle.'
        },
        {
          question: language === 'pl' ? 'Czy mogę używać świecy w każdym pomieszczeniu?' : 'Can I use the candle in any room?',
          answer: language === 'pl'
            ? 'Tak, ale zawsze pal świece w dobrze wentylowanym pomieszczeniu z dala od przeciągów, domowników, dzieci i zwierząt domowych. Nigdy nie zostawiaj płonącej świecy bez nadzoru.'
            : 'Yes, but always burn candles in a well-ventilated room away from drafts, flammable materials, children, and pets. Never leave a burning candle unattended.'
        }
      ]
    },
    {
      icon: <User className="w-5 h-5 text-primary" />,
      title: language === 'pl' ? 'Konto i Preferencje' : 'Account & Preferences',
      faqs: [
        {
          question: language === 'pl' ? 'Czy muszę utworzyć konto, aby złożyć zamówienie?' : 'Do I need to create an account to place an order?',
          answer: language === 'pl'
            ? 'Nie, możesz zamówić jako gość. Jednak utworzenie konta pozwala na łatwiejsze śledzenie zamówień, zarządzanie preferencjami i szybsze realizowanie zamówień w przyszłości.'
            : 'No, you can order as a guest. However, creating an account allows you to easily track orders, manage preferences, and checkout faster in the future.'
        },
        {
          question: language === 'pl' ? 'Jak zmienić preferowany język?' : 'How do I change my preferred language?',
          answer: language === 'pl'
            ? 'Możesz zmienić preferowany język, logując się na swoje konto, przechodząc do Ustawień i wybierając preferowany język. To ustawi język dla całej witryny i e-maili, które otrzymujesz od nas.'
            : 'You can change your preferred language by logging into your account, going to Settings, and selecting your preferred language. This will set the language for the entire site and emails you receive from us.'
        },
        {
          question: language === 'pl' ? 'Czy mogę otrzymywać aktualizacje o nowych produktach?' : 'Can I receive updates about new products?',
          answer: language === 'pl'
            ? 'Tak! Zapisz się do naszego newslettera, aby otrzymywać aktualizacje o nowych zapachach, ekskluzywnych ofertach i promocjach. Możesz zarządzać swoimi preferencjami komunikacyjnymi w ustawieniach konta.'
            : 'Yes! Subscribe to our newsletter to receive updates about new fragrances, exclusive offers, and promotions. You can manage your communication preferences in your account settings.'
        }
      ]
    }
  ];

  // Filter FAQs based on search query
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <>
      <SEOManager
        title="FAQ"
        description={language === 'en'
          ? 'Find answers to frequently asked questions about SPIRIT CANDLES products, shipping, returns, and more.'
          : 'Znajdź odpowiedzi na najczęściej zadawane pytania o produkty SPIRIT CANDLES, wysyłkę, zwroty i więcej.'}
        keywords={language === 'en'
          ? 'faq, frequently asked questions, candle help, shipping info, returns policy'
          : 'faq, najczęściej zadawane pytania, pomoc świece, informacje wysyłka, polityka zwrotów'}
        url={getFullUrl('/faq', language)}
        structuredData={breadcrumbData}
        alternateUrls={generateAlternateUrls('/faq')}
      />
      <main className="min-h-screen bg-gradient-mystical">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <HelpCircle className="w-10 h-10 text-primary" />
            {t('frequentlyAskedQuestions')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'pl' 
              ? 'Znajdź odpowiedzi na najczęściej zadawane pytania o nasze świece, wysyłkę i nie tylko.'
              : 'Find answers to the most common questions about our candles, shipping, and more.'}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder={language === 'pl' ? 'Szukaj w FAQ...' : 'Search FAQs...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="bg-card border-border/40 shadow-elegant overflow-hidden">
                <div className="bg-primary/5 px-6 py-4 border-b border-border/40">
                  <h2 className="text-xl font-playfair font-bold text-foreground flex items-center gap-3">
                    {category.icon}
                    {category.title}
                  </h2>
                </div>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left hover:text-primary transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-card border-border/40 shadow-elegant p-12 text-center">
              <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-playfair font-bold text-foreground mb-2">
                {language === 'pl' ? 'Nie znaleziono wyników' : 'No results found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === 'pl' 
                  ? 'Spróbuj zmienić zapytanie wyszukiwania lub przeglądaj wszystkie FAQ.'
                  : 'Try changing your search query or browse all FAQs.'}
              </p>
              <Button onClick={() => setSearchQuery('')} variant="outline">
                {language === 'pl' ? 'Wyczyść Wyszukiwanie' : 'Clear Search'}
              </Button>
            </Card>
          )}
        </div>

        {/* Contact CTA */}
        <Card className="mt-12 bg-primary/5 border-primary/20 shadow-elegant max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-playfair font-bold text-foreground mb-3">
              {language === 'pl' ? 'Nadal potrzebujesz pomocy?' : 'Still need help?'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'pl'
                ? 'Nie możesz znaleźć odpowiedzi na swoje pytanie? Nasz zespół wsparcia jest tutaj, aby pomóc!'
                : 'Can\'t find the answer to your question? Our support team is here to help!'}
            </p>
            <Button asChild size="lg" className="shadow-luxury">
              <Link to="/contact">{t('contactUs')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      </main>
    </>
  );
};

export default FAQ;
