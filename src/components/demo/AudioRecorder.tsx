import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onRecordingComplete: (transcription: string) => void;
  maxDuration?: number; // in seconds
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete, 
  maxDuration = 180 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

      toast({
        title: "Registrazione iniziata",
        description: "Parla chiaramente nel microfono"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Errore",
        description: "Impossibile accedere al microfono",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast({
        title: "Registrazione completata",
        description: "Ora puoi riascoltare o confermare"
      });
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);

      audio.play();
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const confirmRecording = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const response = await supabase.functions.invoke('transcribe-audio', {
          body: { audioData: base64Audio }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const transcription = response.data?.text || "";
        
        if (transcription.trim()) {
          onRecordingComplete(transcription);
          toast({
            title: "Trascrizione completata",
            description: "Il tuo audio è stato analizzato"
          });
        } else {
          toast({
            title: "Attenzione",
            description: "Non è stato possibile trascrivere l'audio. Riprova.",
            variant: "destructive"
          });
        }
      };
    } catch (error) {
      console.error('Error transcribing:', error);
      toast({
        title: "Errore trascrizione",
        description: "Riprova la registrazione",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 text-center">
      <div className="bg-muted p-6 rounded-lg">
        <div className="text-2xl font-mono mb-4">
          {formatTime(recordingTime)} / {formatTime(maxDuration)}
        </div>
        
        {!audioBlob ? (
          <div className="space-y-4">
            <Button
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={isRecording ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90"}
            >
              {isRecording ? (
                <>
                  <Square className="h-5 w-5 mr-2" />
                  Ferma Registrazione
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Inizia Registrazione
                </>
              )}
            </Button>
            
            {isRecording && (
              <div className="text-sm text-muted-foreground">
                🔴 Registrazione in corso... Parla chiaramente nel microfono
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={isPlaying ? pausePlayback : playRecording}
                disabled={isTranscribing}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausa
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Riascolta
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={resetRecording}
                disabled={isTranscribing}
              >
                🔄 Riregistra
              </Button>
            </div>
            
            <Button
              size="lg"
              onClick={confirmRecording}
              disabled={isTranscribing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isTranscribing ? (
                <>
                  🔄 Analizzando...
                </>
              ) : (
                <>
                  ✅ Conferma Registrazione
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};