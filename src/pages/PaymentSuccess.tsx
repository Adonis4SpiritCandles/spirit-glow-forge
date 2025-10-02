import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/hooks/useCart';

const PaymentSuccess = () => {
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear cart after successful payment
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="font-playfair text-2xl text-success">
                {t('paymentSuccessful') || 'Payment Successful!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                {t('orderConfirmation')}
              </p>
              {sessionId && (
                <p className="text-xs text-muted-foreground">
                  {t('sessionId')}: {sessionId}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/shop">
                  {t('continueShopping')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard">
                  {t('viewOrders')}
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {t('emailConfirmation')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;