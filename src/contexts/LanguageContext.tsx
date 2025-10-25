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
    if (key === 'completeInformation') return language === 'pl' ? 'Pełne informacje dla zamówienia' : 'Complete information for order';

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

    // Status badges
    if (key === 'paid') return language === 'pl' ? 'Opłacone' : 'Paid';
    if (key === 'inTransit') return language === 'pl' ? 'W drodze' : 'In Transit';
    if (key === 'delivered') return language === 'pl' ? 'Dostarczono' : 'Delivered';
    if (key === 'completed') return language === 'pl' ? 'Zakończone' : 'Completed';
    if (key === 'trackPackage') return language === 'pl' ? 'Śledź paczkę' : 'Track Package';
    if (key === 'billing') return language === 'pl' ? 'Płatności' : 'Billing';
    if (key === 'pending') return language === 'pl' ? 'Oczekujące' : 'Pending';
    if (key === 'shipped') return language === 'pl' ? 'Wysłano' : 'Shipped';
    if (key === 'cancelled') return language === 'pl' ? 'Anulowano' : 'Cancelled';

    // Privacy/Legal
    if (key === 'termsOfSale') return language === 'pl' ? 'Regulamin sprzedaży' : 'Terms of Sale';
    if (key === 'privacyPolicy') return language === 'pl' ? 'Polityka prywatności' : 'Privacy Policy';
    if (key === 'consentRequired') return language === 'pl' ? 'Wymagana zgoda' : 'Consent Required';
    if (key === 'mustAcceptTerms') return language === 'pl' ? 'Musisz zaakceptować Regulamin sprzedaży i Politykę prywatności' : 'You must accept the Terms of Sale and Privacy Policy';

    // Default fallback
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageState, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
