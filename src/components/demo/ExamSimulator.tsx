import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface Exercise {
  id: string;
  type: string;
  title: string;
  prompt_it: string;
  text_it?: string;
  audio_url?: string;
  timer_seconds: number;
  questions: Question[];
}

interface ExamSimulatorProps {
  exercises: Exercise[];
  onComplete: (results: any) => void;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({ exercises, onComplete }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [writingText, setWritingText] = useState('');
  const [recordingData, setRecordingData] = useState<any>(null);
  const { toast } = useToast();

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const isLastExercise = currentExerciseIndex === totalExercises - 1;

  // Timer management
  useEffect(() => {
    if (currentExercise) {
      setTimeRemaining(currentExercise.timer_seconds);
    }
  }, [currentExercise]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && currentExercise) {
      handleTimeUp();
    }
  }, [timeRemaining]);

  const handleTimeUp = () => {
    toast({
      title: "Tempo scaduto!",
      description: "Passando al prossimo esercizio..."
    });
    handleNextExercise();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio management for listening exercises
  useEffect(() => {
    if (currentExercise?.type === 'ascolto' && currentExercise.audio_url) {
      const audio = new Audio(currentExercise.audio_url);
      setAudioPlayer(audio);
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [currentExercise]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentExercise.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextExercise = () => {
    if (currentExercise.type === 'scrittura') {
      // Save writing text
      setAnswers(prev => ({
        ...prev,
        [`${currentExercise.id}_writing`]: writingText
      }));
    }

    if (isLastExercise) {
      handleSubmitExam();
    } else {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setWritingText('');
      setRecordingData(null);
    }
  };

  const handleSubmitExam = () => {
    const results = {
      exercises: exercises.map(exercise => ({
        id: exercise.id,
        type: exercise.type,
        answers: exercise.questions.map(q => ({
          questionId: q.id,
          answer: answers[q.id] || ''
        })),
        writingText: exercise.type === 'scrittura' ? answers[`${exercise.id}_writing`] : undefined,
        recordingData: exercise.type === 'produzione_orale' ? recordingData : undefined
      })),
      completedAt: new Date().toISOString(),
      totalTime: exercises.reduce((acc, ex) => acc + ex.timer_seconds, 0)
    };

    onComplete(results);
  };

  const renderListeningExercise = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg mb-4">{currentExercise.prompt_it}</p>
        {audioPlayer && (
          <div className="space-x-4">
            <Button onClick={() => audioPlayer.play()}>
              ▶ Ascolta
            </Button>
            <Button variant="outline" onClick={() => audioPlayer.pause()}>
              ⏸ Pausa
            </Button>
            <Button variant="outline" onClick={() => {
              audioPlayer.currentTime = 0;
              audioPlayer.play();
            }}>
              🔄 Riascolta
            </Button>
          </div>
        )}
      </div>
      {renderQuestions()}
    </div>
  );

  const renderReadingExercise = () => (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Testo da leggere:</h3>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {currentExercise.text_it}
        </div>
      </div>
      {renderQuestions()}
    </div>
  );

  const renderWritingExercise = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg mb-4">{currentExercise.prompt_it}</p>
        <p className="text-sm text-muted-foreground">Minimo 80 parole</p>
      </div>
      <textarea
        value={writingText}
        onChange={(e) => setWritingText(e.target.value)}
        className="w-full h-64 p-4 border rounded-lg resize-none"
        placeholder="Scrivi qui la tua risposta..."
      />
      <div className="text-sm text-muted-foreground">
        Parole: {writingText.trim().split(/\s+/).length}
      </div>
    </div>
  );

  const renderSpeakingExercise = () => (
    <div className="space-y-6 text-center">
      <div>
        <p className="text-lg mb-4">{currentExercise.prompt_it}</p>
        <p className="text-sm text-muted-foreground">Registra la tua risposta (2-3 minuti)</p>
      </div>
      <div className="space-y-4">
        <Button 
          size="lg"
          onClick={() => {
            // Simulazione registrazione
            setRecordingData({ recorded: true, timestamp: Date.now() });
            toast({ title: "Registrazione completata!" });
          }}
          disabled={!!recordingData}
        >
          {recordingData ? '✅ Registrato' : '🎤 Inizia Registrazione'}
        </Button>
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Domanda {currentQuestionIndex + 1} di {currentExercise.questions.length}
        </h3>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === currentExercise.questions.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {currentExercise.questions[currentQuestionIndex] && (
        <div className="space-y-3">
          <p className="font-medium">
            {currentExercise.questions[currentQuestionIndex].text}
          </p>
          <div className="space-y-2">
            {currentExercise.questions[currentQuestionIndex].options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question_${currentExercise.questions[currentQuestionIndex].id}`}
                  value={option}
                  checked={answers[currentExercise.questions[currentQuestionIndex].id] === option}
                  onChange={(e) => handleAnswerChange(currentExercise.questions[currentQuestionIndex].id, e.target.value)}
                  className="h-4 w-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!currentExercise) {
    return <div>Caricamento esame...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{currentExercise.title}</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>
        <Progress 
          value={(currentExerciseIndex / totalExercises) * 100} 
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Esercizio {currentExerciseIndex + 1} di {totalExercises} - {currentExercise.type.toUpperCase()}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentExercise.type === 'ascolto' && renderListeningExercise()}
        {currentExercise.type === 'lettura' && renderReadingExercise()}
        {currentExercise.type === 'scrittura' && renderWritingExercise()}
        {currentExercise.type === 'produzione_orale' && renderSpeakingExercise()}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
            disabled={currentExerciseIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Esercizio Precedente
          </Button>

          <Button onClick={handleNextExercise}>
            {isLastExercise ? (
              <>
                <Send className="h-4 w-4 mr-2" />
                Consegna Esame
              </>
            ) : (
              <>
                Prossimo Esercizio
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};