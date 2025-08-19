import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PenTool, Clock, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface WritingSectionProps {
  exercise: {
    content: {
      prompt_it: string;
      min_words?: number;
      max_words?: number;
    };
  };
  onComplete: (text: string, evaluation: any) => void;
  timeLimit: number;
}

const WritingSection: React.FC<WritingSectionProps> = ({ 
  exercise, 
  onComplete, 
  timeLimit 
}) => {
  const [text, setText] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted) {
      handleSubmit();
    }
  }, [timeLeft, isCompleted]);

  const getWordCount = () => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = async () => {
    if (isCompleted || isEvaluating) return;
    
    const wordCount = getWordCount();
    
    if (wordCount < 50) {
      toast({
        title: "Testo troppo breve",
        description: "Scrivi almeno 50 parole per continuare.",
        variant: "destructive"
      });
      return;
    }

    setIsEvaluating(true);
    
    try {
      const response = await fetch('/api/eval/scrittura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          text,
          consegna: exercise.content.prompt_it
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.error?.includes('Limite giornaliero')) {
          toast({
            title: "Limite raggiunto",
            description: "Limite giornaliero raggiunto nella versione gratuita. Passa al piano Premium per accesso illimitato.",
            variant: "destructive"
          });
          return;
        }
        throw new Error(data.error || 'Errore nella valutazione');
      }


      setIsCompleted(true);
      onComplete(text, data);
      
      toast({
        title: "Valutazione completata",
        description: "La tua scrittura è stata valutata con successo!"
      });
      
    } catch (error) {
      console.error('Error evaluating writing:', error);
      toast({
        title: "Errore nella valutazione",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = getWordCount();
  const minWords = exercise.content.min_words || 90;
  const maxWords = exercise.content.max_words || 120;
  const isMinimumReached = wordCount >= minWords;
  const isOverMax = wordCount > maxWords;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Scrittura
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">{exercise.content.prompt_it}</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Parole: {wordCount}</span>
            </div>
            <div className={`text-xs ${
              isMinimumReached && !isOverMax 
                ? 'text-green-600' 
                : isOverMax 
                  ? 'text-red-600' 
                  : 'text-orange-600'
            }`}>
              {minWords}-{maxWords} parole
            </div>
          </div>
          
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Inizia a scrivere qui..."
            className="min-h-[300px] resize-none"
            disabled={isCompleted}
          />
          
          {isOverMax && (
            <p className="text-sm text-red-600">
              Hai superato il limite massimo di {maxWords} parole.
            </p>
          )}
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!isMinimumReached || isOverMax || isCompleted || isEvaluating}
          className="w-full"
          variant={isCompleted ? "secondary" : "default"}
        >
          {isEvaluating ? (
            "Valutazione in corso..."
          ) : isCompleted ? (
            "Completato"
          ) : (
            "Invia per valutazione"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WritingSection;