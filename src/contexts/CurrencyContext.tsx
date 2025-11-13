/**
 * Currency Context
 * 
 * IMPORTANT: Currency conversion is ONLY for display purposes!
 * 
 * - NEVER use converted prices for Stripe payments
 * - NEVER use converted prices for Furgonetka shipping
 * - NEVER use converted prices for database storage
 * - ALWAYS use price_pln for calculations and API calls
 * 
 * This context only converts prices for UI display.
 * All actual transactions remain in PLN.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Currency, 
  CURRENCIES, 
  DEFAULT_CURRENCY,
  getCurrencyFromCountry,
  CurrencyInfo
} from '@/config/currencies';

interface CurrencyContextType {
  currency: Currency;
  country: string;
  exchangeRate: number;
  setCurrency: (currency: Currency) => void;
  convertPrice: (plnPrice: number) => number;
  formatPrice: (plnPrice: number) => string;
  isLoading: boolean;
  currencyInfo: CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem('currency');
    return (stored as Currency && CURRENCIES[stored as Currency]) ? stored as Currency : DEFAULT_CURRENCY;
  });
  const [country, setCountry] = useState<string>('PL');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  // Rileva paese al primo caricamento
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Controlla cache (24 ore)
        const cachedCountry = localStorage.getItem('detected_country');
        const cacheTime = localStorage.getItem('detected_country_time');
        
        if (cachedCountry && cacheTime && Date.now() - parseInt(cacheTime) < 24 * 60 * 60 * 1000) {
          setCountry(cachedCountry);
          const detectedCurrency = getCurrencyFromCountry(cachedCountry);
          setCurrencyState(detectedCurrency);
          localStorage.setItem('currency', detectedCurrency);
          setIsLoading(false);
          return;
        }

        // Chiama Edge Function per rilevare il paese
        const { data, error } = await supabase.functions.invoke('detect-country');
        if (!error && data?.country) {
          setCountry(data.country);
          localStorage.setItem('detected_country', data.country);
          localStorage.setItem('detected_country_time', Date.now().toString());
          
          const detectedCurrency = getCurrencyFromCountry(data.country);
          setCurrencyState(detectedCurrency);
          localStorage.setItem('currency', detectedCurrency);
        }
      } catch (error) {
        console.error('Error detecting country:', error);
        // Fallback a PLN se rilevamento fallisce
        setCountry('PL');
        setCurrencyState(DEFAULT_CURRENCY);
      } finally {
        setIsLoading(false);
      }
    };

    detectCountry();
  }, []);

  // Carica tassi di cambio quando cambia la valuta
  useEffect(() => {
    const loadExchangeRate = async () => {
      if (currency === 'PLN') {
        setExchangeRate(1);
        return;
      }

      try {
        // Controlla cache (1 ora)
        const cachedRate = localStorage.getItem(`exchange_rate_${currency}`);
        const cacheTime = localStorage.getItem(`exchange_rate_${currency}_time`);
        
        if (cachedRate && cacheTime && Date.now() - parseInt(cacheTime) < 60 * 60 * 1000) {
          const rate = parseFloat(cachedRate);
          if (!isNaN(rate) && rate > 0) {
            console.log(`Using cached exchange rate for ${currency}:`, rate);
            setExchangeRate(rate);
            return;
          }
        }

        console.log(`Fetching exchange rate for ${currency}...`);
        
        // Chiama Edge Function per ottenere tasso di cambio
        const { data, error } = await supabase.functions.invoke('get-exchange-rates', {
          body: { target: currency }
        });
        
        console.log('Exchange rate response:', { data, error });
        
        if (error) {
          console.error('Error from Edge Function:', error);
          // Se c'è un errore, usa un tasso di cambio approssimativo come fallback
          // Ma mostra un warning in console
          console.warn(`Using fallback exchange rate for ${currency}. Please check Edge Function.`);
          // Non impostare rate: 1, ma usa un valore approssimativo basato su valute comuni
          // Questo è solo per visualizzazione, quindi va bene avere un'approssimazione
          const fallbackRates: Record<string, number> = {
            'EUR': 0.23, // 1 PLN ≈ 0.23 EUR
            'USD': 0.25, // 1 PLN ≈ 0.25 USD
            'GBP': 0.20, // 1 PLN ≈ 0.20 GBP
            'CHF': 0.22, // 1 PLN ≈ 0.22 CHF
            'JPY': 37.5, // 1 PLN ≈ 37.5 JPY
            'CNY': 1.8, // 1 PLN ≈ 1.8 CNY
            'KRW': 330, // 1 PLN ≈ 330 KRW
            'INR': 21, // 1 PLN ≈ 21 INR
            'AUD': 0.38, // 1 PLN ≈ 0.38 AUD
            'CAD': 0.34, // 1 PLN ≈ 0.34 CAD
            'RUB': 23, // 1 PLN ≈ 23 RUB
          };
          const fallbackRate = fallbackRates[currency] || 1;
          setExchangeRate(fallbackRate);
          return;
        }
        
        if (data?.rate && !isNaN(data.rate) && data.rate > 0) {
          console.log(`Exchange rate for ${currency}:`, data.rate);
          setExchangeRate(data.rate);
          localStorage.setItem(`exchange_rate_${currency}`, data.rate.toString());
          localStorage.setItem(`exchange_rate_${currency}_time`, Date.now().toString());
        } else {
          console.error('Invalid rate in response:', data);
          // Usa fallback come sopra
          const fallbackRates: Record<string, number> = {
            'EUR': 0.23,
            'USD': 0.25,
            'GBP': 0.20,
            'CHF': 0.22,
            'JPY': 37.5,
            'CNY': 1.8,
            'KRW': 330,
            'INR': 21,
            'AUD': 0.38,
            'CAD': 0.34,
            'RUB': 23,
          };
          const fallbackRate = fallbackRates[currency] || 1;
          setExchangeRate(fallbackRate);
        }
      } catch (error) {
        console.error('Error loading exchange rate:', error);
        // Usa fallback
        const fallbackRates: Record<string, number> = {
          'EUR': 0.23,
          'USD': 0.25,
          'GBP': 0.20,
          'CHF': 0.22,
          'JPY': 37.5,
          'CNY': 1.8,
          'KRW': 330,
          'INR': 21,
          'AUD': 0.38,
          'CAD': 0.34,
          'RUB': 23,
        };
        const fallbackRate = fallbackRates[currency] || 1;
        setExchangeRate(fallbackRate);
      }
    };

    loadExchangeRate();
  }, [currency]);

  const setCurrency = useCallback((newCurrency: Currency) => {
    if (!CURRENCIES[newCurrency]) {
      console.error('Invalid currency:', newCurrency);
      return;
    }
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  }, []);

  /**
   * Converti prezzo da PLN alla valuta selezionata
   * IMPORTANTE: Solo per visualizzazione, non usare per calcoli reali!
   */
  const convertPrice = useCallback((plnPrice: number): number => {
    if (isNaN(plnPrice) || plnPrice < 0) return 0;
    return plnPrice * exchangeRate;
  }, [exchangeRate]);

  /**
   * Formatta prezzo con simbolo valuta
   * IMPORTANTE: Solo per visualizzazione, non usare per calcoli reali!
   */
  const formatPrice = useCallback((plnPrice: number): string => {
    const converted = convertPrice(plnPrice);
    const currencyInfo = CURRENCIES[currency];
    const { symbol, symbolPosition, decimals } = currencyInfo;
    
    // Formatta il numero con i decimali corretti
    let formatted: string;
    if (decimals === 0) {
      formatted = Math.round(converted).toLocaleString('en-US');
    } else {
      formatted = converted.toFixed(decimals);
      // Aggiungi separatori migliaia
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formatted = parts.join('.');
    }
    
    // Aggiungi simbolo valuta
    return symbolPosition === 'before' 
      ? `${symbol}${formatted}`
      : `${formatted} ${symbol}`;
  }, [currency, convertPrice]);

  const currencyInfo = CURRENCIES[currency];

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        country,
        exchangeRate,
        setCurrency,
        convertPrice,
        formatPrice,
        isLoading,
        currencyInfo,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
