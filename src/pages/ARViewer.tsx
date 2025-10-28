import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ARViewer = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [arSupported, setArSupported] = useState(false);

  useEffect(() => {
    // Check AR support
    if ('xr' in navigator) {
      // @ts-ignore
      navigator.xr?.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setArSupported(supported);
      });
    }

    // Load product
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!error && data) {
      setProduct(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {language === 'pl' ? 'Produkt nie znaleziony' : 'Product Not Found'}
          </h1>
          <Button onClick={() => navigate('/')}>
            {language === 'pl' ? 'Wróć do sklepu' : 'Back to Shop'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(`/product/${productId}`)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'pl' ? 'Powrót' : 'Back'}
          </Button>
          <h1 className="text-lg font-semibold text-center flex-1">
            {language === 'en' ? product.name_en : product.name_pl}
          </h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* AR Content */}
      <div className="container mx-auto px-4 py-8">
        {!arSupported ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-lg mb-2">
                    {language === 'pl' ? 'AR nie jest dostępne' : 'AR Not Available'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {language === 'pl'
                      ? 'Twoja przeglądarka lub urządzenie nie obsługuje rozszerzonej rzeczywistości (AR). Aby skorzystać z tej funkcji, otwórz ten link na urządzeniu mobilnym z iOS 12+ lub Android 8+.'
                      : 'Your browser or device does not support Augmented Reality (AR). To use this feature, open this link on a mobile device with iOS 12+ or Android 8+.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Product preview */}
            <div className="bg-card rounded-lg overflow-hidden border border-border">
              <img
                src={product.image_url}
                alt={language === 'en' ? product.name_en : product.name_pl}
                className="w-full aspect-square object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  {language === 'en' ? product.name_en : product.name_pl}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {language === 'en' ? product.description_en : product.description_pl}
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary">
                    {product.price_pln} PLN
                  </div>
                  <div className="text-muted-foreground">
                    ~{product.price_eur} EUR
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                {language === 'pl' ? 'Funkcja AR w budowie' : 'AR Feature Coming Soon'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'pl'
                  ? 'Pracujemy nad pełną funkcjonalnością AR. Wkrótce będziesz mógł zobaczyć tę świecę w swojej przestrzeni!'
                  : 'We are working on full AR functionality. Soon you will be able to see this candle in your space!'}
              </p>
              
              {/* Product preview in AR placeholder */}
              <div className="bg-card rounded-lg overflow-hidden border-2 border-dashed border-border/50 mb-6">
                <img
                  src={product.image_url}
                  alt={language === 'en' ? product.name_en : product.name_pl}
                  className="w-full max-w-md mx-auto aspect-square object-cover"
                />
              </div>

              <Button
                onClick={() => navigate(`/product/${productId}`)}
                size="lg"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'pl' ? 'Powrót do produktu' : 'Back to Product'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARViewer;
