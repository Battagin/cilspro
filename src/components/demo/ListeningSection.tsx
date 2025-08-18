import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Play, Pause, Clock, Volume2 } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface ListeningSectionProps {
  exercise: {
    content: {
      audio_url: string;
      instructions: string;
      questions: Question[];
    };
    answer_key?: Record<string, number>; // Optional for demo mode
  };
  onComplete: (answers: Record<string, number>, score: number) => void;
  timeLimit: number;
}

const ListeningSection: React.FC<ListeningSectionProps> = ({ 
  exercise, 
  onComplete, 
  timeLimit 
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
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
    if (playCount >= 2) return;
    
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

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = () => {
    // For demo mode without answer_key, return a mock score
    if (!exercise.answer_key) {
      return Math.floor(Math.random() * 30) + 60; // Random score between 60-89
    }
    
    let correct = 0;
    Object.entries(exercise.answer_key).forEach(([questionId, correctAnswer]) => {
      if (answers[questionId] === correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / Object.keys(exercise.answer_key).length) * 100);
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

  const allQuestionsAnswered = exercise.answer_key 
    ? Object.keys(exercise.answer_key).every(questionId => answers.hasOwnProperty(questionId))
    : exercise.content.questions.every(q => answers.hasOwnProperty(q.id.toString()));

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
        <p className="text-muted-foreground">{exercise.content.instructions}</p>
        
        <div className="flex flex-col items-center space-y-4 p-6 bg-muted/50 rounded-lg">
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
                disabled={playCount >= 2}
                variant={playCount >= 2 ? "secondary" : "default"}
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
            Ascolti disponibili: {2 - playCount}/2
          </p>
        </div>

        <div className="space-y-6">
          {exercise.content.questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <h4 className="font-medium">
                {index + 1}. {question.question}
              </h4>
              <RadioGroup
                value={answers[question.id]?.toString() || ""}
                onValueChange={(value) => handleAnswerChange(question.id.toString(), parseInt(value))}
              >
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={optionIndex.toString()} 
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