import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ShippingReturns = () => {
  const { t, language } = useLanguage();
  const pdfUrl = language === 'pl' 
    ? '/documents/dostawa-zwroty-pl.pdf' 
    : '/documents/shipping-returns-en.pdf';

  return (
    <main className="min-h-screen bg-gradient-mystical py-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-8 text-center">
          {t('shippingReturnsTitle')}
        </h1>

        <div className="mb-6 text-center">
          <Button asChild variant="outline">
            <a href={pdfUrl} download>
              <Download className="mr-2 h-4 w-4" />
              {t('downloadPDF')}
            </a>
          </Button>
        </div>

        <Card className="bg-card border-border/40 shadow-elegant">
          <CardContent className="p-8 space-y-8">
            {/* Shipping Information */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {t('shippingInfo')}
              </CardTitle>
              <div className="space-y-4 text-muted-foreground">
                <p>{t('shippingInfoDesc')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('shippingItem1')}</li>
                  <li>{t('shippingItem2')}</li>
                  <li>{t('shippingItem3')}</li>
                </ul>
              </div>
            </section>

            {/* Delivery Times */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {t('deliveryTimes')}
              </CardTitle>
              <p className="text-muted-foreground">{t('deliveryTimesDesc')}</p>
            </section>

            {/* Tracking */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {t('orderTracking')}
              </CardTitle>
              <p className="text-muted-foreground">{t('orderTrackingDesc')}</p>
            </section>

            {/* Returns Policy */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {t('returnsPolicy')}
              </CardTitle>
              <div className="space-y-4 text-muted-foreground">
                <p>{t('returnsPolicyDesc')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('returnsItem1')}</li>
                  <li>{t('returnsItem2')}</li>
                  <li>{t('returnsItem3')}</li>
                  <li>{t('returnsItem4')}</li>
                </ul>
              </div>
            </section>

            {/* Return Process */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {t('howToReturn')}
              </CardTitle>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>{t('returnStep1')}</li>
                <li>{t('returnStep2')}</li>
                <li>{t('returnStep3')}</li>
              </ol>
            </section>

            {/* Refunds */}
            <section>
              <CardTitle className="text-2xl font-playfair mb-4 text-foreground">
                {t('refundsPolicy')}
              </CardTitle>
              <p className="text-muted-foreground">{t('refundsDesc')}</p>
            </section>

            {/* Contact */}
            <section className="bg-muted/30 p-6 rounded-lg">
              <CardTitle className="text-xl font-playfair mb-3 text-foreground">
                {t('needHelp')}
              </CardTitle>
              <p className="text-muted-foreground mb-2">{t('needHelpDesc')}</p>
              <p className="text-foreground font-semibold">
                Email: <span className="text-primary">m5moffice@proton.me</span>
              </p>
              <p className="text-foreground font-semibold">
                {t('phone')}: <span className="text-primary">+48 729877557</span>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ShippingReturns;
