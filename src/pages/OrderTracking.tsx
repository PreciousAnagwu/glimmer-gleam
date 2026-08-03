import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Loader2, Package, CheckCircle2, Truck, Home, Clock, Download, Printer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { printOrderReceipt, downloadOrderReceipt } from '@/lib/receipt';


const STAGES = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: o } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
      setOrder(o);
      if (o) {
        const { data: oi } = await supabase.from('order_items').select('*').eq('order_id', id);
        setItems(oi || []);
      }
      setLoading(false);
    };
    load();
    const ch = supabase
      .channel(`order-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, (p) => setOrder(p.new))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  const currentIdx = order ? Math.max(0, STAGES.findIndex((s) => s.key === (order.status === 'cancelled' ? 'pending' : order.status))) : 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Track Your Order" />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
        ) : !order ? (
          <div className="text-center py-20">
            <h1 className="font-display text-2xl">Order not found</h1>
            <Button variant="gold" className="mt-4" asChild><Link to="/shop">Continue shopping</Link></Button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-muted-foreground mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>

            {/* Progress */}
            <div className="mt-10 grid grid-cols-4 gap-2">
              {STAGES.map((s, i) => {
                const Icon = s.icon;
                const done = i <= currentIdx && order.status !== 'cancelled';
                return (
                  <div key={s.key} className="flex flex-col items-center text-center">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${done ? 'bg-gold text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                      {done && i < currentIdx ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <p className={`mt-2 text-xs ${done ? 'font-medium' : 'text-muted-foreground'}`}>{s.label}</p>
                  </div>
                );
              })}
            </div>
            {order.status === 'cancelled' && (
              <p className="mt-6 text-center text-destructive font-medium">This order was cancelled.</p>
            )}

            {/* Items */}
            <div className="mt-10 rounded-xl border border-border p-6">
              <h2 className="font-display text-xl font-semibold mb-4">Items</h2>
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-4">
                    {it.product_image && <img src={it.product_image} alt={it.product_name} className="h-16 w-16 rounded-lg object-cover" />}
                    <div className="flex-1">
                      <p className="font-medium">{it.product_name}</p>
                      <p className="text-sm text-muted-foreground">{it.variant_style} • {it.color} • Qty {it.quantity}</p>
                    </div>
                    <p className="font-medium">₦{Number(it.variant_price * it.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-display text-xl text-gold font-bold">₦{Number(order.total).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border p-6">
              <h3 className="font-medium mb-2">Shipping to</h3>
              <p className="text-sm text-muted-foreground">{order.shipping_name}<br />{order.shipping_address}<br />{order.shipping_city}, {order.shipping_state}<br />{order.shipping_phone}</p>
            </div>

            {/* Payment & receipt */}
            <div className="mt-6 rounded-xl border border-border p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Payment</h3>
                  <p className="text-sm text-muted-foreground capitalize">{order.payment_method} — {String(order.payment_status).replace(/_/g, ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => printOrderReceipt(order, items)}>
                    <Printer className="h-4 w-4 mr-2" /> Print receipt
                  </Button>
                  <Button variant="gold" size="sm" onClick={() => downloadOrderReceipt(order, items)}>
                    <Download className="h-4 w-4 mr-2" /> Download receipt
                  </Button>
                </div>
              </div>

              {order.payment_status === 'awaiting_confirmation' && (
                <p className="mt-4 rounded-lg bg-gold/10 p-3 text-sm text-muted-foreground">
                  ⏳ We've received your transfer receipt and our team is verifying it. You'll be notified as soon as it's approved.
                </p>
              )}

              {order.payment_status === 'failed' && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <p className="font-medium text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Payment could not be verified</p>
                  {order.payment_rejection_reason && (
                    <p className="mt-1 text-muted-foreground">Reason: {order.payment_rejection_reason}</p>
                  )}
                  <p className="mt-1 text-muted-foreground">Please re-upload a valid receipt or contact support.</p>
                </div>
              )}

              {order.payment_receipt_url && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Your uploaded transfer receipt</p>
                  <a href={order.payment_receipt_url} target="_blank" rel="noopener noreferrer" className="inline-block">
                    <img src={order.payment_receipt_url} alt="Uploaded payment receipt" className="max-h-56 rounded-lg border border-border object-contain" />
                  </a>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={order.payment_receipt_url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" /> Download uploaded receipt
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
