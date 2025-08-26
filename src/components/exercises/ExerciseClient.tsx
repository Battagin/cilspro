import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, RefreshCw, Play, Square, Mic, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

import ExerciseRenderer from './ExerciseRenderer';
import FeedbackCard from './FeedbackCard';

interface Exercise {
  id: string;
  type: string;
  title: string;
  content: {
    prompt_it: string;
    text_it?: string;
    audio_url?: string;
    timer_seconds: number;
    questions?: Array<{
      id: string;
      text: string;
      options: string[];
    }>;
    min_words?: number;
    max_words?: number;
  };
  answer_key?: any;
}

interface ExerciseClientProps {
  exerciseType: string;
  exerciseSubType: string;
}

const ExerciseClient: React.FC<ExerciseClientProps> = ({ exerciseType, exerciseSubType }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<any>({});
  const [feedback, setFeedback] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    generateExercise();
  }, [exerciseType, exerciseSubType]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            handleSubmitExercise();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const generateExercise = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-dynamic-exercises', {
        body: { 
          skill_type: exerciseType === 'orale' ? 'produzione_orale' : exerciseType,
          subtype: exerciseSubType,
          count: 1
        }
      });

      if (error) throw error;

      if (data?.exercises && data.exercises.length > 0) {
        const newExercise = data.exercises[0];
        setExercise({
          id: newExercise.id,
          type: newExercise.type,
          title: newExercise.title,
          content: {
            prompt_it: newExercise.prompt_it,
            text_it: newExercise.text_it,
            audio_url: newExercise.audio_url,
            timer_seconds: newExercise.timer_seconds || 600,
            questions: newExercise.questions || [],
            min_words: newExercise.min_words,
            max_words: newExercise.max_words,
          },
          answer_key: newExercise.answer_key
        });
        
        setTimeLeft(newExercise.timer_seconds || 600);
        setAnswers({});
        setFeedback(null);
        setShowResults(false);
      } else {
        throw new Error('Nessun esercizio generato');
      }

    } catch (error) {
      console.error('Error generating exercise:', error);
      toast({
        title: "Errore",
        description: "Impossibile generare l'esercizio. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setTimerActive(true);
  };

  const handleAnswersChange = (newAnswers: any) => {
    setAnswers(newAnswers);
  };

  const handleSubmitExercise = async () => {
    if (!exercise) return;

    try {
      setSubmitting(true);

      // For multiple choice exercises (ascolto, lettura)
      if (['ascolto', 'lettura'].includes(exerciseType)) {
        const { data, error } = await supabase.functions.invoke('evaluate-exercise', {
          body: {
            exercise: exercise,
            answers: answers
          }
        });

        if (error) throw error;
        setFeedback(data);
      } 
      // For written exercises (scrittura)
      else if (exerciseType === 'scrittura') {
        const { data, error } = await supabase.functions.invoke('evaluate-exercise', {
          body: {
            exercise: exercise,
            writingText: answers.text || ''
          }
        });

        if (error) throw error;
        setFeedback(data);
      }
      // For oral exercises (orale/produzione_orale)  
      else if (exerciseType === 'orale' || exerciseType === 'produzione_orale') {
        if (answers.audioBlob) {
          // First transcribe the audio
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('transcribe-audio', {
              body: { audio: base64Audio }
            });

            if (transcribeError) throw transcribeError;

            // Then evaluate the transcription
            const { data, error } = await supabase.functions.invoke('evaluate-exercise', {
              body: {
                exercise: exercise,
                transcription: transcribeData.text || transcribeData.transcription,
                duration_seconds: answers.recordingDuration || 0
              }
            });

            if (error) throw error;
            setFeedback(data);
            setShowResults(true);
            setTimerActive(false);
            setSubmitting(false);
          };
          reader.readAsDataURL(answers.audioBlob);
          return; // Don't continue to the rest of the function
        } else {
          throw new Error('Nessuna registrazione audio trovata');
        }
      }

      setShowResults(true);
      setTimerActive(false);

    } catch (error) {
      console.error('Error submitting exercise:', error);
      toast({
        title: "Errore",
        description: "Impossibile valutare l'esercizio. Riprova.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBackPath = () => {
    if (exerciseType === 'lettura' || exerciseType === 'orale') {
      return `/esercizi/${exerciseType}`;
    }
    return '/exercicios';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Errore nel caricamento
        </h1>
        <p className="text-muted-foreground mb-6">
          Impossibile caricare l'esercizio richiesto.
        </p>
        <Button onClick={() => navigate(getBackPath())} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna indietro
        </Button>
      </div>
    );
  }

  if (showResults && feedback) {
    return (
      <div className="container mx-auto px-4 py-12">
        <FeedbackCard
          feedback={feedback}
          exerciseType={exerciseType}
          onRetry={generateExercise}
          onBack={() => navigate(getBackPath())}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(getBackPath())}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna indietro
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{exercise.title}</CardTitle>
              <div className="flex items-center gap-4">
                {timerActive && (
                  <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono font-bold">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateExercise}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nuovo esercizio
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ExerciseRenderer
              exercise={exercise}
              answers={answers}
              onAnswersChange={handleAnswersChange}
              onStartTimer={startTimer}
              timerActive={timerActive}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={handleSubmitExercise}
            disabled={submitting || loading}
            size="lg"
            className="min-w-48"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Valutando...
              </>
            ) : (
              'Invia per valutazione'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseClient;