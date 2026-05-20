import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Gift, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { useProducts } from '@/hooks/useProducts';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const giftSchema = z.object({
  senderName: z.string().trim().min(2, 'Your name is required').max(80),
  recipientName: z.string().trim().min(2, 'Recipient name is required').max(80),
  recipientEmail: z.string().trim().email('Invalid email').max(255).optional().or(z.literal('')),
  recipientPhone: z.string().trim().min(7, 'Phone is required').max(40),
  shippingAddress: z.string().trim().min(5, 'Address is required').max(300),
  shippingCity: z.string().trim().min(2, 'City is required').max(80),
  shippingState: z.string().trim().min(2, 'State is required').max(80),
  message: z.string().trim().max(500).optional().or(z.literal('')),
  occasion: z.string().max(40).optional().or(z.literal('')),
});

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Christmas', 'Valentine', 'Just Because', 'Other'];

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

export function GiftWishlistDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = useWishlistStore((s) => s.items);
  const { getProductById } = useProducts();
  const addToCart = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const [f, setF] = useState({
    senderName: user?.name || '',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    message: '',
    occasion: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const createAndCheckout = async () => {
    if (!user) { toast({ title: 'Please sign in to send a gift', variant: 'destructive' }); return; }
    if (items.length === 0) { toast({ title: 'Your wishlist is empty', variant: 'destructive' }); return; }
    const parsed = giftSchema.safeParse(f);
    if (!parsed.success) {
      toast({ title: 'Please check your inputs', description: parsed.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from('gift_wishlists').insert({
      sender_id: user.id,
      sender_name: f.senderName.trim(),
      recipient_name: f.recipientName.trim(),
      recipient_email: f.recipientEmail.trim() || null,
      message: f.message.trim() || null,
      occasion: f.occasion || null,
      product_ids: items.map((i) => i.productId),
      gift_type: 'send',
      shipping_name: f.recipientName.trim(),
      shipping_phone: f.recipientPhone.trim(),
      shipping_address: f.shippingAddress.trim(),
      shipping_city: f.shippingCity.trim(),
      shipping_state: f.shippingState.trim(),
    }).select('id, slug').single();
    setSubmitting(false);
    if (error || !data) {
      toast({ title: 'Could not create gift', description: error?.message, variant: 'destructive' });
      return;
    }
    // Load items into cart for checkout
    clearCart();
    items.forEach((it) => {
      const p = getProductById(it.productId);
      if (!p) return;
      addToCart({
        productId: p.id, name: p.name, image: p.images[0],
        variant: p.variants[0], color: p.colors[0]?.name || '', quantity: 1,
      });
    });
    toast({ title: '🎁 Gift ready — pay to send it!' });
    onOpenChange(false);
    navigate(`/checkout?gift=${data.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Gift className="h-5 w-5 text-gold" /> Send as a Gift
          </DialogTitle>
          <DialogDescription>
            You'll pay & we'll ship these {items.length} item{items.length === 1 ? '' : 's'} directly to your recipient.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Your name *</Label>
            <Input value={f.senderName} onChange={(e) => set('senderName', e.target.value)} maxLength={80} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Recipient name *</Label>
              <Input value={f.recipientName} onChange={(e) => set('recipientName', e.target.value)} maxLength={80} />
            </div>
            <div>
              <Label>Occasion</Label>
              <Select value={f.occasion} onValueChange={(v) => set('occasion', v)}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{OCCASIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Recipient phone *</Label>
              <Input value={f.recipientPhone} onChange={(e) => set('recipientPhone', e.target.value)} placeholder="+234..." />
            </div>
            <div>
              <Label>Recipient email</Label>
              <Input type="email" value={f.recipientEmail} onChange={(e) => set('recipientEmail', e.target.value)} placeholder="optional" />
            </div>
          </div>
          <div>
            <Label>Delivery address *</Label>
            <Input value={f.shippingAddress} onChange={(e) => set('shippingAddress', e.target.value)} placeholder="123 Example Street" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City *</Label>
              <Input value={f.shippingCity} onChange={(e) => set('shippingCity', e.target.value)} />
            </div>
            <div>
              <Label>State *</Label>
              <Input value={f.shippingState} onChange={(e) => set('shippingState', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Personal message</Label>
            <Textarea value={f.message} onChange={(e) => set('message', e.target.value)} maxLength={500} rows={3} placeholder="Hope you love these! 💝" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="gold" onClick={createAndCheckout} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Continue to Pay
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
