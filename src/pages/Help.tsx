import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle, Phone, Truck, RotateCcw, Ruler, HelpCircle } from 'lucide-react';

const sections = [
  { id: 'faq', title: 'Frequently Asked Questions', icon: HelpCircle },
  { id: 'shipping', title: 'Shipping Info', icon: Truck },
  { id: 'returns', title: 'Returns & Exchanges', icon: RotateCcw },
  { id: 'size-guide', title: 'Size Guide', icon: Ruler },
  { id: 'contact', title: 'Contact Us', icon: Mail },
];

const Help = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Help Center</h1>
          <p className="mt-3 text-muted-foreground">
            Everything you need to know about shopping with J's Jewels.
          </p>

          {/* Quick nav */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {sections.map(({ id, title, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-secondary/30 p-4 text-center text-sm transition-colors hover:border-gold hover:text-gold"
              >
                <Icon className="h-5 w-5" />
                {title}
              </a>
            ))}
          </div>

          {/* FAQ */}
          <section id="faq" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="mt-6">
              <AccordionItem value="q1">
                <AccordionTrigger>How long does delivery take?</AccordionTrigger>
                <AccordionContent>
                  Orders within Lagos arrive in 1–3 business days. Other states take 3–7 business days.
                  International shipping takes 7–21 business days.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept card payments via Paystack, bank transfers, and supported mobile wallets.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>Are your jewelry pieces hypoallergenic?</AccordionTrigger>
                <AccordionContent>
                  Most of our pieces are nickel-free and hypoallergenic. Check each product page for material details.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger>Do you offer gift wrapping?</AccordionTrigger>
                <AccordionContent>
                  Yes — every order is wrapped in our signature packaging. Add a gift note at checkout.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Shipping */}
          <section id="shipping" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold">Shipping Info</h2>
            <Card className="mt-6">
              <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
                <p>• <strong className="text-foreground">Free shipping</strong> on orders over ₦50,000.</p>
                <p>• Rivers State: 1–3 business days (₦2,500 flat rate).</p>
                <p>• Other Nigerian states: 3–7 business days (₦4,500 flat rate).</p>
                <p>• International: 7–21 business days, calculated at checkout.</p>
                <p>• Tracking link is emailed once your order ships.</p>
              </CardContent>
            </Card>
          </section>

          {/* Returns */}
          <section id="returns" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold">Returns & Exchanges</h2>
            <Card className="mt-6">
              <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
                <p>You may return unworn items in original packaging within <strong className="text-foreground">14 days</strong> of delivery.</p>
                <p>Earrings and custom-engraved pieces are final sale for hygiene reasons.</p>
                <p>Email <a className="text-gold" href="mailto:panagwu@gmail.com">panagwu@gmail.com</a> with your order number to start a return.</p>
                <p>Refunds are processed to the original payment method within 5–7 business days of receipt.</p>
              </CardContent>
            </Card>
          </section>

          {/* Size Guide */}
          <section id="size-guide" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold">Size Guide</h2>
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground">Ring sizes (inner diameter)</h3>
                <table className="mt-3 w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr><th className="py-2">Size</th><th>Diameter (mm)</th><th>Circumference (mm)</th></tr>
                  </thead>
                  <tbody className="text-foreground">
                    <tr className="border-t border-border/50"><td className="py-2">5</td><td>15.7</td><td>49.3</td></tr>
                    <tr className="border-t border-border/50"><td className="py-2">6</td><td>16.5</td><td>51.9</td></tr>
                    <tr className="border-t border-border/50"><td className="py-2">7</td><td>17.3</td><td>54.4</td></tr>
                    <tr className="border-t border-border/50"><td className="py-2">8</td><td>18.2</td><td>57.0</td></tr>
                    <tr className="border-t border-border/50"><td className="py-2">9</td><td>19.0</td><td>59.5</td></tr>
                  </tbody>
                </table>
                <h3 className="mt-6 font-semibold text-foreground">Necklace lengths</h3>
                <p className="mt-2 text-sm text-muted-foreground">Choker 35–40cm · Princess 45cm · Matinee 55–60cm · Opera 70–85cm.</p>
              </CardContent>
            </Card>
          </section>

          {/* Contact */}
          <section id="contact" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold">Contact Us</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Mail className="h-4 w-4 text-gold" /> Email</CardTitle></CardHeader>
                <CardContent><a href="mailto:panagwu@gmail.com" className="text-sm text-muted-foreground hover:text-gold">panagwu@gmail.com</a></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><MessageCircle className="h-4 w-4 text-gold" /> WhatsApp</CardTitle></CardHeader>
                <CardContent><a href="https://wa.me/2348034231231" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-gold">+234 803 423 1231</a></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Phone className="h-4 w-4 text-gold" /> Phone</CardTitle></CardHeader>
                <CardContent><a href="tel:+2348034231231" className="text-sm text-muted-foreground hover:text-gold">+234 803 423 1231</a></CardContent>
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
