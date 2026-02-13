import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export interface Category {
  id: string;
  name: string;
  icon: string;
}

function mapProduct(row: any, images: any[], colors: any[], variants: any[]): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category_id,
    images: images
      .filter((i: any) => i.product_id === row.id)
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((i: any) => i.url),
    colors: colors
      .filter((c: any) => c.product_id === row.id)
      .map((c: any) => ({ name: c.name, hex: c.hex })),
    variants: variants
      .filter((v: any) => v.product_id === row.id)
      .map((v: any) => ({
        id: v.id,
        style: v.style,
        price: Number(v.price),
        originalPrice: v.original_price ? Number(v.original_price) : undefined,
      })),
    rating: Number(row.rating),
    reviews: row.reviews,
    inStock: row.in_stock,
    stockQuantity: row.stock_quantity,
    featured: row.featured,
    newArrival: row.new_arrival,
    bestseller: row.bestseller,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [prodRes, imgRes, colRes, varRes, catRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('product_images').select('*'),
      supabase.from('product_colors').select('*'),
      supabase.from('product_variants').select('*'),
      supabase.from('categories').select('*').order('sort_order'),
    ]);

    if (prodRes.data && imgRes.data && colRes.data && varRes.data) {
      setProducts(
        prodRes.data.map((p: any) => mapProduct(p, imgRes.data!, colRes.data!, varRes.data!))
      );
    }
    if (catRes.data) {
      setCategories(catRes.data.map((c: any) => ({ id: c.id, name: c.name, icon: c.icon })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchAll())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getProductById = (id: string) => products.find((p) => p.id === id);
  const getFeaturedProducts = () => products.filter((p) => p.featured);
  const getNewArrivals = () => products.filter((p) => p.newArrival);
  const getBestsellers = () => products.filter((p) => p.bestseller);
  const getProductsByCategory = (category: string) => products.filter((p) => p.category === category);

  return {
    products,
    categories,
    loading,
    refetch: fetchAll,
    getProductById,
    getFeaturedProducts,
    getNewArrivals,
    getBestsellers,
    getProductsByCategory,
  };
}
