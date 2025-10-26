import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import ShippingAddressForm from '@/components/ShippingAddressForm';
import ShippingOptions from '@/components/ShippingOptions';

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
}

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

const Checkout = () => {
  const { cartItems, totalPLN, totalEUR, itemCount, clearCart } = useCart();
  const { t, language } = useLanguage();
  const { user, initialLoadComplete } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'address' | 'shipping' | 'payment'>('address');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);

  // Redirect to auth if not logged in (only after initial load is complete)
  useEffect(() => {
    if (initialLoadComplete && !user) {
      navigate('/auth');
      toast({
        title: t('loginRequired') || 'Login Required',
        description: t('loginToCheckout') || 'You need to log in to complete your purchase',
        variant: 'destructive',
      });
    }
  }, [user, initialLoadComplete, navigate, t]);

  const handleAddressSubmit = async (address: ShippingAddress) => {
    setIsCalculating(true);
    setShippingAddress(address);

    try {
      // Calculate total weight with minimum of 1kg (aligned with shipment creation)
      const totalWeight = Math.max(1, cartItems.reduce((sum, item) => sum + (item.quantity * 0.5), 0));

      console.log('Checkout - Shipping calculation params:', {
        weight: totalWeight,
        dimensions: { length: 10, width: 10, height: 10 },
        address: address
      });

      const { data, error } = await supabase.functions.invoke('calculate-shipping-price', {
        body: {
          receiver: address,
          parcels: [{
            weight: totalWeight,
            length: 10,
            width: 10,
            height: 10
          }]
        },
      });

      if (error) throw error;

      if (data?.options && data.options.length > 0) {
        setShippingOptions(data.options);
        setStep('shipping');
      } else if (data?.reason === 'validation_failed') {
        const seen = new Set<string>();
        const details = (data.validationErrors || [])
          .map((e: any) => `${e.path}: ${e.message}`)
          .filter((msg: string) => {
            if (seen.has(msg)) return false;
            seen.add(msg);
            return true;
          })
          .slice(0, 6)
          .join('\n') || undefined;
        toast({
          title: t('shippingValidationFailed') || 'Shipping data needs attention',
          description: details || (data?.message || t('shippingCalculationError') || 'Failed to calculate shipping options.'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('noServices') || 'No services available',
          description: (data?.message || t('shippingCalculationError') || 'Failed to calculate shipping options.'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      toast({
        title: t('error') || 'Error',
        description: t('shippingCalculationError') || 'Failed to calculate shipping options. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleShippingConfirm = async () => {
    if (!user || !shippingAddress || !selectedShipping) return;

    if (cartItems.length === 0) {
      toast({
        title: t('emptyCart') || 'Cart Empty',
        description: t('addSomeCandles') || 'Add some candles to your cart first',
        variant: 'destructive',
      });
      return;
    }

    if (!termsConsent) {
      toast({
        title: t('consentRequired') || 'Consent Required',
        description: t('mustAcceptTermsCheckout') || 'You must accept the Terms of Sale to complete your purchase',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          cartItems,
          shippingAddress,
          serviceId: selectedShipping.service_id,
          shippingCost: selectedShipping.price.gross,
          carrierName: selectedShipping.carrier,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shippingCost = selectedShipping ? selectedShipping.price.gross : 0;
  const finalTotalPLN = totalPLN + (selectedShipping?.price.currency === 'PLN' ? shippingCost : 0);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="font-playfair text-3xl font-bold mb-6">{t('checkout') || 'Checkout'}</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {step === 'address' && (
              <ShippingAddressForm onSubmit={handleAddressSubmit} isLoading={isCalculating} />
            )}

            {step === 'shipping' && shippingOptions.length > 0 && (
              <>
                <Card className="p-4 bg-muted/30">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{t('deliveryAddress') || 'Delivery Address'}</h3>
                    {shippingAddress && (
                      <div className="text-sm space-y-1">
                        <p>{shippingAddress.name}</p>
                        <p>{shippingAddress.street}</p>
                        <p>{shippingAddress.postalCode} {shippingAddress.city}</p>
                        <p>{shippingAddress.country}</p>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary"
                          onClick={() => {
                            setStep('address');
                            setShippingOptions([]);
                            setSelectedShipping(null);
                          }}
                        >
                          {t('changeAddress') || 'Change Address'}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-4 bg-muted/30">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms-consent-checkout"
                      checked={termsConsent}
                      onCheckedChange={(checked) => setTermsConsent(checked as boolean)}
                      required
                    />
                     <Label htmlFor="terms-consent-checkout" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                       {t('iAcceptTerms')} <Link to="/terms-of-sale" className="text-primary hover:underline" target="_blank">{t('termsOfSale')}</Link> *
                     </Label>
                  </div>
                </Card>

                <ShippingOptions
                  options={shippingOptions}
                  selectedServiceId={selectedShipping?.service_id}
                  onSelect={setSelectedShipping}
                  onConfirm={handleShippingConfirm}
                  isLoading={isLoading}
                />
              </>
            )}

            <Card className="p-4">
              <h3 className="font-semibold mb-4">{t('orderItems') || 'Order Items'}</h3>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-gradient-mystical">
                      <img src={item.product.image_url} alt={language === 'en' ? item.product.name_en : item.product.name_pl} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-semibold text-sm">{language === 'en' ? item.product.name_en : item.product.name_pl}</div>
                          <div className="text-xs text-muted-foreground">{item.product.size} × {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">{(item.product.price_pln * item.quantity).toFixed(2)} PLN</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="lg:col-span-1 lg:sticky lg:top-8 h-fit order-1 lg:order-2">
            <CardHeader>
              <CardTitle className="font-playfair">{t('orderSummary') || 'Order Summary'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('subtotal')} ({itemCount} {t('items')})</span>
                <span>{Number(totalPLN).toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('shipping')}</span>
                {selectedShipping ? (
                  <span className="font-semibold">{selectedShipping.price.gross.toFixed(2)} {selectedShipping.price.currency}</span>
                ) : (
                  <span className="text-muted-foreground">{t('calculatedNext') || 'Calculated next'}</span>
                )}
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>{t('total')}</span>
                <div className="text-right">
                  <div className="text-primary">{finalTotalPLN.toFixed(2)} PLN</div>
                </div>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link to="/cart">{t('backToCart') || 'Back to Cart'}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;