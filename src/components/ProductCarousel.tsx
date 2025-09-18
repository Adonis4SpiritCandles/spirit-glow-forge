import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import candleLit from "@/assets/candle-lit.png";
import candleUnlit from "@/assets/candle-unlit.png";
import candleWax from "@/assets/candle-wax.png";

// Sample product data - will be replaced with database data later
const sampleProducts = [
  {
    id: "1",
    name: "Mystic Rose",
    fragrance: "Black Opium",
    price: { pln: 89, eur: 21 },
    image: candleLit,
    description: "A captivating blend of black coffee, white flowers, and vanilla with a mysterious edge.",
    sizes: [
      { size: "Small", weight: "180g", price: { pln: 89, eur: 21 } },
      { size: "Large", weight: "320g", price: { pln: 139, eur: 32 } }
    ],
    isNew: true,
  },
  {
    id: "2",
    name: "Golden Embrace",
    fragrance: "Chanel No. 5",
    price: { pln: 95, eur: 22 },
    image: candleUnlit,
    description: "Timeless elegance with aldehydes, ylang-ylang, and sandalwood in perfect harmony.",
    sizes: [
      { size: "Small", weight: "180g", price: { pln: 95, eur: 22 } },
      { size: "Large", weight: "320g", price: { pln: 145, eur: 34 } }
    ],
    isBestseller: true,
  },
  {
    id: "3",
    name: "Velvet Dreams",
    fragrance: "Tom Ford Velvet Orchid",
    price: { pln: 99, eur: 23 },
    image: candleWax,
    description: "Luxurious orchid and rose petals wrapped in warm vanilla and sandalwood.",
    sizes: [
      { size: "Small", weight: "180g", price: { pln: 99, eur: 23 } },
      { size: "Large", weight: "320g", price: { pln: 149, eur: 35 } }
    ],
  },
  {
    id: "4",
    name: "Midnight Passion",
    fragrance: "Dior Sauvage",
    price: { pln: 92, eur: 21 },
    image: candleLit,
    description: "Fresh bergamot meets woody ambroxan for a bold, masculine essence.",
    sizes: [
      { size: "Small", weight: "180g", price: { pln: 92, eur: 21 } },
      { size: "Large", weight: "320g", price: { pln: 142, eur: 33 } }
    ],
  },
  {
    id: "5",
    name: "Royal Essence",
    fragrance: "Creed Aventus",
    price: { pln: 109, eur: 25 },
    image: candleUnlit,
    description: "Pineapple, birch, and musk create this legendary, powerful fragrance.",
    sizes: [
      { size: "Small", weight: "180g", price: { pln: 109, eur: 25 } },
      { size: "Large", weight: "320g", price: { pln: 159, eur: 37 } }
    ],
    isNew: true,
  },
  {
    id: "6",
    name: "Divine Femininity",
    fragrance: "Miss Dior",
    price: { pln: 87, eur: 20 },
    image: candleWax,
    description: "Romantic rose and jasmine with a touch of patchouli elegance.",
    sizes: [
      { size: "Small", weight: "180g", price: { pln: 87, eur: 20 } },
      { size: "Large", weight: "320g", price: { pln: 137, eur: 32 } }
    ],
    isBestseller: true,
  },
];

const ProductCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => 
        prev >= sampleProducts.length - 3 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setCurrentIndex((prev) => 
      prev >= sampleProducts.length - 3 ? 0 : prev + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => 
      prev <= 0 ? sampleProducts.length - 3 : prev - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  return (
    <section className="py-16 bg-gradient-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most beloved luxury soy candles, each inspired by iconic fragrances 
            and crafted with the finest natural ingredients.
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Carousel - 3 items */}
          <div className="flex transition-transform duration-500 ease-in-out"
               style={{ transform: `translateX(-${currentIndex * (100/3)}%)` }}>
            {sampleProducts.map((product) => (
              <div key={product.id} className="w-1/3 flex-shrink-0 px-2">
                <ProductCard {...product} />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="secondary"
            size="sm"
            onClick={goToPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full shadow-elegant z-10 hover:scale-110 transition-transform"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full shadow-elegant z-10 hover:scale-110 transition-transform"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {sampleProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary shadow-mystical scale-125'
                  : 'bg-muted hover:bg-primary/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Multi-card View for Desktop */}
        <div className="hidden lg:block mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProducts.slice(0, 3).map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 shadow-luxury hover:scale-105 transition-all duration-300"
          >
            Explore Full Collection
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;