import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gift, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Play & Earn Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-gold/20 to-gold/20 p-8 md:p-12"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-gold/20 px-4 py-2 text-sm font-medium text-rose-gold">
                <Gamepad2 className="h-4 w-4" />
                Play & Earn
              </div>
              <h3 className="mt-6 font-display text-3xl font-bold text-foreground md:text-4xl">
                Win Rewards <br />
                While Having Fun
              </h3>
              <p className="mt-4 max-w-sm text-muted-foreground">
                Play games, answer questions, and earn coupons or site credits to use on your next
                purchase!
              </p>
              <Button variant="gold" size="lg" className="mt-6" asChild>
                <Link to="/play-earn">
                  Start Playing
                  <Gamepad2 className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-rose-gold/20 blur-3xl" />
            <div className="absolute -top-10 right-20 h-32 w-32 rounded-full bg-gold/20 blur-3xl" />
          </motion.div>

          {/* Gift Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold/20 to-champagne/20 p-8 md:p-12"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-2 text-sm font-medium text-gold">
                <Gift className="h-4 w-4" />
                Gift Cards
              </div>
              <h3 className="mt-6 font-display text-3xl font-bold text-foreground md:text-4xl">
                The Perfect Gift <br />
                For Every Occasion
              </h3>
              <p className="mt-4 max-w-sm text-muted-foreground">
                Give the gift of choice with our digital gift cards. Available in various amounts
                and delivered instantly.
              </p>
              <Button variant="luxury" size="lg" className="mt-6" asChild>
                <Link to="/gift-cards">
                  Shop Gift Cards
                  <Gift className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
            <div className="absolute -top-10 right-20 h-32 w-32 rounded-full bg-champagne/20 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
