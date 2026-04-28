import { useEffect, useState } from 'react';
import { Loader2, Save, Search, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Settings {
  id: string;
  signup_bonus: number;
  points_per_order: number;
  referral_bonus: number;
  points_per_naira: number;
  min_redeem_points: number;
  page_heading: string;
  page_subheading: string;
  signup_label: string;
  signup_description: string;
  order_label: string;
  order_description: string;
  referral_label: string;
  referral_description: string;
}

interface UserRow {
  user_id: string;
  email: string | null;
  name: string | null;
  points_balance: number;
  lifetime_points: number;
  referral_code: string;
}

export function AdminRewardsManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [adjusting, setAdjusting] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const [sRes, lpRes, prRes] = await Promise.all([
      supabase.from('rewards_settings').select('*').limit(1).maybeSingle(),
      supabase.from('loyalty_points').select('*').order('lifetime_points', { ascending: false }).limit(200),
      supabase.from('profiles').select('user_id, name'),
    ]);
    if (sRes.data) setSettings(sRes.data as Settings);
    const profiles = new Map((prRes.data || []).map((p: any) => [p.user_id, p.name]));
    if (lpRes.data) {
      setUsers(lpRes.data.map((lp: any) => ({
        user_id: lp.user_id,
        email: null,
        name: profiles.get(lp.user_id) || null,
        points_balance: lp.points_balance,
        lifetime_points: lp.lifetime_points,
        referral_code: lp.referral_code,
      })));
    }
    setLoading(false);
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const { id, ...updates } = settings;
    const { error } = await supabase.from('rewards_settings').update(updates).eq('id', id);
    setSaving(false);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Settings saved' });
  };

  const adjustPoints = async (userId: string, delta: number, reason: string) => {
    setAdjusting(userId);
    const { data: lp } = await supabase.from('loyalty_points').select('*').eq('user_id', userId).maybeSingle();
    if (!lp) { setAdjusting(null); return; }
    const newBalance = Math.max(0, lp.points_balance + delta);
    const newLifetime = delta > 0 ? lp.lifetime_points + delta : lp.lifetime_points;
    const { error } = await supabase.from('loyalty_points').update({
      points_balance: newBalance,
      lifetime_points: newLifetime,
    }).eq('user_id', userId);
    if (!error) {
      await supabase.from('points_transactions').insert({
        user_id: userId,
        points: delta,
        type: delta > 0 ? 'admin_credit' : 'admin_debit',
        description: reason || (delta > 0 ? 'Admin granted points' : 'Admin removed points'),
      });
      toast({ title: 'Points updated' });
      load();
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    setAdjusting(null);
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || u.referral_code.toLowerCase().includes(q) || u.user_id.includes(q);
  });

  if (loading || !settings) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const upd = (k: keyof Settings, v: any) => setSettings({ ...settings, [k]: v });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reward Amounts</CardTitle>
          <CardDescription>Control how many points users earn for each action.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Signup Bonus (points)</Label>
            <Input type="number" value={settings.signup_bonus} onChange={e => upd('signup_bonus', parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Points per Paid Order</Label>
            <Input type="number" value={settings.points_per_order} onChange={e => upd('points_per_order', parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Referral Bonus (each side)</Label>
            <Input type="number" value={settings.referral_bonus} onChange={e => upd('referral_bonus', parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Naira value per 1 point (₦)</Label>
            <Input type="number" step="0.1" value={settings.points_per_naira} onChange={e => upd('points_per_naira', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Minimum points to redeem</Label>
            <Input type="number" value={settings.min_redeem_points} onChange={e => upd('min_redeem_points', parseInt(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rewards Page Content</CardTitle>
          <CardDescription>Customize what users see on the rewards page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Page heading</Label>
              <Input value={settings.page_heading} onChange={e => upd('page_heading', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Page subheading</Label>
              <Input value={settings.page_subheading} onChange={e => upd('page_subheading', e.target.value)} />
            </div>
          </div>
          <Separator />
          <p className="text-sm font-medium">"How to Earn" cards</p>
          {(['signup', 'order', 'referral'] as const).map(k => (
            <div key={k} className="grid gap-3 sm:grid-cols-2 rounded-lg border p-3">
              <div className="space-y-2">
                <Label>{k} title</Label>
                <Input value={settings[`${k}_label` as keyof Settings] as string} onChange={e => upd(`${k}_label` as keyof Settings, e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{k} description</Label>
                <Input value={settings[`${k}_description` as keyof Settings] as string} onChange={e => upd(`${k}_description` as keyof Settings, e.target.value)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button variant="gold" onClick={save} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Settings
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>User Points</CardTitle>
          <CardDescription>Search users and assign or deduct points.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search by name, referral code, or user id…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Referral</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Lifetime</TableHead>
                  <TableHead>Adjust</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 50).map(u => (
                  <UserAdjustRow key={u.user_id} user={u} adjusting={adjusting === u.user_id} onAdjust={adjustPoints} />
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No users.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserAdjustRow({ user, adjusting, onAdjust }: { user: UserRow; adjusting: boolean; onAdjust: (id: string, delta: number, reason: string) => void }) {
  const [amount, setAmount] = useState(50);
  const [reason, setReason] = useState('');
  return (
    <TableRow>
      <TableCell>
        <div className="text-sm font-medium">{user.name || 'Unnamed'}</div>
        <div className="text-xs font-mono text-muted-foreground">{user.user_id.slice(0, 8)}…</div>
      </TableCell>
      <TableCell className="font-mono text-xs">{user.referral_code}</TableCell>
      <TableCell className="font-bold">{user.points_balance}</TableCell>
      <TableCell>{user.lifetime_points}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Input type="number" className="h-8 w-20" value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)} />
          <Input className="h-8 w-32" placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)} />
          <Button size="icon-sm" variant="outline" disabled={adjusting} onClick={() => onAdjust(user.user_id, amount, reason)}><Plus className="h-4 w-4" /></Button>
          <Button size="icon-sm" variant="outline" disabled={adjusting} onClick={() => onAdjust(user.user_id, -amount, reason)}><Minus className="h-4 w-4" /></Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
