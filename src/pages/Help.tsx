import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle, Phone, Truck, RotateCcw, Ruler, HelpCircle } from 'lucide-react';
import { useSiteContent, getContent } from '@/hooks/useSiteContent';

const sections = [
  { id: 'faq', title: 'Frequently Asked Questions', icon: HelpCircle },
  { id: 'shipping', title: 'Shipping Info', icon: Truck },
  { id: 'returns', title: 'Returns & Exchanges', icon: RotateCcw },
  { id: 'size-guide', title: 'Size Guide', icon: Ruler },
  { id: 'contact', title: 'Contact Us', icon: Mail },
];

const Help = () => {
  const location = useLocation();
  const { content } = useSiteContent();

  const faq = getContent<{ items: { q: string; a: string }[] }>(content, 'help.faq');
  const shipping = getContent<{ lines: string[] }>(content, 'help.shipping');
  const returns = getContent<{ lines: string[] }>(content, 'help.returns');
  const size = getContent<{ intro: string; rings: { size: string; diameter: string; circumference: string }[]; necklaces: string }>(content, 'help.size_guide');
  const contact = getContent<{ email: string; whatsapp: string; phone: string }>(content, 'help.contact');

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const waNumber = (contact.whatsapp || '').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Help Center</h1>
          <p className="mt-3 text-muted-foreground">
            Everything you need to know about shopping with J's Jewels.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {sections.map(({ id, title, icon: Icon }) => (
              <a key={id} href={`#${id}`} className="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-secondary/30 p-4 text-center text-sm transition-colors hover:border-gold hover:text-gold">
                <Icon className="h-5 w-5" />
                {title}
              </a>
            ))}
          </div>

          <section id="faq" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="mt-6">
              {faq.items?.map((item, i) => (
                <AccordionItem key={i} value={`q${i}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section id="shipping" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold">Shipping Info</h2>
            <Card className="mt-6">
              <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
                {shipping.lines?.map((l, i) => <p key={i}>• {l}</p>)}
              </CardContent>
            </Card>
          </section>

          <section id="returns" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold">Returns & Exchanges</h2>
            <Card className="mt-6">
              <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
                {returns.lines?.map((l, i) => <p key={i}>{l}</p>)}
              </CardContent>
            </Card>
          </section>

          <section id="size-guide" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold">Size Guide</h2>
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground">{size.intro}</h3>
                <table className="mt-3 w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr><th className="py-2">Size</th><th>Diameter (mm)</th><th>Circumference (mm)</th></tr>
                  </thead>
                  <tbody className="text-foreground">
                    {size.rings?.map((r, i) => (
                      <tr key={i} className="border-t border-border/50"><td className="py-2">{r.size}</td><td>{r.diameter}</td><td>{r.circumference}</td></tr>
                    ))}
                  </tbody>
                </table>
                <h3 className="mt-6 font-semibold text-foreground">Necklace lengths</h3>
                <p className="mt-2 text-sm text-muted-foreground">{size.necklaces}</p>
              </CardContent>
            </Card>
          </section>

          <section id="contact" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold">Contact Us</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Mail className="h-4 w-4 text-gold" /> Email</CardTitle></CardHeader>
                <CardContent><a href={`mailto:${contact.email}`} className="text-sm text-muted-foreground hover:text-gold">{contact.email}</a></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><MessageCircle className="h-4 w-4 text-gold" /> WhatsApp</CardTitle></CardHeader>
                <CardContent><a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-gold">{contact.whatsapp}</a></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Phone className="h-4 w-4 text-gold" /> Phone</CardTitle></CardHeader>
                <CardContent><a href={`tel:${contact.phone}`} className="text-sm text-muted-foreground hover:text-gold">{contact.phone}</a></CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
