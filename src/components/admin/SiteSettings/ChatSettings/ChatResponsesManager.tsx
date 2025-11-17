import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Save, Trash2, MessageSquare, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatResponse {
  id: string;
  category: string;
  trigger_keywords_en: string[];
  trigger_keywords_pl: string[];
  response_en: string;
  response_pl: string;
  display_order: number;
  is_active: boolean;
  is_default: boolean;
}

const ChatResponsesManager = () => {
  const { language } = useLanguage();
  const [responses, setResponses] = useState<ChatResponse[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    trigger_keywords_en: "",
    trigger_keywords_pl: "",
    response_en: "",
    response_pl: "",
    is_active: true,
  });

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    const { data, error } = await supabase
      .from("chat_responses" as any)
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      setResponses(data as any);
    }
  };

  const handleSave = async () => {
    if (!formData.category || !formData.response_en || !formData.response_pl) {
      toast.error(language === 'pl' ? 'Wypełnij wszystkie pola' : 'Fill all fields');
      return;
    }

    const payload = {
      category: formData.category,
      trigger_keywords_en: formData.trigger_keywords_en.split(',').map(k => k.trim()).filter(Boolean),
      trigger_keywords_pl: formData.trigger_keywords_pl.split(',').map(k => k.trim()).filter(Boolean),
      response_en: formData.response_en,
      response_pl: formData.response_pl,
      is_active: formData.is_active,
      display_order: responses.length + 1,
    };

    if (editingId) {
      const { error } = await supabase
        .from("chat_responses" as any)
        .update(payload)
        .eq("id", editingId);

      if (error) {
        toast.error(language === 'pl' ? 'Błąd aktualizacji' : 'Update error');
        return;
      }
      toast.success(language === 'pl' ? 'Odpowiedź zaktualizowana' : 'Response updated');
    } else {
      const { error } = await supabase
        .from("chat_responses" as any)
        .insert(payload);

      if (error) {
        toast.error(language === 'pl' ? 'Błąd dodawania' : 'Add error');
        return;
      }
      toast.success(language === 'pl' ? 'Odpowiedź dodana' : 'Response added');
    }

    resetForm();
    loadResponses();
  };

  const handleEdit = (response: ChatResponse) => {
    setEditingId(response.id);
    setFormData({
      category: response.category,
      trigger_keywords_en: response.trigger_keywords_en.join(', '),
      trigger_keywords_pl: response.trigger_keywords_pl.join(', '),
      response_en: response.response_en,
      response_pl: response.response_pl,
      is_active: response.is_active,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("chat_responses" as any)
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast.error(language === 'pl' ? 'Błąd usuwania' : 'Delete error');
      return;
    }

    toast.success(language === 'pl' ? 'Odpowiedź usunięta' : 'Response deleted');
    setDeleteId(null);
    loadResponses();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      category: "",
      trigger_keywords_en: "",
      trigger_keywords_pl: "",
      response_en: "",
      response_pl: "",
      is_active: true,
    });
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("chat_responses" as any)
      .update({ is_active: !currentState })
      .eq("id", id);

    if (!error) {
      loadResponses();
      toast.success(language === 'pl' ? 'Status zmieniony' : 'Status changed');
    }
  };

  // Add default responses (can be called manually)
  const addDefaultResponses = async () => {
    const defaultResponses = [
      {
        category: "shipping",
        trigger_keywords_en: ["shipping", "delivery", "shipment", "tracking", "when will my order arrive", "how long does shipping take"],
        trigger_keywords_pl: ["wysyłka", "dostawa", "przesyłka", "śledzenie", "kiedy przyjdzie zamówienie", "ile trwa wysyłka"],
        response_en: "We offer fast and reliable shipping! Standard delivery takes 2-5 business days within Poland and 5-10 business days for international orders. Once your order ships, you'll receive a tracking number via email. For more details, visit our Shipping Policy page or contact us at m5moffice@proton.me",
        response_pl: "Oferujemy szybką i niezawodną wysyłkę! Standardowa dostawa trwa 2-5 dni roboczych w Polsce i 5-10 dni roboczych dla zamówień międzynarodowych. Gdy zamówienie zostanie wysłane, otrzymasz numer śledzenia e-mailem. Więcej szczegółów znajdziesz na stronie Polityki Wysyłki lub skontaktuj się z nami pod adresem m5moffice@proton.me",
        display_order: 100,
        is_active: true,
        is_default: false
      },
      {
        category: "payment",
        trigger_keywords_en: ["payment", "pay", "card", "stripe", "how to pay", "payment methods", "checkout"],
        trigger_keywords_pl: ["płatność", "zapłać", "karta", "jak zapłacić", "metody płatności", "kasa"],
        response_en: "We accept secure payments via Stripe, supporting major credit and debit cards (Visa, Mastercard, American Express). All transactions are encrypted and secure. You can pay in PLN or EUR. If you encounter any payment issues, please contact us at m5moffice@proton.me",
        response_pl: "Przyjmujemy bezpieczne płatności przez Stripe, obsługując główne karty kredytowe i debetowe (Visa, Mastercard, American Express). Wszystkie transakcje są szyfrowane i bezpieczne. Możesz płacić w PLN lub EUR. Jeśli napotkasz jakiekolwiek problemy z płatnością, skontaktuj się z nami pod adresem m5moffice@proton.me",
        display_order: 101,
        is_active: true,
        is_default: false
      },
      {
        category: "returns",
        trigger_keywords_en: ["return", "refund", "exchange", "cancel order", "return policy", "how to return"],
        trigger_keywords_pl: ["zwrot", "zwrot pieniędzy", "wymiana", "anuluj zamówienie", "polityka zwrotów", "jak zwrócić"],
        response_en: "We want you to be completely satisfied with your purchase! You can return unused items within 14 days of delivery for a full refund. Items must be in original packaging. For return requests, please contact us at m5moffice@proton.me with your order number. Visit our Returns & Refunds page for complete details.",
        response_pl: "Chcemy, abyś był w pełni zadowolony z zakupu! Możesz zwrócić nieużywane produkty w ciągu 14 dni od dostawy z pełnym zwrotem kosztów. Produkty muszą być w oryginalnym opakowaniu. Aby złożyć wniosek o zwrot, skontaktuj się z nami pod adresem m5moffice@proton.me z numerem zamówienia. Odwiedź naszą stronę Zwroty i Zwroty Pieniędzy, aby uzyskać szczegółowe informacje.",
        display_order: 102,
        is_active: true,
        is_default: false
      },
      {
        category: "products",
        trigger_keywords_en: ["product", "candle", "fragrance", "scent", "collection", "what products do you have", "custom candles"],
        trigger_keywords_pl: ["produkt", "świeca", "zapach", "kolekcja", "jakie produkty macie", "własne świece"],
        response_en: "We offer a beautiful collection of luxury soy candles in various fragrances inspired by iconic perfumes. Our candles are handcrafted with 100% natural soy wax and wooden wicks. We also offer custom candles where you can personalize your candle with your own fragrance and label. Browse our Shop to see all available products!",
        response_pl: "Oferujemy piękną kolekcję luksusowych świec sojowych w różnych zapachach inspirowanych kultowymi perfumami. Nasze świece są ręcznie robione z 100% naturalnego wosku sojowego i drewnianymi knotami. Oferujemy również własne świece, w których możesz spersonalizować świecę własnym zapachem i etykietą. Przeglądaj nasz Sklep, aby zobaczyć wszystkie dostępne produkty!",
        display_order: 103,
        is_active: true,
        is_default: false
      },
      {
        category: "collections",
        trigger_keywords_en: ["collection", "luxury collection", "romantic", "fresh", "best sellers", "what collections"],
        trigger_keywords_pl: ["kolekcja", "kolekcja luksusowa", "romantyczna", "świeża", "bestsellery", "jakie kolekcje"],
        response_en: "We have several curated collections: Luxury Collection (sophisticated fragrances), Fresh & Clean (energizing scents), Romantic Evening (romantic and cozy), and Best Sellers (our most popular). Each collection offers unique fragrances to match your mood and occasion. Visit our Collections page to explore!",
        response_pl: "Mamy kilka wyselekcjonowanych kolekcji: Kolekcja Luksusowa (wyrafinowane zapachy), Fresh & Clean (energetyzujące zapachy), Romantic Evening (romantyczne i przytulne) oraz Bestsellery (nasze najpopularniejsze). Każda kolekcja oferuje unikalne zapachy dopasowane do Twojego nastroju i okazji. Odwiedź naszą stronę Kolekcje, aby odkryć!",
        display_order: 104,
        is_active: true,
        is_default: false
      },
      {
        category: "spirit_points",
        trigger_keywords_en: ["spirit points", "points", "loyalty", "rewards", "how do i earn points", "badges"],
        trigger_keywords_pl: ["spirit points", "punkty", "lojalność", "nagrody", "jak zdobyć punkty", "odznaki"],
        response_en: "Spirit Points is our loyalty program! Earn points with every purchase, referral, and review. Points can be redeemed for discounts on future orders. You can also earn special badges for various achievements. Check your Dashboard to see your current points balance and available rewards!",
        response_pl: "Spirit Points to nasz program lojalnościowy! Zdobywaj punkty z każdym zakupem, poleceniem i recenzją. Punkty można wymieniać na zniżki przy przyszłych zamówieniach. Możesz również zdobyć specjalne odznaki za różne osiągnięcia. Sprawdź swój Panel, aby zobaczyć aktualny stan punktów i dostępne nagrody!",
        display_order: 105,
        is_active: true,
        is_default: false
      },
      {
        category: "referral",
        trigger_keywords_en: ["referral", "refer a friend", "referral code", "referral link", "how does referral work"],
        trigger_keywords_pl: ["polecenie", "poleć znajomego", "kod polecenia", "link polecenia", "jak działa polecenie"],
        response_en: "Refer a friend and both of you earn rewards! Share your unique referral link or code with friends. When they register using your link, you both receive 100 Spirit Points and they get a 10% discount on their first order (REFERRAL10 coupon). Check your Referrals section in the Dashboard to get your referral link!",
        response_pl: "Poleć znajomego i oboje otrzymacie nagrody! Udostępnij swój unikalny link lub kod polecenia znajomym. Gdy zarejestrują się używając Twojego linku, oboje otrzymacie 100 Spirit Points, a oni otrzymają 10% zniżki na pierwsze zamówienie (kupon REFERRAL10). Sprawdź sekcję Polecenia w Panelu, aby uzyskać swój link polecenia!",
        display_order: 106,
        is_active: true,
        is_default: false
      },
      {
        category: "coupons",
        trigger_keywords_en: ["coupon", "discount", "promo code", "voucher", "how to use coupon", "REFERRAL10"],
        trigger_keywords_pl: ["kupon", "zniżka", "kod promocyjny", "voucher", "jak użyć kuponu", "REFERRAL10"],
        response_en: "You can apply coupons during checkout! Enter your coupon code in the checkout page. Popular coupons include REFERRAL10 (10% off for new referrals) and WELCOME10 (for new customers). Some coupons have usage limits or expiry dates. Check the terms when applying a coupon.",
        response_pl: "Możesz zastosować kupony podczas kasy! Wprowadź swój kod kuponu na stronie kasy. Popularne kupony to REFERRAL10 (10% zniżki dla nowych poleceń) i WELCOME10 (dla nowych klientów). Niektóre kupony mają limity użycia lub daty ważności. Sprawdź warunki przy zastosowaniu kuponu.",
        display_order: 107,
        is_active: true,
        is_default: false
      },
      {
        category: "contact",
        trigger_keywords_en: ["contact", "email", "phone", "address", "how to contact", "support"],
        trigger_keywords_pl: ["kontakt", "email", "telefon", "adres", "jak skontaktować", "wsparcie"],
        response_en: "We're here to help! Contact us via email at m5moffice@proton.me, call us at +48 729877557 (Mon-Fri, 9 AM - 6 PM CET), or visit us at Grzybowska 2/31, 00-131 Warsaw, Poland. We aim to respond within 24-48 hours. You can also use the Contact Form on our website.",
        response_pl: "Jesteśmy tutaj, aby pomóc! Skontaktuj się z nami e-mailem pod adresem m5moffice@proton.me, zadzwoń pod numer +48 729877557 (pon-pt, 9:00-18:00 CET) lub odwiedź nas pod adresem Grzybowska 2/31, 00-131 Warszawa, Polska. Staramy się odpowiadać w ciągu 24-48 godzin. Możesz również skorzystać z Formularza Kontaktowego na naszej stronie.",
        display_order: 108,
        is_active: true,
        is_default: false
      },
      {
        category: "custom_candles",
        trigger_keywords_en: ["custom candle", "personalize", "custom fragrance", "personalized label", "make your own candle"],
        trigger_keywords_pl: ["własna świeca", "personalizuj", "własny zapach", "personalizowana etykieta", "stwórz własną świecę"],
        response_en: "Yes! We offer custom candles where you can create a unique candle tailored to your preferences. Choose your fragrance (or describe a custom one), add a personalized label with a message (up to 50 characters), and select the quantity. Perfect for gifts or special occasions! Visit our Custom Candles page to create yours.",
        response_pl: "Tak! Oferujemy własne świece, w których możesz stworzyć unikalną świecę dopasowaną do swoich preferencji. Wybierz swój zapach (lub opisz własny), dodaj spersonalizowaną etykietę z wiadomością (do 50 znaków) i wybierz ilość. Idealne na prezenty lub specjalne okazje! Odwiedź naszą stronę Własne Świece, aby stworzyć swoją.",
        display_order: 109,
        is_active: true,
        is_default: false
      },
      {
        category: "order_status",
        trigger_keywords_en: ["order status", "where is my order", "order tracking", "check order", "order number"],
        trigger_keywords_pl: ["status zamówienia", "gdzie jest moje zamówienie", "śledzenie zamówienia", "sprawdź zamówienie", "numer zamówienia"],
        response_en: "To check your order status, log in to your Dashboard and go to the Orders section. You'll see all your orders with their current status (Pending, Paid, Complete, Shipped, etc.). If your order has shipped, you'll find the tracking number there. You can also contact us at m5moffice@proton.me with your order number for assistance.",
        response_pl: "Aby sprawdzić status zamówienia, zaloguj się do Panelu i przejdź do sekcji Zamówienia. Zobaczysz wszystkie swoje zamówienia z ich aktualnym statusem (Oczekujące, Opłacone, Zrealizowane, Wysłane itp.). Jeśli zamówienie zostało wysłane, znajdziesz tam numer śledzenia. Możesz również skontaktować się z nami pod adresem m5moffice@proton.me z numerem zamówienia w celu uzyskania pomocy.",
        display_order: 110,
        is_active: true,
        is_default: false
      },
      {
        category: "privacy",
        trigger_keywords_en: ["privacy", "privacy policy", "data protection", "gdpr", "personal data"],
        trigger_keywords_pl: ["prywatność", "polityka prywatności", "ochrona danych", "rodo", "dane osobowe"],
        response_en: "We take your privacy seriously! We only collect necessary data for order processing and service improvement. Your data is securely stored and never shared with third parties without your consent. We comply with GDPR regulations. You can read our full Privacy Policy on our website. For questions about data handling, contact us at m5moffice@proton.me",
        response_pl: "Traktujemy Twoją prywatność poważnie! Zbieramy tylko niezbędne dane do przetwarzania zamówień i ulepszania usług. Twoje dane są bezpiecznie przechowywane i nigdy nie udostępniane osobom trzecim bez Twojej zgody. Przestrzegamy przepisów RODO. Możesz przeczytać naszą pełną Politykę Prywatności na naszej stronie. W przypadku pytań dotyczących przetwarzania danych, skontaktuj się z nami pod adresem m5moffice@proton.me",
        display_order: 111,
        is_active: true,
        is_default: false
      },
      {
        category: "newsletter",
        trigger_keywords_en: ["newsletter", "subscribe", "email updates", "unsubscribe", "marketing emails"],
        trigger_keywords_pl: ["newsletter", "zapisz się", "aktualizacje e-mail", "wypisz się", "emaile marketingowe"],
        response_en: "Subscribe to our newsletter to receive exclusive offers, new product announcements, and candle care tips! You can subscribe during registration, in the Contact form, or at the bottom of our homepage. You can unsubscribe at any time by clicking the link in our emails or contacting us. We respect your preferences!",
        response_pl: "Zapisz się do naszego newslettera, aby otrzymywać ekskluzywne oferty, ogłoszenia o nowych produktach i wskazówki dotyczące pielęgnacji świec! Możesz zapisać się podczas rejestracji, w formularzu kontaktowym lub na dole naszej strony głównej. Możesz wypisać się w dowolnym momencie, klikając link w naszych e-mailach lub kontaktując się z nami. Szanujemy Twoje preferencje!",
        display_order: 112,
        is_active: true,
        is_default: false
      },
      {
        category: "ingredients",
        trigger_keywords_en: ["ingredients", "soy wax", "natural", "what are candles made of", "wax type", "wooden wick"],
        trigger_keywords_pl: ["składniki", "wosk sojowy", "naturalny", "z czego są zrobione świece", "typ wosku", "drewniany knot"],
        response_en: "Our candles are made with 100% natural soy wax, which is eco-friendly and burns cleaner than paraffin wax. We use wooden wicks that create a cozy crackling sound. All our fragrances are carefully selected and safe. Our candles are handcrafted with love and care, ensuring each one is unique and of the highest quality.",
        response_pl: "Nasze świece są wykonane z 100% naturalnego wosku sojowego, który jest przyjazny dla środowiska i pali się czyściej niż wosk parafinowy. Używamy drewnianych knotów, które tworzą przytulny trzaskający dźwięk. Wszystkie nasze zapachy są starannie dobrane i bezpieczne. Nasze świece są ręcznie robione z miłością i troską, zapewniając, że każda z nich jest unikalna i najwyższej jakości.",
        display_order: 113,
        is_active: true,
        is_default: false
      },
      {
        category: "gift",
        trigger_keywords_en: ["gift", "gift wrap", "present", "birthday gift", "gift card", "special occasion"],
        trigger_keywords_pl: ["prezent", "opakowanie prezentowe", "prezent", "prezent urodzinowy", "karta podarunkowa", "specjalna okazja"],
        response_en: "Our candles make perfect gifts! You can personalize custom candles with a special message on the label. Unfortunately, we don't currently offer gift wrapping or gift cards, but you can add a personalized touch to custom candles. Perfect for birthdays, anniversaries, holidays, or just to show someone you care!",
        response_pl: "Nasze świece to idealne prezenty! Możesz spersonalizować własne świece specjalną wiadomością na etykiecie. Niestety, obecnie nie oferujemy opakowania prezentowego ani kart podarunkowych, ale możesz dodać spersonalizowany akcent do własnych świec. Idealne na urodziny, rocznice, święta lub po prostu, aby pokazać komuś, że Ci zależy!",
        display_order: 114,
        is_active: true,
        is_default: false
      }
    ];

    try {
      const { error } = await supabase
        .from("chat_responses" as any)
        .insert(defaultResponses);

      if (error) {
        toast.error(language === 'pl' ? 'Błąd dodawania odpowiedzi' : 'Error adding responses');
        return;
      }

      toast.success(language === 'pl' ? `Dodano ${defaultResponses.length} domyślnych odpowiedzi` : `Added ${defaultResponses.length} default responses`);
      loadResponses();
    } catch (error) {
      toast.error(language === 'pl' ? 'Błąd' : 'Error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {language === 'pl' ? 'Jak to działa?' : 'How it works?'}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {language === 'pl' 
                  ? 'Bot będzie wyszukiwać słowa kluczowe w wiadomościach użytkowników i odpowiadać odpowiednią wiadomością. Możesz dodać wiele słów kluczowych oddzielonych przecinkami.'
                  : 'The bot will search for keywords in user messages and respond with the appropriate message. You can add multiple keywords separated by commas.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {editingId 
              ? (language === 'pl' ? 'Edytuj Odpowiedź' : 'Edit Response')
              : (language === 'pl' ? 'Dodaj Nową Odpowiedź' : 'Add New Response')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Kategoria' : 'Category'}</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder={language === 'pl' ? 'np. shipping, orders' : 'e.g. shipping, orders'}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {language === 'pl' ? 'Aktywna' : 'Active'}
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Słowa kluczowe (EN)' : 'Keywords (EN)'}</Label>
            <Input
              value={formData.trigger_keywords_en}
              onChange={(e) => setFormData({ ...formData, trigger_keywords_en: e.target.value })}
              placeholder="shipping, delivery, send"
            />
            <p className="text-xs text-muted-foreground">
              {language === 'pl' ? 'Oddziel przecinkami' : 'Separate with commas'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Słowa kluczowe (PL)' : 'Keywords (PL)'}</Label>
            <Input
              value={formData.trigger_keywords_pl}
              onChange={(e) => setFormData({ ...formData, trigger_keywords_pl: e.target.value })}
              placeholder="wysyłka, dostawa, wysłać"
            />
          </div>

          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Odpowiedź (EN)' : 'Response (EN)'}</Label>
            <Textarea
              value={formData.response_en}
              onChange={(e) => setFormData({ ...formData, response_en: e.target.value })}
              rows={6}
              placeholder="Enter the bot response in English..."
            />
          </div>

          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Odpowiedź (PL)' : 'Response (PL)'}</Label>
            <Textarea
              value={formData.response_pl}
              onChange={(e) => setFormData({ ...formData, response_pl: e.target.value })}
              rows={6}
              placeholder="Wpisz odpowiedź bota po polsku..."
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {editingId 
                ? (language === 'pl' ? 'Zapisz' : 'Save')
                : (language === 'pl' ? 'Dodaj' : 'Add')}
            </Button>
            {editingId && (
              <Button onClick={resetForm} variant="outline">
                {language === 'pl' ? 'Anuluj' : 'Cancel'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Responses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {language === 'pl' ? 'Zapisane Odpowiedzi' : 'Saved Responses'}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addDefaultResponses}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {language === 'pl' ? 'Dodaj Domyślne Odpowiedzi' : 'Add Default Responses'}
          </Button>
        </div>
        {responses.map((response) => (
          <Card key={response.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1 w-full space-y-3 sm:space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={response.is_default ? "default" : "secondary"}>
                      {response.category}
                    </Badge>
                    {response.is_default && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                        {language === 'pl' ? 'Domyślna' : 'Default'}
                      </Badge>
                    )}
                    <Badge variant={response.is_active ? "default" : "destructive"}>
                      {response.is_active 
                        ? (language === 'pl' ? 'Aktywna' : 'Active')
                        : (language === 'pl' ? 'Nieaktywna' : 'Inactive')}
                    </Badge>
                  </div>

                  <div className="text-sm w-full">
                    <p className="font-medium text-muted-foreground mb-1">
                      {language === 'pl' ? 'Słowa kluczowe:' : 'Keywords:'}
                    </p>
                    <div className="px-2 sm:px-0">
                      <p className="text-xs break-words">
                        EN: {response.trigger_keywords_en.join(', ') || '-'}
                      </p>
                      <p className="text-xs break-words">
                        PL: {response.trigger_keywords_pl.join(', ') || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm space-y-3 w-full">
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">
                        {language === 'pl' ? 'Odpowiedź:' : 'Response:'}
                      </p>
                      
                      {/* English Response Preview */}
                      <div className="mb-3 px-2 sm:px-0">
                        <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
                          {language === 'pl' ? 'Odpowiedź angielska' : 'English Response'}
                        </Label>
                        <p className="text-xs whitespace-pre-wrap bg-muted/50 p-3 rounded-md border border-border/50 break-words">
                          {response.response_en || '-'}
                        </p>
                      </div>

                      {/* Polish Response Preview */}
                      <div className="px-2 sm:px-0">
                        <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
                          {language === 'pl' ? 'Odpowiedź polska' : 'Polish Response'}
                        </Label>
                        <p className="text-xs whitespace-pre-wrap bg-muted/50 p-3 rounded-md border border-border/50 break-words">
                          {response.response_pl || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(response.id, response.is_active)}
                  >
                    {response.is_active 
                      ? (language === 'pl' ? 'Wyłącz' : 'Disable')
                      : (language === 'pl' ? 'Włącz' : 'Enable')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(response)}
                  >
                    {language === 'pl' ? 'Edytuj' : 'Edit'}
                  </Button>
                  {!response.is_default && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(response.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'pl' ? 'Czy na pewno?' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'pl' 
                ? 'Ta akcja nie może być cofnięta. Odpowiedź zostanie trwale usunięta.'
                : 'This action cannot be undone. The response will be permanently deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'pl' ? 'Anuluj' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {language === 'pl' ? 'Usuń' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatResponsesManager;