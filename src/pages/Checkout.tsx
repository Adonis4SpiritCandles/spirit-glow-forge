import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/contexts/LanguageContext';

const Checkout = () => {
  const { cartItems, totalPLN, totalEUR, itemCount } = useCart();
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="font-playfair text-3xl font-bold mb-6">{t('checkout') || 'Checkout'}</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-gradient-mystical">
                    <img src={item.product.image_url} alt={language === 'en' ? item.product.name_en : item.product.name_pl} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{language === 'en' ? item.product.name_en : item.product.name_pl}</div>
                        <div className="text-sm text-muted-foreground">{item.product.size}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">{item.product.price_pln * item.quantity} PLN</div>
                        <div className="text-xs text-muted-foreground">~{item.product.price_eur * item.quantity} EUR</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-1 sticky top-8 h-fit">
            <CardHeader>
              <CardTitle className="font-playfair">{t('orderSummary') || 'Order Summary'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('subtotal')} ({itemCount} {t('items')})</span>
                <span>{totalPLN} PLN</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span></span>
                <span>~{totalEUR} EUR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('shipping')}</span>
                <span className="text-success">{t('freeShipping')}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>{t('total')}</span>
                <div className="text-right">
                  <div className="text-primary">{totalPLN} PLN</div>
                  <div className="text-xs text-muted-foreground">~{totalEUR} EUR</div>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                {t('proceedToPayment') || 'Proceed to Payment'}
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/cart">{t('backToCart') || 'Back to Cart'}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Nota: per i pagamenti useremo Stripe Checkout. Appena colleghi l'account Stripe, abiliterò il pulsante per aprire la cassa.
        </p>
      </div>
    </div>
  );
};

export default Checkout;