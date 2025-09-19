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

    // Product
    addToCart: 'Add to Cart',
    price: 'Price',
    size: 'Size',
    category: 'Category',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    quantity: 'Quantity',

    // Cart
    shoppingCart: 'Shopping Cart',
    emptyCart: 'Your cart is empty',
    addSomeCandles: 'Add some candles to get started',
    browseCollection: 'Browse Collection',
    subtotal: 'Subtotal',
    total: 'Total',
    checkoutNow: 'Checkout Now',
    viewFullCart: 'View Full Cart',
    viewProduct: 'View Product',
    items: 'items',
    clearCart: 'Clear Cart',
    continueShopping: 'Continue Shopping',
    shipping: 'Shipping',
    freeShipping: 'Free',

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

    // Admin
    adminDashboard: 'Admin Dashboard',
    products: 'Products',
    orders: 'Orders',
    customers: 'Customers',
    settings: 'Settings',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    productName: 'Product Name',
    productDescription: 'Product Description',
    productPrice: 'Product Price',
    productCategory: 'Product Category',
    productSize: 'Product Size',
    stockQuantity: 'Stock Quantity',
    imageUrl: 'Image URL',
    uploadImage: 'Upload Image',
    save: 'Save',
    cancel: 'Cancel',
    
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

    // Product
    addToCart: 'Dodaj do koszyka',
    price: 'Cena',
    size: 'Rozmiar', 
    category: 'Kategoria',
    inStock: 'Dostępny',
    outOfStock: 'Wyprzedany',
    quantity: 'Ilość',

    // Cart
    shoppingCart: 'Koszyk zakupów',
    emptyCart: 'Twój koszyk jest pusty',
    addSomeCandles: 'Dodaj świece aby rozpocząć',
    browseCollection: 'Przeglądaj kolekcję', 
    subtotal: 'Suma częściowa',
    total: 'Razem',
    checkoutNow: 'Zamów teraz',
    viewFullCart: 'Zobacz pełny koszyk',
    viewProduct: 'Zobacz produkt',
    items: 'przedmiotów',
    clearCart: 'Wyczyść koszyk',
    continueShopping: 'Kontynuuj zakupy',
    shipping: 'Dostawa',
    freeShipping: 'Darmowa',

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

    // Admin
    adminDashboard: 'Panel administratora',
    products: 'Produkty',
    orders: 'Zamówienia', 
    customers: 'Klienci',
    settings: 'Ustawienia',
    addProduct: 'Dodaj produkt',
    editProduct: 'Edytuj produkt',
    deleteProduct: 'Usuń produkt',
    productName: 'Nazwa produktu',
    productDescription: 'Opis produktu',
    productPrice: 'Cena produktu',
    productCategory: 'Kategoria produktu',
    productSize: 'Rozmiar produktu',
    stockQuantity: 'Stan magazynowy',
    imageUrl: 'URL obrazu',
    uploadImage: 'Prześlij obraz',
    save: 'Zapisz',
    cancel: 'Anuluj',
    
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