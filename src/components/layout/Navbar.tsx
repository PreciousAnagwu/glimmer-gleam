import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User, Search, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { categories } from '@/data/products';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { getTotalItems, openCart } = useCartStore();
  const { user } = useAuth();
  const totalItems = getTotalItems();

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement Bar */}
      <div className="bg-gradient-gold py-2 text-center">
        <p className="text-xs font-medium tracking-wider text-primary-foreground">
          FREE SHIPPING ON ORDERS OVER ₦50,000 | USE CODE: GLAMOUR15 FOR 15% OFF
        </p>
      </div>

      {/* Main Navbar */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-wide text-foreground lg:text-3xl">
                GLAMOUR
              </span>
              <span className="hidden font-display text-lg font-light tracking-widest text-gold sm:inline">
                & Co.
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:items-center lg:gap-8">
              <Link
                to="/shop"
                className="text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-gold"
              >
                Shop All
              </Link>
              <div className="group relative">
                <button className="flex items-center gap-1 text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-gold">
                  Collections
                </button>
                <div className="invisible absolute left-0 top-full min-w-[200px] pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
                  <div className="rounded-lg border border-border/50 bg-background p-4 shadow-elevated">
                    {categories.slice(0, 8).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.id}`}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary"
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                    <Link
                      to="/shop"
                      className="mt-2 block border-t border-border/50 px-3 pt-3 text-sm font-medium text-gold"
                    >
                      View All Categories →
                    </Link>
                  </div>
                </div>
              </div>
              <Link
                to="/new-arrivals"
                className="text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-gold"
              >
                New Arrivals
              </Link>
              <Link
                to="/bestsellers"
                className="text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-gold"
              >
                Bestsellers
              </Link>
              <Link
                to="/play-earn"
                className="text-sm font-medium tracking-wide text-rose-gold transition-colors hover:text-rose-gold/80"
              >
                Play & Earn ✨
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="h-5 w-5" />
              </Button>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="icon" className="text-gold">
                    <Shield className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/account">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={openCart}
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border/50 bg-background lg:hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col gap-2">
                <Link
                  to="/shop"
                  className="rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop All
                </Link>
                <Link
                  to="/new-arrivals"
                  className="rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  New Arrivals
                </Link>
                <Link
                  to="/bestsellers"
                  className="rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Bestsellers
                </Link>
                <Link
                  to="/play-earn"
                  className="rounded-md px-4 py-3 text-sm font-medium text-rose-gold transition-colors hover:bg-secondary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Play & Earn ✨
                </Link>
                <div className="border-t border-border/50 pt-2">
                  <p className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Categories
                  </p>
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.id}`}
                      className="flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors hover:bg-secondary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/50 pt-20 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl rounded-xl bg-background p-6 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for jewelry, accessories..."
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Popular Searches</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Gold Earrings', 'Pearl Necklace', 'Diamond Ring', 'Wedding Set'].map((term) => (
                    <button
                      key={term}
                      className="rounded-full bg-secondary px-4 py-2 text-sm transition-colors hover:bg-gold hover:text-primary-foreground"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
