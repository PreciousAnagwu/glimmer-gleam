import { useState } from 'react';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSiteContent, getContent } from '@/hooks/useSiteContent';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AdminContentManager() {
  const { content, loading, refetch } = useSiteContent();
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  const save = async (key: string, value: any) => {
    setSaving(key);
    const { error } = await (supabase as any).from('site_content').upsert({ key, value });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Saved', description: `${key} updated.` }); refetch(); }
    setSaving(null);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <Tabs defaultValue="faq" className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger value="faq">FAQ</TabsTrigger>
        <TabsTrigger value="shipping">Shipping</TabsTrigger>
        <TabsTrigger value="returns">Returns</TabsTrigger>
        <TabsTrigger value="size">Size Guide</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
      </TabsList>

      <TabsContent value="faq"><FaqEditor data={getContent(content, 'help.faq')} onSave={(v) => save('help.faq', v)} saving={saving === 'help.faq'} /></TabsContent>
      <TabsContent value="shipping"><LinesEditor title="Shipping bullets" data={getContent(content, 'help.shipping')} onSave={(v) => save('help.shipping', v)} saving={saving === 'help.shipping'} /></TabsContent>
      <TabsContent value="returns"><LinesEditor title="Returns paragraphs" data={getContent(content, 'help.returns')} onSave={(v) => save('help.returns', v)} saving={saving === 'help.returns'} /></TabsContent>
      <TabsContent value="size"><SizeEditor data={getContent(content, 'help.size_guide')} onSave={(v) => save('help.size_guide', v)} saving={saving === 'help.size_guide'} /></TabsContent>
      <TabsContent value="contact"><ContactEditor data={getContent(content, 'help.contact')} onSave={(v) => save('help.contact', v)} saving={saving === 'help.contact'} /></TabsContent>
      <TabsContent value="testimonials"><TestimonialsEditor data={getContent(content, 'home.testimonials')} onSave={(v) => save('home.testimonials', v)} saving={saving === 'home.testimonials'} /></TabsContent>
    </Tabs>
  );
}

function FaqEditor({ data, onSave, saving }: any) {
  const [items, setItems] = useState(data.items || []);
  return (
    <Card><CardHeader><CardTitle>FAQ items</CardTitle></CardHeader><CardContent className="space-y-4">
      {items.map((it: any, i: number) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex justify-between items-center">
            <Label>Question {i + 1}</Label>
            <Button size="icon-sm" variant="ghost" onClick={() => setItems(items.filter((_: any, x: number) => x !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <Input value={it.q} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], q: e.target.value }; setItems(n); }} />
          <Textarea value={it.a} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], a: e.target.value }; setItems(n); }} rows={3} />
        </div>
      ))}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setItems([...items, { q: '', a: '' }])}><Plus className="mr-1 h-4 w-4" /> Add</Button>
        <Button onClick={() => onSave({ items })} disabled={saving} className="bg-gold text-primary-foreground hover:bg-gold/90">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
        </Button>
      </div>
    </CardContent></Card>
  );
}

