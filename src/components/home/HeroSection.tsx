import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-luxury">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute left-10 top-20 h-32 w-32 rounded-full bg-gold/10 blur-3xl"
        animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-rose-gold/10 blur-3xl"
        animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container relative mx-auto px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2 text-sm font-medium text-gold"
            >
              <Sparkles className="h-4 w-4" />
              New Collection 2024
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Elevate Your
              <span className="relative ml-4 inline-block">
                <span className="text-gradient-gold">Style</span>
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                >
                  <path
                    d="M2 10 Q50 2, 100 6 T198 4"
                    fill="none"
                    stroke="hsl(var(--gold))"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0"
            >
              Discover our exquisite collection of handcrafted jewelry and accessories.
              Each piece tells a story of elegance, passion, and timeless beauty.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <Button variant="hero" size="xl" asChild>
                <Link to="/shop">
                  Shop Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/new-arrivals">New Arrivals</Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex justify-center gap-8 lg:justify-start"
            >
              {[
                { value: '5K+', label: 'Happy Customers' },
                { value: '500+', label: 'Unique Designs' },
                { value: '99%', label: 'Satisfaction' },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <p className="font-display text-2xl font-bold text-gold sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square">
              {/* Main Image */}
              <motion.div
                className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-gold/30 shadow-elevated"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
              >
                <img
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600"
                  alt="Featured jewelry"
                  className="h-full w-full object-cover"
                />
              </motion.div>

              {/* Floating Product Cards */}
              <motion.div
                className="absolute left-0 top-10 rounded-xl bg-background/90 p-4 shadow-elevated backdrop-blur-sm"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <img
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=150"
                  alt="Earrings"
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <p className="mt-2 text-xs font-medium">Celestial Earrings</p>
                <p className="text-xs text-gold">₦12,500</p>
              </motion.div>

              <motion.div
                className="absolute bottom-10 right-0 rounded-xl bg-background/90 p-4 shadow-elevated backdrop-blur-sm"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <img
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=150"
                  alt="Ring"
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <p className="mt-2 text-xs font-medium">Infinity Ring</p>
                <p className="text-xs text-gold">₦8,500</p>
              </motion.div>

              {/* Decorative Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-gold/20" />
              <motion.div
                className="absolute inset-4 rounded-full border border-gold/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="flex h-12 w-6 items-start justify-center rounded-full border-2 border-gold/30 p-1"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="h-2 w-1 rounded-full bg-gold"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
