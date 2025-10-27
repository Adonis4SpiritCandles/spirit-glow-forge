import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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
  const [phonePrefix, setPhonePrefix] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

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
    // Helper to escape regex special chars
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Build full street: "street streetNumber[/apartment]" avoiding duplication
    const baseStreet = address.street.trim();
    const num = address.streetNumber.trim();
    const apt = address.apartmentNumber.trim();

    const hasNumInStreet = num ? new RegExp(`\\b${escapeRegExp(num)}\\b`).test(baseStreet) : false;
    let fullStreet = hasNumInStreet || !num ? baseStreet : `${baseStreet} ${num}`;

    if (apt) {
      fullStreet = /\d$/.test(fullStreet) ? `${fullStreet}/${apt}` : `${fullStreet} ${apt}`;
    }

    // Combine phone: require prefix, keep one field in payload
    const normalizedPrefix = phonePrefix.trim().startsWith('+')
      ? phonePrefix.trim()
      : (phonePrefix.trim() ? `+${phonePrefix.trim()}` : '');
    const combinedPhone = [normalizedPrefix, phoneNumber.trim()].filter(Boolean).join(' ');

    onSubmit({
      ...address,
      street: fullStreet,
      phone: combinedPhone,
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
              onChange={(e) => {
                const value = e.target.value;
                // Remove numbers while user types
                const cleanedValue = value.replace(/[0-9]/g, '');
                setAddress({ ...address, name: cleanedValue });
              }}
              onBlur={(e) => {
                const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
                if (e.target.value && !nameRegex.test(e.target.value)) {
                  toast({
                    title: t('invalidName') || 'Invalid Name',
                    description: t('nameCannotContainNumbers') || 'Name and surname cannot contain numbers',
                    variant: 'destructive'
                  });
                }
              }}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="street">{t('streetAddress')}</Label>
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
                placeholder=""
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
              <Label htmlFor="streetNumber">{t('streetNumber') === 'streetNumber' ? 'Street Number' : t('streetNumber') || 'Street Number'}</Label>
              <Input
                id="streetNumber"
                required
                value={address.streetNumber}
                onChange={(e) => setAddress({ ...address, streetNumber: e.target.value })}
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apartmentNumber">{t('apartmentNumber')}</Label>
              <Input
                id="apartmentNumber"
                value={address.apartmentNumber}
                onChange={(e) => setAddress({ ...address, apartmentNumber: e.target.value })}
                placeholder=""
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t('city')}</Label>
              <Input
                id="city"
                required
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">{t('postalCode')}</Label>
              <Input
                id="postalCode"
                required
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                placeholder=""
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">{t('country') === 'country' ? 'Country' : t('country') || 'Country'}</Label>
            <Select value={address.country} onValueChange={(value) => setAddress({ ...address, country: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t('country') === 'country' ? 'Country' : t('country')} />
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
            <div className="grid grid-cols-3 gap-2">
              <Input
                id="phonePrefix"
                type="tel"
                required
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                placeholder="+48"
              />
              <Input
                id="phoneNumber"
                type="tel"
                required
                className="col-span-2"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder=""
              />
            </div>
            <p className="text-xs text-muted-foreground">{t('phonePrefixHint') === 'phonePrefixHint' ? "Telephone prefix (include '+', e.g., +48)" : t('phonePrefixHint') || "Telephone prefix (include '+', e.g., +48)"}</p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('calculating') : t('calculateShipping')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShippingAddressForm;
