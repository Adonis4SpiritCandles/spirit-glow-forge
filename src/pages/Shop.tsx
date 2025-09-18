import { useState } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import candleLit from "@/assets/candle-lit.png";
import candleUnlit from "@/assets/candle-unlit.png";
import candleWax from "@/assets/candle-wax.png";

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

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterBy, setFilterBy] = useState("all");
  const [products] = useState(sampleProducts);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.fragrance.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === "all" || 
                         (filterBy === "new" && product.isNew) ||
                         (filterBy === "bestseller" && product.isBestseller);
    
    return matchesSearch && matchesFilter;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price.pln - b.price.pln;
      case "price-high":
        return b.price.pln - a.price.pln;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <main className="min-h-screen bg-gradient-mystical">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-4">
            Our Collection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our complete range of luxury soy candles, each inspired by iconic fragrances 
            and handcrafted with natural ingredients.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border/40 rounded-lg p-6 mb-8 shadow-elegant">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search candles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter */}
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="new">New Arrivals</SelectItem>
                <SelectItem value="bestseller">Bestsellers</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center justify-center md:justify-end">
              <span className="text-sm text-muted-foreground">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-playfair font-semibold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setFilterBy("all");
                setSortBy("featured");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More (Placeholder for pagination) */}
        {sortedProducts.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4"
            >
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Shop;