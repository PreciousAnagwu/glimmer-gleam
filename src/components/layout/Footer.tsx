import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Send, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/30">
      {/* Newsletter Section */}
      <div className="border-b border-border/50 bg-gradient-luxury">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
              Join the Glamour Family
            </h3>
            <p className="mt-3 text-muted-foreground">
              Subscribe for exclusive offers, early access to new collections, and 10% off your first order.
            </p>
            <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold"
              />
              <Button variant="gold" size="lg" type="submit">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-bold tracking-wide text-foreground">
                GLAMOUR
              </span>
              <span className="ml-1 font-display text-lg font-light tracking-widest text-gold">
                & Co.
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Elevating your style with exquisite jewelry and accessories crafted with love and precision.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-gold hover:text-primary-foreground"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-gold hover:text-primary-foreground"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="https://t.me/glamour"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-gold hover:text-primary-foreground"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">Shop</h4>
            <ul className="mt-4 space-y-3">
              {['All Products', 'New Arrivals', 'Bestsellers', 'Collections', 'Sale'].map((item) => (
                <li key={item}>
                  <Link
                    to="/shop"
                    className="text-sm text-muted-foreground transition-colors hover:text-gold"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">Help</h4>
            <ul className="mt-4 space-y-3">
              {['FAQ', 'Shipping Info', 'Returns & Exchanges', 'Size Guide', 'Contact Us'].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/help"
                      className="text-sm text-muted-foreground transition-colors hover:text-gold"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">Account</h4>
            <ul className="mt-4 space-y-3">
              {['My Account', 'Orders', 'Wishlist', 'My Coupons', 'Play & Earn'].map((item) => (
                <li key={item}>
                  <Link
                    to="/account"
                    className="text-sm text-muted-foreground transition-colors hover:text-gold"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Glamour & Co. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 text-rose-gold" /> in Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}
