import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Play, Pause, Mic, Square, Volume2 } from "lucide-react";

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
}

interface ExerciseRendererProps {
  exercise: Exercise;
  answers: any;
  onAnswersChange: (answers: any) => void;
  onStartTimer: () => void;
  timerActive: boolean;
}

const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({
  exercise,
  answers,
  onAnswersChange,
  onStartTimer,
  timerActive
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleAudioPlay = () => {
    if (audioRef.current && playCount < 2) {
      if (!timerActive) {
        onStartTimer();
      }
      
      audioRef.current.play();
      setIsPlaying(true);
      setPlayCount(prev => prev + 1);
    }
  };

  const handleAudioPause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleQuestionChange = (questionId: string, value: string) => {
    onAnswersChange({
      ...answers,
      [questionId]: value
    });
  };

  const handleTextChange = (text: string) => {
    onAnswersChange({
      ...answers,
      text
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        onAnswersChange({
          ...answers,
          audioBlob: blob
        });
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      if (!timerActive) {
        onStartTimer();
      }
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderAudioPlayer = () => {
    if (!exercise.content.audio_url) return null;

    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={isPlaying ? handleAudioPause : handleAudioPlay}
              disabled={playCount >= 2}
              variant={playCount >= 2 ? "outline" : "default"}
              size="lg"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 mr-2" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              {playCount >= 2 ? 'Audio esaurito' : `Ascolta (${2 - playCount}/2)`}
            </Button>
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Puoi ascoltare l'audio massimo 2 volte
            </span>
          </div>
          
          <audio
            ref={audioRef}
            src={exercise.content.audio_url}
            onEnded={handleAudioEnded}
            className="hidden"
          />
        </CardContent>
      </Card>
    );
  };

  const renderReadingText = () => {
    if (!exercise.content.text_it) return null;

    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-line text-foreground leading-relaxed">
              {exercise.content.text_it}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuestions = () => {
    if (!exercise.content.questions || exercise.content.questions.length === 0) return null;

    return (
      <div className="space-y-6">
        {exercise.content.questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">
                {index + 1}. {question.text}
              </h3>
              
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleQuestionChange(question.id, value)}
              >
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option} 
                      id={`${question.id}-${optionIndex}`} 
                    />
                    <Label 
                      htmlFor={`${question.id}-${optionIndex}`} 
                      className="cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderWritingArea = () => {
    return (
      <Card>
        <CardContent className="p-6">
          <Textarea
            placeholder="Scrivi qui la tua risposta..."
            value={answers.text || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-64"
          />
          
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>
              Parole: {(answers.text || '').split(/\s+/).filter(word => word.length > 0).length}
            </span>
            {exercise.content.min_words && exercise.content.max_words && (
              <span>
                Richieste: {exercise.content.min_words}-{exercise.content.max_words} parole
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRecording = () => {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-6">
            <div className="flex justify-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="w-32 h-32 rounded-full"
              >
                {isRecording ? (
                  <Square className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold">
                {isRecording ? 'Registrazione in corso...' : 'Premi per registrare'}
              </p>
              
              {isRecording && (
                <p className="text-lg font-mono">
                  {formatRecordingTime(recordingTime)}
                </p>
              )}
              
              {answers.audioBlob && !isRecording && (
                <p className="text-green-600 font-medium">
                  ✓ Registrazione completata
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Exercise prompt */}
      <Card>
        <CardContent className="p-6">
          <p className="text-lg leading-relaxed">
            {exercise.content.prompt_it}
          </p>
        </CardContent>
      </Card>

      {/* Audio player for listening exercises */}
      {(exercise.type === 'ascolto') && renderAudioPlayer()}

      {/* Reading text for reading exercises */}
      {(exercise.type === 'lettura') && renderReadingText()}

      {/* Questions for multiple choice exercises */}
      {['ascolto', 'lettura'].includes(exercise.type) && renderQuestions()}

      {/* Writing area for writing exercises */}
      {exercise.type === 'scrittura' && renderWritingArea()}

      {/* Recording interface for oral exercises */}
      {(exercise.type === 'orale' || exercise.type === 'produzione_orale') && renderRecording()}
    </div>
  );
};

export default ExerciseRenderer;