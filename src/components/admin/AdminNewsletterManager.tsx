import { useEffect, useState } from 'react';
import { Loader2, Mail, Download, Send, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Subscriber { id: string; email: string; source: string; is_active: boolean; subscribed_at: string; }
interface Newsletter { id: string; subject: string; content: string; status: string; recipient_count: number; created_at: string; sent_at: string | null; }

export function AdminNewsletterManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel('newsletter-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'newsletter_subscribers' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'newsletters' }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const fetchAll = async () => {
    const [s, n] = await Promise.all([
      supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false }),
      supabase.from('newsletters').select('*').order('created_at', { ascending: false }),
    ]);
    if (s.data) setSubs(s.data as Subscriber[]);
    if (n.data) setNewsletters(n.data as Newsletter[]);
    setLoading(false);
  };

  const exportCSV = () => {
    const rows = [['Email', 'Source', 'Active', 'Subscribed At']]
      .concat(subs.map(s => [s.email, s.source, String(s.is_active), s.subscribed_at]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `subscribers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const removeSub = async (id: string) => {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Removed', description: 'Subscriber removed.' });
  };

  const saveDraft = async (status: 'draft' | 'sent') => {
    if (!subject.trim() || !content.trim()) {
      toast({ title: 'Missing fields', description: 'Subject and content are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const activeCount = subs.filter(s => s.is_active).length;
    const { error } = await supabase.from('newsletters').insert({
      subject: subject.trim(),
      content: content.trim(),
      status,
      recipient_count: status === 'sent' ? activeCount : 0,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: status === 'sent' ? 'Newsletter queued' : 'Draft saved',
        description: status === 'sent'
          ? `Recorded for ${activeCount} subscribers. Export the list to send via your email tool.`
          : 'Draft saved successfully.',
      });
      setSubject(''); setContent(''); setComposeOpen(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <Tabs defaultValue="subscribers" className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <TabsList>
          <TabsTrigger value="subscribers"><Mail className="mr-2 h-4 w-4" />Subscribers ({subs.length})</TabsTrigger>
          <TabsTrigger value="newsletters">Newsletters ({newsletters.length})</TabsTrigger>
        </TabsList>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!subs.length}>
            <Download className="mr-2 h-4 w-4" />Export CSV
          </Button>
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" size="sm"><Plus className="mr-2 h-4 w-4" />Compose</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Compose Newsletter</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                <Textarea placeholder="Write your newsletter content here..." rows={10} value={content} onChange={(e) => setContent(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  Will be recorded for {subs.filter(s => s.is_active).length} active subscribers. Export the list to send via your email tool.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => saveDraft('draft')} disabled={saving}>Save Draft</Button>
                <Button variant="gold" onClick={() => saveDraft('sent')} disabled={saving}>
                  <Send className="mr-2 h-4 w-4" />Mark as Sent
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <TabsContent value="subscribers">
        {subs.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No subscribers yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Email</TableHead><TableHead>Source</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {subs.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.source}</TableCell>
                  <TableCell><Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell className="text-sm">{new Date(s.subscribed_at).toLocaleDateString()}</TableCell>
                  <TableCell><Button variant="ghost" size="icon-sm" onClick={() => removeSub(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TabsContent>

      <TabsContent value="newsletters">
        {newsletters.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No newsletters yet. Click Compose to create one.</p>
        ) : (
          <div className="space-y-3">
            {newsletters.map(n => (
              <div key={n.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold">{n.subject}</h4>
                  <Badge variant={n.status === 'sent' ? 'default' : 'secondary'}>{n.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{n.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {n.status === 'sent' ? `Sent to ${n.recipient_count} on ${new Date(n.sent_at!).toLocaleString()}` : `Drafted ${new Date(n.created_at).toLocaleDateString()}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
