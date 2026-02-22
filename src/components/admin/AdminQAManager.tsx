import { useState, useEffect } from 'react';
import { Bot, CheckCircle, XCircle, Loader2, MessageCircle, Pencil, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface QuestionWithAnswer {
  id: string;
  product_id: string;
  question: string;
  created_at: string;
  answers: {
    id: string;
    answer: string;
    is_ai_generated: boolean;
    is_approved: boolean;
    created_at: string;
  }[];
  product_name?: string;
}

export function AdminQAManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchQuestions = async () => {
    const { data: qData } = await supabase
      .from('product_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!qData) { setLoading(false); return; }

    const productIds = [...new Set(qData.map(q => q.product_id))];
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    const { data: aData } = await supabase
      .from('product_answers')
      .select('*')
      .in('question_id', qData.map(q => q.id));

    setQuestions(qData.map(q => ({
      ...q,
      answers: (aData || []).filter(a => a.question_id === q.id),
      product_name: products?.find(p => p.id === q.product_id)?.name || 'Unknown',
    })));
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
    const channel = supabase
      .channel('admin-qa')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_questions' }, () => fetchQuestions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_answers' }, () => fetchQuestions())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const approveAnswer = async (answerId: string) => {
    const { error } = await supabase.from('product_answers').update({ is_approved: true }).eq('id', answerId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Answer approved' }); fetchQuestions(); }
  };

  const rejectAnswer = async (answerId: string) => {
    const { error } = await supabase.from('product_answers').delete().eq('id', answerId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Answer removed' }); fetchQuestions(); }
  };

  const updateAnswer = async (answerId: string) => {
    const { error } = await supabase.from('product_answers').update({ answer: editText, is_approved: true, is_ai_generated: false }).eq('id', answerId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Answer updated & approved' }); setEditingAnswer(null); fetchQuestions(); }
  };

  const addVendorReply = async (questionId: string) => {
    if (!replyText.trim() || !user) return;
    const { error } = await supabase.from('product_answers').insert({
      question_id: questionId,
      answer: replyText.trim(),
      is_ai_generated: false,
      is_approved: true,
      responder_id: user.id,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Reply added' }); setReplyingTo(null); setReplyText(''); fetchQuestions(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No questions yet.</p>
        </div>
      ) : (
        questions.map((q) => (
          <div key={q.id} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="outline" className="mb-2 text-xs">{q.product_name}</Badge>
                <p className="font-medium text-sm">{q.question}</p>
                <p className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {q.answers.map((a) => (
              <div key={a.id} className={`ml-4 p-3 rounded-lg ${a.is_approved ? 'bg-green-50 dark:bg-green-950/20' : 'bg-amber-50 dark:bg-amber-950/20'}`}>
                {editingAnswer === a.id ? (
                  <div className="space-y-2">
                    <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} />
                    <div className="flex gap-2">
                      <Button size="sm" variant="gold" onClick={() => updateAnswer(a.id)}>Save & Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingAnswer(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      {a.is_ai_generated ? <Bot className="h-4 w-4 text-blue-500 mt-0.5" /> : <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                      <p className="text-sm flex-1">{a.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={a.is_approved ? 'default' : 'secondary'} className="text-xs">
                        {a.is_approved ? 'Approved' : 'Pending'}
                      </Badge>
                      {!a.is_approved && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => approveAnswer(a.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />Approve
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingAnswer(a.id); setEditText(a.answer); }}>
                        <Pencil className="h-3 w-3 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => rejectAnswer(a.id)}>
                        <XCircle className="h-3 w-3 mr-1" />Remove
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {replyingTo === q.id ? (
              <div className="ml-4 space-y-2">
                <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your response..." rows={2} />
                <div className="flex gap-2">
                  <Button size="sm" variant="gold" onClick={() => addVendorReply(q.id)} disabled={!replyText.trim()}>
                    <Send className="h-3 w-3 mr-1" />Reply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="ghost" className="ml-4 text-xs" onClick={() => setReplyingTo(q.id)}>
                <Send className="h-3 w-3 mr-1" />Add Vendor Reply
              </Button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
