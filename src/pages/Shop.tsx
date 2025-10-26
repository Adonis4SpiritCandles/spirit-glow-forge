import { useState, useEffect } from "react";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

// Loaded from Supabase

const Shop = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterBy, setFilterBy] = useState("all");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (!error && data) {
        const mapped = data.map((p) => ({
          id: p.id,
          name: language === 'en' ? p.name_en : p.name_pl,
          fragrance: language === 'en' ? (p.description_en || '') : (p.description_pl || ''),
          price: { pln: Number(p.price_pln) / 100, eur: Number(p.price_eur) / 100 },
          image: p.image_url,
          description: language === 'en' ? (p.description_en || '') : (p.description_pl || ''),
          sizes: [{ size: p.size, weight: p.weight || p.size, price: { pln: Number(p.price_pln) / 100, eur: Number(p.price_eur) / 100 } }],
          isNew: false,
          isBestseller: false,
        }));
        setProducts(mapped);
      }
    };
    load();

    const channel = supabase
      .channel('products-shop')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [language]);

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
              {t('ourCollection')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('discoverCompleteRange')}
            </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border/40 rounded-lg p-6 mb-8 shadow-elegant">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('searchCandles')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter */}
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('filterBy')} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all">{t('allProducts')}</SelectItem>
                <SelectItem value="new">{t('newArrivals')}</SelectItem>
                <SelectItem value="bestseller">{t('bestSellers')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="featured">{t('featured')}</SelectItem>
                <SelectItem value="price-low">{t('priceLowToHigh')}</SelectItem>
                <SelectItem value="price-high">{t('priceHighToLow')}</SelectItem>
                <SelectItem value="name">{t('nameAtoZ')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center justify-center md:justify-end">
              <span className="text-sm text-muted-foreground">
                {sortedProducts.length} {sortedProducts.length === 1 ? t('product') : t('products')}
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
              {t('noProductsFound')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('tryAdjusting')}
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setFilterBy("all");
                setSortBy("featured");
              }}
              variant="outline"
            >
              {t('clearFilters')}
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
              {t('loadMoreProducts')}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Shop;