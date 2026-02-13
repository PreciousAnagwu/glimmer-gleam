import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';

export function FeaturedProducts() {
  const { getFeaturedProducts, loading } = useProducts();
  const products = getFeaturedProducts();

  if (loading) {
    return (
      <section className="bg-secondary/30 py-20">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-secondary/30 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Featured Collection</h2>
            <p className="mt-2 text-muted-foreground">Our most loved pieces, handpicked for you</p>
          </div>
          <Button variant="luxury-outline" asChild>
            <Link to="/shop">View All<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </motion.div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
