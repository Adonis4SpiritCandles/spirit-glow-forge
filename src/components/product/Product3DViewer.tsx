import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

// Import real candle images
import candleReal1 from "@/assets/candle-real-1.png";
import candleReal2 from "@/assets/candle-real-2.png";
import candleReal3 from "@/assets/candle-real-3.png";
import candleReal4 from "@/assets/candle-real-4.png";
import candleReal5 from "@/assets/candle-real-5.png";
import candleReal6 from "@/assets/candle-real-6.jpg";

const Product3DViewer = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const candleImages = [
    candleReal1,
    candleReal2,
    candleReal3,
    candleReal4,
    candleReal5,
    candleReal6,
  ];

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % candleImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRotate, candleImages.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        nextImage();
      } else {
        prevImage();
      }
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - startX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        nextImage();
      } else {
        prevImage();
      }
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % candleImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + candleImages.length) % candleImages.length);
  };

  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };

  return (
    <div className="w-full bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-lg p-6 border border-border/50">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {language === 'pl' ? 'Widok 360° Świecy' : '360° Candle View'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'pl'
              ? 'Przeciągnij lub użyj strzałek, aby obejrzeć świecę z każdej strony'
              : 'Drag or use arrows to view the candle from every angle'}
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAutoRotate}
          className={autoRotate ? 'bg-primary/10' : ''}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* 360 Viewer */}
      <div
        ref={containerRef}
        className="relative aspect-square bg-gradient-to-br from-background to-muted/20 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={candleImages[currentIndex]}
            alt={`Candle view ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-contain p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            draggable={false}
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between p-4 pointer-events-none">
          <Button
            variant="secondary"
            size="icon"
            onClick={prevImage}
            className="pointer-events-auto bg-background/80 hover:bg-background shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={nextImage}
            className="pointer-events-auto bg-background/80 hover:bg-background shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Angle Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
          <div className="flex items-center gap-2">
            {candleImages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setAutoRotate(false);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary w-6'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          {language === 'pl'
            ? '💡 Wskazówka: Przeciągnij palcem lub myszą, aby obrócić świecę'
            : '💡 Tip: Drag with your finger or mouse to rotate the candle'}
        </p>
      </div>
    </div>
  );
};

export default Product3DViewer;
