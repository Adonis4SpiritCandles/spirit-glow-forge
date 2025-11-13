/**
 * Currency Configuration
 * 
 * This file contains all supported currencies and their mapping to countries.
 * Currency conversion is ONLY for display purposes - all transactions (Stripe, Furgonetka)
 * and database storage use PLN as the base currency.
 */

export type Currency = 
  // Europa (Euro)
  | 'EUR'
  // Europa (non-Euro)
  | 'GBP' | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' 
  | 'RON' | 'BGN' | 'HRK' | 'ISK' | 'RSD' | 'BAM' | 'MKD' | 'ALL' 
  | 'MDL' | 'UAH' | 'BYN'
  // Americhe
  | 'USD' | 'CAD' | 'MXN' | 'BRL' | 'ARS' | 'CLP' | 'COP' | 'PEN' 
  | 'UYU' | 'VES'
  // Asia
  | 'CNY' | 'JPY' | 'KRW' | 'INR' | 'IDR' | 'THB' | 'SGD' | 'MYR' 
  | 'PHP' | 'VND' | 'TWD' | 'HKD'
  // Eurasia
  | 'RUB' | 'KZT' | 'TRY'
  // Oceania
  | 'AUD' | 'NZD'
  // Africa
  | 'ZAR' | 'EGP' | 'MAD' | 'TND' | 'DZD' | 'NGN' | 'KES';

export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimals: number; // 0 per JPY, KRW, etc.
  countries: string[]; // Codici paese ISO-2
}

// Lista completa di tutte le valute supportate
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  // Europa (Euro)
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['AT', 'BE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LU', 'NL', 'PT', 'ES', 'EE', 'LV', 'LT', 'SI', 'SK', 'CY', 'MT']
  },
  
  // Europa (non-Euro)
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['GB']
  },
  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['CH', 'LI']
  },
  SEK: {
    code: 'SEK',
    name: 'Swedish Krona',
    symbol: 'kr',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['SE']
  },
  NOK: {
    code: 'NOK',
    name: 'Norwegian Krone',
    symbol: 'kr',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['NO']
  },
  DKK: {
    code: 'DKK',
    name: 'Danish Krone',
    symbol: 'kr',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['DK']
  },
  PLN: {
    code: 'PLN',
    name: 'Polish Złoty',
    symbol: 'PLN',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['PL']
  },
  CZK: {
    code: 'CZK',
    name: 'Czech Koruna',
    symbol: 'Kč',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['CZ']
  },
  HUF: {
    code: 'HUF',
    name: 'Hungarian Forint',
    symbol: 'Ft',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['HU']
  },
  RON: {
    code: 'RON',
    name: 'Romanian Leu',
    symbol: 'lei',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['RO']
  },
  BGN: {
    code: 'BGN',
    name: 'Bulgarian Lev',
    symbol: 'лв',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['BG']
  },
  HRK: {
    code: 'HRK',
    name: 'Croatian Kuna',
    symbol: 'kn',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['HR']
  },
  ISK: {
    code: 'ISK',
    name: 'Icelandic Króna',
    symbol: 'kr',
    symbolPosition: 'after',
    decimals: 0,
    countries: ['IS']
  },
  RSD: {
    code: 'RSD',
    name: 'Serbian Dinar',
    symbol: 'дин',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['RS']
  },
  BAM: {
    code: 'BAM',
    name: 'Bosnia-Herzegovina Convertible Mark',
    symbol: 'KM',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['BA']
  },
  MKD: {
    code: 'MKD',
    name: 'Macedonian Denar',
    symbol: 'ден',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['MK']
  },
  ALL: {
    code: 'ALL',
    name: 'Albanian Lek',
    symbol: 'L',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['AL']
  },
  MDL: {
    code: 'MDL',
    name: 'Moldovan Leu',
    symbol: 'L',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['MD']
  },
  UAH: {
    code: 'UAH',
    name: 'Ukrainian Hryvnia',
    symbol: '₴',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['UA']
  },
  BYN: {
    code: 'BYN',
    name: 'Belarusian Ruble',
    symbol: 'Br',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['BY']
  },
  
  // Americhe
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['US']
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['CA']
  },
  MXN: {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: '$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['MX']
  },
  BRL: {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['BR']
  },
  ARS: {
    code: 'ARS',
    name: 'Argentine Peso',
    symbol: '$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['AR']
  },
  CLP: {
    code: 'CLP',
    name: 'Chilean Peso',
    symbol: '$',
    symbolPosition: 'before',
    decimals: 0,
    countries: ['CL']
  },
  COP: {
    code: 'COP',
    name: 'Colombian Peso',
    symbol: '$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['CO']
  },
  PEN: {
    code: 'PEN',
    name: 'Peruvian Sol',
    symbol: 'S/',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['PE']
  },
  UYU: {
    code: 'UYU',
    name: 'Uruguayan Peso',
    symbol: '$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['UY']
  },
  VES: {
    code: 'VES',
    name: 'Venezuelan Bolívar',
    symbol: 'Bs',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['VE']
  },
  
  // Asia
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['CN']
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    symbolPosition: 'before',
    decimals: 0,
    countries: ['JP']
  },
  KRW: {
    code: 'KRW',
    name: 'South Korean Won',
    symbol: '₩',
    symbolPosition: 'before',
    decimals: 0,
    countries: ['KR']
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['IN']
  },
  IDR: {
    code: 'IDR',
    name: 'Indonesian Rupiah',
    symbol: 'Rp',
    symbolPosition: 'before',
    decimals: 0,
    countries: ['ID']
  },
  THB: {
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['TH']
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['SG']
  },
  MYR: {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['MY']
  },
  PHP: {
    code: 'PHP',
    name: 'Philippine Peso',
    symbol: '₱',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['PH']
  },
  VND: {
    code: 'VND',
    name: 'Vietnamese Dong',
    symbol: '₫',
    symbolPosition: 'after',
    decimals: 0,
    countries: ['VN']
  },
  TWD: {
    code: 'TWD',
    name: 'New Taiwan Dollar',
    symbol: 'NT$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['TW']
  },
  HKD: {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    symbol: 'HK$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['HK']
  },
  
  // Eurasia
  RUB: {
    code: 'RUB',
    name: 'Russian Ruble',
    symbol: '₽',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['RU']
  },
  KZT: {
    code: 'KZT',
    name: 'Kazakhstani Tenge',
    symbol: '₸',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['KZ']
  },
  TRY: {
    code: 'TRY',
    name: 'Turkish Lira',
    symbol: '₺',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['TR']
  },
  
  // Oceania
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['AU']
  },
  NZD: {
    code: 'NZD',
    name: 'New Zealand Dollar',
    symbol: 'NZ$',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['NZ']
  },
  
  // Africa
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['ZA']
  },
  EGP: {
    code: 'EGP',
    name: 'Egyptian Pound',
    symbol: 'E£',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['EG']
  },
  MAD: {
    code: 'MAD',
    name: 'Moroccan Dirham',
    symbol: 'د.م.',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['MA']
  },
  TND: {
    code: 'TND',
    name: 'Tunisian Dinar',
    symbol: 'د.ت',
    symbolPosition: 'after',
    decimals: 3,
    countries: ['TN']
  },
  DZD: {
    code: 'DZD',
    name: 'Algerian Dinar',
    symbol: 'د.ج',
    symbolPosition: 'after',
    decimals: 2,
    countries: ['DZ']
  },
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['NG']
  },
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    symbolPosition: 'before',
    decimals: 2,
    countries: ['KE']
  },
};

