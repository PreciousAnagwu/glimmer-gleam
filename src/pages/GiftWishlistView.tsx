import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Gift, Loader2, Sparkles, Heart, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { useCartStore } from '@/store/cartStore';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface GiftWishlist {
  id: string;
  slug: string;
  gift_type: 'send' | 'request';
  sender_name: string;
  recipient_name: string | null;
  recipient_user_id: string | null;
  message: string | null;
  occasion: string | null;
  product_ids: string[];
  expires_at: string | null;
  created_at: string;
  status: string;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  fulfilled_order_id: string | null;
}

function decodeLegacy(payload: string): string[] {
  try {
    const json = atob(decodeURIComponent(payload));
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch { return []; }
}

export default function GiftWishlistView() {
  const { slug, payload } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, loading: pLoading, getProductById } = useProducts();
  const addToCart = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
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

  const beTheGifter = () => {
    if (!gift) return;
    if (!user) {
      toast({ title: 'Please sign in to gift', description: 'Quick signup, then pay.' });
      navigate('/auth', { state: { from: { pathname: `/gift/${gift.slug}` } } });
      return;
    }
    clearCart();
    items.forEach((p) => {
      addToCart({
        productId: p.id, name: p.name, image: p.images[0],
        variant: p.variants[0], color: p.colors[0]?.name || '', quantity: 1,
      });
    });
    toast({ title: '🎁 Gifting items added!', description: 'Address is locked to the recipient.' });
    navigate(`/checkout?gift=${gift.id}`);
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

  const isRequest = gift?.gift_type === 'request';
  const isFulfilled = gift?.status === 'fulfilled' && gift?.fulfilled_order_id;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={gift ? (isRequest ? `${gift.sender_name}'s wishlist` : `A gift from ${gift.sender_name}`) : 'Shared Wishlist'}
        description={gift?.message || "Someone's sharing their J's Jewels favorites with you."}
      />
      <Navbar />
      <main>
        {loading || pLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
        ) : (
          <>
            <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16">
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-10 left-10 text-gold/30"><Sparkles className="h-8 w-8" /></div>
                <div className="absolute bottom-10 right-20 text-gold/30"><Heart className="h-6 w-6" /></div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="container mx-auto px-4 text-center relative z-10"
              >
                <div className={`mx-auto h-20 w-20 rounded-full ${isRequest ? 'bg-gradient-to-br from-rose-gold to-gold' : 'bg-gradient-to-br from-gold to-rose-gold'} flex items-center justify-center shadow-lg`}>
                  <Gift className="h-10 w-10 text-primary-foreground" />
                </div>

                {isRequest ? (
                  <>
                    <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold">
                      {gift?.sender_name} would love these 💝
                    </h1>
                    <p className="mt-3 text-lg text-muted-foreground">
                      Pick one (or all) to gift them. We'll ship straight to their door.
                    </p>
                  </>
                ) : (
                  <>
                    {gift?.occasion && (
                      <span className="inline-block mt-4 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-semibold uppercase tracking-wider">{gift.occasion}</span>
                    )}
                    <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold">
                      {gift?.recipient_name ? `Hi ${gift.recipient_name},` : 'A gift just for you'}
                    </h1>
                    <p className="mt-3 text-lg text-muted-foreground">
                      <span className="text-gold font-medium">{gift?.sender_name}</span> sent these to you
                    </p>
                  </>
                )}

                {gift?.message && (
                  <blockquote className="mt-8 max-w-xl mx-auto rounded-2xl border border-gold/30 bg-card p-6 text-base italic text-foreground shadow-sm">
                    "{gift.message}"
                    <footer className="mt-3 text-sm not-italic text-muted-foreground">— {gift.sender_name}</footer>
                  </blockquote>
                )}

                {isRequest && gift?.shipping_address && (
                  <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
                    <MapPin className="h-4 w-4" /> Ships to {gift.shipping_city}, {gift.shipping_state}
                  </div>
                )}

                {isFulfilled && (
                  <div className="mt-8 max-w-md mx-auto rounded-xl border-2 border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3 text-left">
                    <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
                    <div>
                      <p className="font-semibold">{isRequest ? '🎉 Someone gifted these to you!' : 'Gift paid for — on its way!'}</p>
                      <Link to={`/track/${gift?.fulfilled_order_id}`} className="text-sm text-gold underline">Track delivery →</Link>
                    </div>
                  </div>
                )}
              </motion.div>
            </section>

            <section className="container mx-auto px-4 py-12">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">The selected items are no longer available.</p>
                  <Button variant="gold" className="mt-4" asChild><Link to="/shop">Browse the shop</Link></Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <h2 className="font-display text-2xl font-bold">
                      {isRequest ? `${gift?.sender_name}'s wishlist (${items.length})` : `Curated for you (${items.length})`}
                    </h2>
                    {isRequest && !isFulfilled && (
                      <Button variant="gold" size="lg" onClick={beTheGifter}>
                        <Gift className="mr-2 h-4 w-4" /> Be the Gifter — Pay & Send
                      </Button>
                    )}
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
