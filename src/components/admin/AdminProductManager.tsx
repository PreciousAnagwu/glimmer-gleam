import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Loader2, X, Save, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface VariantForm {
  id?: string;
  style: string;
  price: string;
  originalPrice: string;
}

interface ColorForm {
  id?: string;
  name: string;
  hex: string;
}

interface ProductForm {
  id?: string;
  name: string;
  description: string;
  category_id: string;
  in_stock: boolean;
  stock_quantity: string;
  featured: boolean;
  new_arrival: boolean;
  bestseller: boolean;
  images: string[];
  variants: VariantForm[];
  colors: ColorForm[];
}

const emptyProduct: ProductForm = {
  name: '',
  description: '',
  category_id: '',
  in_stock: true,
  stock_quantity: '0',
  featured: false,
  new_arrival: false,
  bestseller: false,
  images: [''],
  variants: [{ style: '', price: '', originalPrice: '' }],
  colors: [{ name: '', hex: '#D4AF37' }],
};

export function AdminProductManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({ ...emptyProduct });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [catRes, prodRes, imgRes, varRes, colRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('product_images').select('*'),
      supabase.from('product_variants').select('*'),
      supabase.from('product_colors').select('*'),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (prodRes.data && imgRes.data && varRes.data && colRes.data) {
      setProducts(prodRes.data.map((p: any) => ({
        ...p,
        images: imgRes.data!.filter((i: any) => i.product_id === p.id).sort((a: any, b: any) => a.sort_order - b.sort_order),
        variants: varRes.data!.filter((v: any) => v.product_id === p.id),
        colors: colRes.data!.filter((c: any) => c.product_id === p.id),
      })));
    }
    setLoading(false);
  };

  const openCreate = () => {
    setForm({ ...emptyProduct });
    setDialogOpen(true);
  };

  const openEdit = (product: any) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      in_stock: product.in_stock,
      stock_quantity: String(product.stock_quantity),
      featured: product.featured,
      new_arrival: product.new_arrival,
      bestseller: product.bestseller,
      images: product.images.map((i: any) => i.url),
      variants: product.variants.map((v: any) => ({
        id: v.id,
        style: v.style,
        price: String(v.price),
        originalPrice: v.original_price ? String(v.original_price) : '',
      })),
      colors: product.colors.map((c: any) => ({
        id: c.id,
        name: c.name,
        hex: c.hex,
      })),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category_id || form.variants.length === 0) {
      toast({ title: 'Validation error', description: 'Name, category, and at least one variant are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);

    try {
      let productId = form.id;

      const productData = {
        name: form.name,
        description: form.description,
        category_id: form.category_id,
        in_stock: form.in_stock,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        featured: form.featured,
        new_arrival: form.new_arrival,
        bestseller: form.bestseller,
      };

      if (productId) {
        const { error } = await supabase.from('products').update(productData).eq('id', productId);
        if (error) throw error;

        // Delete old related data and re-insert
        await Promise.all([
          supabase.from('product_images').delete().eq('product_id', productId),
          supabase.from('product_variants').delete().eq('product_id', productId),
          supabase.from('product_colors').delete().eq('product_id', productId),
        ]);
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select().single();
        if (error) throw error;
        productId = data.id;
      }

      // Insert images
      const validImages = form.images.filter((url) => url.trim());
      if (validImages.length > 0) {
        await supabase.from('product_images').insert(
          validImages.map((url, i) => ({ product_id: productId!, url: url.trim(), sort_order: i }))
        );
      }

      // Insert variants
      const validVariants = form.variants.filter((v) => v.style && v.price);
      if (validVariants.length > 0) {
        await supabase.from('product_variants').insert(
          validVariants.map((v) => ({
            product_id: productId!,
            style: v.style,
            price: parseFloat(v.price),
            original_price: v.originalPrice ? parseFloat(v.originalPrice) : null,
          }))
        );
      }

      // Insert colors
      const validColors = form.colors.filter((c) => c.name && c.hex);
      if (validColors.length > 0) {
        await supabase.from('product_colors').insert(
          validColors.map((c) => ({ product_id: productId!, name: c.name, hex: c.hex }))
        );
      }

      toast({ title: form.id ? 'Product updated' : 'Product created', description: `${form.name} saved successfully.` });
      setDialogOpen(false);
      fetchAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const { error } = await supabase.from('products').delete().eq('id', deletingId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Product deleted' });
      fetchAll();
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

  const filteredProducts = products.filter((p) =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:w-64"
        />
        <Button onClick={openCreate} className="bg-gold text-primary-foreground hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images[0] ? (
                    <img src={product.images[0].url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{categories.find((c) => c.id === product.category_id)?.name}</TableCell>
                <TableCell>
                  {product.variants[0] ? formatPrice(Number(product.variants[0].price)) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={product.in_stock ? 'default' : 'destructive'}>
                    {product.in_stock ? product.stock_quantity : 'Out of stock'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {product.featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                    {product.new_arrival && <Badge variant="outline" className="text-xs">New</Badge>}
                    {product.bestseller && <Badge variant="outline" className="text-xs">Best</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      onClick={() => { setDeletingId(product.id); setDeleteDialogOpen(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label>Product Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Diamond Earrings" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Stock & Flags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock Quantity</Label>
                <Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />
                <Label>In Stock</Label>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.new_arrival} onCheckedChange={(v) => setForm({ ...form, new_arrival: v })} />
                <Label>New Arrival</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.bestseller} onCheckedChange={(v) => setForm({ ...form, bestseller: v })} />
                <Label>Bestseller</Label>
              </div>
            </div>

            <Separator />

            {/* Images */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Image URLs</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, images: [...form.images, ''] })}>
                  <Plus className="mr-1 h-3 w-3" /> Add Image
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {form.images.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={url}
                      onChange={(e) => {
                        const imgs = [...form.images];
                        imgs[i] = e.target.value;
                        setForm({ ...form, images: imgs });
                      }}
                      placeholder="https://..."
                    />
                    {form.images.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Variants</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, variants: [...form.variants, { style: '', price: '', originalPrice: '' }] })}>
                  <Plus className="mr-1 h-3 w-3" /> Add Variant
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {form.variants.map((v, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={v.style}
                      onChange={(e) => {
                        const vars = [...form.variants];
                        vars[i] = { ...vars[i], style: e.target.value };
                        setForm({ ...form, variants: vars });
                      }}
                      placeholder="Style name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={v.price}
                      onChange={(e) => {
                        const vars = [...form.variants];
                        vars[i] = { ...vars[i], price: e.target.value };
                        setForm({ ...form, variants: vars });
                      }}
                      placeholder="Price"
                      className="w-28"
                    />
                    <Input
                      type="number"
                      value={v.originalPrice}
                      onChange={(e) => {
                        const vars = [...form.variants];
                        vars[i] = { ...vars[i], originalPrice: e.target.value };
                        setForm({ ...form, variants: vars });
                      }}
                      placeholder="Was (opt)"
                      className="w-28"
                    />
                    {form.variants.length > 1 && (
                      <Button variant="ghost" size="icon-sm" onClick={() => setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) })}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Colors */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Colors</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, colors: [...form.colors, { name: '', hex: '#D4AF37' }] })}>
                  <Plus className="mr-1 h-3 w-3" /> Add Color
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {form.colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => {
                        const cols = [...form.colors];
                        cols[i] = { ...cols[i], hex: e.target.value };
                        setForm({ ...form, colors: cols });
                      }}
                      className="h-9 w-9 cursor-pointer rounded border-0"
                    />
                    <Input
                      value={c.name}
                      onChange={(e) => {
                        const cols = [...form.colors];
                        cols[i] = { ...cols[i], name: e.target.value };
                        setForm({ ...form, colors: cols });
                      }}
                      placeholder="Color name"
                      className="flex-1"
                    />
                    <Input
                      value={c.hex}
                      onChange={(e) => {
                        const cols = [...form.colors];
                        cols[i] = { ...cols[i], hex: e.target.value };
                        setForm({ ...form, colors: cols });
                      }}
                      placeholder="#hex"
                      className="w-28"
                    />
                    {form.colors.length > 1 && (
                      <Button variant="ghost" size="icon-sm" onClick={() => setForm({ ...form, colors: form.colors.filter((_, idx) => idx !== i) })}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gold text-primary-foreground hover:bg-gold/90">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {form.id ? 'Update' : 'Create'} Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
