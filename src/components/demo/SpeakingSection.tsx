import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Clock, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SpeakingSectionProps {
  exercise: {
    content: {
      prompt_it: string;
      timer_seconds?: number;
    };
  };
  onComplete: (transcription: string, evaluation: any) => void;
  timeLimit: number;
}

const SpeakingSection: React.FC<SpeakingSectionProps> = ({ 
  exercise, 
  onComplete, 
  timeLimit 
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted) {
      if (isRecording) {
        stopRecording();
      }
    }
  }, [timeLeft, isCompleted, isRecording]);

  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          const maxDuration = exercise.content.timer_seconds || 120;
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRecording, exercise.content.timer_seconds]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Process the audio with new endpoint
        await transcribeAndEvaluate(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Errore microfono",
        description: "Impossibile accedere al microfono. Verifica i permessi.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAndEvaluate = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Create FormData with the audio file
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('consegna', exercise.content.prompt_it);
      if (user?.id) {
        formData.append('user_id', user.id);
      }

      const response = await fetch('/api/eval/orale', {
        method: 'POST',
        body: formData
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

      setTranscription(data.transcript || '');
      setIsCompleted(true);
      onComplete(data.transcript, data.evaluation);
      
      toast({
        title: "Valutazione completata",
        description: "La tua produzione orale è stata valutata!"
      });
      
    } catch (error) {
      console.error('Error in transcription and evaluation:', error);
      toast({
        title: "Errore nella valutazione",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maxDuration = exercise.content.timer_seconds || 120;
  const canRecord = recordingTime < maxDuration && !isCompleted;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Produzione Orale
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">{exercise.content.prompt_it}</p>
        
        <div className="flex flex-col items-center space-y-6 p-8 bg-muted/50 rounded-lg">
          <div className="text-center space-y-2">
            <div className="text-3xl font-mono">
              {formatTime(recordingTime)}
            </div>
            <div className="text-sm text-muted-foreground">
              Tempo massimo: {formatTime(maxDuration)}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!isRecording ? (
              <Button 
                onClick={startRecording}
                disabled={!canRecord || isProcessing}
                variant="default"
                size="lg"
              >
                <Mic className="w-5 h-5 mr-2" />
                {recordingTime > 0 ? "Registra di nuovo" : "Inizia registrazione"}
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                variant="destructive"
                size="lg"
              >
                <MicOff className="w-5 h-5 mr-2" />
                Ferma registrazione
              </Button>
            )}
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600 animate-pulse">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-sm font-medium">Registrazione in corso...</span>
            </div>
          )}
          
          {audioURL && !isRecording && (
            <div className="flex flex-col items-center gap-2">
              <audio controls src={audioURL} className="w-full max-w-sm">
                Il tuo browser non supporta l'elemento audio.
              </audio>
              <p className="text-xs text-muted-foreground">
                Anteprima della registrazione
              </p>
            </div>
          )}
        </div>

        {transcription && (
          <div className="space-y-2">
            <h4 className="font-medium">Trascrizione:</h4>
            <div className="p-4 bg-muted/50 rounded-lg text-sm">
              "{transcription}"
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground">
              Elaborazione in corso... Trascrizione e valutazione dell'audio.
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="text-center py-4 text-green-600 font-medium">
            ✓ Produzione orale completata e valutata
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpeakingSection;