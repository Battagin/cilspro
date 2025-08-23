import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface AudioGeneratorProps {
  text: string;
  onAudioReady: (audioUrl: string) => void;
  exerciseId: string;
}

const AudioGenerator: React.FC<AudioGeneratorProps> = ({ 
  text, 
  onAudioReady, 
  exerciseId 
}) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (text && !audioUrl) {
      generateAudio();
    }
  }, [text]);

  const generateAudio = async () => {
    try {
      setIsGenerating(true);

      const { data, error } = await supabase.functions.invoke('generate-tts', {
        body: { 
          text: text,
          voice: 'alice' // Italian female voice
        }
      });

      if (error) throw error;

      if (data?.audioContent) {
        // Convert base64 to blob and create URL
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        
        setAudioUrl(url);
        onAudioReady(url);
      }

    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Errore audio",
        description: "Impossibile generare l'audio. Verrà utilizzato un audio di esempio.",
        variant: "destructive"
      });
      
      // Use fallback audio (empty audio data URL)
      const fallbackUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Hsr2QcBSaO1vPUgC0ELnLG8N+SRAsUVLLn+7VhFgY+ltryxnkpBSB6yu7bjSIEMGvH8N2QQAsTU7Pt6qhXFAlFnN/tr2QdBSaN1/TVgyMFNW/H8N2QQAoUVbPo7bdiFAY9l9vyxnkqBSB6yu7ZjyQFLWbH8N2QQAoUVbTo7LVjFQY9l9vyxHwrBSF6yu7ZjSUENG7H8N2QQAsTUbPn9LdnBSF6yu7bjCQFLWXD8OGXTgoURK3d8K9oFAY';
      setAudioUrl(fallbackUrl);
      onAudioReady(fallbackUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (audioUrl && playCount < 2) {
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      setPlayCount(prev => prev + 1);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  if (isGenerating) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">
              Generando áudio com IA... Aguarde alguns segundos.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!audioUrl) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Volume2 className="w-6 h-6 text-muted-foreground" />
            <span className="text-muted-foreground">
              Áudio não disponível
            </span>
            <Button onClick={generateAudio} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={playCount >= 2}
            variant={playCount >= 2 ? "outline" : "default"}
            size="lg"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 mr-2" />
            ) : (
              <Play className="w-5 h-5 mr-2" />
            )}
            {playCount >= 2 ? 'Áudio esgotado' : `Escutar (${2 - playCount}/2)`}
          </Button>
          <Volume2 className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Você pode escutar o áudio no máximo 2 vezes
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioGenerator;