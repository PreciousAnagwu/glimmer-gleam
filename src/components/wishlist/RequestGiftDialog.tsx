import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Gift, Copy, Check, Mail, MessageCircle, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlistStore } from '@/store/wishlistStore';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const schema = z.object({
  requesterName: z.string().trim().min(2).max(80),
  shippingPhone: z.string().trim().min(7).max(40),
  shippingAddress: z.string().trim().min(5).max(300),
  shippingCity: z.string().trim().min(2).max(80),
  shippingState: z.string().trim().min(2).max(80),
  message: z.string().trim().max(500).optional().or(z.literal('')),
});

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

export function RequestGiftDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const items = useWishlistStore((s) => s.items);
  const [f, setF] = useState({
    requesterName: user?.name || '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const reset = () => {
    setLink(null); setCopied(false);
  };

  const create = async () => {
    if (!user) { toast({ title: 'Please sign in', variant: 'destructive' }); return; }
    if (items.length === 0) { toast({ title: 'Your wishlist is empty', variant: 'destructive' }); return; }
    const parsed = schema.safeParse(f);
    if (!parsed.success) {
      toast({ title: 'Please check your inputs', description: parsed.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from('gift_wishlists').insert({
      sender_id: user.id,
      sender_name: f.requesterName.trim(),
      recipient_name: f.requesterName.trim(),
      recipient_user_id: user.id,
      message: f.message.trim() || null,
      product_ids: items.map((i) => i.productId),
      gift_type: 'request',
      shipping_name: f.requesterName.trim(),
      shipping_phone: f.shippingPhone.trim(),
      shipping_address: f.shippingAddress.trim(),
      shipping_city: f.shippingCity.trim(),
      shipping_state: f.shippingState.trim(),
    }).select('slug').single();
    setSubmitting(false);
    if (error || !data) {
      toast({ title: 'Could not create request', description: error?.message, variant: 'destructive' });
      return;
    }
    setLink(`${window.location.origin}/gift/${data.slug}`);
    toast({ title: '🎁 Wishlist link ready!', description: 'Share with anyone who might gift you.' });
  };

  const copy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailto = () => {
    if (!link) return;
    const subject = encodeURIComponent(`${f.requesterName}'s J's Jewels wishlist 💝`);
    const body = encodeURIComponent(`Hi! I've picked some J's Jewels pieces I'd love. If you're thinking of a gift, here's my wishlist:\n\n${link}\n\nThanks!\n${f.requesterName}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const whatsapp = () => {
    if (!link) return;
    const text = encodeURIComponent(`Hi! Here's my J's Jewels wishlist if you're thinking of a gift 💝 ${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Gift className="h-5 w-5 text-rose-gold" /> Request a Gift
          </DialogTitle>
          <DialogDescription>
            {link ? 'Your gift request link is ready — share it with anyone.' : `Create a link so someone else can pay for your ${items.length} wishlist item${items.length === 1 ? '' : 's'} and ship them to you.`}
          </DialogDescription>
        </DialogHeader>

        {!link ? (
          <div className="space-y-4">
            <div>
              <Label>Your name *</Label>
              <Input value={f.requesterName} onChange={(e) => set('requesterName', e.target.value)} maxLength={80} />
            </div>
            <div>
              <Label>Your phone *</Label>
              <Input value={f.shippingPhone} onChange={(e) => set('shippingPhone', e.target.value)} placeholder="+234..." />
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
              <Label>Note to your potential gifter</Label>
              <Textarea value={f.message} onChange={(e) => set('message', e.target.value)} maxLength={500} rows={3} placeholder="It's my birthday next week! 🎂" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button variant="gold" onClick={create} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Create Link
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-secondary/40 p-3 break-all text-sm font-mono">{link}</div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={copy}>
                {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}{copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="outline" onClick={mailto}><Mail className="mr-1 h-4 w-4" /> Email</Button>
              <Button variant="outline" onClick={whatsapp}><MessageCircle className="mr-1 h-4 w-4" /> WhatsApp</Button>
            </div>
            <Button variant="gold" className="w-full" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
