import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SUPPORTED_CURRENCIES, CURRENCIES, Currency } from '@/config/currencies';
import { ChevronDown } from 'lucide-react';

const CurrencySelector = () => {
  const { currency, setCurrency, currencyInfo, isLoading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  // Raggruppa valute per regione per migliore UX
  const groupedCurrencies = {
    'Europe': ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'ISK', 'RSD', 'BAM', 'MKD', 'ALL', 'MDL', 'UAH', 'BYN'],
    'Americas': ['USD', 'CAD', 'MXN', 'BRL', 'ARS', 'CLP', 'COP', 'PEN', 'UYU', 'VES'],
    'Asia': ['CNY', 'JPY', 'KRW', 'INR', 'IDR', 'THB', 'SGD', 'MYR', 'PHP', 'VND', 'TWD', 'HKD'],
    'Eurasia': ['RUB', 'KZT', 'TRY'],
    'Oceania': ['AUD', 'NZD'],
    'Africa': ['ZAR', 'EGP', 'MAD', 'TND', 'DZD', 'NGN', 'KES'],
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        ...
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <span className="text-sm font-medium">{currencyInfo.symbol}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">{currency}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-[80vh] overflow-y-auto">
        {Object.entries(groupedCurrencies).map(([region, currencies]) => (
          <div key={region}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
              {region}
            </div>
            {currencies.map((code) => {
              const info = CURRENCIES[code as Currency];
              if (!info) return null;
              
              const isSelected = code === currency;
              
              return (
                <DropdownMenuItem
                  key={code}
                  onClick={() => {
                    setCurrency(code as Currency);
                    setIsOpen(false);
                  }}
                  className={`cursor-pointer ${isSelected ? 'bg-primary/10 font-semibold' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{info.symbol}</span>
                      <span className="text-sm">{info.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{code}</span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;



