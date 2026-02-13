import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';

const categoryImages: Record<string, string> = {
  earrings: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
  rings: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
  necklaces: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
  bracelets: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400',
  watches: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
  sets: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400',
};

const featuredCategoryIds = ['earrings', 'rings', 'necklaces', 'bracelets', 'watches', 'sets'];

export function CategoriesSection() {
  const { categories } = useProducts();

  const featuredCategories = featuredCategoryIds
    .map((id) => {
      const cat = categories.find((c) => c.id === id);
      return cat ? { ...cat, image: categoryImages[id] || '' } : null;
    })
    .filter(Boolean) as (typeof categories[number] & { image: string })[];

  if (featuredCategories.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Shop by Category</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Explore our curated collections of fine jewelry and accessories, each piece crafted to perfection.</p>
        </motion.div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((category, index) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
              <Link to={`/shop?category=${category.id}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl">
                <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent transition-opacity group-hover:opacity-90" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-background">{category.name}</h3>
                      <p className="mt-1 text-sm text-background/80">Explore collection →</p>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-gold/0 transition-all duration-300 group-hover:border-gold/50" />
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-12 text-center">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-dark">
            View All Categories <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
