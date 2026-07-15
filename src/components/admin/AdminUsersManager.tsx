import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Trash2, UserPlus } from 'lucide-react';

interface AdminRow {
  user_id: string;
  email: string | null;
  name: string | null;
  manage_orders: boolean;
  manage_products: boolean;
  manage_categories: boolean;
  manage_coupons: boolean;
  manage_content: boolean;
  manage_admins: boolean;
  manage_rewards: boolean;
  manage_newsletters: boolean;
  notify_email: boolean;
  email_for_notifications: string | null;
}

const PERMS: { key: keyof AdminRow; label: string }[] = [
  { key: 'manage_orders', label: 'Orders' },
  { key: 'manage_products', label: 'Products' },
  { key: 'manage_categories', label: 'Categories' },
  { key: 'manage_coupons', label: 'Coupons' },
  { key: 'manage_content', label: 'Content' },
  { key: 'manage_rewards', label: 'Rewards' },
  { key: 'manage_newsletters', label: 'Newsletter' },
  { key: 'manage_admins', label: 'Manage Admins' },
  { key: 'notify_email', label: 'Email alerts' },
];

export function AdminUsersManager() {
  const { toast } = useToast();
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: admins } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
    if (!admins?.length) { setRows([]); setLoading(false); return; }
    const ids = admins.map((a) => a.user_id);
    const [{ data: perms }, { data: profiles }] = await Promise.all([
      supabase.from('admin_permissions').select('*').in('user_id', ids),
      supabase.from('profiles').select('user_id, name, email').in('user_id', ids),
    ]);
    const combined: AdminRow[] = ids.map((id) => {
      const p: any = (perms as any[] | null)?.find((x: any) => x.user_id === id) || {};
      const pr: any = (profiles as any[] | null)?.find((x: any) => x.user_id === id) || {};
      return {
        user_id: id,
        email: pr.email ?? null,
        name: pr.name ?? null,
        manage_orders: p.manage_orders ?? true,
        manage_products: p.manage_products ?? true,
        manage_categories: p.manage_categories ?? true,
        manage_coupons: p.manage_coupons ?? true,
        manage_content: p.manage_content ?? true,
        manage_admins: p.manage_admins ?? false,
        manage_rewards: p.manage_rewards ?? true,
        manage_newsletters: p.manage_newsletters ?? true,
        notify_email: p.notify_email ?? true,
        email_for_notifications: p.email_for_notifications ?? pr.email ?? null,
      };
    });
    setRows(combined);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const togglePerm = async (row: AdminRow, key: keyof AdminRow) => {
    const next = !row[key];
    setRows((rs) => rs.map((r) => r.user_id === row.user_id ? { ...r, [key]: next } : r));
    const { error } = await supabase
      .from('admin_permissions')
      .upsert({ user_id: row.user_id, [key]: next } as any, { onConflict: 'user_id' });
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      load();
    }
  };

  const saveEmail = async (row: AdminRow, value: string) => {
    await supabase.from('admin_permissions').upsert({ user_id: row.user_id, email_for_notifications: value } as any, { onConflict: 'user_id' });
    toast({ title: 'Email saved' });
  };

  const addAdmin = async () => {
    if (!inviteEmail.trim()) return;
    setBusy(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, email')
        .ilike('email', inviteEmail.trim())
        .maybeSingle();
      if (!profile) {
        toast({ title: 'User not found', description: 'That email has no account yet. Ask them to sign up first.', variant: 'destructive' });
        return;
      }
      const { error } = await supabase.from('user_roles').insert({ user_id: profile.user_id, role: 'admin' });
      if (error && !error.message.includes('duplicate')) throw error;
      await supabase.from('admin_permissions').upsert({ user_id: profile.user_id, email_for_notifications: profile.email } as any, { onConflict: 'user_id' });
      toast({ title: 'Admin added' });
      setInviteEmail('');
      load();
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    } finally { setBusy(false); }
  };

  const removeAdmin = async (row: AdminRow) => {
    if (!confirm(`Remove admin access for ${row.email || row.user_id}?`)) return;
    await supabase.from('user_roles').delete().eq('user_id', row.user_id).eq('role', 'admin');
    await supabase.from('admin_permissions').delete().eq('user_id', row.user_id);
    toast({ title: 'Admin removed' });
    load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Add Admin</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            type="email"
            placeholder="user@email.com (must already have an account)"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Button variant="gold" onClick={addAdmin} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Grant Access'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Admins & Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">No admins yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Notify email</TableHead>
                    {PERMS.map((p) => <TableHead key={p.key} className="text-center text-xs">{p.label}</TableHead>)}
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.user_id}>
                      <TableCell>
                        <div className="font-medium">{row.name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{row.email || row.user_id.slice(0, 8)}</div>
                      </TableCell>
                      <TableCell>
                        <Input
                          defaultValue={row.email_for_notifications || ''}
                          placeholder="notify@…"
                          className="min-w-[180px]"
                          onBlur={(e) => e.target.value !== (row.email_for_notifications || '') && saveEmail(row, e.target.value)}
                        />
                      </TableCell>
                      {PERMS.map((p) => (
                        <TableCell key={p.key} className="text-center">
                          <Switch checked={!!row[p.key]} onCheckedChange={() => togglePerm(row, p.key)} />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => removeAdmin(row)} title="Remove admin">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Admins with <strong>Manage Admins</strong> can add or remove other admins and change permissions.
            Admins with <strong>Email alerts</strong> ON receive an email for each new order at the address above (requires email service configured).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
