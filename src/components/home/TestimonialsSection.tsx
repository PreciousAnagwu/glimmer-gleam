import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useSiteContent, getContent } from '@/hooks/useSiteContent';

export function TestimonialsSection() {
  const { content } = useSiteContent();
  const data = getContent<{ items: any[] }>(content, 'home.testimonials');
  const testimonials = data.items || [];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join thousands of satisfied customers who trust J's Jewels for their jewelry needs
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="absolute -top-4 left-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold">
                  <Quote className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <div className="mt-4 flex gap-1">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="mt-4 text-muted-foreground">{t.content}</p>
              <div className="mt-6 flex items-center gap-3">
                {t.image && (
                  <img src={t.image} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-medium text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
