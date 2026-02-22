import { useState, useEffect } from 'react';
import { MessageCircle, Send, Bot, User as UserIcon, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question: string;
  user_id: string;
  created_at: string;
  answers: Answer[];
}

interface Answer {
  id: string;
  answer: string;
  is_ai_generated: boolean;
  is_approved: boolean;
  created_at: string;
}

interface ProductQAProps {
  productId: string;
  productName: string;
  productDescription: string;
}

export function ProductQA({ productId, productName, productDescription }: ProductQAProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    const { data: qData } = await supabase
      .from('product_questions')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (qData) {
      const { data: aData } = await supabase
        .from('product_answers')
        .select('*')
        .in('question_id', qData.map(q => q.id));

      const mapped = qData.map(q => ({
        ...q,
        answers: (aData || []).filter(a => a.question_id === q.id),
      }));
      setQuestions(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();

    const channel = supabase
      .channel(`qa-${productId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_questions' }, () => fetchQuestions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_answers' }, () => fetchQuestions())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [productId]);

  const handleSubmit = async () => {
    if (!newQuestion.trim() || !user) return;
    setSubmitting(true);

    try {
      // Insert the question
      const { data: qData, error: qError } = await supabase
        .from('product_questions')
        .insert({ product_id: productId, user_id: user.id, question: newQuestion.trim() })
        .select()
        .single();

      if (qError) throw qError;

      // Generate AI answer
      const resp = await supabase.functions.invoke('generate-answer', {
        body: { question: newQuestion.trim(), productName, productDescription },
      });

      if (resp.data?.answer) {
        await supabase.from('product_answers').insert({
          question_id: qData.id,
          answer: resp.data.answer,
          is_ai_generated: true,
          is_approved: false,
          responder_id: null,
        });
      }

      setNewQuestion('');
      toast({ title: 'Question submitted!', description: 'An AI-suggested answer has been generated for vendor review.' });
      fetchQuestions();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-display text-2xl font-bold text-foreground flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary" />
        Questions & Answers
      </h2>

      {/* Ask a question */}
      {user ? (
        <div className="mb-8 rounded-xl border border-border p-4">
          <Textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a question about this product..."
            rows={2}
            className="mb-3"
          />
          <Button
            variant="gold"
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !newQuestion.trim()}
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Ask Question
          </Button>
        </div>
      ) : (
        <p className="mb-8 text-sm text-muted-foreground">
          <a href="/auth" className="text-primary hover:underline">Sign in</a> to ask a question.
        </p>
      )}

      {/* Questions list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : questions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No questions yet. Be the first to ask!</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-secondary p-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{q.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(q.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {q.answers.filter(a => a.is_approved).map((a) => (
                <div key={a.id} className="ml-8 flex items-start gap-3 rounded-lg bg-primary/5 p-3">
                  <div className="mt-0.5 rounded-full bg-primary/20 p-1.5">
                    {a.is_ai_generated ? <Bot className="h-3.5 w-3.5 text-primary" /> : <CheckCircle className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{a.answer}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {a.is_ai_generated ? 'AI-suggested answer' : 'Vendor response'} • {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

              {q.answers.length === 0 && (
                <p className="ml-8 text-xs text-muted-foreground italic">Answer pending vendor review...</p>
              )}
              {q.answers.length > 0 && q.answers.every(a => !a.is_approved) && (
                <p className="ml-8 text-xs text-muted-foreground italic">Answer pending vendor approval...</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
