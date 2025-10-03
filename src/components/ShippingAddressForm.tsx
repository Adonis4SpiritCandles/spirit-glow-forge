import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface ShippingAddress {
  name: string;
  street: string;
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

const ShippingAddressForm = ({ onSubmit, isLoading }: ShippingAddressFormProps) => {
  const { t } = useLanguage();
  const [address, setAddress] = useState<ShippingAddress>({
    name: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'PL',
    email: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(address);
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

          <div className="space-y-2">
            <Label htmlFor="street">{t('streetAddress') || 'Street Address'}</Label>
            <Input
              id="street"
              required
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              placeholder="Via Roma 123"
            />
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
