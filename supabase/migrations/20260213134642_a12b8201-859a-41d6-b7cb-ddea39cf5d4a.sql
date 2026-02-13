
-- Categories table
CREATE TABLE public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '🌟',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category_id text NOT NULL REFERENCES public.categories(id),
  rating numeric NOT NULL DEFAULT 0,
  reviews integer NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,
  stock_quantity integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  new_arrival boolean NOT NULL DEFAULT false,
  bestseller boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Product images
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product images are publicly readable" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Product colors
CREATE TABLE public.product_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  hex text NOT NULL
);
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product colors are publicly readable" ON public.product_colors FOR SELECT USING (true);
CREATE POLICY "Admins can manage product colors" ON public.product_colors FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Product variants
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  style text NOT NULL,
  price numeric NOT NULL,
  original_price numeric
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product variants are publicly readable" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admins can manage product variants" ON public.product_variants FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Seed categories
INSERT INTO public.categories (id, name, icon, sort_order) VALUES
  ('earrings', 'Earrings', '✨', 1),
  ('rings', 'Rings', '💍', 2),
  ('necklaces', 'Necklaces', '📿', 3),
  ('sets', 'Sets', '🎁', 4),
  ('bracelets', 'Bracelets', '⭐', 5),
  ('watches', 'Wrist Watches', '⌚', 6),
  ('anklets', 'Anklets', '🦶', 7),
  ('eyeglasses', 'Eyeglasses', '👓', 8),
  ('waist-beads', 'Waist Beads', '💫', 9),
  ('belts', 'Belts', '🎀', 10),
  ('caps-hats', 'Caps & Hats', '🎩', 11),
  ('bonnets', 'Bonnets', '👒', 12),
  ('shoe-attachments', 'Shoe Attachments', '👠', 13),
  ('jewelry-cases', 'Jewelry Cases & Bags', '👜', 14),
  ('others', 'Others', '🌟', 15);

-- Seed products
INSERT INTO public.products (id, name, description, category_id, rating, reviews, in_stock, stock_quantity, featured, new_arrival, bestseller) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Celestial Diamond Earrings', 'Elegant drop earrings featuring brilliant-cut diamonds set in 18k gold, inspired by celestial constellations.', 'earrings', 4.9, 127, true, 15, true, false, true),
  ('00000000-0000-0000-0000-000000000002', 'Aurora Pendant Necklace', 'A stunning pendant featuring an aurora-inspired opal surrounded by micro-pavé diamonds on a delicate chain.', 'necklaces', 4.8, 89, true, 8, true, true, false),
  ('00000000-0000-0000-0000-000000000003', 'Infinity Love Ring', 'A timeless infinity band symbolizing eternal love, crafted with precision and adorned with accent diamonds.', 'rings', 4.7, 156, true, 25, false, false, true),
  ('00000000-0000-0000-0000-000000000004', 'Royal Pearl Set', 'An exquisite matching set featuring freshwater pearls with diamond accents - includes necklace, earrings, and bracelet.', 'sets', 5.0, 42, true, 5, true, false, false),
  ('00000000-0000-0000-0000-000000000005', 'Serpentine Gold Bracelet', 'A flexible gold bracelet with serpentine design, featuring emerald eyes and intricate scale patterns.', 'bracelets', 4.6, 67, true, 12, false, true, false),
  ('00000000-0000-0000-0000-000000000006', 'Monaco Luxury Watch', 'A sophisticated timepiece with mother-of-pearl dial, diamond hour markers, and genuine leather strap.', 'watches', 4.9, 34, true, 7, true, false, false),
  ('00000000-0000-0000-0000-000000000007', 'Bohemian Anklet Chain', 'A delicate layered anklet featuring tiny charms and crystal beads, perfect for beach and summer looks.', 'anklets', 4.5, 98, true, 30, false, false, false),
  ('00000000-0000-0000-0000-000000000008', 'Heritage Waist Beads', 'Traditional African waist beads with modern twist, featuring semi-precious stones and gold accents.', 'waist-beads', 4.8, 203, true, 50, false, false, true);

