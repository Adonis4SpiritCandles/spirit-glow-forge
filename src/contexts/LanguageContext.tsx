import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Language = 'en' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored === 'pl' || stored === 'en') ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    // Navigation
    if (key === 'home') return language === 'pl' ? 'Strona główna' : 'Home';
    if (key === 'shop') return language === 'pl' ? 'Sklep' : 'Shop';
    if (key === 'collections') return language === 'pl' ? 'Kolekcje' : 'Collections';
    if (key === 'about') return language === 'pl' ? 'O nas' : 'About';
    if (key === 'contact') return language === 'pl' ? 'Kontakt' : 'Contact';
    if (key === 'cart') return language === 'pl' ? 'Koszyk' : 'Cart';
    if (key === 'login') return language === 'pl' ? 'Zaloguj się' : 'Login';
    if (key === 'register') return language === 'pl' ? 'Zarejestruj się' : 'Register';
    if (key === 'logout') return language === 'pl' ? 'Wyloguj' : 'Logout';
    if (key === 'dashboard') return language === 'pl' ? 'Panel' : 'Dashboard';
    if (key === 'search') return language === 'pl' ? 'Szukaj' : 'Search';
    if (key === 'wishlist') return language === 'pl' ? 'Lista życzeń' : 'Wishlist';
    if (key === 'myOrders') return language === 'pl' ? 'Moje zamówienia' : 'My Orders';
    if (key === 'admin') return language === 'pl' ? 'Panel Administracyjny' : 'Admin Dashboard';

    // Hero Section
    if (key === 'rebornYourNature') return language === 'pl' ? 'Reborn Your Nature' : 'Reborn Your Nature';
    if (key === 'heroDescription') return language === 'pl' ? 'Odkryj luksusowe świece sojowe ręcznie wykonane z pasją. Każda świeca to podróż do spokoju i harmonii.' : 'Discover luxurious soy candles handcrafted with passion. Each candle is a journey to peace and harmony.';
    if (key === 'shopCollection') return language === 'pl' ? 'Kup Kolekcję' : 'Shop Collection';
    if (key === 'learnOurStory') return language === 'pl' ? 'Poznaj naszą historię' : 'Learn Our Story';
    if (key === 'featuredCollection') return language === 'pl' ? 'Polecane Kolekcje' : 'Featured Collection';
    if (key === 'featuredCollectionDescription') return language === 'pl' ? 'Odkryj naszą wyselekcjonowaną kolekcję luksusowych świec sojowych' : 'Discover our handpicked selection of premium soy candles';
    if (key === 'exploreFullCollection') return language === 'pl' ? 'Zobacz Pełną Kolekcję' : 'Explore Full Collection';

    // Footer
    if (key === 'brandDescription') return language === 'pl' ? 'SPIRIT CANDLES - Luksusowe świece sojowe ręcznie wykonane dla Twojego spokoju i harmonii.' : 'SPIRIT CANDLES - Luxury soy candles handcrafted for your peace and harmony.';
    if (key === 'allCandles') return language === 'pl' ? 'Wszystkie świece' : 'All Candles';
    if (key === 'newArrivals') return language === 'pl' ? 'Nowości' : 'New Arrivals';
    if (key === 'bestSellers') return language === 'pl' ? 'Bestsellery' : 'Best Sellers';
    if (key === 'supportSection') return language === 'pl' ? 'Wsparcie' : 'Support';
    if (key === 'contactUs') return language === 'pl' ? 'Skontaktuj się z nami' : 'Contact Us';
    if (key === 'aboutUs') return language === 'pl' ? 'O nas' : 'About Us';
    if (key === 'legal') return language === 'pl' ? 'Informacje prawne' : 'Legal';
    if (key === 'cookiePolicy') return language === 'pl' ? 'Polityka plików cookie' : 'Cookie Policy';
    if (key === 'shippingAndReturns') return language === 'pl' ? 'Dostawa i zwroty' : 'Shipping & Returns';
    if (key === 'legalNotice') return language === 'pl' ? 'Nota prawna' : 'Legal Notice';
    if (key === 'accessibility') return language === 'pl' ? 'Dostępność' : 'Accessibility';
    if (key === 'dataRequest') return language === 'pl' ? 'Wniosek o dane' : 'Data Request';
    if (key === 'privacyRegistration') return language === 'pl' ? 'Polityka prywatności rejestracji' : 'Privacy Registration';
    if (key === 'allNotices') return language === 'pl' ? 'Wszystkie informacje' : 'All Notices';
    if (key === 'manageCookies') return language === 'pl' ? 'Zarządzaj ciasteczkami' : 'Manage Cookies';
    if (key === 'manageCookiePreferences') return language === 'pl' ? 'Zarządzaj preferencjami plików cookie' : 'Manage cookie preferences';
    if (key === 'availableInLanguages') return language === 'pl' ? 'Dostępne w języku polskim i angielskim' : 'Available in Polish and English';
    if (key === 'designedBy') return language === 'pl' ? 'Zaprojektowane i stworzone z ❤️ miłością i pasją' : 'Designed and created with ❤️ love and passion';
    if (key === 'by') return language === 'pl' ? 'przez' : 'by';
    if (key === 'inspirationNotice') return language === 'pl' ? 'Inspiracja' : 'Inspiration';
    if (key === 'inspirationNoticeText') return language === 'pl' ? 'Wszystkie produkty Spirit Candles są inspirowane popularnymi zapachami znanych marek, ale nie są z nimi powiązane.' : 'All Spirit Candles products are inspired by popular fragrances from well-known brands but are not affiliated with them.';
    if (key === 'independentBrand') return language === 'pl' ? 'Spirit Candles jest niezależną marką firmy M5M Limited' : 'Spirit Candles is an independent brand of M5M Limited';
    if (key === 'inspirationNoticeFooter') return language === 'pl' ? 'Inspiracja: Wszystkie produkty Spirit Candles są inspirowane popularnymi zapachami znanych marek, ale nie są z nimi powiązane.' : 'Inspiration: All Spirit Candles products are inspired by popular fragrances from well-known brands but are not affiliated with them.';
    if (key === 'notAffiliatedDisclaimer') return language === 'pl' ? 'Spirit Candles to niezależna marka. Nie jesteśmy powiązani z żadnymi znakami towarowymi wspomnianych marek.' : 'Spirit Candles is an independent brand. We are not affiliated with any trademarks of the mentioned brands.';

    // Product Cards & Shopping
    if (key === 'viewProduct') return language === 'pl' ? 'Zobacz produkt' : 'View Product';
    if (key === 'addToCart') return language === 'pl' ? 'Dodaj do koszyka' : 'Add to Cart';
    if (key === 'inspiredBy') return language === 'pl' ? 'Inspirowane przez' : 'Inspired by';

    // Cart Sidebar
    if (key === 'shoppingCart') return language === 'pl' ? 'Koszyk' : 'Shopping Cart';
    if (key === 'emptyCart') return language === 'pl' ? 'Twój koszyk jest pusty' : 'Your cart is empty';
    if (key === 'addSomeCandles') return language === 'pl' ? 'Dodaj piękne świece do swojego koszyka' : 'Add some beautiful candles to your cart';
    if (key === 'browseCollection') return language === 'pl' ? 'Przeglądaj kolekcję' : 'Browse Collection';
    if (key === 'subtotal') return language === 'pl' ? 'Suma częściowa' : 'Subtotal';
    if (key === 'items') return language === 'pl' ? 'produktów' : 'items';
    if (key === 'checkoutNow') return language === 'pl' ? 'Przejdź do kasy' : 'Checkout Now';
    if (key === 'viewFullCart') return language === 'pl' ? 'Zobacz pełny koszyk' : 'View Full Cart';

    // Product Detail
    if (key === 'trimWickBefore') return language === 'pl' ? 'Przytnij knot do 5mm przed każdym użyciem' : 'Trim wick to 5mm before each use';
    if (key === 'burnFirstTime') return language === 'pl' ? 'Pal przez 2-3 godziny przy pierwszym użyciu' : 'Burn for 2-3 hours on first use';
    if (key === 'neverLeaveUnattended') return language === 'pl' ? 'Nigdy nie zostawiaj bez nadzoru' : 'Never leave unattended';
    if (key === 'productNotFound') return language === 'pl' ? 'Produkt nie znaleziony' : 'Product Not Found';
    if (key === 'returnToShop') return language === 'pl' ? 'Wróć do sklepu' : 'Return to Shop';
    if (key === 'addedToCart') return language === 'pl' ? 'Dodano do koszyka' : 'Added to Cart';
    if (key === 'shared') return language === 'pl' ? 'Udostępniono' : 'Shared';
    if (key === 'productShared') return language === 'pl' ? 'Produkt został udostępniony' : 'Product has been shared';
    if (key === 'linkCopied') return language === 'pl' ? 'Link skopiowany' : 'Link Copied';
    if (key === 'productLinkCopied') return language === 'pl' ? 'Link do produktu został skopiowany' : 'Product link copied to clipboard';
    if (key === 'backToShop') return language === 'pl' ? 'Powrót do sklepu' : 'Back to Shop';

    // Admin Dashboard
    if (key === 'adminDashboard') return language === 'pl' ? 'Panel ADMINISTRATORA' : 'ADMIN Dashboard';
    if (key === 'manageProductInventory') return language === 'pl' ? 'Zarządzaj swoim asortymentem' : 'Manage your product inventory';
    if (key === 'manageCustomerOrders') return language === 'pl' ? 'Zarządzaj zamówieniami klientów i wysyłką' : 'Manage customer orders and shipping';
    if (key === 'addProduct') return language === 'pl' ? 'Dodaj produkt' : 'Add Product';
    if (key === 'editProductTitle') return language === 'pl' ? 'Edytuj produkt' : 'Edit Product';
    if (key === 'addNewProduct') return language === 'pl' ? 'Dodaj nowy produkt' : 'Add New Product';
    if (key === 'dataType') return language === 'pl' ? 'Typ danych' : 'Data Type';
    if (key === 'format') return language === 'pl' ? 'Format' : 'Format';
    if (key === 'exportOrdersCsv') return language === 'pl' ? 'Eksportuj zamówienia jako CSV' : 'Export Orders as CSV';
    if (key === 'warehouse') return language === 'pl' ? 'Magazyn' : 'Warehouse';
    if (key === 'coupons') return language === 'pl' ? 'Kupony' : 'Coupons';
    if (key === 'export') return language === 'pl' ? 'Eksport' : 'Export';
    if (key === 'siteSettings') return language === 'pl' ? 'Ustawienia Strony' : 'Site Settings';
    if (key === 'socialMedia') return language === 'pl' ? 'Media Społecznościowe' : 'Social Media';
    if (key === 'referralsRewards') return language === 'pl' ? 'Polecenia i Nagrody' : 'Referrals & Rewards';
    if (key === 'monthlyOrders') return language === 'pl' ? 'Miesięczne zamówienia' : 'Monthly Orders';
    if (key === 'salesByCategory') return language === 'pl' ? 'Sprzedaż według kategorii' : 'Sales by Category';
    if (key === 'monthlyRevenue') return language === 'pl' ? 'Miesięczny przychód' : 'Monthly Revenue';
    if (key === 'fromLastMonth') return language === 'pl' ? 'od ostatniego miesiąca' : 'from last month';
    if (key === 'resetDemoOrders') return language === 'pl' ? 'Zresetuj WSZYSTKIE zamówienia' : 'Reset ALL Orders';
    if (key === 'resetDemoOrdersConfirm') return language === 'pl' ? 'Czy na pewno chcesz usunąć wszystkie zamówienia i zresetować numerację? Tej operacji nie można cofnąć.' : 'Are you sure you want to delete all orders and reset the order number sequence? This action cannot be undone.';
    if (key === 'resettingOrders') return language === 'pl' ? 'Resetowanie zamówień...' : 'Resetting orders...';
    if (key === 'ordersResetSuccess') return language === 'pl' ? 'Wszystkie zamówienia demo zostały usunięte' : 'All demo orders have been deleted successfully';
    if (key === 'ordersResetError') return language === 'pl' ? 'Nie udało się zresetować zamówień' : 'Failed to reset orders';
    if (key === 'excludeFromStats') return language === 'pl' ? 'Wyklucz ze statystyk' : 'Exclude from statistics';
    if (key === 'includeInStats') return language === 'pl' ? 'Uwzględnij w statystykach' : 'Include in statistics';
    if (key === 'statsControl') return language === 'pl' ? 'Kontrola statystyk' : 'Stats Control';
    if (key === 'statsUpdated') return language === 'pl' ? 'Statystyki zaktualizowane' : 'Statistics updated';
    if (key === 'reset') return language === 'pl' ? 'Resetuj' : 'Reset';
    if (key === 'sync') return language === 'pl' ? 'Sync' : 'Sync';
    if (key === 'newOrderNotification') return language === 'pl' ? 'Otrzymano nowe zamówienie!' : 'New order received!';
    if (key === 'viewInDashboard') return language === 'pl' ? 'Zobacz w panelu' : 'View in Dashboard';
    if (key === 'shippingInfo') return language === 'pl' ? 'Informacje o wysyłce' : 'Shipping Info';
    if (key === 'newOrdersToConfirm') return language === 'pl' ? 'Nowe zamówienia do potwierdzenia' : 'New orders to confirm';
    if (key === 'youHaveXOrders') return language === 'pl' ? 'Masz {count} zamówień oczekujących na potwierdzenie' : 'You have {count} orders awaiting confirmation';
    if (key === 'goToAdminDashboard') return language === 'pl' ? 'Przejdź do panelu ADMINISTRATORA' : 'Go to ADMIN Dashboard';
    if (key === 'viewNewOrders') return language === 'pl' ? 'Zobacz Nowe Zamówienia' : 'View New Orders';
    if (key === 'markAllAsSeen') return language === 'pl' ? 'Oznacz WSZYSTKIE jako widoczne' : 'Mark ALL as Seen';
    if (key === 'newOrder') return language === 'pl' ? 'Nowe Zamówienie' : 'New Order';
    if (key === 'orderReceived') return language === 'pl' ? 'Zamówienie otrzymano' : 'Order received';
    if (key === 'orderBeingPrepared') return language === 'pl' ? 'Twoje zamówienie jest przygotowywane' : 'Your order is being prepared';
    if (key === 'trackingAvailable') return language === 'pl' ? 'Numer śledzenia dostępny' : 'Tracking available';
    if (key === 'trackYourOrder') return language === 'pl' ? 'Śledź swoje Zamówienie' : 'Track your Order';
    if (key === 'orderConfirmedAndPreparing') return language === 'pl' ? 'Zamówienie potwierdzone i jest przygotowywane do wysyłki' : 'Order confirmed and being prepared for shipment';
    if (key === 'youWillReceiveTracking') return language === 'pl' ? 'Otrzymasz kolejnego e-maila z numerem śledzenia, gdy zamówienie zostanie wysłane' : 'You will receive another email with tracking number when your order is Shipped';
    if (key === 'orderHasBeenShipped') return language === 'pl' ? 'Twoje Zamówienie zostało wysłane!' : 'Your Order has been shipped!';
    if (key === 'trackingNumber') return language === 'pl' ? 'Numer śledzenia' : 'Tracking Number';

    // Shipping Legend & Statuses
    if (key === 'shippingStatusLegend') return language === 'pl' ? 'Legenda statusu wysyłki' : 'Shipping Status Legend';
    if (key === 'shippingStatusInfo') return language === 'pl' ? 'Poniżej znajdziesz wyjaśnienia dla statusów Twojego zamówienia.' : 'Below are explanations for your order statuses.';
    if (key === 'paid') return language === 'pl' ? 'Opłacone' : 'Paid';
    if (key === 'pending') return language === 'pl' ? 'Oczekujące' : 'Pending';
    if (key === 'awaitingConfirm') return language === 'pl' ? 'Oczekuje na Potwierdzenie' : 'Awaiting Confirm';
    if (key === 'complete') return language === 'pl' ? 'Ukończone' : 'Complete';
    if (key === 'awaitingShipping') return language === 'pl' ? 'Oczekuje na Wysyłkę' : 'Awaiting Shipping';
    if (key === 'shipped') return language === 'pl' ? 'Wysłane' : 'Shipped';
    if (key === 'inTransit') return language === 'pl' ? 'W Drodze' : 'In Transit';
    if (key === 'awaitingPickup') return language === 'pl' ? 'Oczekuje na odbiór' : 'Awaiting Pickup';
    if (key === 'issue') return language === 'pl' ? 'Problem' : 'Issue';
    if (key === 'statusPaidDesc') return language === 'pl' ? 'Zamówienie opłacone i oczekuje na potwierdzenie' : 'Order has been paid and awaiting confirmation';
    if (key === 'statusAwaitingConfirmDesc') return language === 'pl' ? 'Oczekiwanie na akceptację zamówienia przez admina' : 'Waiting for admin to accept the order';
    if (key === 'statusCompleteDesc') return language === 'pl' ? 'Zamówienie zaakceptowane przez admina, w przygotowaniu' : 'Order accepted by admin, being prepared';
    if (key === 'statusAwaitingShippingDesc') return language === 'pl' ? 'Paczka gotowa, oczekuje na odbiór przez kuriera' : 'Package ready, waiting for carrier pickup';
    if (key === 'statusShippedDesc') return language === 'pl' ? 'Paczka została wysłana' : 'Package has been shipped';
    if (key === 'statusInTransitDesc') return language === 'pl' ? 'Paczka w drodze do Ciebie' : 'Package is on the way to you';
    if (key === 'statusAwaitingPickupDesc') return language === 'pl' ? 'Paczka przygotowana i oczekuje na odbiór przez przewoźnika.' : 'Parcel prepared and awaiting carrier pickup.';
    if (key === 'statusIssueDesc') return language === 'pl' ? 'Problem z zamówieniem lub danymi - skontaktuj się z obsługą' : 'Problem with order or data - contact support';
    if (key === 'markAsIssue') return language === 'pl' ? 'Oznacz Problem' : 'Mark Issue';
    if (key === 'removeIssue') return language === 'pl' ? 'Usuń Problem' : 'Remove Issue';
    if (key === 'editProfile') return language === 'pl' ? 'Edytuj Profil' : 'Edit Profile';
    if (key === 'spiritPointsLeaderboard') return language === 'pl' ? 'Ranking Punktów Spirit' : 'Spirit Points Leaderboard';
    if (key === 'yourPoints') return language === 'pl' ? 'Twoje Punkty' : 'Your Points';
    if (key === 'nextRewardProgress') return language === 'pl' ? 'Postęp Do Następnej Nagrody' : 'Next Reward Progress';
    if (key === 'purchasedProducts') return language === 'pl' ? 'Zakupione Produkty' : 'Purchased Products';
    
    // Admin Dashboard - Additional translations
    if (key === 'exclude') return language === 'pl' ? 'Wykluczyć' : 'Exclude';
    if (key === 'excludeFromStat') return language === 'pl' ? 'Wyklucz ze STAT' : 'Exclude from STAT';
    if (key === 'restoreInStat') return language === 'pl' ? 'Przywróć do STAT' : 'Restore in STAT';
    if (key === 'resetAllOrders') return language === 'pl' ? 'Resetuj wszystkie zamówienia' : 'Reset All Orders';
    if (key === 'syncTrackingNum') return language === 'pl' ? 'Sync numer śledzenia' : 'Sync Tracking Num.';

    // Checkout & Payment
    if (key === 'checkout') return language === 'pl' ? 'Kasa' : 'Checkout';
    if (key === 'calculatedNext') return language === 'pl' ? 'Obliczane w następnym kroku' : 'Calculated next';
    if (key === 'backToCart') return language === 'pl' ? 'Powrót do koszyka' : 'Back to Cart';
    if (key === 'deliveryAddress') return language === 'pl' ? 'Adres dostawy' : 'Delivery Address';
    if (key === 'changeAddress') return language === 'pl' ? 'Zmień adres' : 'Change Address';
    if (key === 'iAcceptTerms') return language === 'pl' ? 'Akceptuję' : 'I accept';
    if (key === 'termsOfSale') return language === 'pl' ? 'Regulamin Sprzedaży' : 'Terms of Sale';
    if (key === 'shippingOptions') return language === 'pl' ? 'Opcje wysyłki' : 'Shipping Options';
    if (key === 'streetAddress') return language === 'pl' ? 'Ulica' : 'Street Address';
    if (key === 'postalCode') return language === 'pl' ? 'Kod pocztowy' : 'Postal Code';
    if (key === 'city') return language === 'pl' ? 'Miasto' : 'City';
    if (key === 'calculateShipping') return language === 'pl' ? 'Oblicz opcje wysyłki' : 'Calculate Shipping Options';
    if (key === 'orderItems') return language === 'pl' ? 'Produkty w zamówieniu' : 'Order Items';
    if (key === 'standardDelivery') return language === 'pl' ? 'Dostawa standardowa' : 'Standard Delivery';
    if (key === 'selectedShipping') return language === 'pl' ? 'Wybrana wysyłka' : 'Selected Shipping';
    if (key === 'confirmAndProceed') return language === 'pl' ? 'Potwierdź i przejdź do płatności' : 'Confirm and Proceed to Payment';
    if (key === 'apartmentNumber') return language === 'pl' ? 'Mieszkanie (Opcj.)' : 'Apartment (Opt.)';
    if (key === 'orderSummary') return language === 'pl' ? 'Podsumowanie zamówienia' : 'Order Summary';
    
    // Payment Success
    if (key === 'paymentSuccessful') return language === 'pl' ? 'Płatność udana!' : 'Payment Successful!';
    if (key === 'orderConfirmation') return language === 'pl' ? 'Dziękujemy za zamówienie! Otrzymasz wkrótce email z potwierdzeniem.' : 'Thank you for your order! You will receive a confirmation email shortly.';
    if (key === 'sessionId') return language === 'pl' ? 'ID sesji' : 'Session ID';
    if (key === 'continueShopping') return language === 'pl' ? 'Kontynuuj zakupy' : 'Continue Shopping';
    if (key === 'viewOrders') return language === 'pl' ? 'Zobacz zamówienia' : 'View Orders';
    if (key === 'emailConfirmation') return language === 'pl' ? 'Sprawdź swoją skrzynkę pocztową, aby uzyskać szczegóły zamówienia.' : 'Check your email for order details.';

    // Search

    if (key === 'searchPlaceholder') return language === 'pl' ? 'Wyszukaj produkty' : 'Search for products';

    // Multiple Collections
    if (key === 'multipleAllowed') return language === 'pl' ? 'Wiele dozwolone' : 'Multiple allowed';
    if (key === 'selectMultipleCollections') return language === 'pl' ? 'Wybierz jedną lub więcej kolekcji dla tego produktu' : 'Select one or more collections for this product';
    if (key === 'preferredCardTag') return language === 'pl' ? 'Preferowany Tag na Karcie' : 'Preferred Card Tag';
    if (key === 'preferredCardTagDesc') return language === 'pl' ? 'Wybierz, czy wyświetlać kategorię czy kolekcję na kartach produktów' : 'Choose whether to display category or collection on product cards';
    if (key === 'showCategory') return language === 'pl' ? 'Pokaż Kategorię' : 'Show Category';
    if (key === 'showCollection') return language === 'pl' ? 'Pokaż Kolekcję' : 'Show Collection';
    
    // Upload Images
    if (key === 'uploadProfilePicture') return language === 'pl' ? 'Prześlij Zdjęcie Profilowe' : 'Upload Profile Picture';
    if (key === 'uploadCoverImage') return language === 'pl' ? 'Prześlij Obraz Okładki' : 'Upload Cover Image';
    if (key === 'adjustYourImage') return language === 'pl' ? 'Dostosuj Swój Obraz' : 'Adjust Your Image';
    if (key === 'dragToMove') return language === 'pl' ? 'Przeciągnij, aby przesunąć' : 'Drag to move';
    if (key === 'scrollToZoom') return language === 'pl' ? 'Przewiń lub użyj suwaka, aby powiększyć' : 'Scroll or use slider to zoom';
    if (key === 'saveImage') return language === 'pl' ? 'Zapisz Obraz' : 'Save Image';
    
    // Comments
    if (key === 'writeAReply') return language === 'pl' ? 'Napisz odpowiedź...' : 'Write a reply...';
    if (key === 'send') return language === 'pl' ? 'Wyślij' : 'Send';
    if (key === 'reply') return language === 'pl' ? 'Odpowiedz' : 'Reply';
    if (key === 'replyTo') return language === 'pl' ? 'Odpowiedz' : 'Reply to';
    if (key === 'replyAdded') return language === 'pl' ? 'Odpowiedź dodana' : 'Reply added';
    if (key === 'commentDeleted') return language === 'pl' ? 'Komentarz usunięty' : 'Comment deleted';
    if (key === 'page') return language === 'pl' ? 'Strona' : 'Page';
    if (key === 'previous') return language === 'pl' ? 'Poprzednia' : 'Previous';
    if (key === 'next') return language === 'pl' ? 'Następna' : 'Next';
    if (key === 'edit') return language === 'pl' ? 'Edytuj' : 'Edit';
    if (key === 'save') return language === 'pl' ? 'Zapisz' : 'Save';
    if (key === 'cancel') return language === 'pl' ? 'Anuluj' : 'Cancel';
    if (key === 'sendGif') return language === 'pl' ? 'Wyślij GIF' : 'Send GIF';
    if (key === 'searchGifs') return language === 'pl' ? 'Szukaj GIF-ów...' : 'Search GIFs...';

    // Verious Adonis Edit

    if (key === 'careInstructions') return language === 'pl' ? 'Obsługa i Instrukcje' : 'Operation and Instructions';
    if (key === 'sendTrackingEmail') return language === 'pl' ? 'Wyślij użytk. E-Mail z numerem śledzenia' : 'Send E-Mail with tracking number to User';
    if (key === 'sendCompletionEmail') return language === 'pl' ? 'Wyślij E-Mail z potwierdzeniem do użytk.' : 'Send Order Completion E-Mail to User';

    // Toast messages
    if (key === 'addedToCart') return language === 'pl' ? 'Dodano do koszyka' : 'Added to cart';
    if (key === 'removedFromCart') return language === 'pl' ? 'Usunięto z koszyka' : 'Removed from cart';
    if (key === 'quantityUpdated') return language === 'pl' ? 'Zaktualizowano ilość' : 'Quantity updated';
    if (key === 'addedToWishlist') return language === 'pl' ? 'Dodano do ulubionych' : 'Added to wishlist';
    if (key === 'removedFromWishlist') return language === 'pl' ? 'Usunięto z ulubionych' : 'Removed from wishlist';
    if (key === 'error') return language === 'pl' ? 'Błąd' : 'Error';
    if (key === 'success') return language === 'pl' ? 'Sukces' : 'Success';
    if (key === 'processing') return language === 'pl' ? 'Przetwarzanie...' : 'Processing...';
    if (key === 'pleaseTryAgain') return language === 'pl' ? 'Spróbuj ponownie' : 'Please try again';
    
    // Traduzioni aggiunte
    if (key === 'lastModified') return language === 'pl' ? 'Ostatnia Modyfikacja' : 'Last Modified';
    if (key === 'websiteLanguage') return language === 'pl' ? 'Język Witryny' : 'Website Language';
    if (key === 'emailLanguage') return language === 'pl' ? 'Język Emaili' : 'Email Language';
    if (key === 'publicProfile') return language === 'pl' ? 'Profil Publiczny' : 'Public Profile';

    // Admin Dashboard - Additional translations
    if (key === 'loading') return language === 'pl' ? 'Ładowanie...' : 'Loading...';
    if (key === 'accessDenied') return language === 'pl' ? 'Dostęp zabroniony' : 'Access Denied';
    if (key === 'noPermission') return language === 'pl' ? 'Nie masz uprawnień do panelu administratora.' : 'You don\'t have permission to access the admin dashboard.';
    if (key === 'save') return language === 'pl' ? 'Zapisz' : 'Save';
    if (key === 'outOfStock') return language === 'pl' ? 'Brak' : 'Out';
    if (key === 'lowStock') return language === 'pl' ? 'Niski' : 'Low';
    if (key === 'inStock') return language === 'pl' ? 'Dostępny' : 'Available';
    if (key === 'yes') return language === 'pl' ? 'Tak' : 'Yes';
    if (key === 'no') return language === 'pl' ? 'Nie' : 'No';
    if (key === 'published') return language === 'pl' ? 'Opublikowany' : 'Published';
    if (key === 'error') return language === 'pl' ? 'Błąd' : 'Error';
    if (key === 'success') return language === 'pl' ? 'Sukces' : 'Success';
    if (key === 'selectLanguage') return language === 'pl' ? 'Wybierz język' : 'Select a language';
    if (key === 'removed') return language === 'pl' ? 'Usunięto' : 'Removed';
    if (key === 'updated') return language === 'pl' ? 'Zaktualizowano' : 'Updated';
    if (key === 'synced') return language === 'pl' ? 'Zsynchronizowano' : 'Synced';
    if (key === 'syncingAllOrders') return language === 'pl' ? 'Synchronizacja wszystkich zamówień...' : 'Syncing all orders...';
    if (key === 'doneButton') return language === 'pl' ? 'Zrobione' : 'Done';
    if (key === 'syncing') return language === 'pl' ? 'Synchronizacja' : 'Syncing';
    if (key === 'syncTriggered') return language === 'pl' ? 'Synchronizacja uruchomiona' : 'Sync triggered';
    if (key === 'statusPaidDesc') return language === 'pl' ? 'Zamówienie opłacone, wkrótce zostanie przetworzone' : 'Order has been paid and will be processed soon';
    if (key === 'statusShippedDesc') return language === 'pl' ? 'Zamówienie wysłane, możesz je śledzić' : 'Order has been shipped, you can track it';
    if (key === 'statusAwaitingPickupDesc') return language === 'pl' ? 'Paczka gotowa i czeka na odbiór przez przewoźnika' : 'Package is ready and waiting for carrier pickup';
    if (key === 'statusIssueDesc') return language === 'pl' ? 'Problem z zamówieniem lub danymi, skontaktuj się z obsługą' : 'Problem with order or data, contact support';
    if (key === 'paid') return language === 'pl' ? 'Opłacone' : 'Paid';
    if (key === 'pending') return language === 'pl' ? 'Oczekujące' : 'Pending';
    if (key === 'editComment') return language === 'pl' ? 'Edytuj' : 'Edit';
    if (key === 'saveEdit') return language === 'pl' ? 'Zapisz' : 'Save';
    if (key === 'cancelEdit') return language === 'pl' ? 'Anuluj' : 'Cancel';
    if (key === 'replyToReply') return language === 'pl' ? 'Odpowiedz' : 'Reply';
    if (key === 'markAsIssue') return language === 'pl' ? 'Oznacz jako problem' : 'Mark as Issue';
    if (key === 'removeIssue') return language === 'pl' ? 'Usuń problem' : 'Remove Issue';
    if (key === 'orderHasIssues') return language === 'pl' ? 'Oznacz zamówienie jako problematyczne' : 'Mark order as having issues';

    // User Dashboard
    if (key === 'userDashboard') return language === 'pl' ? 'Panel' : 'Dashboard';
    if (key === 'welcomeBack') return language === 'pl' ? 'Witamy ponownie :)' : 'Welcome back :)';
    if (key === 'welcomeBackUser') return language === 'pl' ? 'Witamy ponownie :)' : 'Welcome back :)';
    if (key === 'profile') return language === 'pl' ? 'Profil' : 'Profile';
    if (key === 'orders') return language === 'pl' ? 'Zamówienia' : 'Orders';
    if (key === 'payments') return language === 'pl' ? 'Płatności' : 'Payments';
    if (key === 'settings') return language === 'pl' ? 'Ustawienia' : 'Settings';
    if (key === 'accountSettings') return language === 'pl' ? 'Ustawienia konta' : 'Account Settings';
    
    // Wishlist translations
    if (key === 'myWishlist') return language === 'pl' ? 'Lista Życzeń' : 'My Wishlist';
    if (key === 'alerts') return language === 'pl' ? 'Powiadomienia' : 'Alerts';
    if (key === 'share') return language === 'pl' ? 'Udostępnij' : 'Share';
    if (key === 'item') return language === 'pl' ? 'produkt' : 'item';
    if (key === 'items') return language === 'pl' ? 'produkty' : 'items';
    if (key === 'emptyWishlist') return language === 'pl' ? 'Twoja lista życzeń jest pusta' : 'Your wishlist is empty';
    if (key === 'startAddingFavorites') return language === 'pl' ? 'Zacznij dodawać ulubione produkty' : 'Start adding your favorite products';
    
    // 3D Viewer translations
    if (key === 'waxColor') return language === 'pl' ? 'Kolor Wosku' : 'Wax Color';
    if (key === 'flame') return language === 'pl' ? 'Płomień' : 'Flame';
    if (key === 'autoRotate') return language === 'pl' ? 'Automatyczny Obrót' : 'Auto Rotate';
    
    // Chat translations
    if (key === 'endConversation') return language === 'pl' ? 'Zakończ rozmowę i zamknij czat' : 'End conversation and close chat';
    
    // Coupon and checkout translations
    if (key === 'haveCoupon') return language === 'pl' ? 'Masz kupon?' : 'Have a coupon?';
    if (key === 'enterCouponCode') return language === 'pl' ? 'Wprowadź swój kod kuponu' : 'Enter your coupon code';
    if (key === 'apply') return language === 'pl' ? 'Zastosuj' : 'Apply';
    if (key === 'applying') return language === 'pl' ? 'Zastosowanie...' : 'Applying...';
    if (key === 'couponApplied') return language === 'pl' ? 'Kupon został pomyślnie zastosowany!' : 'Coupon applied successfully!';
    if (key === 'invalidCoupon') return language === 'pl' ? 'Nieprawidłowy lub wygasły kod kuponu' : 'Invalid or expired coupon code';
    if (key === 'couponNotYetValid') return language === 'pl' ? 'Ten kupon nie jest jeszcze ważny' : 'This coupon is not yet valid';
    if (key === 'couponExpired') return language === 'pl' ? 'Ten kupon wygasł' : 'This coupon has expired';
    if (key === 'couponMaxRedemptions') return language === 'pl' ? 'Ten kupon osiągnął limit użycia' : 'This coupon has reached its usage limit';
    if (key === 'couponError') return language === 'pl' ? 'Błąd podczas stosowania kuponu' : 'Error applying coupon';
    if (key === 'checkoutError') return language === 'pl' ? 'Błąd podczas tworzenia sesji zakupu. Spróbuj ponownie.' : 'Error creating checkout session. Please try again.';
    if (key === 'discount') return language === 'pl' ? 'Zniżka' : 'Discount';
    if (key === 'success') return language === 'pl' ? 'Sukces' : 'Success';
    if (key === 'copy') return language === 'pl' ? 'Kopiuj' : 'Copy';
    if (key === 'copied') return language === 'pl' ? 'Skopiowano!' : 'Copied!';
    if (key === 'shippingLegendTitle') return language === 'pl' ? 'Legenda Statusów Wysyłki' : 'Shipping Status Legend';
    if (key === 'shippedSuccessfully') return language === 'pl' ? 'Wysłano Pomyślnie' : 'Shipped Successfully';
    if (key === 'inTransit') return language === 'pl' ? 'W Tranzycie' : 'In Transit';
    if (key === 'awaitingPickup') return language === 'pl' ? 'Oczekuje na Odbiór' : 'Awaiting Pickup';
    if (key === 'collectProblem') return language === 'pl' ? 'Problem z Odbiorem' : 'Collection Problem';
    if (key === 'legendDescription') return language === 'pl' 
      ? 'Poniżej znajdują się możliwe statusy wysyłki dla Twoich zamówień i ich znaczenia.' 
      : 'Below are the possible shipping statuses for your orders and their meanings.';
    
    // SpiritPoints Loyalty System
    if (key === 'spiritPoints') return 'SpiritPoints';
    if (key === 'earnSpiritPoints') return language === 'pl' ? 'Zdobądź SpiritPoints' : 'Earn SpiritPoints';
    if (key === 'yourSpiritPoints') return language === 'pl' ? 'Twoje SpiritPoints' : 'Your SpiritPoints';
    if (key === 'bonusSpiritPoints') return language === 'pl' ? 'Bonusowe SpiritPoints' : 'Bonus SpiritPoints';
    if (key === 'spiritPointsBalance') return language === 'pl' ? 'Saldo SpiritPoints' : 'SpiritPoints Balance';
    if (key === 'totalSpiritPoints') return language === 'pl' ? 'Łącznie SpiritPoints' : 'Total SpiritPoints';
    if (key === 'lifetimeSpiritPoints') return language === 'pl' ? 'SpiritPoints przez całe życie' : 'Lifetime SpiritPoints';
    
    // Review translations
    if (key === 'noReviewsYet') return language === 'pl' ? 'Brak recenzji. Bądź pierwszym!' : 'No reviews yet. Be the first to review!';
    
    // Toast message translations
    if (key === 'loginSuccessTitle') return language === 'pl' ? 'Witamy ponownie!' : 'Welcome back!';
    if (key === 'loginSuccessDesc') return language === 'pl' ? 'Zalogowano pomyślnie.' : 'You have been signed in successfully.';
    if (key === 'orderStatusUpdatedTitle') return language === 'pl' ? 'Status zamówienia zaktualizowany' : 'Order status updated';
    if (key === 'orderStatusUpdatedDesc') return language === 'pl' ? 'Status zamówienia został pomyślnie zaktualizowany.' : 'The order status has been updated successfully.';
    if (key === 'addedToCartTitle') return language === 'pl' ? 'Dodano do koszyka' : 'Added to cart';
    if (key === 'addedToCartDesc') return language === 'pl' ? 'Produkt został dodany do koszyka.' : 'Product has been added to your cart.';
    if (key === 'manageAccountPrefs') return language === 'pl' ? 'Zarządzaj preferencjami swojego konta' : 'Manage your account preferences';
    if (key === 'accountStatus') return language === 'pl' ? 'Status konta' : 'Account Status';
    if (key === 'user') return language === 'pl' ? 'Użytkownik' : 'User';
    if (key === 'preferredLanguage') return language === 'pl' ? 'Preferowany język' : 'Preferred Language';
    if (key === 'choosePreferredLang') return language === 'pl' ? 'Wybierz preferowany język dla e-maili i strony internetowej.' : 'Choose your preferred language for emails and the website.';
    if (key === 'profileInformation') return language === 'pl' ? 'Informacje o profilu' : 'Profile Information';
    if (key === 'viewEditPersonalInfo') return language === 'pl' ? 'Wyświetl i edytuj swoje dane osobowe' : 'View and edit your personal information';
    if (key === 'viewAndEdit') return language === 'pl' ? 'Wyświetl i edytuj swoje dane osobowe' : 'View and edit your personal information';
    if (key === 'firstName') return language === 'pl' ? 'Imię' : 'First Name';
    if (key === 'lastName') return language === 'pl' ? 'Nazwisko' : 'Last Name';
    if (key === 'username') return language === 'pl' ? 'Nazwa użytkownika' : 'Username';
    if (key === 'saveChanges') return language === 'pl' ? 'Zapisz zmiany' : 'Save Changes';
    if (key === 'cancel') return language === 'pl' ? 'Anuluj' : 'Cancel';
    if (key === 'orderHistory') return language === 'pl' ? 'Historia zamówień' : 'Order History';
    if (key === 'viewPastOrders') return language === 'pl' ? 'Zobacz swoje poprzednie zamówienia i ich status' : 'View your past orders and their status';
    if (key === 'orderHistoryDesc') return language === 'pl' ? 'Zobacz swoje poprzednie zamówienia i ich status' : 'View your past orders and their status';
    if (key === 'noOrders') return language === 'pl' ? 'Nie znaleziono zamówień' : 'No orders found';
    if (key === 'editProfile') return language === 'pl' ? 'Edytuj profil' : 'Edit Profile';
    if (key === 'updating') return language === 'pl' ? 'Aktualizowanie...' : 'Updating...';
    if (key === 'shippingInformation') return language === 'pl' ? 'Informacje o wysyłce' : 'Shipping Information';

    // Order Details
    if (key === 'orderDetails') return language === 'pl' ? 'Szczegóły zamówienia' : 'Order Details';
    if (key === 'completeInfoForOrder') return language === 'pl' ? 'Pełne informacje dla zamówienia' : 'Complete information for order';
    if (key === 'orderInformation') return language === 'pl' ? 'Informacje o zamówieniu' : 'Order Information';
    if (key === 'orderId') return language === 'pl' ? 'ID zamówienia' : 'Order ID';
    if (key === 'orderNumber') return language === 'pl' ? 'Numer zamówienia' : 'Order Number';
    if (key === 'date') return language === 'pl' ? 'Data' : 'Date';
    if (key === 'status') return language === 'pl' ? 'Status' : 'Status';
    if (key === 'customerInformation') return language === 'pl' ? 'Informacje o kliencie' : 'Customer Information';
    if (key === 'name') return language === 'pl' ? 'Imię i nazwisko' : 'Name';
    if (key === 'email') return language === 'pl' ? 'E-mail' : 'Email';
    if (key === 'userId') return language === 'pl' ? 'ID użytkownika' : 'User ID';
    if (key === 'role') return language === 'pl' ? 'Rola' : 'Role';
    if (key === 'shippingAddress') return language === 'pl' ? 'Adres wysyłki' : 'Shipping Address';
    if (key === 'phone') return language === 'pl' ? 'Telefon' : 'Phone';
    if (key === 'pricingDetails') return language === 'pl' ? 'Szczegóły cenowe' : 'Pricing Details';
    if (key === 'productsSubtotal') return language === 'pl' ? 'Suma produktów' : 'Products Subtotal';
    if (key === 'shippingCost') return language === 'pl' ? 'Koszt wysyłki' : 'Shipping Cost';
    if (key === 'carrierSelected') return language === 'pl' ? 'Wybrany przewoźnik' : 'Carrier Selected';
    if (key === 'serviceId') return language === 'pl' ? 'ID usługi' : 'Service ID';
    if (key === 'totalPaid') return language === 'pl' ? 'Łącznie zapłacono' : 'Total Paid';
    if (key === 'shippingStatus') return language === 'pl' ? 'Status wysyłki' : 'Shipping Status';
    if (key === 'carrier') return language === 'pl' ? 'Przewoźnik' : 'Carrier';
    if (key === 'packageId') return language === 'pl' ? 'ID paczki' : 'Package ID';
    if (key === 'customer') return language === 'pl' ? 'Klient' : 'Customer';
    if (key === 'total') return language === 'pl' ? 'Łącznie' : 'Total';
    if (key === 'shipping') return language === 'pl' ? 'Wysyłka' : 'Shipping';
    if (key === 'actions') return language === 'pl' ? 'Akcje' : 'Actions';
    if (key === 'details') return language === 'pl' ? 'Szczegóły' : 'Details';
    if (key === 'complete') return language === 'pl' ? 'Zakończ' : 'Complete';
    if (key === 'createShipment') return language === 'pl' ? 'Utwórz przesyłkę' : 'Create Shipment';
    if (key === 'noShipment') return language === 'pl' ? 'Brak przesyłki' : 'No shipment';
    if (key === 'viewDetails') return language === 'pl' ? 'Zobacz szczegóły' : 'View Details';

    // Auth page
    if (key === 'signIn') return language === 'pl' ? 'Zaloguj się' : 'Sign In';
    if (key === 'signUp') return language === 'pl' ? 'Zarejestruj się' : 'Sign Up';
    if (key === 'password') return language === 'pl' ? 'Hasło' : 'Password';
    if (key === 'confirmPassword') return language === 'pl' ? 'Potwierdź hasło' : 'Confirm Password';
    if (key === 'rememberMe') return language === 'pl' ? 'Zapamiętaj mnie' : 'Remember Me';
    if (key === 'forgotPassword') return language === 'pl' ? 'Nie pamiętasz hasła?' : 'Forgot Password?';
    if (key === 'dontHaveAccount') return language === 'pl' ? 'Nie masz konta?' : "Don't have an account?";
    if (key === 'alreadyHaveAccount') return language === 'pl' ? 'Masz już konto?' : 'Already have an account?';
    if (key === 'iAccept') return language === 'pl' ? 'Akceptuję' : 'I accept';
    if (key === 'and') return language === 'pl' ? 'i' : 'and';
    if (key === 'newsletterOptIn') return language === 'pl' ? 'Chcę otrzymywać newsletter z wiadomościami i ofertami' : 'I want to receive newsletters with news and offers';
    if (key === 'joinFamily') return language === 'pl' ? 'Dołącz do rodziny Spirit of Candles' : 'Join in the Spirit of Candles family';

    // Common
    if (key === 'products') return language === 'pl' ? 'Produkty' : 'Products';
    if (key === 'customers') return language === 'pl' ? 'Klienci' : 'Customers';
    if (key === 'revenue') return language === 'pl' ? 'Przychody' : 'Revenue';
    if (key === 'customerDetails') return language === 'pl' ? 'Szczegóły klienta' : 'Customer Details';
    if (key === 'memberSince') return language === 'pl' ? 'Członek od' : 'Member Since';
    if (key === 'fullName') return language === 'pl' ? 'Imię i nazwisko' : 'Full Name';
    if (key === 'notProvided') return language === 'pl' ? 'Nie podano' : 'Not Provided';
    if (key === 'shipmentConfirmation') return language === 'pl' ? 'Potwierdzenie przesyłki' : 'Shipment Confirmation';
    if (key === 'shipmentDetails') return language === 'pl' ? 'Szczegóły przesyłki' : 'Shipment Details';
    if (key === 'enableEditingDimensions') return language === 'pl' ? 'Włącz edycję wymiarów' : 'Enable editing dimensions';
    if (key === 'confirmAndCreateShipment') return language === 'pl' ? 'Potwierdź i utwórz przesyłkę' : 'Confirm and Create Shipment';
    if (key === 'width') return language === 'pl' ? 'Szerokość' : 'Width';
    if (key === 'height') return language === 'pl' ? 'Wysokość' : 'Height';
    if (key === 'length') return language === 'pl' ? 'Długość' : 'Length';
    if (key === 'weight') return language === 'pl' ? 'Waga' : 'Weight';
    if (key === 'processing') return language === 'pl' ? 'Przetwarzanie...' : 'Processing...';
    if (key === 'editUser') return language === 'pl' ? 'Edytuj użytkownika' : 'Edit User';
    if (key === 'updateUser') return language === 'pl' ? 'Zaktualizuj użytkownika' : 'Update User';
    if (key === 'areYouSureDeleteOrder') return language === 'pl' ? 'Czy na pewno chcesz usunąć to zamówienie?' : 'Are you sure you want to delete this order?';
    if (key === 'permanentDeletion') return language === 'pl' ? 'To zamówienie zostanie trwale usunięte. Nie będzie można go przywrócić.' : 'This order will be permanently deleted. It cannot be recovered.';
    if (key === 'iUnderstandProceed') return language === 'pl' ? 'Rozumiem, usuń' : 'I Understand, Delete';
    if (key === 'deleteOrder') return language === 'pl' ? 'Usuń zamówienie' : 'Delete Order';
    if (key === 'deleting') return language === 'pl' ? 'Usuwanie...' : 'Deleting...';
    if (key === 'statistics') return language === 'pl' ? 'Statystyki' : 'Statistics';
    if (key === 'exportData') return language === 'pl' ? 'Eksportuj dane' : 'Export Data';
    if (key === 'category') return language === 'pl' ? 'Kategoria' : 'Category';
    if (key === 'size') return language === 'pl' ? 'Rozmiar' : 'Size';
    if (key === 'stock') return language === 'pl' ? 'Magazyn' : 'Stock';
    if (key === 'edit') return language === 'pl' ? 'Edytuj' : 'Edit';
    if (key === 'publish') return language === 'pl' ? 'Opublikuj' : 'Publish';
    if (key === 'unpublish') return language === 'pl' ? 'Cofnij publikację' : 'Unpublish';
    if (key === 'delete') return language === 'pl' ? 'Usuń' : 'Delete';
    if (key === 'clear') return language === 'pl' ? 'Wyczyść' : 'Clear';
    if (key === 'notAvailable') return language === 'pl' ? 'Niedostępne' : 'N/A';
    if (key === 'notSet') return language === 'pl' ? 'Nie ustawiono' : 'Not set';
    if (key === 'loading') return language === 'pl' ? 'Ładowanie...' : 'Loading...';
    if (key === 'success') return language === 'pl' ? 'Sukces' : 'Success';
    if (key === 'error') return language === 'pl' ? 'Błąd' : 'Error';
    if (key === 'joinDate') return language === 'pl' ? 'Data rejestracji' : 'Join Date';
    if (key === 'promoteToAdmin') return language === 'pl' ? 'Awansuj na Admina' : 'Promote to Admin';
    if (key === 'demoteToUser') return language === 'pl' ? 'Obniż do Użytkownika' : 'Demote to User';
    if (key === 'product') return language === 'pl' ? 'Produkt' : 'Product';
    if (key === 'published') return language === 'pl' ? 'Opublikowany' : 'Published';
    if (key === 'editProductDetails') return language === 'pl' ? 'Edytuj szczegóły' : 'Edit Details';
    if (key === 'viewProductPage') return language === 'pl' ? 'Zobacz stronę' : 'View Page';
    if (key === 'billingDescription') return language === 'pl' ? 'Zarządzaj swoimi metodami płatności' : 'Manage your payment methods';
    if (key === 'viewOrdersForPayments') return language === 'pl' ? 'Zobacz swoje zamówienia, aby uzyskać szczegóły płatności' : 'View your orders for payment details';
    if (key === 'trackingNumber') return language === 'pl' ? 'Numer śledzenia' : 'Tracking Number';
    if (key === 'trackPackage') return language === 'pl' ? 'Śledź paczkę' : 'Num. Track package';
    if (key === 'completeInformation') return language === 'pl' ? 'Pełne informacje dla zamówienia' : 'Complete information for order';
    if (key === 'deliveryName') return language === 'pl' ? 'Nazwa dostawy' : 'Delivery Name';
    if (key === 'shippingLabel') return language === 'pl' ? 'Etykieta wysyłkowa' : 'Shipping Label';
    if (key === 'downloadLabel') return language === 'pl' ? 'Pobierz etykietę' : 'Download Label';
    if (key === 'ordersTrash') return language === 'pl' ? 'Kosz zamówień' : 'Orders Trash';
    if (key === 'deletedOrdersDesc') return language === 'pl' ? 'Zarządzaj usuniętymi zamówieniami' : 'Manage deleted orders';
    if (key === 'orderMovedToTrash') return language === 'pl' ? 'Zamówienie przeniesione do kosza' : 'Order moved to trash';
    if (key === 'orderRestored') return language === 'pl' ? 'Zamówienie przywrócone pomyślnie' : 'Order restored successfully';
    if (key === 'orderPermanentlyDeleted') return language === 'pl' ? 'Zamówienie trwale usunięte' : 'Order permanently deleted';
    if (key === 'permanentDeleteConfirm') return language === 'pl' ? 'Ta akcja nie może być cofnięta. Usunąć na stałe?' : 'This action cannot be undone. Delete permanently?';
    if (key === 'restore') return language === 'pl' ? 'Przywróć' : 'Restore';
    if (key === 'deletePermanently') return language === 'pl' ? 'Usuń na stałe' : 'Delete Permanently';
    
    // Additional warehouse keys
    if (key === 'warehouseManagement') return language === 'pl' ? 'Zarządzanie Magazynem' : 'Warehouse Management';
    if (key === 'stockOverview') return language === 'pl' ? 'Przegląd Zapasów' : 'Stock Overview';
    if (key === 'product') return language === 'pl' ? 'Produkt' : 'Product';
    if (key === 'actions') return language === 'pl' ? 'Akcje' : 'Actions';
    if (key === 'size') return language === 'pl' ? 'Rozmiar' : 'Size';
    if (key === 'category') return language === 'pl' ? 'Kategoria' : 'Category';
    if (key === 'stockQuantity') return language === 'pl' ? 'Zapas' : 'Stock Quantity';
    if (key === 'editDetails') return language === 'pl' ? 'Edytuj Szczegóły' : 'Edit Details';
    if (key === 'viewPage') return language === 'pl' ? 'Zobacz Stronę' : 'View Page';
    if (key === 'totalItems') return language === 'pl' ? 'Przedmioty Ogółem' : 'Total Items';
    if (key === 'lowStockAlerts') return language === 'pl' ? 'Niski Stan' : 'Low Stock Alerts';
    if (key === 'outOfStockItems') return language === 'pl' ? 'Brak Towaru' : 'Out of Stock';
    
    // Language settings
    if (key === 'preferredLanguage') return language === 'pl' ? 'Preferowany Język' : 'Preferred Language';
    if (key === 'preferredLanguageDesc') return language === 'pl' ? 'Wybierz preferowany język dla witryny' : 'Choose your preferred language for the website';
    if (key === 'emailLanguage') return language === 'pl' ? 'Język Wiadomości E-mail' : 'Email Language';
    if (key === 'emailLanguageDesc') return language === 'pl' ? 'Wybierz język dla wiadomości e-mail z witryny' : 'Choose the language for emails from the website';
    if (key === 'emailLanguageUpdated') return language === 'pl' ? 'Język e-mail zaktualizowany' : 'Email language updated';
    
    // Reviews  
    if (key === 'anonymous') return language === 'pl' ? 'Anonimowy' : 'Anonymous';
    if (key === 'complete') return language === 'pl' ? 'Zakończ' : 'Complete';
    if (key === 'furgonetkaPayMiss') return language === 'pl' ? 'Brak płatności FURGONETKA' : 'FURGONETKA Pay Miss';
    if (key === 'trackingNumb') return language === 'pl' ? 'Numer śledzenia' : 'Tracking Numb.';
    if (key === 'awaitingShipmentConfirmation') return language === 'pl' ? 'czekam na ZAKOŃCZENIE' : 'Awaiting for data COMPLETE';
    if (key === 'shippedSuccessfully') return language === 'pl' ? 'Wysłano pomyślnie' : 'Shipped Successfully';
    if (key === 'copy') return language === 'pl' ? 'Kopiuj' : 'Copy';
    if (key === 'copied') return language === 'pl' ? 'Skopiowano!' : 'Copied!';
    if (key === 'shippingStatusLegend') return language === 'pl' ? 'Legenda Statusów Przesyłki' : 'Shipping Status Legend';
    if (key === 'shippingStatusInfo') return language === 'pl' ? 'Zrozum, co oznacza każdy status przesyłki:' : 'Understand what each shipping status means:';
    if (key === 'statusDelivered') return language === 'pl' ? 'Dostarczono - Twoje zamówienie zostało pomyślnie dostarczone' : 'Delivered - Your order has been successfully delivered';
    if (key === 'statusInTransit') return language === 'pl' ? 'W Transporcie - Twoja paczka jest w drodze' : 'In Transit - Your package is on its way';
    if (key === 'statusAwaitingPickup') return language === 'pl' ? 'Oczekuje na Odbiór - Paczka gotowa do odbioru' : 'Awaiting Pickup - Package is ready for collection';
    if (key === 'statusCollectProblem') return language === 'pl' ? 'Problem z Odbiorem - Problem z odbiorem paczki' : 'Collection Issue - Problem with package collection';
    if (key === 'statusPending') return language === 'pl' ? 'Oczekujące - Zamówienie jest przygotowywane' : 'Pending - Order is being prepared';
    if (key === 'statusProcessing') return language === 'pl' ? 'Przetwarzanie - Zamówienie jest przetwarzane' : 'Processing - Order is being processed';
    if (key === 'awaitingFurgonetkaSubmission') return language === 'pl' ? 'Oczekiwanie na przesłanie FURKONEKTA' : 'Awaiting FURKONEKTA submission';
    if (key === 'shipmentCreated') return language === 'pl' ? 'Przesyłka utworzona' : 'Shipment CREATED!';
    if (key === 'shipped') return language === 'pl' ? 'WYSŁANY' : 'SHIPPED';
    if (key === 'shippedSuccessfully') return language === 'pl' ? 'Wysłano pomyślnie' : 'Shipped successfully';
    if (key === 'sentVia') return language === 'pl' ? 'Wysłano przez' : 'Sent via';
    if (key === 'noShipmentCreated') return language === 'pl' ? 'BRAK Przesyłki' : 'NO Shipment';
    if (key === 'syncTracking') return language === 'pl' ? 'Synchronizuj śledzenie z FURGONETKI' : 'Sync Tracking from FURGONETKA';
    if (key === 'syncingTracking') return language === 'pl' ? 'Synchronizowanie...' : 'Syncing...';
    if (key === 'serviceCarrierId') return language === 'pl' ? 'ID usługi przewoźnika' : 'Service Carrier ID';
    if (key === 'viewOrderId') return language === 'pl' ? 'Zobacz ID zamówienia' : 'View Order ID';
    if (key === 'orderIdCopied') return language === 'pl' ? 'ID zamówienia skopiowane do schowka' : 'Order ID copied to clipboard';
    if (key === 'shipTo') return language === 'pl' ? 'Wysłać do' : 'Ship to';
    if (key === 'creationDate') return language === 'pl' ? 'Data utworzenia' : 'Creation Date';
    if (key === 'created') return language === 'pl' ? 'Utworzono' : 'Created';
    
    // New Shipping Status Translations
    if (key === 'awaitingShipmentConfirmation') return language === 'pl' ? 'Oczekiwanie na potwierdzenie' : 'Awaiting CONFIRMATION';
    if (key === 'awaitingFurgonetkaSubmission') return language === 'pl' ? 'Oczekiwanie na wysyłkę' : 'Awaiting SUBMISSION';
    if (key === 'shipmentCreated') return language === 'pl' ? 'Przesyłka utworzona' : 'Shipment Created';
    if (key === 'shippedSuccessfully') return language === 'pl' ? 'Wysłano pomyślnie' : 'Shipped Successfully';
    if (key === 'sentVia') return language === 'pl' ? 'Wysłano przez' : 'Sent via';
    if (key === 'trackingNumb') return language === 'pl' ? 'Nr śledzenia' : 'Tracking Numb.';
    if (key === 'shipTo') return language === 'pl' ? 'Wysyłka do' : 'Ship to';
    if (key === 'creationDate') return language === 'pl' ? 'Data utworzenia' : 'Creation Date';
    if (key === 'serviceCarrierId') return language === 'pl' ? 'ID usługi przewoźnika' : 'Service Carrier ID';
    if (key === 'viewOrderId') return language === 'pl' ? 'Zobacz ID' : 'View ID';
    if (key === 'copyOrderId') return language === 'pl' ? 'Kopiuj ID' : 'Copy ID';
    if (key === 'orderIdCopied') return language === 'pl' ? 'ID zamówienia skopiowane' : 'Order ID copied';
    if (key === 'syncTracking') return language === 'pl' ? 'Synchronizuj tracking' : 'Sync Tracking';
    if (key === 'syncingTracking') return language === 'pl' ? 'Synchronizacja...' : 'Syncing...';
    if (key === 'trackingSynced') return language === 'pl' ? 'Tracking zsynchronizowany' : 'Tracking synced';
    if (key === 'noShipmentCreated') return language === 'pl' ? 'BRAK Przesyłki' : 'NO Shipment';

    // Product form fields
    if (key === 'nameEn') return language === 'pl' ? 'Nazwa (EN)' : 'Name (EN)';
    if (key === 'namePl') return language === 'pl' ? 'Nazwa (PL)' : 'Name (PL)';
    if (key === 'descriptionEn') return language === 'pl' ? 'Opis (EN)' : 'Description (EN)';
    if (key === 'descriptionPl') return language === 'pl' ? 'Opis (PL)' : 'Description (PL)';
    if (key === 'pricePln') return language === 'pl' ? 'Cena PLN' : 'Price PLN';
    if (key === 'priceEur') return language === 'pl' ? 'Cena EUR' : 'Price EUR';
    if (key === 'stockQuantity') return language === 'pl' ? 'Stan magazynowy' : 'Stock Quantity';
    if (key === 'uploadImage') return language === 'pl' ? 'Wgraj zdjęcie' : 'Upload Image';
    if (key === 'imageUploaded') return language === 'pl' ? 'Zdjęcie wgrane' : 'Image Uploaded';
    if (key === 'updateProduct') return language === 'pl' ? 'Zaktualizuj produkt' : 'Update Product';
    if (key === 'createProduct') return language === 'pl' ? 'Utwórz produkt' : 'Create Product';
    if (key === 'deleteConfirm') return language === 'pl' ? 'Czy na pewno chcesz usunąć ten produkt?' : 'Are you sure you want to delete this product?';

    // Product Detail Page - Missing Translations
    if (key === 'quantity') return language === 'pl' ? 'Ilość' : 'Quantity';
    if (key === 'buyNow') return language === 'pl' ? 'Kup teraz' : 'Buy Now';
    if (key === 'productDetails') return language === 'pl' ? 'Szczegóły produktu' : 'Product Details';
    if (key === 'waxType') return language === 'pl' ? 'Typ wosku' : 'Wax Type';
    if (key === 'wick') return language === 'pl' ? 'Knot' : 'Wick';
    if (key === 'handPoured') return language === 'pl' ? 'Ręcznie wylane' : 'Hand Poured';
    if (key === 'burnTime') return language === 'pl' ? 'Czas palenia' : 'Burn Time';
    if (key === 'naturalIngredients') return language === 'pl' ? 'Naturalne składniki' : 'Natural Ingredients';
    if (key === 'yes') return language === 'pl' ? 'Tak' : 'Yes';
    if (key === 'no') return language === 'pl' ? 'Nie' : 'No';
    if (key === 'inspirationNotice') return language === 'pl' ? 'Inspiracja:' : 'Inspiration:';
    if (key === 'fragranceReferences') return language === 'pl' 
      ? 'Wszystkie produkty są inspirowane popularnymi zapachami znanych marek, ale nie są z nimi powiązane.' 
      : 'All products are inspired by popular fragrances from well-known brands but are not affiliated with them.';
    if (key === 'customerReviews') return language === 'pl' ? 'Opinie klientów' : 'Customer Reviews';
    if (key === 'reviews') return language === 'pl' ? 'opinie' : 'reviews';
    if (key === 'basedOnReviews') return language === 'pl' ? 'na podstawie {count} opinii' : 'based on {count} reviews';
    if (key === 'writeReview') return language === 'pl' ? 'Napisz opinię' : 'Write Review';
    if (key === 'yourRating') return language === 'pl' ? 'Twoja ocena' : 'Your Rating';
    if (key === 'yourReview') return language === 'pl' ? 'Twoja opinia' : 'Your Review';
    if (key === 'shareYourThoughts') return language === 'pl' ? 'Podziel się swoimi przemyśleniami' : 'Share your thoughts';
    if (key === 'submitReview') return language === 'pl' ? 'Wyślij opinię' : 'Submit Review';
    if (key === 'allReviews') return language === 'pl' ? 'Wszystkie opinie' : 'All Reviews';
    if (key === 'productWeight') return language === 'pl' ? 'Waga produktu' : 'Product Weight';
    if (key === 'shipmentCreatedSuccess') return language === 'pl' ? 'Przesyłka utworzona pomyślnie' : 'Shipment created successfully';
    if (key === 'admin') return language === 'pl' ? 'Administrator' : 'Administrator';

    // Categories
    if (key === 'luxury') return language === 'pl' ? 'Luksus' : 'Luxury';
    if (key === 'nature') return language === 'pl' ? 'Natura' : 'Nature';
    if (key === 'fresh') return language === 'pl' ? 'Świeżość' : 'Fresh';

    // Order Timeline & Bulk Actions
    if (key === 'orderTimeline') return language === 'pl' ? 'Oś czasu zamówienia' : 'Order Timeline';
    if (key === 'orderPlaced') return language === 'pl' ? 'Zamówienie złożone' : 'Order placed';
    if (key === 'paymentReceived') return language === 'pl' ? 'Płatność otrzymana' : 'Payment received';
    if (key === 'orderConfirmedByAdmin') return language === 'pl' ? 'Potwierdzone przez Spirit Candle' : 'Confirmed by Spirit Candle';
    if (key === 'shipmentCreatedAwaitingPayment') return language === 'pl' ? 'Przesyłka utworzona, oczekiwanie na płatność' : 'Shipment created, awaiting payment';
    if (key === 'packageShipped') return language === 'pl' ? 'Paczka wysłana' : 'Package shipped';
    if (key === 'estimatedDelivery') return language === 'pl' ? 'Szacowana dostawa' : 'Estimated delivery';
    if (key === 'ordersSelected') return language === 'pl' ? 'Zamówień zaznaczonych' : 'Orders Selected';
    if (key === 'bulkComplete') return language === 'pl' ? 'Zrealizuj wszystkie zamówienia' : 'Complete All Orders';
    if (key === 'bulkSyncTracking') return language === 'pl' ? 'Synchronizuj wszystkie śledzenia' : 'Sync All Tracking';
    if (key === 'bulkDelete') return language === 'pl' ? 'Usuń wszystkie' : 'Delete All';
    if (key === 'clearSelection') return language === 'pl' ? 'Wyczyść zaznaczenie' : 'Clear Selection';
    if (key === 'manualSyncAll') return language === 'pl' ? 'Ręczna synchronizacja wszystkich śledzenia' : 'Manual Sync All Tracking';
    if (key === 'syncing') return language === 'pl' ? 'Synchronizacja...' : 'Syncing...';
    
    // Password Reset
    if (key === 'forgotPassword') return language === 'pl' ? 'Zapomniałeś hasła?' : 'Forgot Password?';
    if (key === 'resetPassword') return language === 'pl' ? 'Zresetuj hasło' : 'Reset Password';
    if (key === 'resetPasswordDescription') return language === 'pl' ? 'Wpisz swój email, a wyślemy Ci link do resetu' : 'Enter your email and we\'ll send you a reset link';
    if (key === 'sendResetLink') return language === 'pl' ? 'Wyślij link do resetu' : 'Send Reset Link';
    if (key === 'emailSent') return language === 'pl' ? 'Email wysłany' : 'Email Sent';
    if (key === 'checkEmailForResetLink') return language === 'pl' ? 'Sprawdź swoją skrzynkę pocztową w celu uzyskania linku do resetu hasła' : 'Check your email for the password reset link';
    if (key === 'newPassword') return language === 'pl' ? 'Nowe hasło' : 'New Password';
    if (key === 'confirmNewPassword') return language === 'pl' ? 'Potwierdź nowe hasło' : 'Confirm New Password';
    if (key === 'passwordsDoNotMatch') return language === 'pl' ? 'Hasła nie pasują do siebie' : 'Passwords do not match';
    if (key === 'passwordTooShort') return language === 'pl' ? 'Hasło musi mieć co najmniej 8 znaków' : 'Password must be at least 8 characters';
    if (key === 'passwordResetSuccess') return language === 'pl' ? 'Hasło zresetowane pomyślnie! Przekierowanie...' : 'Password reset successfully! Redirecting...';
    if (key === 'resetting') return language === 'pl' ? 'Resetowanie...' : 'Resetting...';
    if (key === 'emailRequired') return language === 'pl' ? 'Email jest wymagany!' : 'Email is required!';
    
    // Toast messages
    if (key === 'removed') return language === 'pl' ? 'Usunięto' : 'Removed';
    if (key === 'updated') return language === 'pl' ? 'Zaktualizowano' : 'Updated';
    if (key === 'synced') return language === 'pl' ? 'Zsynchronizowano' : 'Synced';
    if (key === 'syncingAllOrders') return language === 'pl' ? 'Synchronizacja WSZYSTKICH Zamówień...' : 'Syncing ALL Orders...';
    if (key === 'syncTriggered') return language === 'pl' ? 'Synchronizacja uruchomiona' : 'Sync triggered';
    if (key === 'noPaidOrders') return language === 'pl' ? 'Brak Zamówień do ZREALIZOWANIA (tylko Zamówienia „OPŁACONE”)' : 'No Orders to COMPLETE ("PAID" Orders only)';
    if (key === 'ordersCompleted') return language === 'pl' ? 'Zamówień zakończonych' : 'Orders Completed';
    if (key === 'noOrdersWithTracking') return language === 'pl' ? 'Brak Zamówień z przesyłką FURGONETKA' : 'No Orders with FURGONETKA package';
    if (key === 'ordersSynced') return language === 'pl' ? 'Zamówień zsynchronizowanych' : 'Orders Synced';
    if (key === 'bulkDeleteConfirm') return language === 'pl' ? 'Czy na pewno chcesz usunąć zaznaczone Zamówienia?' : 'Are you sure you want to delete selected Orders?';
    if (key === 'ordersDeleted') return language === 'pl' ? 'Zamówień usuniętych!' : 'Orders DELETED!';
    if (key === 'syncAllTracking') return language === 'pl' ? 'Synchronizuj wszystkie' : 'Sync All Tracking';
    if (key === 'resetDemoOrders') return language === 'pl' ? 'Reset zamówień' : 'Reset Orders';
    if (key === 'resetDemoOrdersConfirm') return language === 'pl' ? 'Czy na pewno chcesz usunąć wszystkie Zamówienia? Tej czynności nie można cofnąć.' : 'Are you sure you want to delete all Orders? This action cannot be undone.';
    if (key === 'allOrdersDeleted') return language === 'pl' ? 'Wszystkie Zamówienia usunięte pomyślnie!' : 'All Orders deleted successfully!';
    if (key === 'doneButton') return language === 'pl' ? 'Zrobione' : 'Done';
    
    // Name Validation
    if (key === 'invalidName') return language === 'pl' ? 'Nieprawidłowe imię' : 'Invalid Name';
    if (key === 'nameCannotContainNumbers') return language === 'pl' ? 'Imię i nazwisko nie mogą zawierać cyfr' : 'Name and surname cannot contain numbers';
    
    // Carrier Names & Shipping
    if (key === 'sendTo') return language === 'pl' ? 'Wyślij do' : 'Send to';
    if (key === 'furgonetka') return language === 'pl' ? 'FURGONETKA' : 'FURGONETKA';
    
    // Existing translations continuation...

    // Privacy/Legal
    if (key === 'termsOfSale') return language === 'pl' ? 'Regulamin sprzedaży' : 'Terms of Sale';
    if (key === 'privacyPolicy') return language === 'pl' ? 'Polityka prywatności' : 'Privacy Policy';
    if (key === 'consentRequired') return language === 'pl' ? 'Wymagana zgoda' : 'Consent Required';
    if (key === 'mustAcceptTerms') return language === 'pl' ? 'Musisz zaakceptować Regulamin sprzedaży i Politykę prywatności' : 'You must accept the Terms of Sale and Privacy Policy';
    
    // Privacy Policy Page
    if (key === 'downloadPDF') return language === 'pl' ? 'Pobierz PDF' : 'Download PDF';
    if (key === 'lastUpdated') return language === 'pl' ? 'Ostatnia aktualizacja' : 'Last Updated';
    if (key === 'privacyIntro') return language === 'pl' ? 'W Spirit Candle szanujemy Twoją prywatność i zobowiązujemy się chronić Twoje dane osobowe zgodnie z RODO.' : 'At Spirit Candle, we respect your privacy and are committed to protecting your personal data in accordance with GDPR.';
    if (key === 'dataController') return language === 'pl' ? 'Administrator danych' : 'Data Controller';
    if (key === 'dataWeCollect') return language === 'pl' ? 'Dane, które zbieramy' : 'Data We Collect';
    if (key === 'accountData') return language === 'pl' ? 'Dane konta' : 'Account Data';
    if (key === 'accountDataDesc') return language === 'pl' ? 'E-mail, hasło, imię, nazwisko' : 'Email, password, first name, last name';
    if (key === 'orderData') return language === 'pl' ? 'Dane zamówienia' : 'Order Data';
    if (key === 'orderDataDesc') return language === 'pl' ? 'Adres wysyłki, historia zamówień, szczegóły płatności' : 'Shipping address, order history, payment details';
    if (key === 'technicalData') return language === 'pl' ? 'Dane techniczne' : 'Technical Data';
    if (key === 'technicalDataDesc') return language === 'pl' ? 'Adres IP, typ przeglądarki, urządzenie, pliki cookie' : 'IP address, browser type, device, cookies';
    if (key === 'legalBasis') return language === 'pl' ? 'Podstawa prawna' : 'Legal Basis';
    if (key === 'contractPerformance') return language === 'pl' ? 'Wykonanie umowy' : 'Contract Performance';
    if (key === 'contractPerformanceDesc') return language === 'pl' ? 'Przetwarzanie niezbędne do realizacji zamówień' : 'Processing necessary to fulfill orders';
    if (key === 'consent') return language === 'pl' ? 'Zgoda' : 'Consent';
    if (key === 'consentDesc') return language === 'pl' ? 'Marketing, newsletter, opcjonalne funkcje' : 'Marketing, newsletter, optional features';
    if (key === 'legitimateInterest') return language === 'pl' ? 'Prawnie uzasadniony interes' : 'Legitimate Interest';
    if (key === 'legitimateInterestDesc') return language === 'pl' ? 'Zapobieganie oszustwom, bezpieczeństwo, analiza' : 'Fraud prevention, security, analytics';
    if (key === 'legalObligation') return language === 'pl' ? 'Obowiązek prawny' : 'Legal Obligation';
    if (key === 'legalObligationDesc') return language === 'pl' ? 'Wymogi podatkowe i księgowe' : 'Tax and accounting requirements';
    if (key === 'howWeUseData') return language === 'pl' ? 'Jak wykorzystujemy Twoje dane' : 'How We Use Your Data';
    if (key === 'processOrders') return language === 'pl' ? 'Przetwarzanie i realizacja zamówień' : 'Process and fulfill orders';
    if (key === 'provideCommunication') return language === 'pl' ? 'Komunikacja dotycząca zamówień i obsługi klienta' : 'Order communication and customer service';
    if (key === 'improveServices') return language === 'pl' ? 'Ulepszanie naszych usług i strony' : 'Improve our services and website';
    if (key === 'sendMarketing') return language === 'pl' ? 'Wysyłanie materiałów marketingowych (za zgodą)' : 'Send marketing materials (with consent)';
    if (key === 'fraudPrevention') return language === 'pl' ? 'Zapobieganie oszustwom i zapewnianie bezpieczeństwa' : 'Prevent fraud and ensure security';
    if (key === 'dataSharing') return language === 'pl' ? 'Udostępnianie danych' : 'Data Sharing';
    if (key === 'dataSharingIntro') return language === 'pl' ? 'Udostępniamy Twoje dane następującym dostawcom usług:' : 'We share your data with the following service providers:';
    if (key === 'paymentProcessors') return language === 'pl' ? 'Przetwarzanie płatności' : 'Payment processing';
    if (key === 'shippingProviders') return language === 'pl' ? 'Usługi logistyczne' : 'Shipping services';
    if (key === 'analyticsServices') return language === 'pl' ? 'Analityka internetowa' : 'Web analytics';
    if (key === 'emailServices') return language === 'pl' ? 'Dostarczanie e-maili' : 'Email delivery';
    if (key === 'hostingServices') return language === 'pl' ? 'Hosting bazy danych' : 'Database hosting';
    if (key === 'internationalTransfers') return language === 'pl' ? 'Transfery międzynarodowe' : 'International Transfers';
    if (key === 'internationalTransfersDesc') return language === 'pl' ? 'Niektórzy dostawcy usług mogą przetwarzać dane poza EOG. Zapewniamy odpowiednie zabezpieczenia zgodnie z RODO.' : 'Some service providers may process data outside the EEA. We ensure appropriate safeguards in accordance with GDPR.';
    if (key === 'dataRetention') return language === 'pl' ? 'Przechowywanie danych' : 'Data Retention';
    if (key === 'accountDataRetention') return language === 'pl' ? 'Dane konta: dopóki konto jest aktywne lub przez 30 dni po usunięciu' : 'Account data: while account is active or 30 days after deletion';
    if (key === 'marketingDataRetention') return language === 'pl' ? 'Dane marketingowe: do momentu wycofania zgody' : 'Marketing data: until consent is withdrawn';
    if (key === 'cookieDataRetention') return language === 'pl' ? 'Pliki cookie: do 13 miesięcy' : 'Cookie data: up to 13 months';
    if (key === 'yourRights') return language === 'pl' ? 'Twoje prawa' : 'Your Rights';
    if (key === 'rightAccess') return language === 'pl' ? 'Prawo dostępu' : 'Right to Access';
    if (key === 'rightAccessDesc') return language === 'pl' ? 'Otrzymać kopię swoich danych osobowych' : 'Obtain a copy of your personal data';
    if (key === 'rightRectification') return language === 'pl' ? 'Prawo do sprostowania' : 'Right to Rectification';
    if (key === 'rightRectificationDesc') return language === 'pl' ? 'Poprawiać nieprawidłowe lub niekompletne dane' : 'Correct inaccurate or incomplete data';
    if (key === 'rightErasure') return language === 'pl' ? 'Prawo do usunięcia' : 'Right to Erasure';
    if (key === 'rightErasureDesc') return language === 'pl' ? 'Zażądać usunięcia swoich danych osobowych' : 'Request deletion of your personal data';
    if (key === 'rightRestrict') return language === 'pl' ? 'Prawo do ograniczenia przetwarzania' : 'Right to Restrict Processing';
    if (key === 'rightRestrictDesc') return language === 'pl' ? 'Ograniczyć sposób wykorzystania Twoich danych' : 'Limit how we use your data';
    if (key === 'rightPortability') return language === 'pl' ? 'Prawo do przenoszenia danych' : 'Right to Data Portability';
    if (key === 'rightPortabilityDesc') return language === 'pl' ? 'Otrzymać swoje dane w formacie do ponownego użycia' : 'Receive your data in a reusable format';
    if (key === 'rightObject') return language === 'pl' ? 'Prawo do sprzeciwu' : 'Right to Object';
    if (key === 'rightObjectDesc') return language === 'pl' ? 'Sprzeciwić się przetwarzaniu w określonych celach' : 'Object to processing for certain purposes';
    if (key === 'rightWithdraw') return language === 'pl' ? 'Prawo do wycofania zgody' : 'Right to Withdraw Consent';
    if (key === 'rightWithdrawDesc') return language === 'pl' ? 'Wycofać zgodę w dowolnym momencie' : 'Withdraw consent at any time';
    if (key === 'exerciseRights') return language === 'pl' ? 'Aby skorzystać ze swoich praw, skorzystaj z naszego' : 'To exercise your rights, use our';
    if (key === 'dataRequestForm') return language === 'pl' ? 'Formularz wniosku o dane' : 'Data Request Form';
    if (key === 'security') return language === 'pl' ? 'Bezpieczeństwo' : 'Security';
    if (key === 'securityDesc') return language === 'pl' ? 'Wdrażamy branżowe środki bezpieczeństwa w celu ochrony Twoich danych, w tym szyfrowanie, bezpieczne połączenia HTTPS i regularne audyty.' : 'We implement industry-standard security measures to protect your data, including encryption, secure HTTPS connections, and regular audits.';
    if (key === 'childrenPrivacy') return language === 'pl' ? 'Prywatność dzieci' : "Children's Privacy";
    if (key === 'childrenPrivacyDesc') return language === 'pl' ? 'Nasza strona nie jest skierowana do osób poniżej 16 roku życia. Świadomie nie zbieramy danych od dzieci.' : 'Our Site is not directed at children under 16. We do not knowingly collect data from children.';
    if (key === 'policyChanges') return language === 'pl' ? 'Zmiany w polityce' : 'Policy Changes';
    if (key === 'policyChangesDesc') return language === 'pl' ? 'Zastrzegamy sobie prawo do aktualizacji tej polityki. Powiadomimy Cię o istotnych zmianach poprzez e-mail lub powiadomienie na stronie.' : 'We reserve the right to update this policy. We will notify you of significant changes by email or website notice.';
    if (key === 'privacyContactIntro') return language === 'pl' ? 'W przypadku pytań dotyczących prywatności skontaktuj się z nami:' : 'For privacy-related questions, contact us:';
    if (key === 'supervisoryAuthority') return language === 'pl' ? 'Organ nadzorczy' : 'Supervisory Authority';
    if (key === 'supervisoryAuthorityDesc') return language === 'pl' ? 'Masz prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (PUODO) w Polsce.' : 'You have the right to lodge a complaint with the President of the Personal Data Protection Office (PUODO) in Poland.';

    // Shipping & Returns Page
    if (key === 'shippingReturnsTitle') return language === 'pl' ? 'Dostawa i Zwroty' : 'Shipping & Returns';
    if (key === 'needHelp') return language === 'pl' ? 'Potrzebujesz pomocy?' : 'Need Help?';

    // Accessibility Page
    if (key === 'accessibilityStatement') return language === 'pl' ? 'Deklaracja dostępności' : 'Accessibility Statement';
    if (key === 'technicalSpecifications') return language === 'pl' ? 'Specyfikacje techniczne' : 'Technical Specifications';
    if (key === 'technicalSpecificationsIntro') return language === 'pl' ? 'Nasza strona korzysta z następujących technologii:' : 'Our Site relies on the following technologies:';
    if (key === 'assistiveTechnologies') return language === 'pl' ? 'Technologie wspomagające' : 'Assistive Technologies';
    if (key === 'assistiveTechnologiesDesc') return language === 'pl' ? 'Nasza strona została zaprojektowana do współpracy z:' : 'Our Site is designed to work with:';
    if (key === 'screenMagnifiers') return language === 'pl' ? 'Powiększalniki ekranu' : 'Screen Magnifiers';
    if (key === 'speechRecognition') return language === 'pl' ? 'Oprogramowanie rozpoznawania mowy' : 'Speech Recognition Software';
    if (key === 'continuousImprovement') return language === 'pl' ? 'Ciągłe doskonalenie' : 'Continuous Improvement';
    if (key === 'continuousImprovementDesc') return language === 'pl' ? 'Jesteśmy zaangażowani w ciągłe doskonalenie dostępności naszej strony i będziemy regularnie sprawdzać i aktualizować tę deklarację.' : 'We are committed to continuously improving the accessibility of our Site and will regularly review and update this statement.';
    if (key === 'alternativeFormats') return language === 'pl' ? 'Formaty alternatywne' : 'Alternative Formats';
    if (key === 'alternativeFormatsDesc') return language === 'pl' ? 'Jeśli potrzebujesz informacji w alternatywnym formacie, skontaktuj się z nami, a chętnie pomożemy.' : 'If you need information in an alternative format, please contact us and we will be happy to assist.';

    // Data Request Page
    if (key === 'requestSent') return language === 'pl' ? 'Wniosek wysłany' : 'Request Sent';
    if (key === 'dataRequestSentDesc') return language === 'pl' ? 'Twój wniosek został wysłany. Odpowiemy w ciągu 30 dni.' : 'Your request has been sent. We will respond within 30 days.';
    if (key === 'errorSendingRequest') return language === 'pl' ? 'Błąd podczas wysyłania wniosku. Spróbuj ponownie.' : 'Error sending request. Please try again.';
    if (key === 'dataRequestIntro') return language === 'pl' ? 'Użyj tego formularza, aby skorzystać ze swoich praw RODO. Odpowiemy na Twój wniosek w ciągu 30 dni.' : 'Use this form to exercise your GDPR rights. We will respond to your request within 30 days.';
    if (key === 'selectRequestType') return language === 'pl' ? 'Wybierz typ wniosku' : 'Select request type';
    if (key === 'requestType') return language === 'pl' ? 'Typ wniosku' : 'Request Type';
    if (key === 'withdrawConsent') return language === 'pl' ? 'Wycofanie zgody' : 'Withdraw Consent';
    if (key === 'additionalDetails') return language === 'pl' ? 'Dodatkowe szczegóły' : 'Additional Details';
    if (key === 'dataRequestDetailsPlaceholder') return language === 'pl' ? 'Podaj wszelkie dodatkowe informacje dotyczące Twojego wniosku...' : 'Provide any additional information about your request...';
    if (key === 'dataRequestProcessingTime') return language === 'pl' ? 'Przetwarzamy wnioski w ciągu 30 dni od otrzymania. Możemy poprosić o weryfikację tożsamości.' : 'We process requests within 30 days of receipt. We may request identity verification.';
    if (key === 'sending') return language === 'pl' ? 'Wysyłanie...' : 'Sending...';
    if (key === 'submitRequest') return language === 'pl' ? 'Wyślij wniosek' : 'Submit Request';

    // Privacy Registration Page
    if (key === 'contactInformation') return language === 'pl' ? 'Informacje kontaktowe' : 'Contact Information';

    // Cookie Banner
    if (key === 'strictlyNecessaryCookies') return language === 'pl' ? 'Niezbędne pliki cookie' : 'Strictly Necessary Cookies';
    if (key === 'strictlyNecessaryDescription') return language === 'pl' ? 'Wymagane do podstawowego funkcjonowania strony, w tym uwierzytelniania i bezpieczeństwa.' : 'Required for essential site functionality including authentication and security.';
    if (key === 'supabaseService') return language === 'pl' ? 'Supabase (Uwierzytelnianie i baza danych)' : 'Supabase (Authentication & Database)';
    if (key === 'supabaseServiceDesc') return language === 'pl' ? 'Zarządza uwierzytelnianiem użytkowników, sesjami i przechowywaniem danych.' : 'Manages user authentication, sessions, and data storage.';
    if (key === 'stripeService') return language === 'pl' ? 'Stripe (Przetwarzanie płatności)' : 'Stripe (Payment Processing)';
    if (key === 'stripeServiceDesc') return language === 'pl' ? 'Bezpieczne przetwarzanie płatności i zapobieganie oszustwom.' : 'Secure payment processing and fraud prevention.';
    if (key === 'hostingerService') return language === 'pl' ? 'Hostinger (Hosting strony)' : 'Hostinger (Website Hosting)';
    if (key === 'hostingerServiceDesc') return language === 'pl' ? 'Zapewnia infrastrukturę dla naszej strony internetowej i przetwarza dane dotyczące użytkowania.' : 'Provides infrastructure for our website and processes usage data.';
    if (key === 'functionalCookies') return language === 'pl' ? 'Funkcjonalne pliki cookie' : 'Functional Cookies';
    if (key === 'functionalDescription') return language === 'pl' ? 'Zapewniają usprawnione funkcje, takie jak wysyłka i komunikacja e-mailowa.' : 'Enable enhanced features like shipping and email communication.';
    if (key === 'furgonetkaService') return language === 'pl' ? 'Furgonetka (Usługi wysyłkowe)' : 'Furgonetka (Shipping Services)';
    if (key === 'furgonetkaServiceDesc') return language === 'pl' ? 'Oblicza koszty wysyłki i zarządza dostawą paczek.' : 'Calculates shipping costs and manages package delivery.';
    if (key === 'resendService') return language === 'pl' ? 'Resend (Dostawa e-maili)' : 'Resend (Email Delivery)';
    if (key === 'resendServiceDesc') return language === 'pl' ? 'Dostarcza potwierdzenia zamówień i powiadomienia.' : 'Delivers order confirmations and notifications.';
    if (key === 'analyticsCookies') return language === 'pl' ? 'Analityczne pliki cookie' : 'Analytics Cookies';
    if (key === 'analyticsDescription') return language === 'pl' ? 'Pomagają nam zrozumieć sposób korzystania z naszej strony i ulepszać doświadczenie użytkowników.' : 'Help us understand how visitors use our Site and improve user experience.';
    if (key === 'ga4Service') return language === 'pl' ? 'Google Analytics 4' : 'Google Analytics 4';
    if (key === 'ga4ServiceDesc') return language === 'pl' ? 'Śledzi interakcje użytkowników i ruch na stronie.' : 'Tracks user interactions and website traffic.';
    if (key === 'marketingCookies') return language === 'pl' ? 'Marketingowe pliki cookie' : 'Marketing Cookies';
    if (key === 'marketingDescription') return language === 'pl' ? 'Używane do wyświetlania spersonalizowanych reklam i śledzenia efektywności kampanii.' : 'Used to display personalized ads and track campaign effectiveness.';
    if (key === 'metaPixelService') return language === 'pl' ? 'Meta Pixel (Facebook & Instagram)' : 'Meta Pixel (Facebook & Instagram)';
    if (key === 'metaPixelServiceDesc') return language === 'pl' ? 'Śledzi konwersje i optymalizuje kampanie reklamowe.' : 'Tracks conversions and optimizes ad campaigns.';
    if (key === 'tiktokService') return language === 'pl' ? 'TikTok Pixel' : 'TikTok Pixel';
    if (key === 'tiktokServiceDesc') return language === 'pl' ? 'Śledzi interakcje użytkowników z reklam TikTok.' : 'Tracks user interactions from TikTok ads.';
    if (key === 'twitterService') return language === 'pl' ? 'Twitter Pixel' : 'Twitter Pixel';
    if (key === 'twitterServiceDesc') return language === 'pl' ? 'Mierzy skuteczność reklam na Twitterze.' : 'Measures Twitter ad effectiveness.';
    if (key === 'cookieBannerTitle') return language === 'pl' ? 'Zarządzanie plikami cookie' : 'Cookie Management';
    if (key === 'cookieBannerDescription') return language === 'pl' ? 'Używamy plików cookie, aby ulepszyć Twoje doświadczenie. Przeczytaj naszą' : 'We use cookies to enhance your experience. Read our';
    if (key === 'acceptAllCookies') return language === 'pl' ? 'Zaakceptuj wszystkie' : 'Accept All';
    if (key === 'rejectAllCookies') return language === 'pl' ? 'Odrzuć wszystkie' : 'Reject All';
    if (key === 'customizeSettings') return language === 'pl' ? 'Dostosuj ustawienia' : 'Customize Settings';
    if (key === 'alwaysOn') return language === 'pl' ? 'Zawsze włączone' : 'Always On';
    if (key === 'learnMore') return language === 'pl' ? 'Dowiedz się więcej' : 'Learn More';
    if (key === 'savePreferences') return language === 'pl' ? 'Zapisz preferencje' : 'Save Preferences';

    if (key === 'shipped') return language === 'pl' ? 'Wysłane' : 'Shipped';
    if (key === 'allProducts') return language === 'pl' ? 'Wszystkie produkty' : 'All Products';
    if (key === 'newArrivals') return language === 'pl' ? 'Nowości' : 'New Arrivals';
    if (key === 'bestSellers') return language === 'pl' ? 'Bestsellery' : 'Bestsellers';
    if (key === 'featured') return language === 'pl' ? 'Wyróżnione' : 'Featured';
    if (key === 'priceLowToHigh') return language === 'pl' ? 'Cena: Od najniższej' : 'Price: Low to High';
    if (key === 'priceHighToLow') return language === 'pl' ? 'Cena: Od najwyższej' : 'Price: High to Low';
    if (key === 'nameAtoZ') return language === 'pl' ? 'Nazwa: A do Z' : 'Name: A to Z';
    if (key === 'searchCandles') return language === 'pl' ? 'Szukaj świec...' : 'Search candles...';
    if (key === 'filterBy') return language === 'pl' ? 'Filtruj według' : 'Filter by';
    if (key === 'sortBy') return language === 'pl' ? 'Sortuj według' : 'Sort by';
    if (key === 'noProductsFound') return language === 'pl' ? 'Nie znaleziono produktów' : 'No products found';
    if (key === 'tryAdjusting') return language === 'pl' ? 'Spróbuj dostosować kryteria wyszukiwania lub filtrowania' : 'Try adjusting your search or filter criteria';
    if (key === 'clearFilters') return language === 'pl' ? 'Wyczyść filtry' : 'Clear Filters';
    if (key === 'loadMoreProducts') return language === 'pl' ? 'Załaduj więcej produktów' : 'Load More Products';
    if (key === 'product') return language === 'pl' ? 'produkt' : 'product';
    if (key === 'products') return language === 'pl' ? 'produkty' : 'products';
    if (key === 'pleaseLogIn') return language === 'pl' ? 'Proszę się zalogować' : 'Please Log In';
    if (key === 'needLoginCart') return language === 'pl' ? 'Musisz być zalogowany, aby zobaczyć swój koszyk' : 'You need to be logged in to view your cart';
    if (key === 'orderSummary') return language === 'pl' ? 'Podsumowanie zamówienia' : 'Order Summary';
    if (key === 'addedToCart') return language === 'pl' ? 'Dodano do koszyka' : 'Added to Cart';
    if (key === 'addedToWishlist') return language === 'pl' ? 'Dodano do listy życzeń' : 'Added to Wishlist';
    if (key === 'removedFromWishlist') return language === 'pl' ? 'Usunięto z listy życzeń' : 'Removed from Wishlist';
    if (key === 'inspiredBy') return language === 'pl' ? 'Zainspirowane przez' : 'Inspired by';
    
    // Order Timeline
    if (key === 'orderTimeline') return language === 'pl' ? 'Oś czasu zamówienia' : 'Order Timeline';
    if (key === 'orderCreated') return language === 'pl' ? 'Zamówienie utworzone' : 'Order Created';
    if (key === 'paymentConfirmed') return language === 'pl' ? 'Płatność potwierdzona' : 'Payment Confirmed';
    if (key === 'adminConfirmed') return language === 'pl' ? 'Zamówienie potwierdzone' : 'Order Confirmed';
    if (key === 'shipmentCreated') return language === 'pl' ? 'Przesyłka utworzona' : 'Shipment Created';
    if (key === 'inTransit') return language === 'pl' ? 'W tranzycie' : 'In Transit';
    if (key === 'delivered') return language === 'pl' ? 'Dostarczone' : 'Delivered';
    
    // Bulk Actions
    if (key === 'bulkComplete') return language === 'pl' ? 'Zakończ wybrane' : 'Complete Selected';
    if (key === 'bulkSyncTracking') return language === 'pl' ? 'Synchronizuj śledzenie' : 'Sync Tracking';
    if (key === 'bulkDelete') return language === 'pl' ? 'Usuń wybrane' : 'Delete Selected';
    if (key === 'ordersSelected') return language === 'pl' ? 'Zamówień wybranych' : 'Orders selected';
    if (key === 'clearSelection') return language === 'pl' ? 'Wyczyść wybór' : 'Clear Selection';
    if (key === 'ordersCompleted') return language === 'pl' ? 'Zamówień zakończonych' : 'Orders completed';
    if (key === 'ordersSynced') return language === 'pl' ? 'Zamówień zsynchronizowanych' : 'Orders synced';
    if (key === 'ordersDeleted') return language === 'pl' ? 'Zamówień przeniesiono do kosza' : 'Orders moved to trash';
    if (key === 'bulkDeleteConfirm') return language === 'pl' ? 'Czy na pewno chcesz przenieść wybrane Zamówienia do kosza?' : 'Are you sure you want to move selected Orders to trash?';
    if (key === 'noPaidOrders') return language === 'pl' ? 'Nie wybrano zamówień OPŁACONYCH' : 'No PAID Orders selected';
    if (key === 'noOrdersWithTracking') return language === 'pl' ? 'NIE wybrano Zamówień z przesyłkami FURGONETKA' : 'NO Orders with FURGONETKA packages selected';
    if (key === 'syncing') return language === 'pl' ? 'Synchronizacja...' : 'Syncing...';
    if (key === 'syncingAllOrders') return language === 'pl' ? 'Synchronizacja wszystkich Zamówień ze śledzeniem' : 'Syncing all Orders with Tracking';
    if (key === 'syncTriggered') return language === 'pl' ? 'Ręczna synchronizacja uruchomiona' : 'Manual sync triggered successfully';
    if (key === 'syncAllTracking') return language === 'pl' ? 'Synchronizuj Wszystko' : 'Sync All Tracking';

    // About Page
    if (key === 'naturalSoyWax') return language === 'pl' ? 'Naturalny wosk sojowy' : 'Natural Soy Wax';
    if (key === 'naturalSoyWaxDesc') return language === 'pl' ? 'Ekologiczny i odnawialny, pali się czyszciej i dłużej' : 'Eco-friendly and renewable, burns cleaner and longer';
    if (key === 'woodenWicks') return language === 'pl' ? 'Drewniane knoty' : 'Wooden Wicks';
    if (key === 'woodenWicksDesc') return language === 'pl' ? 'Przyjemne trzaskanie przypominające kominek' : 'Pleasant crackling reminiscent of a fireplace';
    if (key === 'handPouredWithLove') return language === 'pl' ? 'Ręcznie wylewane z miłością' : 'Hand-Poured with Love';
    if (key === 'handPouredDesc') return language === 'pl' ? 'Każda świeca jest starannie wykonana ręcznie' : 'Each candle is carefully crafted by hand';
    if (key === 'luxuryFragrances') return language === 'pl' ? 'Luksusowe zapachy' : 'Luxury Fragrances';
    if (key === 'luxuryFragrancesDesc') return language === 'pl' ? 'Inspirowane najlepszymi perfumami świata' : 'Inspired by the world\'s finest perfumes';
    if (key === 'aboutIntro1') return language === 'pl' ? 'Tworzymy wyjątkowe świece zapachowe, powstające w 100% ręcznie, z dbałością o najmniejsze szczegóły. Nasza misją jest wprowadzanie ciepła, relaksu i wyjątkowej atmosfery do wnętrz naszych klientów.' : 'We create unique scented candles, made 100% by hand, with attention to the smallest details. Our mission is to bring warmth, relaxation, and a unique atmosphere to our customers\' interiors.';
    if (key === 'aboutIntro2') return language === 'pl' ? 'Każda świeca to historia, emocja, chwila, którą chcesz zachować. Łączymy pasję z rzemiosłem, aby dostarczyć produkty, które są nie tylko piękne, ale także bezpieczne dla Ciebie i środowiska.' : 'Each candle is a story, an emotion, a moment you want to preserve. We combine passion with craftsmanship to deliver products that are not only beautiful but also safe for you and the environment.';
    
    // Official Features from PDF
    if (key === 'feature1Title') return language === 'pl' ? '100% Naturalny Wosk Sojowy' : '100% Natural Soy Wax';
    if (key === 'feature1Desc') return language === 'pl' ? 'Bezpieczny dla zdrowia, przyjazny dla środowiska wosk, który pali się czysto i dłużej niż tradycyjna parafina.' : 'Safe for health, environmentally friendly wax that burns cleanly and longer than traditional paraffin.';
    if (key === 'feature2Title') return language === 'pl' ? 'Ręcznie Wykonane' : 'Handcrafted';
    if (key === 'feature2Desc') return language === 'pl' ? 'Każda świeca jest unikatowa, tworzona z pasją i starannością przez wykwalifikowanych rzemieślników.' : 'Each candle is unique, created with passion and care by skilled artisans.';
    if (key === 'feature3Title') return language === 'pl' ? 'Gramatura 180g' : '180g Optimal Size';
    if (key === 'feature3Desc') return language === 'pl' ? 'Optymalny rozmiar zapewniający długi czas palenia i intensywność zapachu w całej przestrzeni.' : 'Perfect weight ensuring long burn time and optimal fragrance intensity throughout your space.';
    if (key === 'feature4Title') return language === 'pl' ? 'Ekskluzywne Kompozycje Zapachowe' : 'Exclusive Fragrances';
    if (key === 'feature4Desc') return language === 'pl' ? 'Inspirowane światowymi perfumami i orientalnymi aromatami, nasze kompozycje tworzą niezapomniane atmosfery.' : 'Inspired by world perfumes and oriental aromas, our compositions create unforgettable atmospheres.';
    if (key === 'feature5Title') return language === 'pl' ? 'Ekologiczne Opakowania' : 'Eco-Friendly Packaging';
    if (key === 'feature5Desc') return language === 'pl' ? 'Używamy materiałów biodegradowalnych i wielokrotnego użytku, dbając o naszą planetę przy każdym produkcie.' : 'We use biodegradable and reusable materials, caring for our planet with every product.';
    if (key === 'feature6Title') return language === 'pl' ? 'Możliwość Personalizacji' : 'Personalization Available';
    if (key === 'feature6Desc') return language === 'pl' ? 'Stwórz świece z indywidualnym napisem, kolorem czy zapachem na naprawdę wyjątkowy prezent.' : 'Create candles with custom inscriptions, colors, or fragrances for a truly unique gift.';
    
    if (key === 'discoverOurCollection') return language === 'pl' ? 'Odkryj naszą kolekcję' : 'Discover Our Collection';
    if (key === 'whyChooseSpiritCandles') return language === 'pl' ? 'Dlaczego Spirit Candles?' : 'Why Spirit Candles?';
    if (key === 'whyChooseDesc') return language === 'pl' ? 'Jakość, craftsmanship i dbałość o środowisko w każdym produkcie' : 'Quality, craftsmanship and environmental care in every product';
    if (key === 'ourStory') return language === 'pl' ? 'Nasza historia' : 'Our Story';
    if (key === 'storyPara1') return language === 'pl' ? 'Spirit Candle narodził się z pasji do tworzenia chwil spokoju w szybko zmieniającym się świecie. Wierzymy, że każdy zasługuje na przestrzeń do relaksu i odnowy.' : 'Spirit Candle was born from a passion for creating moments of peace in a fast-paced world. We believe everyone deserves a space for relaxation and renewal.';
    if (key === 'storyPara2') return language === 'pl' ? 'Nasze świece to efekt miłości do natury i kunsztu. Używamy wyłącznie naturalnych składników i dbamy o każdy detal – od wyboru zapachów po ręczne wylewanie każdej świecy.' : 'Our candles are the result of a love for nature and craftsmanship. We use only natural ingredients and care for every detail – from choosing fragrances to hand-pouring each candle.';
    if (key === 'storyPara3') return language === 'pl' ? 'Jesteśmy dumni z tego, że możemy być częścią Twoich najważniejszych chwil – czy to wieczorny relaks, medytacja, czy po prostu tworzenie przytulnej atmosfery w domu.' : 'We are proud to be part of your most important moments – whether it\'s an evening relaxation, meditation, or simply creating a cozy atmosphere at home.';
    if (key === 'philosophyQuote') return language === 'pl' ? '"Zapalenie świecy to prosty gest, który tworzy magię – chwilę tylko dla Ciebie"' : '"Lighting a candle is a simple gesture that creates magic – a moment just for you"';
    if (key === 'philosophyCite') return language === 'pl' ? 'Filozofia Spirit Candle' : 'Spirit Candle Philosophy';
    if (key === 'legalDisclaimer') return language === 'pl' ? 'Uwaga prawna:' : 'Legal Disclaimer:';
    if (key === 'legalDisclaimerText') return language === 'pl' ? 'Spirit Candle jest niezależną marką. Nasze produkty są inspirowane popularnymi zapachami znanych marek, ale nie są z nimi powiązane. Wszystkie znaki towarowe należą do ich prawnych właścicieli.' : 'Spirit Candle is an independent brand. Our products are inspired by popular fragrances from well-known brands but are not affiliated with them. All trademarks belong to their respective owners.';

    // Shop Page
    if (key === 'ourCollection') return language === 'pl' ? 'Nasza kolekcja' : 'Our Collection';
    if (key === 'discoverCompleteRange') return language === 'pl' ? 'Odkryj pełną gamę luksusowych świec sojowych Spirit Candle' : 'Discover the complete range of Spirit Candle luxury soy candles';

    // Collections Page
    if (key === 'luxuryCollection') return language === 'pl' ? 'Kolekcja Luksusowa' : 'Luxury Collection';
    if (key === 'luxuryCollectionDesc') return language === 'pl' ? 'Wyrafinowane zapachy inspirowane prestiżowymi perfumami' : 'Sophisticated fragrances inspired by prestigious perfumes';
    if (key === 'freshAndClean') return language === 'pl' ? 'Świeże i czyste' : 'Fresh & Clean';
    if (key === 'freshDesc') return language === 'pl' ? 'Orzeźwiające nuty dla czystej atmosfery' : 'Refreshing notes for a clean atmosphere';
    if (key === 'romanticEvening') return language === 'pl' ? 'Romantyczny wieczór' : 'Romantic Evening';
    if (key === 'romanticDesc') return language === 'pl' ? 'Ciepłe, zmysłowe zapachy na wyjątkowe chwile' : 'Warm, sensual fragrances for special moments';
    if (key === 'bestSellersDesc') return language === 'pl' ? 'Nasze najpopularniejsze zapachy uwielbianych przez klientów' : 'Our most popular fragrances loved by customers';
    if (key === 'featured') return language === 'pl' ? 'Polecane' : 'Featured';
    if (key === 'ourCollections') return language === 'pl' ? 'Nasze kolekcje' : 'Our Collections';
    if (key === 'discoverCuratedCollections') return language === 'pl' ? 'Odkryj starannie dobrane kolekcje zapachów dla każdej okazji i nastroju' : 'Discover carefully curated fragrance collections for every occasion and mood';
    if (key === 'exploreCollectionPage') return language === 'pl' ? 'Zobacz kolekcję' : 'Explore Collection';
    if (key === 'backToAllCollections') return language === 'pl' ? 'Powrót do wszystkich kolekcji' : 'Back to All Collections';
    if (key === 'moreProductsComingSoon') return language === 'pl' ? 'Wkrótce więcej produktów' : 'More products coming soon';
    if (key === 'cantDecide') return language === 'pl' ? 'Nie możesz się zdecydować?' : 'Can\'t Decide?';
    if (key === 'shopAllCandles') return language === 'pl' ? 'Zobacz wszystkie świece' : 'Shop All Candles';

    // Contact Page
    if (key === 'emailUs') return language === 'pl' ? 'Napisz do nas' : 'Email Us';
    if (key === 'sendUsQuestionsAnytime') return language === 'pl' ? 'Wyślij nam pytania w dowolnym momencie' : 'Send us questions anytime';
    if (key === 'callUs') return language === 'pl' ? 'Zadzwoń do nas' : 'Call Us';
    if (key === 'monFri9to18CET') return language === 'pl' ? 'Pon-Pt 9:00-18:00 CET' : 'Mon-Fri 9:00-18:00 CET';
    if (key === 'visitUs') return language === 'pl' ? 'Odwiedź nas' : 'Visit Us';
    if (key === 'responseTime') return language === 'pl' ? 'Czas odpowiedzi' : 'Response Time';
    if (key === 'weAimToRespondQuickly') return language === 'pl' ? 'Staramy się odpowiadać szybko' : 'We aim to respond quickly';
    if (key === 'missingInformation') return language === 'pl' ? 'Brakujące informacje' : 'Missing Information';
    if (key === 'pleaseFillRequired') return language === 'pl' ? 'Wypełnij wszystkie wymagane pola' : 'Please fill all required fields';
    if (key === 'mustAcceptPrivacy') return language === 'pl' ? 'Musisz zaakceptować Politykę prywatności' : 'You must accept the Privacy Policy';
    if (key === 'messageSentSuccessfully') return language === 'pl' ? 'Wiadomość wysłana pomyślnie' : 'Message Sent Successfully';
    if (key === 'thankYouContact') return language === 'pl' ? 'Dziękujemy za kontakt. Odpowiemy wkrótce.' : 'Thank you for contacting us. We will respond soon.';
    if (key === 'errorSendingMessage') return language === 'pl' ? 'Błąd podczas wysyłania wiadomości' : 'Error sending message';
    if (key === 'getInTouch') return language === 'pl' ? 'Skontaktuj się z nami' : 'Get In Touch';
    if (key === 'contactIntro') return language === 'pl' ? 'Masz pytania? Chcesz dowiedzieć się więcej o naszych świecach? Jesteśmy tu, aby pomóc!' : 'Have questions? Want to learn more about our candles? We\'re here to help!';
    if (key === 'sendUsAMessage') return language === 'pl' ? 'Wyślij nam wiadomość' : 'Send Us a Message';
    if (key === 'yourFullName') return language === 'pl' ? 'Twoje imię i nazwisko' : 'Your Full Name';
    if (key === 'yourEmail') return language === 'pl' ? 'Twój email' : 'Your Email';
    if (key === 'selectCategory') return language === 'pl' ? 'Wybierz kategorię' : 'Select Category';
    if (key === 'categoryInfo') return language === 'pl' ? 'Informacje o produkcie' : 'Product Information';
    if (key === 'categoryGeneric') return language === 'pl' ? 'Ogólne pytanie' : 'General Question';
    if (key === 'categoryOrder') return language === 'pl' ? 'Pytanie o zamówienie' : 'Order Question';
    if (key === 'categoryShipping') return language === 'pl' ? 'Wysyłka i dostawa' : 'Shipping & Delivery';
    if (key === 'categoryOther') return language === 'pl' ? 'Inne' : 'Other';
    if (key === 'subject') return language === 'pl' ? 'Temat' : 'Subject';
    if (key === 'whatsThisAbout') return language === 'pl' ? 'O co chodzi?' : 'What\'s this about?';
    if (key === 'message') return language === 'pl' ? 'Wiadomość' : 'Message';
    if (key === 'tellUsHowWeCanHelp') return language === 'pl' ? 'Powiedz nam, jak możemy pomóc...' : 'Tell us how we can help...';
    if (key === 'iAcceptPrivacy') return language === 'pl' ? 'Akceptuję' : 'I accept the';
    if (key === 'sendMessage') return language === 'pl' ? 'Wyślij wiadomość' : 'Send Message';
    if (key === 'howLongBurn') return language === 'pl' ? 'Jak długo palą się świece?' : 'How long do candles burn?';
    if (key === 'burnTimeAnswer') return language === 'pl' ? 'Nasze świece palą się od 40 do 60 godzin, w zależności od rozmiaru.' : 'Our candles burn for 40-60 hours depending on size.';
    if (key === 'areEcoFriendly') return language === 'pl' ? 'Czy są ekologiczne?' : 'Are they eco-friendly?';
    if (key === 'ecoAnswer') return language === 'pl' ? 'Tak! Używamy naturalnego wosku sojowego, drewnianych knotów i ekologicznych opakowań.' : 'Yes! We use natural soy wax, wooden wicks, and eco-friendly packaging.';
    if (key === 'shipInternationally') return language === 'pl' ? 'Czy wysyłacie międzynarodowo?' : 'Do you ship internationally?';
    if (key === 'shippingAnswer') return language === 'pl' ? 'Tak, wysyłamy do większości krajów UE. Szczegóły na stronie Dostawa.' : 'Yes, we ship to most EU countries. See our Shipping page for details.';
    if (key === 'viewAllFaqs') return language === 'pl' ? 'Zobacz wszystkie FAQ' : 'View All FAQs';
    if (key === 'spiritCandleSite') return language === 'pl' ? 'Lokalizacja Spirit Candle' : 'Spirit Candle Location';
    if (key === 'customerServiceHours') return language === 'pl' ? 'Godziny obsługi klienta' : 'Customer Service Hours';
    if (key === 'emailSupport') return language === 'pl' ? 'Wsparcie e-mail' : 'Email Support';
    if (key === 'responseTime24') return language === 'pl' ? 'Odpowiedź w ciągu 24-48 godzin' : '24-48 hour response time';
    if (key === 'phoneSupport') return language === 'pl' ? 'Wsparcie telefoniczne' : 'Phone Support';
    if (key === 'phoneHours') return language === 'pl' ? 'Pon-Pt: 9:00-18:00 CET' : 'Mon-Fri: 9:00-18:00 CET';

    // Coupon & Checkout translations
    if (key === 'haveCoupon') return language === 'pl' ? 'Masz KUPON?' : 'Have a COUPON?';
    if (key === 'enterCouponCode') return language === 'pl' ? 'Wprowadź Kod Kuponu' : 'Enter Coupon Code';
    if (key === 'apply') return language === 'pl' ? 'Zastosuj' : 'Apply';
    if (key === 'applying') return language === 'pl' ? 'Zastosowanie...' : 'Applying...';
    if (key === 'couponApplied') return language === 'pl' ? 'Kupon został pomyślnie zastosowany!' : 'Coupon APPLIED successfully!';
    if (key === 'invalidCoupon') return language === 'pl' ? 'Nieprawidłowy lub wygasły kod Kuponu' : 'Invalid or expired Coupon Code';
    if (key === 'couponNotYetValid') return language === 'pl' ? 'Ten Kupon nie jest jeszcze ważny' : 'This Coupon is not yet valid';
    if (key === 'couponExpired') return language === 'pl' ? 'Ten Kupon wygasł' : 'This Coupon has expired';
    if (key === 'couponMaxRedemptions') return language === 'pl' ? 'Ten Cupon osiągnął limit użycia' : 'This Coupon has reached its usage limit';
    if (key === 'couponError') return language === 'pl' ? 'Błąd podczas stosowania Cuponu' : 'Failed to apply Coupon';
    if (key === 'checkoutError') return language === 'pl' ? 'Błąd podczas tworzenia sesji zakupu. Spróbuj ponownie.' : 'Failed to create checkout session. Please try again.';
    if (key === 'couponProductsOnly') return language === 'pl' ? 'Ten kupon jest ważny tylko dla określonych produktów' : 'This coupon is only valid for specific products';
    if (key === 'userPromotedToAdmin') return language === 'pl' ? 'Użytkownik został awansowany na administratora' : 'User promoted to administrator';
    if (key === 'userDemotedToUser') return language === 'pl' ? 'Administrator został obniżony do użytkownika' : 'Administrator demoted to user';
    if (key === 'success') return language === 'pl' ? 'Sukces' : 'Success';
    if (key === 'autoRotate') return language === 'pl' ? 'Automatyczna rotacja' : 'Auto-rotate';
    if (key === 'endConversation') return language === 'pl' ? 'Zakończ rozmowę i zamknij czat' : 'End conversation and close chat';
    
    // Billing translations
    if (key === 'billing') return language === 'pl' ? 'Płatności' : 'Billing';
    if (key === 'billingSettings') return language === 'pl' ? 'Ustawienia Płatności' : 'Billing Settings';
    if (key === 'billingSettingsDesc') return language === 'pl' ? 'Zarządzaj metodami płatności i fakturami' : 'Manage payment methods and invoices';
    if (key === 'billingInfo') return language === 'pl' ? 'Informacje o Płatnościach' : 'Billing Information';
    
    // Dashboard tabs
    if (key === 'rewards') return language === 'pl' ? 'Nagrody' : 'Rewards';
    if (key === 'referrals') return language === 'pl' ? 'Polecenia' : 'Referrals';
    if (key === 'referralsRewards') return language === 'pl' ? 'Polecenia i Nagrody' : 'Referrals & Rewards';
    
    // Public Profile
    if (key === 'publicProfile') return language === 'pl' ? 'Profil Publiczny' : 'Public Profile';
    if (key === 'profileNotAvailable') return language === 'pl' ? 'Profil niedostępny' : 'Profile Not Available';
    if (key === 'profileNotAvailableDesc') return language === 'pl' ? 'Ten profil nie jest jeszcze dostępny.' : 'This profile is not available yet.';
    if (key === 'createYourProfile') return language === 'pl' ? 'Utwórz swój profil' : 'Create Your Profile';
    if (key === 'createProfileDesc') return language === 'pl' ? 'Skonfiguruj swój publiczny profil, aby dzielić się swoją historią z innymi.' : 'Set up your public profile to share your story with others.';
    if (key === 'goToSettings') return language === 'pl' ? 'Przejdź do Ustawień' : 'Go to Settings';
    if (key === 'backToHome') return language === 'pl' ? 'Wróć do Strony Głównej' : 'Back to Home';
    if (key === 'backToShop') return language === 'pl' ? 'Wróć do Sklepu' : 'Back to Shop';
    if (key === 'backToProduct') return language === 'pl' ? 'Wróć do Produktu' : 'Back to Product';
    
    // Comments social system
    if (key === 'addComment') return language === 'pl' ? 'Dodaj Komentarz' : 'Add Comment';
    if (key === 'writeComment') return language === 'pl' ? 'Napisz komentarz...' : 'Write a comment...';
    if (key === 'reply') return language === 'pl' ? 'Odpowiedz' : 'Reply';
    if (key === 'writeReply') return language === 'pl' ? 'Napisz odpowiedź...' : 'Write a reply...';
    if (key === 'send') return language === 'pl' ? 'Wyślij' : 'Send';
    if (key === 'cancel') return language === 'pl' ? 'Anuluj' : 'Cancel';
    if (key === 'commentAdded') return language === 'pl' ? 'Komentarz został dodany' : 'Comment added';
    if (key === 'commentFailed') return language === 'pl' ? 'Nie udało się dodać komentarza' : 'Failed to add comment';
    if (key === 'rateComment') return language === 'pl' ? 'Oceń komentarz' : 'Rate comment';
    if (key === 'likes') return language === 'pl' ? 'Polubień' : 'Likes';
    if (key === 'replies') return language === 'pl' ? 'Odpowiedzi' : 'Replies';
    
    // Load More
    if (key === 'loadMore') return language === 'pl' ? 'Załaduj Więcej' : 'Load More';
    if (key === 'loadMoreProducts') return language === 'pl' ? 'Załaduj Więcej Produktów' : 'Load More Products';
    
    // Language Preferences
    if (key === 'languagePreferences') return language === 'pl' ? 'Preferencje Językowe' : 'Language Preferences';
    if (key === 'settingsDesc') return language === 'pl' ? 'Zarządzaj ustawieniami języka witryny i wiadomości e-mail' : 'Manage your site and email language settings';
    if (key === 'emailLanguageUpdated') return language === 'pl' ? 'Język e-mail zaktualizowany' : 'Email language updated';

    // Custom Candles
    if (key === 'customCandles') return language === 'pl' ? 'Personalizowane Świece' : 'Custom Candles';
    if (key === 'customize') return language === 'pl' ? 'Personalizacja' : 'Customize';
    if (key === 'designYourCandle') return language === 'pl' ? 'Zaprojektuj swoją świecę' : 'Design Your Candle';
    if (key === 'sendRequest') return language === 'pl' ? 'Wyślij zapytanie' : 'Send Request';
    if (key === 'requestSent') return language === 'pl' ? 'Zapytanie wysłane!' : 'Request Sent!';
    if (key === 'whatIsCustomization') return language === 'pl' ? 'Czym jest personalizacja?' : 'What is Customization?';
    if (key === 'qualityGuarantee') return language === 'pl' ? 'Gwarancja Jakości' : 'Quality Guarantee';
    if (key === 'chooseFrangrance') return language === 'pl' ? 'Wybierz zapach' : 'Choose Fragrance';
    if (key === 'labelText') return language === 'pl' ? 'Tekst na etykiecie' : 'Label Text';
    if (key === 'quantity') return language === 'pl' ? 'Ilość' : 'Quantity';
    if (key === 'additionalNotes') return language === 'pl' ? 'Dodatkowe uwagi' : 'Additional Notes';
    if (key === 'wantToPersonalize') return language === 'pl' ? 'Chcesz spersonalizować swoją świecę?' : 'Want to Personalize Your Candle?';

    // Orders & Shipping
    if (key === 'shippingInformation') return language === 'pl' ? 'Informacje o wysyłce' : 'Shipping Information';
    if (key === 'carrier') return language === 'pl' ? 'Przewoźnik' : 'Carrier';
    if (key === 'status') return language === 'pl' ? 'Status' : 'Status';
    if (key === 'trackingNumber') return language === 'pl' ? 'Numer przesyłki' : 'Tracking Number';
    if (key === 'trackPackage') return language === 'pl' ? 'Śledź przesyłkę' : 'Track Package';

    // Upload Images
    if (key === 'uploadProfilePicture') return language === 'pl' ? 'Prześlij Zdjęcie Profilowe' : 'Upload Profile Picture';
    if (key === 'uploadCoverImage') return language === 'pl' ? 'Prześlij Obraz Okładki' : 'Upload Cover Image';
    if (key === 'adjustYourImage') return language === 'pl' ? 'Dostosuj Swój Obraz' : 'Adjust Your Image';
    if (key === 'saveImage') return language === 'pl' ? 'Zapisz Obraz' : 'Save Image';

    // Comments & Pagination
    if (key === 'replyAdded') return language === 'pl' ? 'Odpowiedź dodana' : 'Reply added';
    if (key === 'commentDeleted') return language === 'pl' ? 'Komentarz usunięty' : 'Comment deleted';
    if (key === 'page') return language === 'pl' ? 'Strona' : 'Page';
    if (key === 'previous') return language === 'pl' ? 'Poprzednia' : 'Previous';
    if (key === 'next') return language === 'pl' ? 'Następna' : 'Next';

    // Default fallback
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageState, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
