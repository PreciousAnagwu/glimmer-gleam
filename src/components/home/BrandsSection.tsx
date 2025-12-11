import { motion } from 'framer-motion';

const features = [
  {
    icon: '💎',
    title: 'Premium Quality',
    description: 'Handcrafted with the finest materials and attention to detail',
  },
  {
    icon: '🚚',
    title: 'Free Shipping',
    description: 'Complimentary delivery on orders over ₦50,000',
  },
  {
    icon: '🔄',
    title: 'Easy Returns',
    description: '30-day hassle-free return policy for your peace of mind',
  },
  {
    icon: '🛡️',
    title: 'Secure Payment',
    description: 'Your transactions are protected with bank-level security',
  },
];

export function BrandsSection() {
  return (
    <section className="border-y border-border bg-secondary/30 py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
