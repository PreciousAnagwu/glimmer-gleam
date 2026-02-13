import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Heart, Minus, Plus, ShoppingBag, Star, Truck, RotateCcw, Shield, Loader2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { ProductCard } from '@/components/products/ProductCard';
import { toast } from '@/hooks/use-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading, getProductById } = useProducts();
  const product = getProductById(id || '');
  const { addItem } = useCartStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold">Product Not Found</h1>
            <p className="mt-2 text-muted-foreground">The product you're looking for doesn't exist.</p>
            <Button variant="gold" className="mt-4" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      variant: product.variants[selectedVariant],
      color: product.colors[selectedColor].name,
      quantity,
    });
    toast({ title: "Added to cart!", description: `${product.name} has been added to your cart.` });
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-gold">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-gold">Shop</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => prev === 0 ? product.images.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => prev === product.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {product.newArrival && <span className="rounded-full bg-gold px-3 py-1 text-xs font-medium text-primary-foreground">New</span>}
                  {product.bestseller && <span className="rounded-full bg-rose-gold px-3 py-1 text-xs font-medium text-primary-foreground">Bestseller</span>}
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg ${
                      selectedImage === index ? 'ring-2 ring-gold ring-offset-2' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:py-8">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-gold text-gold' : 'fill-muted text-muted'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
              <div className="mt-4 flex items-center gap-3">
                <span className="font-display text-3xl font-bold text-gold">{formatPrice(product.variants[selectedVariant].price)}</span>
                {product.variants[selectedVariant].originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">{formatPrice(product.variants[selectedVariant].originalPrice)}</span>
                )}
              </div>
              <p className="mt-6 text-muted-foreground">{product.description}</p>

              <div className="mt-8">
                <p className="mb-3 font-medium">Color: <span className="text-gold">{product.colors[selectedColor]?.name}</span></p>
                <div className="flex gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(index)}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${selectedColor === index ? 'scale-110 border-gold' : 'border-border hover:scale-105'}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="mb-3 font-medium">Style</p>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(index)}
                      className={`rounded-lg border px-6 py-3 text-sm font-medium transition-all ${
                        selectedVariant === index ? 'border-gold bg-gold text-primary-foreground' : 'border-border hover:border-gold'
                      }`}
                    >
                      {variant.style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="mb-3 font-medium">Quantity</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-border">
                    <button onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className="px-4 py-3 hover:bg-secondary"><Minus className="h-4 w-4" /></button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button onClick={() => setQuantity((prev) => prev + 1)} className="px-4 py-3 hover:bg-secondary"><Plus className="h-4 w-4" /></button>
                  </div>
                  <span className="text-sm text-muted-foreground">{product.stockQuantity} in stock</span>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Button variant="hero" size="xl" className="flex-1" onClick={handleAddToCart} disabled={!product.inStock}>
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button variant={isLiked ? 'gold' : 'outline'} size="icon-lg" onClick={() => setIsLiked(!isLiked)}>
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="mt-8 grid gap-4 rounded-xl border border-border p-6 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-gold" />
                  <div><p className="text-sm font-medium">Free Shipping</p><p className="text-xs text-muted-foreground">Over ₦50,000</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-gold" />
                  <div><p className="text-sm font-medium">Easy Returns</p><p className="text-xs text-muted-foreground">30 day policy</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gold" />
                  <div><p className="text-sm font-medium">Secure Payment</p><p className="text-xs text-muted-foreground">100% protected</p></div>
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="mb-8 font-display text-2xl font-bold text-foreground md:text-3xl">You May Also Like</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((p, index) => (
                  <ProductCard key={p.id} product={p} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
    </div>
  );
}
