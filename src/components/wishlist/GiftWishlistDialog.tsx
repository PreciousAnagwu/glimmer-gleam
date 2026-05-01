import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Gift, Copy, Check, Mail, MessageCircle, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlistStore } from '@/store/wishlistStore';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const giftSchema = z.object({
  senderName: z.string().trim().min(2, 'Your name is required').max(80),
  recipientName: z.string().trim().max(80).optional().or(z.literal('')),
  recipientEmail: z.string().trim().email('Invalid email').max(255).optional().or(z.literal('')),
  message: z.string().trim().max(500).optional().or(z.literal('')),
  occasion: z.string().max(40).optional().or(z.literal('')),
});

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Christmas', 'Valentine', 'Just Because', 'Other'];

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

export function GiftWishlistDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const items = useWishlistStore((s) => s.items);
  const [senderName, setSenderName] = useState(user?.name || '');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [occasion, setOccasion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setRecipientName(''); setRecipientEmail(''); setMessage(''); setOccasion(''); setLink(null); setCopied(false);
  };

  const create = async () => {
    if (!user) { toast({ title: 'Please sign in to send a gift', variant: 'destructive' }); return; }
    if (items.length === 0) { toast({ title: 'Your wishlist is empty', variant: 'destructive' }); return; }
    const parsed = giftSchema.safeParse({ senderName, recipientName, recipientEmail, message, occasion });
    if (!parsed.success) {
      toast({ title: 'Please check your inputs', description: parsed.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from('gift_wishlists').insert({
      sender_id: user.id,
      sender_name: senderName.trim(),
      recipient_name: recipientName.trim() || null,
      recipient_email: recipientEmail.trim() || null,
      message: message.trim() || null,
      occasion: occasion || null,
      product_ids: items.map((i) => i.productId),
    }).select('slug').single();
    setSubmitting(false);
    if (error || !data) { toast({ title: 'Could not create gift link', description: error?.message, variant: 'destructive' }); return; }
    const url = `${window.location.origin}/gift/${data.slug}`;
    setLink(url);
    toast({ title: '🎁 Gift link created!', description: 'Share it however you like.' });
  };

  const copy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailto = () => {
    if (!link) return;
    const subject = encodeURIComponent(`${senderName} sent you a gift wishlist 💝`);
    const body = encodeURIComponent(`${recipientName ? `Hi ${recipientName},\n\n` : ''}${message ? message + '\n\n' : ''}I picked some pieces from J's Jewels that I thought you'd love. Take a look here:\n\n${link}\n\nWith love,\n${senderName}`);
    window.location.href = `mailto:${recipientEmail || ''}?subject=${subject}&body=${body}`;
  };

  const whatsapp = () => {
    if (!link) return;
    const text = encodeURIComponent(`${recipientName ? `Hi ${recipientName}! ` : ''}${message ? message + ' ' : ''}I picked some J's Jewels pieces just for you 💝 ${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display"><Gift className="h-5 w-5 text-gold" /> Send as a Gift</DialogTitle>
          <DialogDescription>
            {link ? 'Your gift link is ready — share it via email, WhatsApp, or copy it.' : `Wrap up your ${items.length} wishlist item${items.length === 1 ? '' : 's'} with a personal message.`}
          </DialogDescription>
        </DialogHeader>

        {!link ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="sender">Your name *</Label>
              <Input id="sender" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Jane Doe" maxLength={80} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="recipient">Recipient name</Label>
                <Input id="recipient" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Optional" maxLength={80} />
              </div>
              <div>
                <Label htmlFor="occasion">Occasion</Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger id="occasion"><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {OCCASIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="email">Recipient email (optional)</Label>
              <Input id="email" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="friend@email.com" maxLength={255} />
              <p className="text-xs text-muted-foreground mt-1">We'll pre-fill an email for you to send.</p>
            </div>
            <div>
              <Label htmlFor="message">Personal message</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hope you love these as much as I do! 💝" maxLength={500} rows={3} />
              <p className="text-xs text-muted-foreground mt-1">{message.length}/500</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button variant="gold" onClick={create} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Create Gift Link
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
