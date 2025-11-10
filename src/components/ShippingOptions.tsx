import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Clock, Truck } from 'lucide-react';
import { useMemo } from 'react';

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

  const processedOptions = useMemo(() => {
    const map = new Map<number, ShippingOption>();
    for (const opt of options) {
      if (!opt || !opt.price || opt.price.gross <= 0) continue;
      const existing = map.get(opt.service_id);
      if (!existing || opt.price.gross < existing.price.gross) {
        map.set(opt.service_id, opt);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.price.gross - b.price.gross);
  }, [options]);

  const selectedOption = processedOptions.find(opt => opt.service_id === selectedServiceId);

  if (processedOptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-playfair">{t('shippingOptions')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 space-y-4">
          <p className="text-muted-foreground">
            {t('noShippingOptions') || 'Nessuna opzione di spedizione disponibile per questo indirizzo.'}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t('changeAddress') || 'Cambia Indirizzo'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-playfair flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t('shippingOptions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedServiceId?.toString()} onValueChange={(value) => {
          const option = processedOptions.find(opt => opt.service_id === parseInt(value));
          if (option) onSelect(option);
        }}>
          <div className="space-y-3">
            {processedOptions.map((option) => (
              <div
                key={option.service_id}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                  selectedServiceId === option.service_id
                    ? 'border-primary bg-primary/5 scale-[1.02]'
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
                    {option.eta || t('standardDelivery')}
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-bold text-primary">
                      {option.price.gross.toFixed(2)} {option.price.currency}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ShippingOptions;
