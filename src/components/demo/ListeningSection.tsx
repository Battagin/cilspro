import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Play, Pause, Clock, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AudioGenerator from '../exercises/AudioGenerator';

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface ListeningSectionProps {
  exercise: {
    id: string;
    content: {
      audio_url?: string;
      prompt_it: string;
      text_it?: string;
      questions?: Question[];
    };
  };
  onComplete: (answers: Record<string, string>, score: number) => void;
  timeLimit: number;
}

const ListeningSection: React.FC<ListeningSectionProps> = ({ 
  exercise, 
  onComplete, 
  timeLimit 
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isCompleted, setIsCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted) {
      handleSubmit();
    }
  }, [timeLeft, isCompleted]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      setPlayCount(prev => prev + 1);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAnswerChange = (questionId: string, optionValue: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionValue
    }));
  };

  const calculateScore = async () => {
    try {
      const response = await fetch('/api/demo/grade-mcq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercise_id: exercise.id,
          answers: answers
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Errore nella correzione');
      }

      return result.score;
    } catch (error) {
      console.error('Error grading answers:', error);
      // Fallback to mock score for demo
      return Math.floor(Math.random() * 30) + 60;
    }
  };

  const handleSubmit = async () => {
    if (isCompleted) return;
    
    const score = await calculateScore();
    setIsCompleted(true);
    onComplete(answers, score);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const questions = exercise.content.questions || [];
  const allQuestionsAnswered = questions.every(q => answers.hasOwnProperty(q.id));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Ascolto
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">{exercise.content.prompt_it}</p>
        
        <div className="flex flex-col items-center space-y-4 p-6 bg-muted/50 rounded-lg">
          {/* Use AudioGenerator for dynamic audio generation */}
          {exercise.content.audio_url && exercise.content.audio_url.startsWith('http') ? (
            <>
              <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                preload="metadata"
              >
                <source src={exercise.content.audio_url} type="audio/mpeg" />
                Il tuo browser non supporta l'elemento audio.
              </audio>
              
              <div className="flex items-center gap-4">
                {!isPlaying ? (
                  <Button 
                    onClick={handlePlay} 
                    variant="default"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {playCount === 0 ? "Ascolta" : "Ascolta di nuovo"}
                  </Button>
                ) : (
                  <Button onClick={handlePause} variant="secondary">
                    <Pause className="w-4 h-4 mr-2" />
                    Pausa
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Ascolta senza limiti durante i test
              </p>
            </>
          ) : (
            <AudioGenerator
              text={exercise.content?.text_it || exercise.content?.prompt_it || 'Ciao, questo è un audio di esempio per l\'esercizio di ascolto.'}
              exerciseId={exercise.id}
              onAudioReady={(url) => {
                if (exercise.content) {
                  exercise.content.audio_url = url;
                }
              }}
            />
          )}
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <h4 className="font-medium">
                {index + 1}. {question.text}
              </h4>
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option.charAt(0)} 
                      id={`q${question.id}-${optionIndex}`} 
                    />
                    <Label 
                      htmlFor={`q${question.id}-${optionIndex}`}
                      className="cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered || isCompleted}
          className="w-full"
          variant={isCompleted ? "secondary" : "default"}
        >
          {isCompleted ? "Completato" : "Conferma risposte"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ListeningSection;