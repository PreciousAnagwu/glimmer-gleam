import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SEGMENTS = [
  { label: '10', points: 10, color: '#D4AF37' },
  { label: '25', points: 25, color: '#1a1a1a' },
  { label: '5', points: 5, color: '#D4AF37' },
  { label: '50', points: 50, color: '#1a1a1a' },
  { label: '15', points: 15, color: '#D4AF37' },
  { label: '100', points: 100, color: '#1a1a1a' },
  { label: '20', points: 20, color: '#D4AF37' },
  { label: '5', points: 5, color: '#1a1a1a' },
];

export function SpinWheel({ onPointsAwarded }: { onPointsAwarded: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => { checkEligibility(); }, [user]);

  const checkEligibility = async () => {
    if (!user) return;
    const since = new Date(); since.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from('game_plays')
      .select('id')
      .eq('user_id', user.id)
      .eq('game_type', 'spin')
      .gte('played_at', since.toISOString())
      .limit(1);
    setCanPlay(!data || data.length === 0);
    setChecking(false);
  };

  const spin = async () => {
    if (!user || spinning || !canPlay) return;
    setSpinning(true);
    const idx = Math.floor(Math.random() * SEGMENTS.length);
    const segAngle = 360 / SEGMENTS.length;
    const target = 360 * 6 + (360 - idx * segAngle - segAngle / 2);
    setRotation(target);

    setTimeout(async () => {
      const won = SEGMENTS[idx];
      // Award points via direct updates
      const { data: lp } = await supabase.from('loyalty_points').select('*').eq('user_id', user.id).maybeSingle();
      if (lp) {
        await supabase.from('loyalty_points').update({
          points_balance: lp.points_balance + won.points,
          lifetime_points: lp.lifetime_points + won.points,
        }).eq('user_id', user.id);
      }
      await supabase.from('points_transactions').insert({
        user_id: user.id, points: won.points, type: 'game_reward', description: `Spin & Win: ${won.points} pts`,
      });
      await supabase.from('game_plays').insert({
        user_id: user.id, game_type: 'spin', points_earned: won.points, metadata: { segment: idx },
      });
      toast({ title: `🎉 You won ${won.points} points!`, description: 'Come back tomorrow for another spin.' });
      setSpinning(false);
      setCanPlay(false);
      onPointsAwarded();
    }, 4200);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-gold" />Daily Spin & Win</CardTitle>
        <CardDescription>Spin once a day to win loyalty points!</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-64 h-64 mb-4">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-gold" />
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
            className="w-full h-full rounded-full border-4 border-gold shadow-xl overflow-hidden relative"
            style={{
              background: `conic-gradient(${SEGMENTS.map((s, i) => `${s.color} ${(i * 360) / SEGMENTS.length}deg ${((i + 1) * 360) / SEGMENTS.length}deg`).join(',')})`,
            }}
          >
            {SEGMENTS.map((s, i) => {
              const angle = (i * 360) / SEGMENTS.length + 360 / SEGMENTS.length / 2;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 text-white font-bold text-sm"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-90px)`,
                    transformOrigin: 'center',
                  }}
                >
                  {s.label}
                </div>
              );
            })}
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background border-4 border-gold z-10" />
        </div>
        <Button variant="gold" size="lg" onClick={spin} disabled={spinning || checking || !canPlay} className="w-full">
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : spinning ? 'Spinning…' : canPlay ? 'SPIN NOW' : 'Come back tomorrow'}
        </Button>
      </CardContent>
    </Card>
  );
}
