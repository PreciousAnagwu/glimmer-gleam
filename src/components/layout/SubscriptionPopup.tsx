import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function SubscriptionPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Show popup after 5 seconds if not dismissed before
    const hasSeenPopup = localStorage.getItem('glamour-popup-dismissed');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('glamour-popup-dismissed', 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Welcome to the family! 💎",
        description: "Check your email for your exclusive 15% discount code.",
      });
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="grid md:grid-cols-2">
              {/* Image Side */}
              <div className="relative hidden bg-gradient-gold p-8 md:block">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600')] bg-cover bg-center opacity-30" />
                <div className="relative flex h-full flex-col items-center justify-center text-center text-primary-foreground">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Gift className="h-16 w-16" />
                  </motion.div>
                  <h3 className="mt-4 font-display text-3xl font-bold">15% OFF</h3>
                  <p className="mt-2 text-sm opacity-90">Your first order</p>
                </div>
              </div>

              {/* Form Side */}
              <div className="p-8">
                <div className="flex items-center gap-2 text-gold">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">
                    Exclusive Offer
                  </span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
                  Unlock Your Discount
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Subscribe to our newsletter and get 15% off your first purchase, plus exclusive
                  access to new arrivals and special promotions.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm outline-none transition-colors focus:border-gold"
                  />
                  <Button variant="gold" type="submit" className="w-full" size="lg">
                    Get My 15% Off
                  </Button>
                </form>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
                </p>

                <button
                  onClick={handleClose}
                  className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-2 hover:underline"
                >
                  No thanks, I'll pay full price
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