// Mappatura paese → valuta
export const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  // Paesi Euro
  'AT': 'EUR', 'BE': 'EUR', 'FI': 'EUR', 'FR': 'EUR', 'DE': 'EUR',
  'GR': 'EUR', 'IE': 'EUR', 'IT': 'EUR', 'LU': 'EUR', 'NL': 'EUR',
  'PT': 'EUR', 'ES': 'EUR', 'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR',
  'SI': 'EUR', 'SK': 'EUR', 'CY': 'EUR', 'MT': 'EUR',
  
  // Europa (non-Euro)
  'GB': 'GBP', 'CH': 'CHF', 'LI': 'CHF', 'SE': 'SEK', 'NO': 'NOK',
  'DK': 'DKK', 'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF', 'RO': 'RON',
  'BG': 'BGN', 'HR': 'HRK', 'IS': 'ISK', 'RS': 'RSD', 'BA': 'BAM',
  'MK': 'MKD', 'AL': 'ALL', 'MD': 'MDL', 'UA': 'UAH', 'BY': 'BYN',
  
  // Americhe
  'US': 'USD', 'CA': 'CAD', 'MX': 'MXN', 'BR': 'BRL', 'AR': 'ARS',
  'CL': 'CLP', 'CO': 'COP', 'PE': 'PEN', 'UY': 'UYU', 'VE': 'VES',
  
  // Asia
  'CN': 'CNY', 'JP': 'JPY', 'KR': 'KRW', 'IN': 'INR', 'ID': 'IDR',
  'TH': 'THB', 'SG': 'SGD', 'MY': 'MYR', 'PH': 'PHP', 'VN': 'VND',
  'TW': 'TWD', 'HK': 'HKD',
  
  // Eurasia
  'RU': 'RUB', 'KZ': 'KZT', 'TR': 'TRY',
  
  // Oceania
  'AU': 'AUD', 'NZ': 'NZD',
  
  // Africa
  'ZA': 'ZAR', 'EG': 'EGP', 'MA': 'MAD', 'TN': 'TND', 'DZ': 'DZD',
  'NG': 'NGN', 'KE': 'KES',
};

// Lista di tutte le valute supportate (per selettore)
export const SUPPORTED_CURRENCIES: Currency[] = Object.keys(CURRENCIES) as Currency[];

// Valuta di default (fallback)
export const DEFAULT_CURRENCY: Currency = 'PLN';

// Ottieni valuta da codice paese
export const getCurrencyFromCountry = (countryCode: string): Currency => {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || DEFAULT_CURRENCY;
};

// Ottieni informazioni valuta
export const getCurrencyInfo = (currency: Currency): CurrencyInfo => {
  return CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
};



