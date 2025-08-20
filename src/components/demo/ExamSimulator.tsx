import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronLeft, ChevronRight, Send, SkipForward, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AudioRecorder } from './AudioRecorder';

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
  audio_text?: string;
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
  const [recordingData, setRecordingData] = useState<{ transcription?: string; recorded?: boolean; timestamp?: number } | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
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
    if (currentExercise?.type === 'ascolto') {
      setAudioPlayer(null);
      setAudioError(null);
    }
  }, [currentExercise]);

  const generateAudio = async (text: string) => {
    try {
      setIsAudioLoading(true);
      setAudioError(null);

      const response = await supabase.functions.invoke('generate-tts', {
        body: { 
          text,
          voice: 'alice' // Italian female voice
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Errore generazione audio');
      }

      const audioData = response.data as { audioContent: string };
      if (audioData?.audioContent) {
        const audio = new Audio(`data:audio/mpeg;base64,${audioData.audioContent}`);
        setAudioPlayer(audio);
        return audio;
      } else {
        throw new Error('Audio non ricevuto');
      }
    } catch (error) {
      console.error('Errore audio:', error);
      setAudioError('Errore nel caricamento audio. Riprova più tardi.');
      return null;
    } finally {
      setIsAudioLoading(false);
    }
  };

  const playAudio = async () => {
    if (!audioPlayer && currentExercise?.type === 'ascolto') {
      // Generate audio from text if not already generated
      const audioText = currentExercise.audio_text || currentExercise.prompt_it;
      const newAudio = await generateAudio(audioText);
      if (newAudio) {
        newAudio.play();
      }
    } else if (audioPlayer) {
      audioPlayer.play();
    }
  };

  const pauseAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
  };

  const replayAudio = async () => {
    if (audioPlayer) {
      audioPlayer.currentTime = 0;
      audioPlayer.play();
    } else {
      await playAudio();
    }
  };

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

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setCurrentQuestionIndex(0);
      setWritingText('');
      setRecordingData(null);
    }
  };

  const handleNextExercise = () => {
    // Validate that all questions are answered before proceeding
    if ((currentExercise.type === 'ascolto' || currentExercise.type === 'lettura') && currentExercise.questions.length > 0) {
      const unansweredQuestions = currentExercise.questions.filter(q => !answers[q.id]);
      if (unansweredQuestions.length > 0) {
        toast({
          title: "Completa tutte le domande",
          description: `Rispondi a tutte le domande prima di continuare (${unansweredQuestions.length} rimanenti)`,
          variant: "destructive"
        });
        return;
      }
    }

    if (currentExercise.type === 'scrittura') {
      if (!writingText.trim() || writingText.trim().split(/\s+/).length < 80) {
        toast({
          title: "Completa la scrittura",
          description: "Scrivi almeno 80 parole prima di continuare",
          variant: "destructive"
        });
        return;
      }
      // Save writing text
      setAnswers(prev => ({
        ...prev,
        [`${currentExercise.id}_writing`]: writingText
      }));
    }

    if (currentExercise.type === 'produzione_orale') {
      if (!recordingData?.recorded) {
        toast({
          title: "Registra la tua risposta",
          description: "Completa la registrazione audio prima di continuare",
          variant: "destructive"
        });
        return;
      }
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

  const handleSkipExercise = () => {
    handleNextExercise();
  };

  const handleSubmitExam = async () => {
    // Evaluate all exercises
    const evaluatedResults = [];

    for (const exercise of exercises) {
      let evaluation = null;
      
      if (exercise.type === 'ascolto' || exercise.type === 'lettura') {
        // Get answers for this exercise
        const exerciseAnswers: Record<string, string> = {};
        exercise.questions.forEach(q => {
          if (answers[q.id]) {
            exerciseAnswers[q.id] = answers[q.id];
          }
        });

        const response = await supabase.functions.invoke('evaluate-exercise', {
          body: {
            exercise,
            answers: exerciseAnswers
          }
        });
        
        evaluation = response.data;
      } else if (exercise.type === 'scrittura') {
        const response = await supabase.functions.invoke('evaluate-exercise', {
          body: {
            exercise,
            writingText: answers[`${exercise.id}_writing`] || ''
          }
        });
        
        evaluation = response.data;
      } else if (exercise.type === 'produzione_orale') {
        const response = await supabase.functions.invoke('evaluate-exercise', {
          body: {
            exercise,
            transcription: recordingData?.transcription || ''
          }
        });
        
        evaluation = response.data;
      }

      evaluatedResults.push({
        exercise,
        evaluation,
        answers: exercise.questions.map(q => ({
          questionId: q.id,
          answer: answers[q.id] || ''
        })),
        writingText: exercise.type === 'scrittura' ? answers[`${exercise.id}_writing`] : undefined,
        recordingData: exercise.type === 'produzione_orale' ? recordingData : undefined
      });
    }

    const results = {
      exercises: evaluatedResults,
      completedAt: new Date().toISOString(),
      totalTime: exercises.reduce((acc, ex) => acc + ex.timer_seconds, 0)
    };

    onComplete(results);
  };

  const renderListeningExercise = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg mb-4">{currentExercise.prompt_it}</p>
        <div className="space-x-4">
          <Button 
            onClick={playAudio}
            disabled={isAudioLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAudioLoading ? '🔄 Caricando...' : '▶ Ascolta'}
          </Button>
          <Button 
            variant="outline" 
            onClick={pauseAudio}
            disabled={!audioPlayer || audioPlayer.paused}
          >
            ⏸ Pausa
          </Button>
          <Button 
            variant="outline" 
            onClick={replayAudio}
            disabled={isAudioLoading}
          >
            🔄 Riascolta
          </Button>
        </div>
        {audioError && (
          <p className="text-red-600 text-sm mt-2">{audioError}</p>
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
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg mb-4">{currentExercise.prompt_it}</p>
        <p className="text-sm text-muted-foreground">Registra la tua risposta (2-3 minuti)</p>
      </div>
      <AudioRecorder
        onRecordingComplete={(transcription) => {
          setRecordingData({ transcription, recorded: true, timestamp: Date.now() });
          toast({ title: "Registrazione e trascrizione completate!" });
        }}
        maxDuration={180}
      />
      {recordingData && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Trascrizione del tuo audio:</h4>
          <p className="text-sm">{recordingData.transcription}</p>
        </div>
      )}
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

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevExercise}
              disabled={currentExerciseIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Precedente
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSkipExercise}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Salta
            </Button>
          </div>

          <Button onClick={handleNextExercise}>
            {isLastExercise ? (
              <>
                <Send className="h-4 w-4 mr-2" />
                Invia per Correzione
              </>
            ) : (
              <>
                Avanti
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};