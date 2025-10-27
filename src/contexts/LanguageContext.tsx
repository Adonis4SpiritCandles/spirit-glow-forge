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

    // Hero Section
    if (key === 'rebornYourNature') return language === 'pl' ? 'Odrodzenie Twojej Natury' : 'Reborn Your Nature';
    if (key === 'heroDescription') return language === 'pl' ? 'Odkryj luksusowe świece sojowe ręcznie wykonane z pasją. Każda świeca to podróż do spokoju i harmonii.' : 'Discover luxurious soy candles handcrafted with passion. Each candle is a journey to peace and harmony.';
    if (key === 'shopCollection') return language === 'pl' ? 'Kup Kolekcję' : 'Shop Collection';
    if (key === 'learnOurStory') return language === 'pl' ? 'Poznaj naszą historię' : 'Learn Our Story';

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
    if (key === 'availableInLanguages') return language === 'pl' ? 'Dostępne w języku polskim i angielskim' : 'Available in Polish and English';
    if (key === 'designedBy') return language === 'pl' ? 'Zaprojektowane z pasją' : 'Designed with passion';
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
    if (key === 'adminDashboard') return language === 'pl' ? 'Panel administratora' : 'Admin Dashboard';
    if (key === 'manageProductInventory') return language === 'pl' ? 'Zarządzaj swoim asortymentem' : 'Manage your product inventory';
    if (key === 'manageCustomerOrders') return language === 'pl' ? 'Zarządzaj zamówieniami klientów i wysyłką' : 'Manage customer orders and shipping';
    if (key === 'addProduct') return language === 'pl' ? 'Dodaj produkt' : 'Add Product';
    if (key === 'editProductTitle') return language === 'pl' ? 'Edytuj produkt' : 'Edit Product';
    if (key === 'addNewProduct') return language === 'pl' ? 'Dodaj nowy produkt' : 'Add New Product';
    if (key === 'dataType') return language === 'pl' ? 'Typ danych' : 'Data Type';
    if (key === 'format') return language === 'pl' ? 'Format' : 'Format';
    if (key === 'exportOrdersCsv') return language === 'pl' ? 'Eksportuj zamówienia jako CSV' : 'Export orders as CSV';
    if (key === 'warehouse') return language === 'pl' ? 'Magazyn' : 'Warehouse';
    if (key === 'monthlyOrders') return language === 'pl' ? 'Miesięczne zamówienia' : 'Monthly Orders';
    if (key === 'salesByCategory') return language === 'pl' ? 'Sprzedaż według kategorii' : 'Sales by Category';
    if (key === 'monthlyRevenue') return language === 'pl' ? 'Miesięczny przychód' : 'Monthly Revenue';
    if (key === 'fromLastMonth') return language === 'pl' ? 'od ostatniego miesiąca' : 'from last month';
    if (key === 'resetDemoOrders') return language === 'pl' ? 'Resetuj zamówienia demo' : 'Reset Demo Orders';
    if (key === 'resetDemoOrdersConfirm') return language === 'pl' ? 'Czy na pewno chcesz usunąć wszystkie zamówienia i zresetować numerację? Tej operacji nie można cofnąć.' : 'Are you sure you want to delete all orders and reset the order number sequence? This action cannot be undone.';
    if (key === 'resettingOrders') return language === 'pl' ? 'Resetowanie zamówień...' : 'Resetting orders...';
    if (key === 'ordersResetSuccess') return language === 'pl' ? 'Wszystkie zamówienia demo zostały usunięte' : 'All demo orders have been deleted successfully';
    if (key === 'ordersResetError') return language === 'pl' ? 'Nie udało się zresetować zamówień' : 'Failed to reset orders';
    if (key === 'excludeFromStats') return language === 'pl' ? 'Wyklucz ze statystyk' : 'Exclude from statistics';
    if (key === 'includeInStats') return language === 'pl' ? 'Uwzględnij w statystykach' : 'Include in statistics';
    if (key === 'statsUpdated') return language === 'pl' ? 'Statystyki zaktualizowane' : 'Statistics updated';
    if (key === 'newOrderNotification') return language === 'pl' ? 'Otrzymano nowe zamówienie!' : 'New order received!';
    if (key === 'viewInDashboard') return language === 'pl' ? 'Zobacz w panelu' : 'View in Dashboard';
    if (key === 'shippingInfo') return language === 'pl' ? 'Informacje o wysyłce' : 'Shipping Info';

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
    if (key === 'removed') return language === 'pl' ? 'Usunięto' : 'Removed';
    if (key === 'updated') return language === 'pl' ? 'Zaktualizowano' : 'Updated';
    if (key === 'synced') return language === 'pl' ? 'Zsynchronizowano' : 'Synced';
    if (key === 'syncingAllOrders') return language === 'pl' ? 'Synchronizacja wszystkich zamówień...' : 'Syncing all orders...';
    if (key === 'doneButton') return language === 'pl' ? 'Zrobione' : 'Done';
    if (key === 'syncing') return language === 'pl' ? 'Synchronizacja' : 'Syncing';
    if (key === 'syncTriggered') return language === 'pl' ? 'Synchronizacja uruchomiona' : 'Sync triggered';

    // User Dashboard
    if (key === 'userDashboard') return language === 'pl' ? 'Panel' : 'Dashboard';
    if (key === 'welcomeBack') return language === 'pl' ? 'Witamy ponownie' : 'Welcome back';
    if (key === 'welcomeBackUser') return language === 'pl' ? 'Witamy ponownie' : 'Welcome back';
    if (key === 'profile') return language === 'pl' ? 'Profil' : 'Profile';
    if (key === 'orders') return language === 'pl' ? 'Zamówienia' : 'Orders';
    if (key === 'payments') return language === 'pl' ? 'Płatności' : 'Payments';
    if (key === 'settings') return language === 'pl' ? 'Ustawienia' : 'Settings';
    if (key === 'accountSettings') return language === 'pl' ? 'Ustawienia konta' : 'Account Settings';
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
    if (key === 'joinFamily') return language === 'pl' ? 'Dołącz do rodziny Spirit of Candles' : 'Join the Spirit of Candles family';

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
    if (key === 'trackPackage') return language === 'pl' ? 'Śledź paczkę' : 'Track package';
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
    if (key === 'complete') return language === 'pl' ? 'Zakończ' : 'Complete';
    if (key === 'furgonetkaPayMiss') return language === 'pl' ? 'Brak płatności Furgonetka' : 'Furgonetka Pay Miss';
    if (key === 'trackingNumb') return language === 'pl' ? 'Numer śledzenia' : 'Tracking Numb.';
    if (key === 'awaitingShipmentConfirmation') return language === 'pl' ? 'Oczekiwanie na potwierdzenie wysyłki' : 'Awaiting shipment confirmation';
    if (key === 'awaitingFurgonetkaSubmission') return language === 'pl' ? 'Oczekiwanie na przesłanie do Furgonetki' : 'Awaiting Furgonetka submission';
    if (key === 'shipmentCreated') return language === 'pl' ? 'Przesyłka utworzona' : 'Shipment created';
    if (key === 'shipped') return language === 'pl' ? 'Wysłano' : 'Shipped';
    if (key === 'shippedSuccessfully') return language === 'pl' ? 'Wysłano pomyślnie' : 'Shipped successfully';
    if (key === 'sentVia') return language === 'pl' ? 'Wysłano przez' : 'Sent via';
    if (key === 'noShipmentCreated') return language === 'pl' ? 'Brak przesyłki' : 'No shipment';
    if (key === 'syncTracking') return language === 'pl' ? 'Synchronizuj śledzenie z Furgonetki' : 'Sync Tracking from Furgonetka';
    if (key === 'syncingTracking') return language === 'pl' ? 'Synchronizowanie...' : 'Syncing...';
    if (key === 'serviceCarrierId') return language === 'pl' ? 'ID usługi przewoźnika' : 'Service Carrier ID';
    if (key === 'viewOrderId') return language === 'pl' ? 'Zobacz ID zamówienia' : 'View Order ID';
    if (key === 'orderIdCopied') return language === 'pl' ? 'ID zamówienia skopiowane do schowka' : 'Order ID copied to clipboard';
    if (key === 'shipTo') return language === 'pl' ? 'Wysłać do' : 'Ship to';
    if (key === 'creationDate') return language === 'pl' ? 'Data utworzenia' : 'Creation Date';
    if (key === 'created') return language === 'pl' ? 'Utworzono' : 'Created';
    
    // New Shipping Status Translations
    if (key === 'awaitingShipmentConfirmation') return language === 'pl' ? 'Oczekiwanie na potwierdzenie' : 'Awaiting confirmation';
    if (key === 'awaitingFurgonetkaSubmission') return language === 'pl' ? 'Oczekiwanie na wysyłkę' : 'Awaiting submission';
    if (key === 'shipmentCreated') return language === 'pl' ? 'Przesyłka utworzona' : 'Shipment created';
    if (key === 'shippedSuccessfully') return language === 'pl' ? 'Wysłano pomyślnie' : 'Shipped successfully';
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
    if (key === 'noShipmentCreated') return language === 'pl' ? 'Brak przesyłki' : 'No shipment';

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
    if (key === 'productWeight') return language === 'pl' ? 'Waga produktu' : 'Product Weight';
    if (key === 'shipmentCreatedSuccess') return language === 'pl' ? 'Przesyłka utworzona pomyślnie' : 'Shipment created successfully';
    if (key === 'admin') return language === 'pl' ? 'Administrator' : 'Admin';

    // Categories
    if (key === 'luxury') return language === 'pl' ? 'Luksus' : 'Luxury';
    if (key === 'nature') return language === 'pl' ? 'Natura' : 'Nature';
    if (key === 'fresh') return language === 'pl' ? 'Świeżość' : 'Fresh';

    // Order Timeline & Bulk Actions
    if (key === 'orderTimeline') return language === 'pl' ? 'Oś czasu zamówienia' : 'Order Timeline';
    if (key === 'orderPlaced') return language === 'pl' ? 'Zamówienie złożone' : 'Order placed';
    if (key === 'paymentReceived') return language === 'pl' ? 'Płatność otrzymana' : 'Payment received';
    if (key === 'orderConfirmedByAdmin') return language === 'pl' ? 'Potwierdzone przez Admina' : 'Confirmed by Admin';
    if (key === 'shipmentCreatedAwaitingPayment') return language === 'pl' ? 'Przesyłka utworzona, oczekiwanie na płatność' : 'Shipment created, awaiting payment';
    if (key === 'packageShipped') return language === 'pl' ? 'Paczka wysłana' : 'Package shipped';
    if (key === 'estimatedDelivery') return language === 'pl' ? 'Szacowana dostawa' : 'Estimated delivery';
    if (key === 'ordersSelected') return language === 'pl' ? 'Zamówień zaznaczonych' : 'orders selected';
    if (key === 'bulkComplete') return language === 'pl' ? 'Zakończ wszystkie' : 'Complete All';
    if (key === 'bulkSyncTracking') return language === 'pl' ? 'Synchronizuj wszystkie' : 'Sync All';
    if (key === 'bulkDelete') return language === 'pl' ? 'Usuń wszystkie' : 'Delete All';
    if (key === 'clearSelection') return language === 'pl' ? 'Wyczyść zaznaczenie' : 'Clear Selection';
    if (key === 'manualSyncAll') return language === 'pl' ? 'Ręcznie synchronizuj wszystkie' : 'Manual Sync All';
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
    if (key === 'emailRequired') return language === 'pl' ? 'Email jest wymagany' : 'Email is required';
    
    // Toast messages
    if (key === 'removed') return language === 'pl' ? 'Usunięto' : 'Removed';
    if (key === 'updated') return language === 'pl' ? 'Zaktualizowano' : 'Updated';
    if (key === 'synced') return language === 'pl' ? 'Zsynchronizowano' : 'Synced';
    if (key === 'syncingAllOrders') return language === 'pl' ? 'Synchronizacja wszystkich zamówień...' : 'Syncing all orders...';
    if (key === 'syncTriggered') return language === 'pl' ? 'Synchronizacja uruchomiona' : 'Sync triggered';
    if (key === 'noPaidOrders') return language === 'pl' ? 'Brak zamówień do zakończenia (tylko zamówienia zapłacone)' : 'No orders to complete (paid orders only)';
    if (key === 'ordersCompleted') return language === 'pl' ? 'zamówień zakończonych' : 'orders completed';
    if (key === 'noOrdersWithTracking') return language === 'pl' ? 'Brak zamówień z przesyłką Furgonetka' : 'No orders with Furgonetka package';
    if (key === 'ordersSynced') return language === 'pl' ? 'zamówień zsynchronizowanych' : 'orders synced';
    if (key === 'bulkDeleteConfirm') return language === 'pl' ? 'Czy na pewno chcesz usunąć zaznaczone zamówienia?' : 'Are you sure you want to delete selected orders?';
    if (key === 'ordersDeleted') return language === 'pl' ? 'zamówień usuniętych' : 'orders deleted';
    if (key === 'syncAllTracking') return language === 'pl' ? 'Synchronizuj wszystkie' : 'Sync All Tracking';
    if (key === 'resetDemoOrders') return language === 'pl' ? 'Reset zamówień (demo)' : 'Reset Orders (demo)';
    if (key === 'resetDemoOrdersConfirm') return language === 'pl' ? 'Czy na pewno chcesz usunąć wszystkie zamówienia testowe? Ta akcja jest nieodwracalna.' : 'Are you sure you want to delete all demo orders? This action cannot be undone.';
    if (key === 'allOrdersDeleted') return language === 'pl' ? 'Wszystkie zamówienia usunięte pomyślnie' : 'All orders deleted successfully';
    if (key === 'doneButton') return language === 'pl' ? 'Zrobione' : 'Done';
    
    // Name Validation
    if (key === 'invalidName') return language === 'pl' ? 'Nieprawidłowe imię' : 'Invalid Name';
    if (key === 'nameCannotContainNumbers') return language === 'pl' ? 'Imię i nazwisko nie mogą zawierać cyfr' : 'Name and surname cannot contain numbers';
    
    // Carrier Names & Shipping
    if (key === 'sendTo') return language === 'pl' ? 'Wyślij do' : 'Send to';
    if (key === 'furgonetka') return language === 'pl' ? 'Furgonetka' : 'Furgonetka';
    
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
    if (key === 'ordersSelected') return language === 'pl' ? 'zamówień wybranych' : 'orders selected';
    if (key === 'clearSelection') return language === 'pl' ? 'Wyczyść wybór' : 'Clear Selection';
    if (key === 'ordersCompleted') return language === 'pl' ? 'zamówień zakończonych' : 'orders completed';
    if (key === 'ordersSynced') return language === 'pl' ? 'zamówień zsynchronizowanych' : 'orders synced';
    if (key === 'ordersDeleted') return language === 'pl' ? 'zamówień przeniesiono do kosza' : 'orders moved to trash';
    if (key === 'bulkDeleteConfirm') return language === 'pl' ? 'Czy na pewno chcesz przenieść wybrane zamówienia do kosza?' : 'Are you sure you want to move selected orders to trash?';
    if (key === 'noPaidOrders') return language === 'pl' ? 'Nie wybrano opłaconych zamówień' : 'No paid orders selected';
    if (key === 'noOrdersWithTracking') return language === 'pl' ? 'Nie wybrano zamówień z przesyłkami Furgonetka' : 'No orders with Furgonetka packages selected';
    if (key === 'syncing') return language === 'pl' ? 'Synchronizacja...' : 'Syncing...';
    if (key === 'syncingAllOrders') return language === 'pl' ? 'Synchronizacja wszystkich zamówień ze śledzeniem' : 'Syncing all orders with tracking';
    if (key === 'syncTriggered') return language === 'pl' ? 'Ręczna synchronizacja uruchomiona' : 'Manual sync triggered successfully';
    if (key === 'syncAllTracking') return language === 'pl' ? 'Synchronizuj wszystko' : 'Sync All Tracking';

    // About Page
    if (key === 'naturalSoyWax') return language === 'pl' ? 'Naturalny wosk sojowy' : 'Natural Soy Wax';
    if (key === 'naturalSoyWaxDesc') return language === 'pl' ? 'Ekologiczny i odnawialny, pali się czyszciej i dłużej' : 'Eco-friendly and renewable, burns cleaner and longer';
    if (key === 'woodenWicks') return language === 'pl' ? 'Drewniane knoty' : 'Wooden Wicks';
    if (key === 'woodenWicksDesc') return language === 'pl' ? 'Przyjemne trzaskanie przypominające kominek' : 'Pleasant crackling reminiscent of a fireplace';
    if (key === 'handPouredWithLove') return language === 'pl' ? 'Ręcznie wylewane z miłością' : 'Hand-Poured with Love';
    if (key === 'handPouredDesc') return language === 'pl' ? 'Każda świeca jest starannie wykonana ręcznie' : 'Each candle is carefully crafted by hand';
    if (key === 'luxuryFragrances') return language === 'pl' ? 'Luksusowe zapachy' : 'Luxury Fragrances';
    if (key === 'luxuryFragrancesDesc') return language === 'pl' ? 'Inspirowane najlepszymi perfumami świata' : 'Inspired by the world\'s finest perfumes';
    if (key === 'aboutIntro1') return language === 'pl' ? 'Spirit Candle to więcej niż świece – to zaproszenie do odkrycia wewnętrznego spokoju i harmonii. Każdy produkt jest starannie wykonany z naturalnego wosku sojowego i zapachów inspirowanych luksusowymi perfumami.' : 'Spirit Candle is more than candles – it\'s an invitation to discover inner peace and harmony. Each product is carefully crafted from natural soy wax and fragrances inspired by luxury perfumes.';
    if (key === 'aboutIntro2') return language === 'pl' ? 'Nasze drewniane knoty tworzą uspokajający, trzaskający dźwięk, a ekologiczne składniki sprawiają, że możesz cieszyć się każdą chwilą bez obaw o środowisko.' : 'Our wooden wicks create a soothing crackling sound, and eco-friendly ingredients mean you can enjoy every moment without worrying about the environment.';
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

    // Default fallback
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageState, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
