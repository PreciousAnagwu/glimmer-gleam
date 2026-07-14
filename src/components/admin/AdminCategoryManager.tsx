import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}

const empty = { id: '', name: '', icon: '✨', sort_order: 0 };

function slugify(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function AdminCategoryManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Category>({ ...empty });
  const [editing, setEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('sort_order');
    if (error) toast({ title: 'Failed to load categories', description: error.message, variant: 'destructive' });
    setCategories((data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    const next = Math.max(0, ...categories.map(c => c.sort_order)) + 1;
    setForm({ ...empty, sort_order: next });
    setEditing(false);
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setForm({ ...c });
    setEditing(true);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const id = editing ? form.id : (form.id.trim() || slugify(form.name));
    const payload = { id, name: form.name.trim(), icon: form.icon || '✨', sort_order: form.sort_order || 0 };
    const { error } = editing
      ? await supabase.from('categories').update(payload).eq('id', form.id)
      : await supabase.from('categories').insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: editing ? 'Category updated' : 'Category created' });
    setDialogOpen(false);
    fetchCategories();
  };

  const remove = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('categories').delete().eq('id', deleteId);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Category deleted' });
      fetchCategories();
    }
    setDeleteId(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold">Categories</h3>
          <p className="text-sm text-muted-foreground">Categories added here appear in Shop filters and product creation.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New Category</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug (ID)</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="text-2xl">{c.icon}</TableCell>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.id}</TableCell>
              <TableCell>{c.sort_order}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {categories.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No categories yet.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Earrings" />
            </div>
            <div>
              <Label>Icon (emoji)</Label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="✨" maxLength={4} />
            </div>
            {!editing && (
              <div>
                <Label>Slug (optional, auto-generated)</Label>
                <Input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder={slugify(form.name) || 'auto'} />
              </div>
            )}
            <div>
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}><X className="mr-2 h-4 w-4" />Cancel</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              Products in this category will lose their category assignment. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
