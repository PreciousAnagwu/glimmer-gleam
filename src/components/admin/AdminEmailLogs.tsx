import { useEffect, useState } from 'react';
import { Loader2, MailCheck, MailX, MailWarning, RefreshCw, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface EmailLog {
  id: string;
  recipient: string;
  subject: string | null;
  template: string | null;
  event: string | null;
  order_id: string | null;
  status: string;
  provider_id: string | null;
  error: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-green-100 text-green-800 hover:bg-green-100',
  failed: 'bg-red-100 text-red-800 hover:bg-red-100',
  skipped: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  queued: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
};

export function AdminEmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('email_logs' as never)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setLogs((data as unknown as EmailLog[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    const ch = supabase
      .channel('admin-email-logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_logs' }, fetchLogs)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = logs.filter((l) => {
    if (status !== 'all' && l.status !== status) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      l.recipient.toLowerCase().includes(q) ||
      (l.subject || '').toLowerCase().includes(q) ||
      (l.event || '').toLowerCase().includes(q) ||
      (l.order_id || '').toLowerCase().includes(q)
    );
  });

  const counts = {
    sent: logs.filter((l) => l.status === 'sent').length,
    failed: logs.filter((l) => l.status === 'failed').length,
    skipped: logs.filter((l) => l.status === 'skipped').length,
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Delivered', value: counts.sent, icon: MailCheck, color: 'text-green-600' },
          { label: 'Failed', value: counts.failed, icon: MailX, color: 'text-red-600' },
          { label: 'Skipped (no email provider)', value: counts.skipped, icon: MailWarning, color: 'text-amber-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-muted p-3 ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Email Delivery Monitor</CardTitle>
              <CardDescription>Last 200 notification emails sent by the store (live).</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative sm:w-56">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search recipient / event" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchLogs}><RefreshCw className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No emails logged yet. Every order, receipt and status email will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{l.recipient}</TableCell>
                      <TableCell className="text-xs">{l.event || l.template || '—'}</TableCell>
                      <TableCell className="text-xs max-w-[240px] truncate">{l.subject || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{l.order_id ? l.order_id.slice(0, 8).toUpperCase() : '—'}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[l.status] || 'bg-muted text-muted-foreground'}>{l.status}</Badge>
                        {l.error && <p className="mt-1 max-w-[220px] text-[10px] text-destructive line-clamp-2">{l.error}</p>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
