import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    home: 'Home',
    shop: 'Shop', 
    collections: 'Collections',
    about: 'About',
    contact: 'Contact',
    cart: 'Cart',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    adminDashboard: 'Admin Dashboard',

    // Product
    addToCart: 'Add to Cart',
    price: 'Price',
    size: 'Size',
    weight: 'Weight',
    category: 'Category',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    quantity: 'Quantity',
    viewProduct: 'View Product',
    featuredCollection: 'Featured Collection',
    featuredCollectionDescription: 'Discover our most beloved luxury soy candles, each inspired by iconic fragrances and crafted with the finest natural ingredients.',
    exploreFullCollection: 'Explore Full Collection',

    // Cart
    shoppingCart: 'Shopping Cart',
    emptyCart: 'Your cart is empty',
    addSomeCandles: 'Add some candles to get started',
    browseCollection: 'Browse Collection',
    subtotal: 'Subtotal',
    total: 'Total',
    checkoutNow: 'Checkout Now',
    viewFullCart: 'View Full Cart',
    items: 'items',
    clearCart: 'Clear Cart',
    continueShopping: 'Continue Shopping',
    shipping: 'Shipping',
    freeShipping: 'Free',
    remove: 'Remove',

    // Admin
    productManagement: 'Product Management',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    productName: 'Product Name',
    productDescription: 'Product Description',
    productImage: 'Product Image',
    uploadImage: 'Upload Image',
    selectImage: 'Select Image',
    imageUploaded: 'Image uploaded successfully',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    optional: 'Optional',

    // Forms
    email: 'Email',
    password: 'Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    confirmPassword: 'Confirm Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',

    // Hero Section
    heroTitle: 'Spirit of Candles',
    heroSubtitle: 'Illuminate Your Soul with Luxury Scented Candles',
    shopNow: 'Shop Now',
    exploreCollection: 'Explore Full Collection',

    // Categories
    luxury: 'Luxury',
    nature: 'Nature', 
    fresh: 'Fresh',

    // Footer
    quickLinks: 'Quick Links',
    customerService: 'Customer Service',
    followUs: 'Follow Us',
    allRightsReserved: 'All rights reserved',

    // Admin (continued)
    products: 'Products',
    orders: 'Orders',
    customers: 'Customers',
    settings: 'Settings',
    productPrice: 'Product Price',
    productCategory: 'Product Category',
    productSize: 'Product Size',
    stockQuantity: 'Stock Quantity',
    imageUrl: 'Image URL',
    
    // User Dashboard
    profile: 'Profile',
    accountStatus: 'Account Status',
    spiritMembers: 'Spirit Members',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    orderHistory: 'Order History',
    noOrders: 'No orders found',
    language: 'Language',
    preferredLanguage: 'Preferred Language',
    
    // Search
    search: 'Search',
    searchPlaceholder: 'Search products...',
    searchResults: 'Search Results',
    noResults: 'No products found',
    
    // Contact
    contactUs: 'Contact Us',
    name: 'Name',
    message: 'Message',
    sendMessage: 'Send Message',
    subject: 'Subject',
    getInTouch: 'Get in Touch',
    sendUsAMessage: 'Send us a Message',
    contactInformation: 'Contact Information',
    emailUs: 'Email Us',
    callUs: 'Call Us',
    visitUs: 'Visit Us',
    responseTime: 'Response Time',
    frequentlyAskedQuestions: 'Frequently Asked Questions',
    viewAllFaqs: 'View All FAQs',
    customerServiceHours: 'Customer Service Hours',
    emailSupport: 'Email Support',
    phoneSupport: 'Phone Support',
    
    // Dashboard additions
    revenue: 'Revenue',
    manageProductInventory: 'Manage your product inventory',
    addNewProduct: 'Add New Product',
    editProductTitle: 'Edit Product',
    updateProduct: 'Update Product',
    createProduct: 'Create Product',
    deleteConfirm: 'Are you sure you want to delete this product?',
    billing: 'Billing',
    status: 'Status',
    customerDetails: 'Customer Details',
    viewDetails: 'View Details',
    exportData: 'Export Data',
    statistics: 'Statistics',
    
    // Form labels
    nameEn: 'Name (EN)',
    namePl: 'Name (PL)',
    descriptionEn: 'Description (EN)',
    descriptionPl: 'Description (PL)',
    pricePln: 'Price PLN (cents)',
    priceEur: 'Price EUR (cents)',
    
    // Animations and UI
    materializing: 'Materializing',
    shopCollection: 'Shop Collection',
    learnOurStory: 'Learn Our Story',
    rebornYourNature: 'Reborn Your Nature',
  },
  pl: {
    // Navigation  
    home: 'Strona główna',
    shop: 'Sklep',
    collections: 'Kolekcje', 
    about: 'O nas',
    contact: 'Kontakt',
    cart: 'Koszyk',
    login: 'Zaloguj',
    register: 'Rejestracja',
    logout: 'Wyloguj',
    dashboard: 'Panel',
    adminDashboard: 'Panel administratora',

    // Product
    addToCart: 'Dodaj do koszyka',
    price: 'Cena',
    size: 'Rozmiar',
    weight: 'Waga',
    category: 'Kategoria',
    inStock: 'Dostępny',
    outOfStock: 'Wyprzedany',
    quantity: 'Ilość',
    viewProduct: 'Zobacz produkt',
    featuredCollection: 'Kolekcja wyróżniona',
    featuredCollectionDescription: 'Odkryj nasze najbardziej ukochane luksusowe świece sojowe, każda inspirowana kultowymi zapachami i stworzona z najlepszych naturalnych składników.',
    exploreFullCollection: 'Poznaj pełną kolekcję',

    // Cart
    shoppingCart: 'Koszyk zakupów',
    emptyCart: 'Twój koszyk jest pusty',
    addSomeCandles: 'Dodaj świece aby rozpocząć',
    browseCollection: 'Przeglądaj kolekcję', 
    subtotal: 'Suma częściowa',
    total: 'Razem',
    checkoutNow: 'Zamów teraz',
    viewFullCart: 'Zobacz pełny koszyk',
    items: 'przedmiotów',
    clearCart: 'Wyczyść koszyk',
    continueShopping: 'Kontynuuj zakupy',
    shipping: 'Dostawa',
    freeShipping: 'Darmowa',
    remove: 'Usuń',

     // Admin
    productManagement: 'Zarządzanie produktami',
    orderManagement: 'Zarządzanie zamówieniami', 
    customerManagement: 'Zarządzanie klientami',
    adminSettings: 'Ustawienia administratora',
    addProduct: 'Dodaj produkt',
    editProduct: 'Edytuj produkt',
    deleteProduct: 'Usuń produkt',
    productName: 'Nazwa produktu',
    productDescription: 'Opis produktu',
    productImage: 'Zdjęcie produktu',
    uploadImage: 'Wgraj zdjęcie',
    selectImage: 'Wybierz zdjęcie',
    imageUploaded: 'Zdjęcie wgrane pomyślnie',
    productPrice: 'Cena produktu',
    productCategory: 'Kategoria produktu',
    productSize: 'Rozmiar produktu',
    productWeight: 'Waga produktu (opcjonalnie)',
    stockQuantity: 'Stan magazynowy',
    imageUrl: 'URL obrazu',
    save: 'Zapisz',
    cancel: 'Anuluj',
    delete: 'Usuń',
    edit: 'Edytuj',
    optional: 'Opcjonalne',
    products: 'Produkty',
    orders: 'Zamówienia',
    customers: 'Klienci',
    settings: 'Ustawienia',

    // Forms
    email: 'Email',
    password: 'Hasło',
    firstName: 'Imię',
    lastName: 'Nazwisko',
    confirmPassword: 'Potwierdź hasło',
    signIn: 'Zaloguj się',
    signUp: 'Zarejestruj się',
    dontHaveAccount: 'Nie masz konta?',
    alreadyHaveAccount: 'Masz już konto?',
    changePassword: 'Zmień hasło',
    currentPassword: 'Obecne hasło',
    newPassword: 'Nowe hasło',
    confirmNewPassword: 'Potwierdź nowe hasło',

    // Hero Section
    heroTitle: 'Duch Świec',
    heroSubtitle: 'Oświetl swoją duszę luksusowymi świecami zapachowymi',
    shopNow: 'Kup teraz',
    exploreCollection: 'Poznaj pełną kolekcję',

    // Categories
    luxury: 'Luksus',
    nature: 'Natura',
    fresh: 'Świeżość',

    // Footer  
    quickLinks: 'Szybkie linki',
    customerService: 'Obsługa klienta',
    followUs: 'Śledź nas',
    allRightsReserved: 'Wszelkie prawa zastrzeżone',

     
    // User Dashboard
    profile: 'Profil',
    accountStatus: 'Status konta',
    spiritMembers: 'Członkowie Spirit',
    editProfile: 'Edytuj profil',
    saveChanges: 'Zapisz zmiany',
    orderHistory: 'Historia zamówień',
    noOrders: 'Nie znaleziono zamówień',
    language: 'Język',
    preferredLanguage: 'Preferowany język',
    
    // Search
    search: 'Szukaj',
    searchPlaceholder: 'Szukaj produktów...',
    searchResults: 'Wyniki wyszukiwania',
    noResults: 'Nie znaleziono produktów',
    
    // Contact
    contactUs: 'Skontaktuj się z nami',
    name: 'Imię',
    message: 'Wiadomość',
    sendMessage: 'Wyślij wiadomość',
    subject: 'Temat',
    getInTouch: 'Skontaktuj się z nami',
    sendUsAMessage: 'Wyślij nam wiadomość',
    contactInformation: 'Informacje kontaktowe',
    emailUs: 'Napisz do nas',
    callUs: 'Zadzwoń',
    visitUs: 'Odwiedź nas',
    responseTime: 'Czas odpowiedzi',
    frequentlyAskedQuestions: 'Często zadawane pytania',
    viewAllFaqs: 'Zobacz wszystkie FAQ',
    customerServiceHours: 'Godziny obsługi klienta',
    emailSupport: 'Wsparcie email',
    phoneSupport: 'Wsparcie telefoniczne',
    
    // Dashboard additions
    revenue: 'Przychody',
    manageProductInventory: 'Zarządzaj swoim asortymentem',
    addNewProduct: 'Dodaj nowy produkt',
    editProductTitle: 'Edytuj produkt',
    updateProduct: 'Zaktualizuj produkt',
    createProduct: 'Utwórz produkt',
    deleteConfirm: 'Czy na pewno chcesz usunąć ten produkt?',
    billing: 'Płatności',
    status: 'Status',
    customerDetails: 'Szczegóły klienta',
    viewDetails: 'Zobacz szczegóły',
    exportData: 'Eksportuj dane',
    statistics: 'Statystyki',
    
    // Form labels
    nameEn: 'Nazwa (EN)',
    namePl: 'Nazwa (PL)',
    descriptionEn: 'Opis (EN)',
    descriptionPl: 'Opis (PL)',
    pricePln: 'Cena PLN (grosze)',
    priceEur: 'Cena EUR (centy)',
    
    // Animations and UI
    materializing: 'Materializuje się',
    shopCollection: 'Kup kolekcję',
    learnOurStory: 'Poznaj naszą historię',
    rebornYourNature: 'Odrodzenie twojej natury',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};