-- Seed product images
INSERT INTO public.product_images (product_id, url, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600', 0),
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600', 1),
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600', 2),
  ('00000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', 0),
  ('00000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600', 1),
  ('00000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600', 0),
  ('00000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600', 1),
  ('00000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600', 0),
  ('00000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600', 1),
  ('00000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600', 0),
  ('00000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600', 1),
  ('00000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', 0),
  ('00000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600', 1),
  ('00000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600', 0),
  ('00000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600', 0);

-- Seed product colors
INSERT INTO public.product_colors (product_id, name, hex) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Gold', '#D4AF37'),
  ('00000000-0000-0000-0000-000000000001', 'Rose Gold', '#B76E79'),
  ('00000000-0000-0000-0000-000000000001', 'Silver', '#C0C0C0'),
  ('00000000-0000-0000-0000-000000000002', 'Gold', '#D4AF37'),
  ('00000000-0000-0000-0000-000000000002', 'White Gold', '#E8E8E8'),
  ('00000000-0000-0000-0000-000000000003', 'Gold', '#D4AF37'),
  ('00000000-0000-0000-0000-000000000003', 'Rose Gold', '#B76E79'),
  ('00000000-0000-0000-0000-000000000003', 'Platinum', '#E5E4E2'),
  ('00000000-0000-0000-0000-000000000004', 'White Pearl', '#FDEEF4'),
  ('00000000-0000-0000-0000-000000000004', 'Pink Pearl', '#F8C8DC'),
  ('00000000-0000-0000-0000-000000000004', 'Black Pearl', '#1C1C1C'),
  ('00000000-0000-0000-0000-000000000005', 'Gold', '#D4AF37'),
  ('00000000-0000-0000-0000-000000000005', 'Rose Gold', '#B76E79'),
  ('00000000-0000-0000-0000-000000000006', 'Gold', '#D4AF37'),
  ('00000000-0000-0000-0000-000000000006', 'Silver', '#C0C0C0'),
  ('00000000-0000-0000-0000-000000000006', 'Rose Gold', '#B76E79'),
  ('00000000-0000-0000-0000-000000000007', 'Gold', '#D4AF37'),
  ('00000000-0000-0000-0000-000000000007', 'Silver', '#C0C0C0'),
  ('00000000-0000-0000-0000-000000000008', 'Multi-Color', '#FF6B6B'),
  ('00000000-0000-0000-0000-000000000008', 'Earth Tones', '#8B4513'),
  ('00000000-0000-0000-0000-000000000008', 'Ocean Blue', '#1E90FF');

-- Seed product variants
INSERT INTO public.product_variants (product_id, style, price, original_price) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Petite', 12500, 15000),
  ('00000000-0000-0000-0000-000000000001', 'Classic', 18500, NULL),
  ('00000000-0000-0000-0000-000000000001', 'Statement', 25000, NULL),
  ('00000000-0000-0000-0000-000000000002', '16" Chain', 22000, NULL),
  ('00000000-0000-0000-0000-000000000002', '18" Chain', 24000, NULL),
  ('00000000-0000-0000-0000-000000000002', '20" Chain', 26000, NULL),
  ('00000000-0000-0000-0000-000000000003', 'Size 5', 8500, NULL),
  ('00000000-0000-0000-0000-000000000003', 'Size 6', 8500, NULL),
  ('00000000-0000-0000-0000-000000000003', 'Size 7', 8500, NULL),
  ('00000000-0000-0000-0000-000000000003', 'Size 8', 8500, NULL),
  ('00000000-0000-0000-0000-000000000004', '3-Piece Set', 45000, 55000),
  ('00000000-0000-0000-0000-000000000004', '5-Piece Set (with ring & brooch)', 65000, 78000),
  ('00000000-0000-0000-0000-000000000005', 'Small (6")', 32000, NULL),
  ('00000000-0000-0000-0000-000000000005', 'Medium (7")', 35000, NULL),
  ('00000000-0000-0000-0000-000000000005', 'Large (8")', 38000, NULL),
  ('00000000-0000-0000-0000-000000000006', 'Leather Strap', 85000, NULL),
  ('00000000-0000-0000-0000-000000000006', 'Metal Bracelet', 95000, NULL),
  ('00000000-0000-0000-0000-000000000007', 'Single Chain', 4500, NULL),
  ('00000000-0000-0000-0000-000000000007', 'Layered (3 chains)', 8500, 10000),
  ('00000000-0000-0000-0000-000000000008', 'Single Strand', 3500, NULL),
  ('00000000-0000-0000-0000-000000000008', 'Triple Strand', 8000, NULL),
  ('00000000-0000-0000-0000-000000000008', 'Custom Length', 5000, NULL);

-- Enable realtime for products
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
