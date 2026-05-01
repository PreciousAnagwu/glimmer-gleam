import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Gift, Loader2, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { useCartStore } from '@/store/cartStore';
import { toast } from '@/hooks/use-toast';

interface GiftWishlist {
  id: string;
  slug: string;
  sender_name: string;
  recipient_name: string | null;
  message: string | null;
  occasion: string | null;
  product_ids: string[];
  expires_at: string | null;
  created_at: string;
}

// Legacy fallback for old base64 share links
function decodeLegacy(payload: string): string[] {
  try {
    const json = atob(decodeURIComponent(payload));
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch { return []; }
}

export default function GiftWishlistView() {
  const { slug, payload } = useParams();
  const { products, loading: pLoading } = useProducts();
  const addToCart = useCartStore((s) => s.addItem);
  const [gift, setGift] = useState<GiftWishlist | null>(null);
  const [legacyIds, setLegacyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      (async () => {
        const { data, error } = await supabase.from('gift_wishlists').select('*').eq('slug', slug).maybeSingle();
        if (error || !data) { setNotFound(true); setLoading(false); return; }
        if (data.expires_at && new Date(data.expires_at) < new Date()) { setNotFound(true); setLoading(false); return; }
        setGift(data as GiftWishlist);
        supabase.rpc('record_gift_view' as any, { _slug: slug }).then(() => {});
        setLoading(false);
      })();
    } else if (payload) {
      setLegacyIds(decodeLegacy(payload));
      setLoading(false);
    }
  }, [slug, payload]);

  const items = useMemo(() => {
    if (pLoading) return [];
    const ids = gift?.product_ids || legacyIds;
    return products.filter((p) => ids.includes(p.id));
  }, [products, pLoading, gift, legacyIds]);

  const addAllToCart = () => {
    items.forEach((p) => {
      addToCart({
        productId: p.id, name: p.name, image: p.images[0],
        variant: p.variants[0], color: p.colors[0]?.name || '', quantity: 1,
      });
    });
    toast({ title: '✨ Added to cart', description: `${items.length} items added.` });
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Gift not found" />
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-3xl font-bold">This gift can't be found</h1>
          <p className="text-muted-foreground mt-2">The link may have expired or been removed.</p>
          <Button variant="gold" className="mt-6" asChild><Link to="/shop">Browse the shop</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={gift ? `A gift from ${gift.sender_name}` : 'Shared Wishlist'}
        description={gift?.message || "Someone's sharing their J's Jewels favorites with you."}
      />
      <Navbar />
      <main>
        {loading || pLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
        ) : (
          <>
            {/* Gift hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16">
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-10 left-10 text-gold/30"><Sparkles className="h-8 w-8" /></div>
                <div className="absolute bottom-10 right-20 text-gold/30"><Heart className="h-6 w-6" /></div>
                <div className="absolute top-20 right-10 text-gold/30"><Sparkles className="h-5 w-5" /></div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="container mx-auto px-4 text-center relative z-10"
              >
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-gold to-rose-gold flex items-center justify-center shadow-lg">
                  <Gift className="h-10 w-10 text-primary-foreground" />
                </div>
                {gift?.occasion && (
                  <span className="inline-block mt-4 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-semibold uppercase tracking-wider">{gift.occasion}</span>
                )}
                <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold">
                  {gift?.recipient_name ? `Hi ${gift.recipient_name},` : 'A gift just for you'}
                </h1>
                <p className="mt-3 text-lg text-muted-foreground">
                  {gift ? <><span className="text-gold font-medium">{gift.sender_name}</span> picked these out for you</> : 'Someone shared their favorites with you'}
                </p>
                {gift?.message && (
                  <blockquote className="mt-8 max-w-xl mx-auto rounded-2xl border border-gold/30 bg-card p-6 text-base italic text-foreground shadow-sm">
                    "{gift.message}"
                    <footer className="mt-3 text-sm not-italic text-muted-foreground">— {gift.sender_name}</footer>
                  </blockquote>
                )}
              </motion.div>
            </section>

            {/* Items */}
            <section className="container mx-auto px-4 py-12">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">The selected items are no longer available.</p>
                  <Button variant="gold" className="mt-4" asChild><Link to="/shop">Browse the shop</Link></Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <h2 className="font-display text-2xl font-bold">Curated for you ({items.length})</h2>
                    <Button variant="gold" onClick={addAllToCart}>Add all to cart</Button>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
