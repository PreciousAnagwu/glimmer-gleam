export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  colors: { name: string; hex: string }[];
  variants: {
    id: string;
    style: string;
    price: number;
    originalPrice?: number;
  }[];
  rating: number;
  reviews: number;
  inStock: boolean;
  stockQuantity: number;
  featured?: boolean;
  newArrival?: boolean;
  bestseller?: boolean;
}

export const categories = [
  { id: 'earrings', name: 'Earrings', icon: '✨' },
  { id: 'rings', name: 'Rings', icon: '💍' },
  { id: 'necklaces', name: 'Necklaces', icon: '📿' },
  { id: 'sets', name: 'Sets', icon: '🎁' },
  { id: 'bracelets', name: 'Bracelets', icon: '⭐' },
  { id: 'watches', name: 'Wrist Watches', icon: '⌚' },
  { id: 'anklets', name: 'Anklets', icon: '🦶' },
  { id: 'eyeglasses', name: 'Eyeglasses', icon: '👓' },
  { id: 'waist-beads', name: 'Waist Beads', icon: '💫' },
  { id: 'belts', name: 'Belts', icon: '🎀' },
  { id: 'caps-hats', name: 'Caps & Hats', icon: '🎩' },
  { id: 'bonnets', name: 'Bonnets', icon: '👒' },
  { id: 'shoe-attachments', name: 'Shoe Attachments', icon: '👠' },
  { id: 'jewelry-cases', name: 'Jewelry Cases & Bags', icon: '👜' },
  { id: 'others', name: 'Others', icon: '🌟' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Celestial Diamond Earrings',
    description: 'Elegant drop earrings featuring brilliant-cut diamonds set in 18k gold, inspired by celestial constellations.',
    category: 'earrings',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
      'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600',
    ],
    colors: [
      { name: 'Gold', hex: '#D4AF37' },
      { name: 'Rose Gold', hex: '#B76E79' },
      { name: 'Silver', hex: '#C0C0C0' },
    ],
    variants: [
      { id: 'small', style: 'Petite', price: 12500, originalPrice: 15000 },
      { id: 'medium', style: 'Classic', price: 18500 },
      { id: 'large', style: 'Statement', price: 25000 },
    ],
    rating: 4.9,
    reviews: 127,
    inStock: true,
    stockQuantity: 15,
    featured: true,
    bestseller: true,
  },
  {
    id: '2',
    name: 'Aurora Pendant Necklace',
    description: 'A stunning pendant featuring an aurora-inspired opal surrounded by micro-pavé diamonds on a delicate chain.',
    category: 'necklaces',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600',
    ],
    colors: [
      { name: 'Gold', hex: '#D4AF37' },
      { name: 'White Gold', hex: '#E8E8E8' },
    ],
    variants: [
      { id: '16inch', style: '16" Chain', price: 22000 },
      { id: '18inch', style: '18" Chain', price: 24000 },
      { id: '20inch', style: '20" Chain', price: 26000 },
    ],
    rating: 4.8,
    reviews: 89,
    inStock: true,
    stockQuantity: 8,
    featured: true,
    newArrival: true,
  },
  {
    id: '3',
    name: 'Infinity Love Ring',
    description: 'A timeless infinity band symbolizing eternal love, crafted with precision and adorned with accent diamonds.',
    category: 'rings',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600',
    ],
    colors: [
      { name: 'Gold', hex: '#D4AF37' },
      { name: 'Rose Gold', hex: '#B76E79' },
      { name: 'Platinum', hex: '#E5E4E2' },
    ],
    variants: [
      { id: 'size5', style: 'Size 5', price: 8500 },
      { id: 'size6', style: 'Size 6', price: 8500 },
      { id: 'size7', style: 'Size 7', price: 8500 },
      { id: 'size8', style: 'Size 8', price: 8500 },
    ],
    rating: 4.7,
    reviews: 156,
    inStock: true,
    stockQuantity: 25,
    bestseller: true,
  },
  {
    id: '4',
    name: 'Royal Pearl Set',
    description: 'An exquisite matching set featuring freshwater pearls with diamond accents - includes necklace, earrings, and bracelet.',
    category: 'sets',
    images: [
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600',
    ],
    colors: [
      { name: 'White Pearl', hex: '#FDEEF4' },
      { name: 'Pink Pearl', hex: '#F8C8DC' },
      { name: 'Black Pearl', hex: '#1C1C1C' },
    ],
    variants: [
      { id: '3piece', style: '3-Piece Set', price: 45000, originalPrice: 55000 },
      { id: '5piece', style: '5-Piece Set (with ring & brooch)', price: 65000, originalPrice: 78000 },
    ],
    rating: 5.0,
    reviews: 42,
    inStock: true,
    stockQuantity: 5,
    featured: true,
  },
  {
    id: '5',
    name: 'Serpentine Gold Bracelet',
    description: 'A flexible gold bracelet with serpentine design, featuring emerald eyes and intricate scale patterns.',
    category: 'bracelets',
    images: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600',
    ],
    colors: [
      { name: 'Gold', hex: '#D4AF37' },
      { name: 'Rose Gold', hex: '#B76E79' },
    ],
    variants: [
      { id: 'small', style: 'Small (6")', price: 32000 },
      { id: 'medium', style: 'Medium (7")', price: 35000 },
      { id: 'large', style: 'Large (8")', price: 38000 },
    ],
    rating: 4.6,
    reviews: 67,
    inStock: true,
    stockQuantity: 12,
    newArrival: true,
  },
  {
    id: '6',
    name: 'Monaco Luxury Watch',
    description: 'A sophisticated timepiece with mother-of-pearl dial, diamond hour markers, and genuine leather strap.',
    category: 'watches',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600',
    ],
    colors: [
      { name: 'Gold', hex: '#D4AF37' },
      { name: 'Silver', hex: '#C0C0C0' },
      { name: 'Rose Gold', hex: '#B76E79' },
    ],
    variants: [
      { id: 'leather', style: 'Leather Strap', price: 85000 },
      { id: 'metal', style: 'Metal Bracelet', price: 95000 },
    ],
    rating: 4.9,
    reviews: 34,
    inStock: true,
    stockQuantity: 7,
    featured: true,
  },
  {
    id: '7',
    name: 'Bohemian Anklet Chain',
    description: 'A delicate layered anklet featuring tiny charms and crystal beads, perfect for beach and summer looks.',
    category: 'anklets',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
    ],
    colors: [
      { name: 'Gold', hex: '#D4AF37' },
      { name: 'Silver', hex: '#C0C0C0' },
    ],
    variants: [
      { id: 'single', style: 'Single Chain', price: 4500 },
      { id: 'layered', style: 'Layered (3 chains)', price: 8500, originalPrice: 10000 },
    ],
    rating: 4.5,
    reviews: 98,
    inStock: true,
    stockQuantity: 30,
  },
  {
    id: '8',
    name: 'Heritage Waist Beads',
    description: 'Traditional African waist beads with modern twist, featuring semi-precious stones and gold accents.',
    category: 'waist-beads',
    images: [
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600',
    ],
    colors: [
      { name: 'Multi-Color', hex: '#FF6B6B' },
      { name: 'Earth Tones', hex: '#8B4513' },
      { name: 'Ocean Blue', hex: '#1E90FF' },
    ],
    variants: [
      { id: 'single', style: 'Single Strand', price: 3500 },
      { id: 'triple', style: 'Triple Strand', price: 8000 },
      { id: 'custom', style: 'Custom Length', price: 5000 },
    ],
    rating: 4.8,
    reviews: 203,
    inStock: true,
    stockQuantity: 50,
    bestseller: true,
  },
];

export const getProductsByCategory = (category: string) =>
  products.filter((p) => p.category === category);

export const getFeaturedProducts = () =>
  products.filter((p) => p.featured);

export const getNewArrivals = () =>
  products.filter((p) => p.newArrival);

export const getBestsellers = () =>
  products.filter((p) => p.bestseller);

export const getProductById = (id: string) =>
  products.find((p) => p.id === id);
