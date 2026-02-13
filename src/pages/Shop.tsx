import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, Grid3X3, LayoutGrid, X, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rating' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const { products, categories, loading } = useProducts();

  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'featured';

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    switch (sortBy) {
      case 'newest':
        result = result.filter((p) => p.newArrival).concat(result.filter((p) => !p.newArrival));
        break;
      case 'price-low':
        result.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result = result.filter((p) => p.featured).concat(result.filter((p) => !p.featured));
    }
    return result;
  }, [products, selectedCategory, sortBy]);

  const handleCategoryChange = (category: string) => {
    if (category) {
      searchParams.set('category', category);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (sort: string) => {
    searchParams.set('sort', sort);
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name || 'Shop'
                : 'All Products'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {filteredProducts.length} products
              {selectedCategory && (
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-2 inline-flex items-center gap-1 text-gold hover:underline"
                >
                  Clear filter <X className="h-3 w-3" />
                </button>
              )}
            </p>
          </div>

          <div className="flex gap-8">
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="mb-4 font-display text-lg font-semibold">Categories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`block w-full rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                        !selectedCategory ? 'bg-gold text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      All Products
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                          selectedCategory === cat.id ? 'bg-gold text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setIsFilterOpen(true)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="appearance-none rounded-lg border border-border bg-background px-4 py-2 pr-10 text-sm outline-none focus:border-gold"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                  <Button variant={gridCols === 2 ? 'default' : 'ghost'} size="icon-sm" onClick={() => setGridCols(2)}>
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button variant={gridCols === 3 ? 'default' : 'ghost'} size="icon-sm" onClick={() => setGridCols(3)}>
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className={`grid gap-6 ${
                gridCols === 2 ? 'grid-cols-1 sm:grid-cols-2'
                  : gridCols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}>
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-lg text-muted-foreground">No products found.</p>
                  <Button variant="gold" className="mt-4" onClick={() => handleCategoryChange('')}>
                    View All Products
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsFilterOpen(false)}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 h-full w-80 max-w-[90vw] bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">Filters</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { handleCategoryChange(''); setIsFilterOpen(false); }}
                className={`block w-full rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                  !selectedCategory ? 'bg-gold text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { handleCategoryChange(cat.id); setIsFilterOpen(false); }}
                  className={`flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                    selectedCategory === cat.id ? 'bg-gold text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
    </div>
  );
}
