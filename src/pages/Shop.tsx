import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Search, Filter, SlidersHorizontal, Grid3x3, List, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import SEOManager from "@/components/SEO/SEOManager";
import { generateBreadcrumbStructuredData } from "@/utils/seoUtils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const Shop = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [headerRef, headerInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 0]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(10);

  const loadMoreProducts = () => {
    setDisplayedCount(prev => Math.min(prev + 10, filteredProducts.length));
  };

  // Check if mobile/tablet
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_collections(
            collection:collections(
              id,
              name_en,
              name_pl,
              slug
            )
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (!error && data) {
        const mapped = data.map((p) => ({
          id: p.id,
          name: language === 'en' ? p.name_en : p.name_pl,
          summary: language === 'en' ? (p.summary_en || '') : (p.summary_pl || ''),
          description: language === 'en' ? (p.description_en || '') : (p.description_pl || ''),
          category: p.category,
          collections: p.product_collections?.map((pc: any) => pc.collection) || [],
          preferred_card_tag: p.preferred_card_tag,
          price: { pln: Number(p.price_pln), eur: Number(p.price_eur) },
          image: p.image_url,
          sizes: [{ size: p.size, weight: p.weight || p.size, price: { pln: Number(p.price_pln), eur: Number(p.price_eur) } }],
          stock_quantity: p.stock_quantity || 0,
          isNew: false,
          isBestseller: false,
        }));
        setProducts(mapped);

        // Compute price bounds (PLN)
        const prices = mapped.map((m:any) => m.price.pln);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setPriceBounds([min, max]);
        setPriceRange([min, max]);
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
    const q = searchQuery.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(q) ||
                          (product.description || '').toLowerCase().includes(q);
    const matchesFilter = filterBy === "all" || 
                         (filterBy === "new" && product.isNew) ||
                         (filterBy === "bestseller" && product.isBestseller);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesPrice = product.price.pln >= priceRange[0] && product.price.pln <= priceRange[1];
    
    const matchesAvailability = availabilityFilter.length === 0 ||
      (availabilityFilter.includes('in_stock') && (product.stock_quantity || 0) > 10) ||
      (availabilityFilter.includes('low_stock') && (product.stock_quantity || 0) > 0 && (product.stock_quantity || 0) <= 10) ||
      (availabilityFilter.includes('out_of_stock') && (product.stock_quantity || 0) === 0);
    
    return matchesSearch && matchesFilter && matchesCategory && matchesPrice && matchesAvailability;
  });

  const displayedProducts = filteredProducts.slice(0, displayedCount);

  const sortedProducts = [...displayedProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price.pln - b.price.pln;
      case "price-high":
        return b.price.pln - a.price.pln;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case "popular":
        return (b.sales_count || 0) - (a.sales_count || 0);
      case "rating":
        return (b.avg_rating || 0) - (a.avg_rating || 0);
      default:
        return 0;
    }
  });

  const title = language === 'en' ? 'Shop Luxury Candles' : 'Sklep z luksusowymi świecami';
  const description = language === 'en'
    ? `Browse our complete collection of luxury soy candles. Premium quality, iconic fragrances, wooden wicks. ${sortedProducts.length} products available. Free shipping on orders over 250 PLN.`
    : `Przeglądaj naszą pełną kolekcję luksusowych świec sojowych. Najwyższa jakość, kultowe zapachy, drewniane knoty. ${sortedProducts.length} produktów dostępnych. Darmowa wysyłka przy zamówieniach powyżej 250 PLN.`;

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: language === 'en' ? 'Home' : 'Strona główna', url: `https://spirit-candle.com/${language}` },
    { name: language === 'en' ? 'Shop' : 'Sklep', url: `https://spirit-candle.com/${language}/shop` }
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <SEOManager
        title={title}
        description={description}
        url={`https://spirit-candle.com/${language}/shop`}
        structuredData={breadcrumbData}
        alternateUrls={{
          en: 'https://spirit-candle.com/en/shop',
          pl: 'https://spirit-candle.com/pl/shop'
        }}
      />
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Animated Header */}
        <motion.div
          ref={headerRef}
          initial={{ y: -30, opacity: 0 }}
          animate={headerInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={headerInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-playfair font-bold text-foreground mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-primary"
          >
            {t('ourCollection')}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={headerInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {t('discoverCompleteRange')}
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={headerInView ? { scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.6, type: "spring" }}
            className="flex justify-center gap-2 mt-6"
          >
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </motion.div>
        </motion.div>

        {/* Animated Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-xl p-6 mb-8 shadow-elegant"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search with Animation */}
            <motion.div 
              className="relative md:col-span-2"
              whileFocus={{ scale: 1.02 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('searchCandles')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/50"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                      {sortedProducts.length}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Filter */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="transition-all duration-300 hover:border-primary/40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('filterBy')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all">{t('allProducts')}</SelectItem>
                  <SelectItem value="new">{t('newArrivals')}</SelectItem>
                  <SelectItem value="bestseller">{t('bestSellers')}</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Sort */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="transition-all duration-300 hover:border-primary/40">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('sortBy')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="featured">{t('featured')}</SelectItem>
                  <SelectItem value="price-low">{t('priceLowToHigh')}</SelectItem>
                  <SelectItem value="price-high">{t('priceHighToLow')}</SelectItem>
                  <SelectItem value="name">{t('nameAtoZ')}</SelectItem>
                  <SelectItem value="newest">{language === 'pl' ? 'Najnowsze' : 'Newest First'}</SelectItem>
                  <SelectItem value="popular">{language === 'pl' ? 'Najpopularniejsze' : 'Most Popular'}</SelectItem>
                  <SelectItem value="rating">{language === 'pl' ? 'Najlepiej oceniane' : 'Best Rated'}</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="w-full transition-all duration-300"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="w-full transition-all duration-300"
                >
                  <List className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Results Counter with Animation */}
          <motion.div 
            className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-sm text-muted-foreground">
              <AnimatePresence mode="wait">
                <motion.span
                  key={sortedProducts.length}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {sortedProducts.length} {sortedProducts.length === 1 ? t('product') : t('products')}
                </motion.span>
              </AnimatePresence>
            </span>
            {(searchQuery || filterBy !== "all") && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBy("all");
                  }}
                  className="text-primary hover:text-primary-glow"
                >
                  {t('clearFilters')}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Advanced Filters - Mobile/Tablet (Horizontal) */}
        {isMobile && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-card/60 border border-border/40 rounded-xl p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3">{t('categories')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[...new Set(products.map(p => p.category).filter(Boolean))].map((cat) => (
                    <label key={cat} className="flex items-center gap-2">
                      <Checkbox 
                        checked={selectedCategories.includes(cat)}
                        onCheckedChange={(checked) => {
                          setSelectedCategories(checked 
                            ? [...selectedCategories, cat]
                            : selectedCategories.filter(c => c !== cat)
                          );
                        }}
                      />
                      <span className="text-sm">{t('category_' + cat)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">{t('priceRange')}</h3>
                <Slider 
                  value={priceRange} 
                  onValueChange={(v:any) => setPriceRange(v as [number, number])}
                  min={priceBounds[0]}
                  max={priceBounds[1]}
                  step={5}
                  className="mt-4"
                />
                <div className="flex justify-between text-sm mt-2">
                  <span>{Math.round(priceRange[0])} PLN</span>
                  <span>{Math.round(priceRange[1])} PLN</span>
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <h3 className="font-semibold mb-3">{t('availability')}</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <Checkbox 
                      checked={availabilityFilter.includes('in_stock')}
                      onCheckedChange={(checked) => {
                        setAvailabilityFilter(checked 
                          ? [...availabilityFilter, 'in_stock']
                          : availabilityFilter.filter(f => f !== 'in_stock')
                        );
                      }}
                    />
                    <span className="text-sm">{language === 'pl' ? 'Dostępne (>10)' : 'In Stock (>10)'}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox 
                      checked={availabilityFilter.includes('low_stock')}
                      onCheckedChange={(checked) => {
                        setAvailabilityFilter(checked 
                          ? [...availabilityFilter, 'low_stock']
                          : availabilityFilter.filter(f => f !== 'low_stock')
                        );
                      }}
                    />
                    <span className="text-sm">{language === 'pl' ? 'Niski stan (1-10)' : 'Low Stock (1-10)'}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox 
                      checked={availabilityFilter.includes('out_of_stock')}
                      onCheckedChange={(checked) => {
                        setAvailabilityFilter(checked 
                          ? [...availabilityFilter, 'out_of_stock']
                          : availabilityFilter.filter(f => f !== 'out_of_stock')
                        );
                      }}
                    />
                    <span className="text-sm">{language === 'pl' ? 'Niedostępne' : 'Out of Stock'}</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Desktop Layout: Sidebar + Products */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6`}>
          
          {/* Sidebar Filtri (Desktop only) */}
          {!isMobile && (
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-64 flex-shrink-0"
            >
              <div className="sticky top-24 space-y-6 bg-card/60 border border-border/40 rounded-xl p-4 shadow-elegant max-h-[calc(100vh-7rem)] overflow-y-auto">
                <div>
                  <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    {t('filters')}
                  </h3>
                  
                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase">{t('categories')}</h4>
                    <div className="space-y-2">
                      {[...new Set(products.map(p => p.category).filter(Boolean))].map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                          <Checkbox 
                            checked={selectedCategories.includes(cat)}
                            onCheckedChange={(checked) => {
                              setSelectedCategories(checked 
                                ? [...selectedCategories, cat]
                                : selectedCategories.filter(c => c !== cat)
                              );
                            }}
                          />
                          <span className="text-sm">{t('category_' + cat)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase">{t('priceRange')}</h4>
                    <Slider 
                      value={priceRange} 
                      onValueChange={(v:any) => setPriceRange(v as [number, number])}
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      step={5}
                      className="mt-4"
                    />
                    <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                      <span>{Math.round(priceRange[0])} PLN</span>
                      <span>{Math.round(priceRange[1])} PLN</span>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase">{t('availability')}</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                        <Checkbox 
                          checked={availabilityFilter.includes('in_stock')}
                          onCheckedChange={(checked) => {
                            setAvailabilityFilter(checked 
                              ? [...availabilityFilter, 'in_stock']
                              : availabilityFilter.filter(f => f !== 'in_stock')
                            );
                          }}
                        />
                        <span className="text-sm">{language === 'pl' ? 'Dostępne (>10)' : 'In Stock (>10)'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                        <Checkbox 
                          checked={availabilityFilter.includes('low_stock')}
                          onCheckedChange={(checked) => {
                            setAvailabilityFilter(checked 
                              ? [...availabilityFilter, 'low_stock']
                              : availabilityFilter.filter(f => f !== 'low_stock')
                            );
                          }}
                        />
                        <span className="text-sm">{language === 'pl' ? 'Niski stan (1-10)' : 'Low Stock (1-10)'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                        <Checkbox 
                          checked={availabilityFilter.includes('out_of_stock')}
                          onCheckedChange={(checked) => {
                            setAvailabilityFilter(checked 
                              ? [...availabilityFilter, 'out_of_stock']
                              : availabilityFilter.filter(f => f !== 'out_of_stock')
                            );
                          }}
                        />
                        <span className="text-sm">{language === 'pl' ? 'Niedostępne' : 'Out of Stock'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {sortedProducts.length > 0 ? (
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                    : "grid grid-cols-1 gap-4"}
                >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <ProductCard {...product} />
                </motion.div>
                  ))}
                </motion.div>
              ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-playfair font-semibold text-foreground mb-3">
                {t('noProductsFound')}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {t('tryAdjusting')}
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBy("all");
                    setSortBy("featured");
                  }}
                  variant="outline"
                  size="lg"
                  className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                >
                  {t('clearFilters')}
                </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* Load More with Animation */}
        {displayedProducts.length >= 10 && displayedProducts.length < filteredProducts.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={loadMoreProducts}
                variant="outline" 
                size="lg"
                className="px-12 py-6 text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-elegant hover:shadow-luxury"
              >
                {t('loadMore')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default Shop;
