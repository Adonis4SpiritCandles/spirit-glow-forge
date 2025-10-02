import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-gradient-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
            {t('featuredCollection')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('featuredCollectionDescription')}
          </p>
        </div>

        {/* Desktop Carousel with Navigation */}
        <div className="hidden lg:block relative">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full max-w-7xl mx-auto"
          >
            <CarouselContent className="-ml-6">
              {sampleProducts.map((product) => (
                <CarouselItem key={product.id} className="pl-6 basis-1/3">
                  <ProductCard {...product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 -translate-x-12" />
            <CarouselNext className="right-0 translate-x-12" />
          </Carousel>
        </div>

        {/* Mobile Carousel with Embla */}
        <div className="lg:hidden">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {sampleProducts.map((product) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-[85%] sm:basis-[70%]">
                  <ProductCard {...product} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button 
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 shadow-luxury hover:scale-105 transition-all duration-300"
          >
            <Link to="/collections">
              {t('exploreFullCollection')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;