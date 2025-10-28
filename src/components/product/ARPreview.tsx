import { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, QrCode, View, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import QRCode from "react-qr-code";

interface ARPreviewProps {
  productId: string;
  productName: string;
  modelUrl?: string;
}

const ARPreview = ({ productId, productName, modelUrl }: ARPreviewProps) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { language } = useLanguage();

  // Check if AR is supported
  const checkARSupport = () => {
    // WebXR Device API check
    if ('xr' in navigator) {
      // @ts-ignore
      navigator.xr.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setIsSupported(supported);
      });
    } else {
      setIsSupported(false);
    }
  };

  const handleARView = () => {
    checkARSupport();
    
    // For mobile: show QR code to open AR
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to launch AR viewer directly
      const arUrl = `${window.location.origin}/ar/${productId}`;
      window.location.href = arUrl;
    } else {
      // Desktop: show QR code to scan with mobile
      setShowQRModal(true);
    }
  };

  const arPageUrl = `${window.location.origin}/ar/${productId}`;

  return (
    <>
      <div className="w-full bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-lg p-6 border border-border/50">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <View className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {language === 'pl' ? 'Zobacz W Swojej Przestrzeni' : 'View in Your Space'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'pl'
                ? 'Użyj rozszerzonej rzeczywistości (AR), aby zobaczyć, jak ta świeca będzie wyglądać w Twoim domu przed zakupem.'
                : 'Use augmented reality (AR) to see how this candle will look in your home before you buy.'}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleARView}
                className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                {language === 'pl' ? 'Uruchom AR' : 'Launch AR'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowQRModal(true)}
                className="hover:bg-primary/10"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {language === 'pl' ? 'Kod QR' : 'QR Code'}
              </Button>
            </div>

            {!isSupported && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {language === 'pl'
                    ? 'AR nie jest dostępne na tym urządzeniu. Zeskanuj kod QR telefonem, aby skorzystać z tej funkcji.'
                    : 'AR is not available on this device. Scan the QR code with your phone to use this feature.'}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <h4 className="text-sm font-semibold mb-3 text-foreground">
            {language === 'pl' ? 'Jak To Działa:' : 'How It Works:'}
          </h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
              {language === 'pl'
                ? 'Kliknij "Uruchom AR" lub zeskanuj kod QR telefonem'
                : 'Click "Launch AR" or scan the QR code with your phone'}
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
              {language === 'pl'
                ? 'Pozwól na dostęp do kamery'
                : 'Allow camera access'}
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span>
              {language === 'pl'
                ? 'Skieruj kamerę na płaską powierzchnię i umieść świecę'
                : 'Point your camera at a flat surface and place the candle'}
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span>
              {language === 'pl'
                ? 'Poruszaj się, aby zobaczyć świecę z różnych kątów'
                : 'Move around to see the candle from different angles'}
            </li>
          </ol>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {language === 'pl' ? 'Zeskanuj Aby Zobaczyć W AR' : 'Scan to View in AR'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="p-4 bg-white rounded-lg">
              <QRCode
                value={arPageUrl}
                size={200}
                level="H"
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {language === 'pl'
                  ? 'Zeskanuj ten kod QR aparatem swojego telefonu'
                  : 'Scan this QR code with your phone camera'}
              </p>
              <p className="text-xs text-muted-foreground">
                {productName}
              </p>
            </div>

            <div className="w-full p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-center text-muted-foreground">
                {language === 'pl'
                  ? 'Uwaga: Funkcja AR wymaga kompatybilnego urządzenia mobilnego z iOS 12+ lub Android 8+'
                  : 'Note: AR feature requires a compatible mobile device with iOS 12+ or Android 8+'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ARPreview;
