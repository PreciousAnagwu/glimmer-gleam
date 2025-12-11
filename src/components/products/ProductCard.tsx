import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/data/products';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuickAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      variant: product.variants[0],
      color: product.colors[0].name,
      quantity: 1,
    });
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.newArrival && (
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-medium text-primary-foreground">
              New
            </span>
          )}
          {product.bestseller && (
            <span className="rounded-full bg-rose-gold px-3 py-1 text-xs font-medium text-primary-foreground">
              Bestseller
            </span>
          )}
          {product.variants[0].originalPrice && (
            <span className="rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">
              Sale
            </span>
          )}
          {!product.inStock && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          className="absolute bottom-3 left-3 right-3 flex gap-2"
        >
          <Button
            variant="luxury"
            size="sm"
            className="flex-1"
            onClick={handleQuickAdd}
            disabled={!product.inStock}
          >
            <ShoppingBag className="mr-1 h-4 w-4" />
            Add to Cart
          </Button>
          <Button variant="outline" size="icon-sm" asChild className="bg-background/80 backdrop-blur-sm">
            <Link to={`/product/${product.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Wishlist Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition-all ${
            isLiked
              ? 'bg-rose-gold text-primary-foreground'
              : 'bg-background/80 text-foreground backdrop-blur-sm hover:bg-rose-gold hover:text-primary-foreground'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Image Dots */}
        {product.images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 gap-1">
            {product.images.map((_, i) => (
              <button
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  i === currentImageIndex ? 'w-4 bg-gold' : 'bg-background/60'
                }`}
                onMouseEnter={() => setCurrentImageIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4 space-y-2">
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'fill-gold text-gold'
                    : 'fill-muted text-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        {/* Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-foreground transition-colors hover:text-gold">
            {product.name}
          </h3>
        </Link>

        {/* Colors */}
        <div className="flex gap-1">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color.name}
              className="h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gold">
            {formatPrice(product.variants[0].price)}
          </span>
          {product.variants[0].originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.variants[0].originalPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
