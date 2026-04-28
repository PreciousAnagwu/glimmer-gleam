import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, Users, Clock, Copy, Check, Loader2, ArrowRight, Trophy, Gamepad2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { SpinWheel } from '@/components/rewards/SpinWheel';
import { TriviaQuiz } from '@/components/rewards/TriviaQuiz';

interface LoyaltyData {
  points_balance: number;
  lifetime_points: number;
  referral_code: string;
}

interface Transaction {
  id: string;
  points: number;
  type: string;
  description: string | null;
  created_at: string;
}

interface RewardsSettings {
  signup_bonus: number;
  points_per_order: number;
  referral_bonus: number;
  points_per_naira: number;
  min_redeem_points: number;
  page_heading: string;
  page_subheading: string;
  signup_label: string; signup_description: string;
  order_label: string; order_description: string;
  referral_label: string; referral_description: string;
}

export default function Rewards() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<RewardsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchData();

    const channel = supabase
      .channel('loyalty-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loyalty_points', filter: `user_id=eq.${user.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'points_transactions', filter: `user_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    const [lpRes, txRes, sRes] = await Promise.all([
      supabase.from('loyalty_points').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('points_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('rewards_settings').select('*').limit(1).maybeSingle(),
    ]);
    if (lpRes.data) setLoyalty(lpRes.data);
    if (txRes.data) setTransactions(txRes.data);
    if (sRes.data) setSettings(sRes.data as RewardsSettings);
    setLoading(false);
  };

  const copyReferralCode = () => {
    if (!loyalty) return;
    const link = `${window.location.origin}/auth?ref=${loyalty.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Referral link copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const getTier = (points: number) => {
    if (points >= 5000) return { name: 'Platinum', color: 'from-slate-400 to-slate-600', next: null, progress: 100 };
    if (points >= 2000) return { name: 'Gold', color: 'from-yellow-400 to-yellow-600', next: 'Platinum', progress: ((points - 2000) / 3000) * 100 };
    if (points >= 500) return { name: 'Silver', color: 'from-gray-300 to-gray-500', next: 'Gold', progress: ((points - 500) / 1500) * 100 };
    return { name: 'Bronze', color: 'from-amber-600 to-amber-800', next: 'Silver', progress: (points / 500) * 100 };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'signup_bonus': return <Gift className="h-4 w-4 text-green-500" />;
      case 'order_reward': return <Star className="h-4 w-4 text-primary" />;
      case 'referral_bonus': return <Users className="h-4 w-4 text-blue-500" />;
      case 'redemption': return <ArrowRight className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  const tier = getTier(loyalty?.lifetime_points || 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Loyalty Rewards</h1>
            <p className="text-muted-foreground mb-8">{settings?.page_subheading || 'Earn points on every purchase and unlock exclusive rewards.'}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Points Balance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="overflow-hidden">
                <div className={`bg-gradient-to-r ${tier.color} p-6 text-white`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-5 w-5" />
                    <span className="text-sm font-medium opacity-90">{tier.name} Member</span>
                  </div>
                  <p className="text-4xl font-bold">{loyalty?.points_balance || 0}</p>
                  <p className="text-sm opacity-80">Available Points</p>
                </div>
                <CardContent className="pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Lifetime: {loyalty?.lifetime_points || 0} pts</span>
                    {tier.next && <span className="text-muted-foreground">Next: {tier.next}</span>}
                  </div>
                  {tier.next && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min(tier.progress, 100)}%` }} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Referral */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Refer & Earn</CardTitle>
                  <CardDescription>Share your code and earn 200 points per referral!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input value={loyalty?.referral_code || ''} readOnly className="font-mono text-center font-bold tracking-wider" />
                    <Button variant="gold" onClick={copyReferralCode}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    When a friend signs up with your code and makes their first purchase, you both earn bonus points!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Play & Earn */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="h-5 w-5 text-gold" />
              <h2 className="font-display text-2xl font-bold">Play & Earn</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <SpinWheel onPointsAwarded={fetchData} />
              <TriviaQuiz onPointsAwarded={fetchData} />
            </div>
          </motion.div>

          {/* How to earn */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>How to Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Gift, title: 'Sign Up Bonus', desc: '100 points when you join', color: 'text-green-500' },
                    { icon: Star, title: 'Per Order', desc: '50 points per completed order', color: 'text-primary' },
                    { icon: Users, title: 'Referrals', desc: '200 points per friend referred', color: 'text-blue-500' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                      <item.icon className={`h-5 w-5 mt-0.5 ${item.color}`} />
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transaction History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle>Points History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(tx.type)}
                          <div>
                            <p className="text-sm font-medium">{tx.description || tx.type.replace('_', ' ')}</p>
                            <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`font-bold text-sm ${tx.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.points > 0 ? '+' : ''}{tx.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
