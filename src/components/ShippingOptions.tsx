import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Clock, Truck } from 'lucide-react';

interface ShippingOption {
  service_id: number;
  service_name: string;
  carrier: string;
  delivery_type: string;
  price: {
    net: number;
    gross: number;
    currency: string;
  };
  eta?: string;
}

interface ShippingOptionsProps {
  options: ShippingOption[];
  selectedServiceId?: number;
  onSelect: (option: ShippingOption) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const ShippingOptions = ({ options, selectedServiceId, onSelect, onConfirm, isLoading }: ShippingOptionsProps) => {
  const { t, language } = useLanguage();

  const selectedOption = options.find(opt => opt.service_id === selectedServiceId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-playfair flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t('shippingOptions') || 'Shipping Options'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedServiceId?.toString()} onValueChange={(value) => {
          const option = options.find(opt => opt.service_id === parseInt(value));
          if (option) onSelect(option);
        }}>
          <div className="space-y-3">
            {options.map((option) => (
              <div
                key={option.service_id}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  selectedServiceId === option.service_id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onSelect(option)}
              >
                <RadioGroupItem value={option.service_id.toString()} id={`option-${option.service_id}`} />
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`option-${option.service_id}`} className="cursor-pointer font-semibold flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    {option.carrier} - {option.service_name}
                  </Label>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {option.eta || (t('standardDelivery') || 'Standard Delivery')}
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-bold text-primary">
                      {option.price.gross.toFixed(2)} {option.price.currency}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({t('net') || 'net'}: {option.price.net.toFixed(2)} {option.price.currency})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>

        {selectedOption && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">{t('selectedShipping') || 'Selected Shipping'}:</span>
              <span className="text-primary font-bold">
                {selectedOption.price.gross.toFixed(2)} {selectedOption.price.currency}
              </span>
            </div>
            <Button
              onClick={onConfirm}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (t('processing') || 'Processing...') : (t('confirmAndProceed') || 'Confirm and Proceed to Payment')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingOptions;
