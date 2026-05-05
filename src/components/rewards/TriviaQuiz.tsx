import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Q { q: string; options: string[]; answer: number; }

const QUESTIONS: Q[] = [
  { q: 'Which metal is traditionally associated with luxury jewelry?', options: ['Iron', 'Gold', 'Aluminum', 'Tin'], answer: 1 },
  { q: 'What does "karat" measure in gold?', options: ['Weight', 'Purity', 'Size', 'Color'], answer: 1 },
  { q: 'Which gem is the birthstone of April?', options: ['Ruby', 'Emerald', 'Diamond', 'Sapphire'], answer: 2 },
  { q: 'Pure gold is how many karats?', options: ['18K', '22K', '24K', '14K'], answer: 2 },
  { q: 'Which of these is a precious metal?', options: ['Copper', 'Brass', 'Platinum', 'Steel'], answer: 2 },
  { q: 'What is rose gold an alloy of?', options: ['Gold + Copper', 'Gold + Silver', 'Gold + Iron', 'Gold + Zinc'], answer: 0 },
  { q: 'A "solitaire" ring features how many main stones?', options: ['One', 'Two', 'Three', 'Four'], answer: 0 },
  { q: 'Which country is famous for pearl farming?', options: ['Sweden', 'Japan', 'Iceland', 'Egypt'], answer: 1 },
];

const POINTS_PER_CORRECT = 15;
const QUESTIONS_PER_ROUND = 3;

export function TriviaQuiz({ onPointsAwarded }: { onPointsAwarded: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [canPlay, setCanPlay] = useState(false);
  const [checking, setChecking] = useState(true);
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { check(); }, [user]);

  const check = async () => {
    if (!user) return;
    const since = new Date(); since.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from('game_plays').select('id')
      .eq('user_id', user.id).eq('game_type', 'quiz')
      .gte('played_at', since.toISOString()).limit(1);
    setCanPlay(!data || data.length === 0);
    setChecking(false);
  };

  const start = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_ROUND);
    setRound(shuffled); setIdx(0); setSelected(null); setCorrect(0); setDone(false); setStarted(true);
  };

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === round[idx].answer) setCorrect(c => c + 1);
    setTimeout(() => {
      if (idx + 1 < round.length) {
        setIdx(idx + 1); setSelected(null);
      } else {
        finish();
      }
    }, 1200);
  };

  const finish = async () => {
    if (!user) return;
    setSubmitting(true);
    const earned = correct * POINTS_PER_CORRECT;
    const { error } = await supabase.from('game_plays').insert({
      user_id: user.id, game_type: 'quiz', points_earned: earned, metadata: { correct, total: round.length },
    });
    if (error) {
      toast({ title: 'Points not saved', description: error.message, variant: 'destructive' });
      setSubmitting(false);
      return;
    }
    toast({ title: `Quiz complete!`, description: `You got ${correct}/${round.length} and earned ${earned} points.` });
    setDone(true); setSubmitting(false); setCanPlay(false);
    onPointsAwarded();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />Daily Trivia</CardTitle>
        <CardDescription>{POINTS_PER_CORRECT} points per correct answer • {QUESTIONS_PER_ROUND} questions/day</CardDescription>
      </CardHeader>
      <CardContent>
        {checking ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : !canPlay && !started ? (
          <p className="text-center text-muted-foreground py-8">You've played today. Come back tomorrow!</p>
        ) : !started ? (
          <Button variant="gold" size="lg" className="w-full" onClick={start}>Start Quiz</Button>
        ) : done ? (
          <div className="text-center py-4">
            <p className="text-2xl font-bold mb-1">{correct}/{round.length}</p>
            <p className="text-sm text-muted-foreground">+{correct * POINTS_PER_CORRECT} points earned</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-xs text-muted-foreground mb-2">Question {idx + 1} of {round.length}</p>
              <h3 className="font-medium mb-4">{round[idx].q}</h3>
              <div className="space-y-2">
                {round[idx].options.map((opt, i) => {
                  const isCorrect = i === round[idx].answer;
                  const isSelected = selected === i;
                  const showResult = selected !== null;
                  return (
                    <button
                      key={i}
                      disabled={selected !== null}
                      onClick={() => choose(i)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        showResult && isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950' :
                        showResult && isSelected && !isCorrect ? 'border-red-500 bg-red-50 dark:bg-red-950' :
                        'border-border hover:border-gold hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{opt}</span>
                        {showResult && isCorrect && <Check className="h-4 w-4 text-green-600" />}
                        {showResult && isSelected && !isCorrect && <X className="h-4 w-4 text-red-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
        {submitting && <Loader2 className="h-4 w-4 animate-spin mx-auto mt-2" />}
      </CardContent>
    </Card>
  );
}
