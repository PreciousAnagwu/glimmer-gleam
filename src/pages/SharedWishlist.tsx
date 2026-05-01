import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';

function decode(payload: string): string[] {
  try {
    const json = atob(decodeURIComponent(payload));
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch { return []; }
}

export default function SharedWishlist() {
  const { payload } = useParams();
  const ids = useMemo(() => decode(payload || ''), [payload]);
  const { products, loading } = useProducts();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!loading) setItems(products.filter((p) => ids.includes(p.id)));
  }, [products, loading, ids]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Shared Wishlist" description="A curated jewelry wishlist shared with you." />
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Sparkles className="mx-auto h-8 w-8 text-gold" />
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold">A Wishlist Just For You</h1>
          <p className="mt-2 text-muted-foreground">Someone shared their J's Jewels favorites with you.</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">This wishlist is empty or the link is invalid.</p>
            <Button variant="gold" className="mt-4" asChild><Link to="/shop">Browse the shop</Link></Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
