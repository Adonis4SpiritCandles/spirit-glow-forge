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

    // Validate Furgonetka limits
    const errors = [];
    if (address.name.length > FURGONETKA_LIMITS.name) {
      errors.push(`${t('fullName') || 'Name'}: max ${FURGONETKA_LIMITS.name} characters`);
    }
    if (fullStreet.length > FURGONETKA_LIMITS.street) {
      errors.push(`${t('streetAddress') || 'Street'}: max ${FURGONETKA_LIMITS.street} characters`);
    }
    if (address.city.length > FURGONETKA_LIMITS.city) {
      errors.push(`${t('city') || 'City'}: max ${FURGONETKA_LIMITS.city} characters`);
    }
    if (address.postalCode.length > FURGONETKA_LIMITS.postalCode) {
      errors.push(`${t('postalCode') || 'Postal Code'}: max ${FURGONETKA_LIMITS.postalCode} characters`);
    }
    if (combinedPhone.length > FURGONETKA_LIMITS.phone) {
      errors.push(`${t('phone') || 'Phone'}: max ${FURGONETKA_LIMITS.phone} characters`);
    }
    if (address.email.length > FURGONETKA_LIMITS.email) {
      errors.push(`${t('email') || 'Email'}: max ${FURGONETKA_LIMITS.email} characters`);
    }

    if (errors.length > 0) {
      toast({
        title: t('validationError') || 'Validation Error',
        description: errors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    onSubmit({
      ...address,
      street: fullStreet,
      phone: combinedPhone,
    });
  };

  // Furgonetka field length limits
  const FURGONETKA_LIMITS = {
    name: 35,
    street: 35,
    city: 35,
    postalCode: 10,
    phone: 20,
    email: 100,
  };

  const countries = [
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' },
    { code: 'EE', name: 'Estonia' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'GR', name: 'Greece' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IT', name: 'Italy' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MT', name: 'Malta' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NO', name: 'Norway' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'RO', name: 'Romania' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'ES', name: 'Spain' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'GB', name: 'United Kingdom' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-playfair">{t('shippingAddress') || 'Shipping Address'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('fullName') || 'Full Name'}
              <span className="text-xs text-muted-foreground ml-2">
                ({address.name.length}/{FURGONETKA_LIMITS.name})
              </span>
            </Label>
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
              className={address.name.length > FURGONETKA_LIMITS.name ? 'border-red-500' : 
                         address.name.length > FURGONETKA_LIMITS.name * 0.9 ? 'border-yellow-500' : ''}
              placeholder="John Doe"
            />
            {address.name.length > FURGONETKA_LIMITS.name && (
              <p className="text-xs text-red-500">
                {t('fieldTooLong') || `This field is too long. Maximum ${FURGONETKA_LIMITS.name} characters.`}
              </p>
            )}
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

          <div className="space-y-2 relative">
            <Label htmlFor="street">
              {t('streetAddress')}
              <span className="text-xs text-muted-foreground ml-2">
                ({address.street.length}/{FURGONETKA_LIMITS.street})
              </span>
            </Label>
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
                className={address.street.length > FURGONETKA_LIMITS.street ? 'border-red-500' : 
                           address.street.length > FURGONETKA_LIMITS.street * 0.9 ? 'border-yellow-500' : ''}
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
            {address.street.length > FURGONETKA_LIMITS.street && (
              <p className="text-xs text-red-500">
                {t('fieldTooLong') || `This field is too long. Maximum ${FURGONETKA_LIMITS.street} characters.`}
              </p>
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
              <Label htmlFor="city">
                {t('city')}
                <span className="text-xs text-muted-foreground ml-2">
                  ({address.city.length}/{FURGONETKA_LIMITS.city})
                </span>
              </Label>
              <Input
                id="city"
                required
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className={address.city.length > FURGONETKA_LIMITS.city ? 'border-red-500' : 
                           address.city.length > FURGONETKA_LIMITS.city * 0.9 ? 'border-yellow-500' : ''}
                placeholder=""
              />
              {address.city.length > FURGONETKA_LIMITS.city && (
                <p className="text-xs text-red-500">
                  {t('fieldTooLong') || `Max ${FURGONETKA_LIMITS.city} chars`}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">
                {t('postalCode')}
                <span className="text-xs text-muted-foreground ml-2">
                  ({address.postalCode.length}/{FURGONETKA_LIMITS.postalCode})
                </span>
              </Label>
              <Input
                id="postalCode"
                required
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                className={address.postalCode.length > FURGONETKA_LIMITS.postalCode ? 'border-red-500' : 
                           address.postalCode.length > FURGONETKA_LIMITS.postalCode * 0.9 ? 'border-yellow-500' : ''}
                placeholder=""
              />
              {address.postalCode.length > FURGONETKA_LIMITS.postalCode && (
                <p className="text-xs text-red-500">
                  {t('fieldTooLong') || `Max ${FURGONETKA_LIMITS.postalCode} chars`}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {t('email') || 'Email'}
              <span className="text-xs text-muted-foreground ml-2">
                ({address.email.length}/{FURGONETKA_LIMITS.email})
              </span>
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={address.email}
              onChange={(e) => setAddress({ ...address, email: e.target.value })}
              className={address.email.length > FURGONETKA_LIMITS.email ? 'border-red-500' : 
                         address.email.length > FURGONETKA_LIMITS.email * 0.9 ? 'border-yellow-500' : ''}
              placeholder="john@example.com"
            />
            {address.email.length > FURGONETKA_LIMITS.email && (
              <p className="text-xs text-red-500">
                {t('fieldTooLong') || `This field is too long. Maximum ${FURGONETKA_LIMITS.email} characters.`}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              {t('phone') || 'Phone'}
              <span className="text-xs text-muted-foreground ml-2">
                ({(phonePrefix + ' ' + phoneNumber).trim().length}/{FURGONETKA_LIMITS.phone})
              </span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                id="phonePrefix"
                type="tel"
                required
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                className={(phonePrefix + ' ' + phoneNumber).trim().length > FURGONETKA_LIMITS.phone ? 'border-red-500' : 
                           (phonePrefix + ' ' + phoneNumber).trim().length > FURGONETKA_LIMITS.phone * 0.9 ? 'border-yellow-500' : ''}
                placeholder="+48"
              />
              <Input
                id="phoneNumber"
                type="tel"
                required
                className={`col-span-2 ${(phonePrefix + ' ' + phoneNumber).trim().length > FURGONETKA_LIMITS.phone ? 'border-red-500' : 
                           (phonePrefix + ' ' + phoneNumber).trim().length > FURGONETKA_LIMITS.phone * 0.9 ? 'border-yellow-500' : ''}`}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder=""
              />
            </div>
            <p className="text-xs text-muted-foreground">{t('phonePrefixHint') === 'phonePrefixHint' ? "Telephone prefix (include '+', e.g., +48)" : t('phonePrefixHint') || "Telephone prefix (include '+', e.g., +48)"}</p>
            {(phonePrefix + ' ' + phoneNumber).trim().length > FURGONETKA_LIMITS.phone && (
              <p className="text-xs text-red-500">
                {t('fieldTooLong') || `This field is too long. Maximum ${FURGONETKA_LIMITS.phone} characters.`}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full whitespace-normal min-h-[2.5rem]" disabled={isLoading}>
            {isLoading ? t('calculating') : t('calculateShipping')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShippingAddressForm;
