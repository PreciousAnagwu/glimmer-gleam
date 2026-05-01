import { useEffect, useState } from 'react';
import { Star, Loader2, Trash2, BadgeCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string;
  is_verified_buyer: boolean;
  created_at: string;
}

export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifiedBuyer, setVerifiedBuyer] = useState(false);
  const [namesById, setNamesById] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setReviews((data as Review[]) || []);
    if (data && data.length) {
      const ids = Array.from(new Set(data.map((r: any) => r.user_id)));
      const { data: profs } = await supabase.from('profiles').select('user_id, name').in('user_id', ids);
      const m: Record<string, string> = {};
      (profs || []).forEach((p: any) => (m[p.user_id] = p.name || 'Customer'));
      setNamesById(m);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // verify buyer
    if (user) {
      supabase
        .from('order_items')
        .select('id, orders!inner(user_id, payment_status)')
        .eq('product_id', productId)
        .then(({ data }) => {
          const ok = (data as any[] | null)?.some(
            (oi) => oi.orders?.user_id === user.id && oi.orders?.payment_status === 'paid'
          );
          setVerifiedBuyer(!!ok);
        });
    }
    const channel = supabase
      .channel(`reviews-${productId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_reviews', filter: `product_id=eq.${productId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [productId, user?.id]);

  const submit = async () => {
    if (!user) { toast({ title: 'Please sign in to review', variant: 'destructive' }); return; }
    if (!comment.trim()) { toast({ title: 'Please write a comment', variant: 'destructive' }); return; }
    setSubmitting(true);
    const { error } = await supabase.from('product_reviews').upsert({
      product_id: productId,
      user_id: user.id,
      rating,
      title: title.trim() || null,
      comment: comment.trim(),
      is_verified_buyer: verifiedBuyer,
    }, { onConflict: 'product_id,user_id' });
    setSubmitting(false);
    if (error) { toast({ title: 'Could not submit review', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Review submitted', description: 'Thank you for your feedback!' });
    setTitle(''); setComment(''); setRating(5);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('product_reviews').delete().eq('id', id);
    if (error) toast({ title: 'Could not delete', variant: 'destructive' });
  };

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Customer Reviews</h2>

      {/* Form */}
      <div className="mt-6 rounded-xl border border-border p-6">
        {!user ? (
          <p className="text-muted-foreground">
            <Link to="/auth" className="text-gold underline">Sign in</Link> to leave a review.
          </p>
        ) : (
          <>
            <p className="mb-2 font-medium">{myReview ? 'Update your review' : 'Write a review'}</p>
            <div className="flex items-center gap-1 mb-4">
              {[1,2,3,4,5].map((i) => (
                <button key={i} type="button" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setRating(i)}>
                  <Star className={`h-6 w-6 ${i <= (hover || rating) ? 'fill-gold text-gold' : 'text-muted'}`} />
                </button>
              ))}
              {verifiedBuyer && <span className="ml-3 inline-flex items-center gap-1 text-xs text-green-600"><BadgeCheck className="h-4 w-4" /> Verified buyer</span>}
            </div>
            <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-3" />
            <Textarea placeholder="Share your experience…" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
            <Button variant="gold" className="mt-4" onClick={submit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {myReview ? 'Update review' : 'Submit review'}
            </Button>
          </>
        )}
      </div>

      {/* List */}
      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'fill-gold text-gold' : 'text-muted'}`} />
                      ))}
                    </div>
                    {r.is_verified_buyer && <span className="inline-flex items-center gap-1 text-xs text-green-600"><BadgeCheck className="h-3 w-3" /> Verified</span>}
                  </div>
                  {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                </div>
                {user?.id === r.user_id && (
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{r.comment}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {namesById[r.user_id] || 'Customer'} • {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
