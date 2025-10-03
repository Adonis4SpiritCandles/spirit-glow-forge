import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ShippingAddress {
  name: string;
  street: string;
  streetNumber: string;
  apartmentNumber: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
}

interface ShippingAddressFormProps {
  onSubmit: (address: ShippingAddress) => void;
  isLoading?: boolean;
}

interface AddressSuggestion {
  description: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

const ShippingAddressForm = ({ onSubmit, isLoading }: ShippingAddressFormProps) => {
  const { t } = useLanguage();
  const [address, setAddress] = useState<ShippingAddress>({
    name: '',
    street: '',
    streetNumber: '',
    apartmentNumber: '',
    city: '',
    postalCode: '',
    country: 'PL',
    email: '',
    phone: ''
  });
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('places-autocomplete', {
        body: { query, country: address.country }
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [address.country]);

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setAddress({
      ...address,
      street: suggestion.street,
      city: suggestion.city,
      postalCode: suggestion.postalCode,
      country: suggestion.country
    });
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine street, streetNumber, and apartmentNumber into full street address
    const fullStreet = [
      address.street,
      address.streetNumber,
      address.apartmentNumber ? `/${address.apartmentNumber}` : ''
    ].filter(Boolean).join(' ').trim();
    
    onSubmit({
      ...address,
      street: fullStreet
    });
  };

  const countries = [
    { code: 'PL', name: 'Poland' },
    { code: 'IT', name: 'Italy' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'UK', name: 'United Kingdom' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-playfair">{t('shippingAddress') || 'Shipping Address'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('fullName') || 'Full Name'}</Label>
            <Input
              id="name"
              required
              value={address.name}
              onChange={(e) => setAddress({ ...address, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="street">{t('streetAddress') || 'Street Address'}</Label>
            <div className="relative">
              <Input
                id="street"
                required
                value={address.street}
                onChange={(e) => {
                  setAddress({ ...address, street: e.target.value });
                  fetchAddressSuggestions(e.target.value);
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Via Roma"
              />
              {isLoadingSuggestions && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => handleAddressSelect(suggestion)}
                  >
                    <div className="text-sm">{suggestion.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="streetNumber">{t('streetNumber') || 'Street Number'}</Label>
              <Input
                id="streetNumber"
                required
                value={address.streetNumber}
                onChange={(e) => setAddress({ ...address, streetNumber: e.target.value })}
                placeholder="123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apartmentNumber">{t('apartmentNumber') || 'Apartment Number (Optional)'}</Label>
              <Input
                id="apartmentNumber"
                value={address.apartmentNumber}
                onChange={(e) => setAddress({ ...address, apartmentNumber: e.target.value })}
                placeholder="22"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t('city') || 'City'}</Label>
              <Input
                id="city"
                required
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="Rome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">{t('postalCode') || 'Postal Code'}</Label>
              <Input
                id="postalCode"
                required
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                placeholder="00100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">{t('country') || 'Country'}</Label>
            <Select value={address.country} onValueChange={(value) => setAddress({ ...address, country: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('email') || 'Email'}</Label>
            <Input
              id="email"
              type="email"
              required
              value={address.email}
              onChange={(e) => setAddress({ ...address, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone') || 'Phone'}</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={address.phone}
              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              placeholder="+39 123 456 7890"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (t('calculating') || 'Calculating...') : (t('calculateShipping') || 'Calculate Shipping Options')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShippingAddressForm;