function LinesEditor({ title, data, onSave, saving }: any) {
  const [lines, setLines] = useState<string[]>(data.lines || []);
  return (
    <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-3">
      {lines.map((l, i) => (
        <div key={i} className="flex gap-2">
          <Textarea value={l} onChange={(e) => { const n = [...lines]; n[i] = e.target.value; setLines(n); }} rows={2} />
          <Button size="icon-sm" variant="ghost" onClick={() => setLines(lines.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setLines([...lines, ''])}><Plus className="mr-1 h-4 w-4" /> Add line</Button>
        <Button onClick={() => onSave({ lines })} disabled={saving} className="bg-gold text-primary-foreground hover:bg-gold/90">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
        </Button>
      </div>
    </CardContent></Card>
  );
}

function SizeEditor({ data, onSave, saving }: any) {
  const [intro, setIntro] = useState(data.intro || '');
  const [rings, setRings] = useState(data.rings || []);
  const [necklaces, setNecklaces] = useState(data.necklaces || '');
  return (
    <Card><CardHeader><CardTitle>Size guide</CardTitle></CardHeader><CardContent className="space-y-4">
      <div><Label>Heading</Label><Input value={intro} onChange={(e) => setIntro(e.target.value)} /></div>
      <div className="space-y-2">
        <Label>Ring sizes</Label>
        {rings.map((r: any, i: number) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="Size" value={r.size} onChange={(e) => { const n = [...rings]; n[i] = { ...n[i], size: e.target.value }; setRings(n); }} />
            <Input placeholder="Diameter (mm)" value={r.diameter} onChange={(e) => { const n = [...rings]; n[i] = { ...n[i], diameter: e.target.value }; setRings(n); }} />
            <Input placeholder="Circumference (mm)" value={r.circumference} onChange={(e) => { const n = [...rings]; n[i] = { ...n[i], circumference: e.target.value }; setRings(n); }} />
            <Button size="icon-sm" variant="ghost" onClick={() => setRings(rings.filter((_: any, x: number) => x !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setRings([...rings, { size: '', diameter: '', circumference: '' }])}><Plus className="mr-1 h-4 w-4" /> Add row</Button>
      </div>
      <div><Label>Necklace lengths</Label><Textarea value={necklaces} onChange={(e) => setNecklaces(e.target.value)} rows={2} /></div>
      <Button onClick={() => onSave({ intro, rings, necklaces })} disabled={saving} className="bg-gold text-primary-foreground hover:bg-gold/90">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
      </Button>
    </CardContent></Card>
  );
}

function ContactEditor({ data, onSave, saving }: any) {
  const [c, setC] = useState({ email: data.email || '', whatsapp: data.whatsapp || '', phone: data.phone || '' });
  return (
    <Card><CardHeader><CardTitle>Contact details</CardTitle></CardHeader><CardContent className="space-y-3">
      <div><Label>Email</Label><Input value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} /></div>
      <div><Label>WhatsApp (E.164, e.g. +234...)</Label><Input value={c.whatsapp} onChange={(e) => setC({ ...c, whatsapp: e.target.value })} /></div>
      <div><Label>Phone</Label><Input value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} /></div>
      <Button onClick={() => onSave(c)} disabled={saving} className="bg-gold text-primary-foreground hover:bg-gold/90">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
      </Button>
    </CardContent></Card>
  );
}

function TestimonialsEditor({ data, onSave, saving }: any) {
  const [items, setItems] = useState<any[]>(data.items || []);
  const update = (i: number, key: string, val: any) => {
    const n = [...items]; n[i] = { ...n[i], [key]: val }; setItems(n);
  };
  return (
    <Card><CardHeader><CardTitle>Homepage testimonials</CardTitle></CardHeader><CardContent className="space-y-4">
      {items.map((it, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex justify-between items-center">
            <Label>Testimonial {i + 1}</Label>
            <Button size="icon-sm" variant="ghost" onClick={() => setItems(items.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <Input placeholder="Name" value={it.name || ''} onChange={(e) => update(i, 'name', e.target.value)} />
          <Input placeholder="Role" value={it.role || ''} onChange={(e) => update(i, 'role', e.target.value)} />
          <Input placeholder="Avatar image URL" value={it.image || ''} onChange={(e) => update(i, 'image', e.target.value)} />
          <Input placeholder="Rating (1-5)" type="number" min={1} max={5} value={it.rating ?? 5} onChange={(e) => update(i, 'rating', parseInt(e.target.value) || 5)} />
          <Textarea placeholder="Quote" value={it.content || ''} onChange={(e) => update(i, 'content', e.target.value)} rows={3} />
        </div>
      ))}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setItems([...items, { name: '', role: '', image: '', content: '', rating: 5 }])}><Plus className="mr-1 h-4 w-4" /> Add</Button>
        <Button onClick={() => onSave({ items })} disabled={saving} className="bg-gold text-primary-foreground hover:bg-gold/90">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
        </Button>
      </div>
    </CardContent></Card>
  );
}
