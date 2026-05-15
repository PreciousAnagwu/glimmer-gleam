import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SiteContentMap = Record<string, any>;

export const DEFAULT_SITE_CONTENT: SiteContentMap = {
  'help.faq': {
    items: [
      { q: 'How long does delivery take?', a: 'Orders within Lagos arrive in 1–3 business days. Other states take 3–7 business days. International shipping takes 7–21 business days.' },
      { q: 'What payment methods do you accept?', a: 'We accept card payments via Paystack, bank transfers, and supported mobile wallets.' },
      { q: 'Are your jewelry pieces hypoallergenic?', a: 'Most of our pieces are nickel-free and hypoallergenic. Check each product page for material details.' },
      { q: 'Do you offer gift wrapping?', a: 'Yes — every order is wrapped in our signature packaging. Add a gift note at checkout.' },
    ],
  },
  'help.shipping': {
    lines: [
      'Free shipping on orders over ₦50,000.',
      'Rivers State: 1–3 business days (₦2,500 flat rate).',
      'Other Nigerian states: 3–7 business days (₦4,500 flat rate).',
      'International: 7–21 business days, calculated at checkout.',
      'Tracking link is emailed once your order ships.',
    ],
  },
  'help.returns': {
    lines: [
      'You may return unworn items in original packaging within 14 days of delivery.',
      'Earrings and custom-engraved pieces are final sale for hygiene reasons.',
      'Email panagwu@gmail.com with your order number to start a return.',
      'Refunds are processed to the original payment method within 5–7 business days of receipt.',
    ],
  },
  'help.size_guide': {
    intro: 'Ring sizes (inner diameter)',
    rings: [
      { size: '5', diameter: '15.7', circumference: '49.3' },
      { size: '6', diameter: '16.5', circumference: '51.9' },
      { size: '7', diameter: '17.3', circumference: '54.4' },
      { size: '8', diameter: '18.2', circumference: '57.0' },
      { size: '9', diameter: '19.0', circumference: '59.5' },
    ],
    necklaces: 'Choker 35–40cm · Princess 45cm · Matinee 55–60cm · Opera 70–85cm.',
  },
  'help.contact': { email: 'panagwu@gmail.com', whatsapp: '+2348034231231', phone: '+2348034231231' },
  'home.testimonials': {
    items: [
      { name: 'Adaeze Okonkwo', role: 'Fashion Blogger', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', content: "The quality of J's Jewels jewelry is absolutely stunning. Every piece I've purchased has become a staple in my collection.", rating: 5 },
      { name: 'Chiamaka Eze', role: 'Business Executive', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', content: "From engagement rings to everyday accessories, J's Jewels has never disappointed. The attention to detail is remarkable.", rating: 5 },
      { name: 'Folake Adeyemi', role: 'Wedding Planner', image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150', content: "I recommend J's Jewels to all my brides. Their bridal sets are breathtaking and the customer service is exceptional.", rating: 5 },
    ],
  },
};

export function useSiteContent() {
  const [content, setContent] = useState<SiteContentMap>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from('site_content' as any).select('key, value');
    if (data) {
      const merged = { ...DEFAULT_SITE_CONTENT };
      (data as any[]).forEach((row) => { merged[row.key] = row.value; });
      setContent(merged);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`site-content-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return { content, loading, refetch: load };
}

export function getContent<T = any>(content: SiteContentMap, key: string): T {
  return (content[key] ?? DEFAULT_SITE_CONTENT[key]) as T;
}
