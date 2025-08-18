import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { BookOpen, Clock } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface ReadingSectionProps {
  exercise: {
    content: {
      text: string;
      instructions: string;
      questions: Question[];
    };
    answer_key?: Record<string, number>; // Optional for demo mode
  };
  onComplete: (answers: Record<string, number>, score: number) => void;
  timeLimit: number;
}

const ReadingSection: React.FC<ReadingSectionProps> = ({ 
  exercise, 
  onComplete, 
  timeLimit 
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted) {
      handleSubmit();
    }
  }, [timeLeft, isCompleted]);

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
            <BookOpen className="w-5 h-5" />
            Lettura
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">{exercise.content.instructions}</p>
        
        <div className="p-6 bg-muted/50 rounded-lg">
          <div className="whitespace-pre-line text-sm leading-relaxed">
            {exercise.content.text}
          </div>
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

export default ReadingSection;