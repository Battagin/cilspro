import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface AudioGeneratorProps {
  text: string;
  onAudioReady: (audioUrl: string) => void;
  exerciseId: string;
  originalUrl?: string;
}

const AudioGenerator: React.FC<AudioGeneratorProps> = ({ 
  text, 
  onAudioReady, 
  exerciseId,
  originalUrl,
}) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFallbackTTS, setIsFallbackTTS] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!text) return;
    diagnoseAndPrepare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, originalUrl]);

  const logDiag = (msg: string) => {
    console.log(`[AudioDiag ${exerciseId}]`, msg);
    setDiagnostics((prev) => [...prev.slice(-10), msg]);
  };

  const validateOriginalAudio = async (url: string): Promise<boolean> => {
    try {
      logDiag(`Validando URL original: ${url}`);
      const resp = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (!resp.ok) {
        logDiag(`Falha HTTP ${resp.status}`);
        return false;
      }
      const ct = resp.headers.get('content-type') || '';
      if (!ct.toLowerCase().includes('audio')) {
        logDiag(`MIME inválido: ${ct}`);
        return false;
      }
      const len = parseInt(resp.headers.get('content-length') || '0', 10);
      if (len > 0 && len < 10240) {
        logDiag(`Tamanho muito pequeno: ${len}`);
        // não retorna ainda; ainda tentaremos metadata
      }
      // Testa metadata/duração
      await new Promise<void>((resolve, reject) => {
        const el = new Audio();
        const onLoaded = () => {
          if (el.duration && el.duration > 0) {
            resolve();
          } else {
            reject(new Error('Duração zero'));
          }
        };
        const onError = () => reject(new Error('Erro no carregamento do áudio'));
        const timeout = setTimeout(() => reject(new Error('Timeout metadata')), 6000);
        el.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          onLoaded();
        });
        el.addEventListener('error', () => {
          clearTimeout(timeout);
          onError();
        });
        el.preload = 'metadata';
        el.src = url;
      });
      logDiag('Áudio original validado com sucesso');
      return true;
    } catch (e) {
      logDiag(`Validação falhou: ${(e as Error).message}`);
      return false;
    }
  };

  const generateTTSFromText = async () => {
    try {
      setIsGenerating(true);
      setIsFallbackTTS(true);
      logDiag('Gerando TTS via ElevenLabs...');
      
      // Check if this is a listening exercise that needs dialogue generation
      const isListeningExercise = text.toLowerCase().includes('dialogo') || 
                                 text.toLowerCase().includes('ascolta') ||
                                 text.toLowerCase().includes('conversazione');
      
      const { data, error } = await supabase.functions.invoke('generate-tts', {
        body: { 
          text, 
          voice: 'alice',
          isListeningExercise 
        }
      });
      if (error) throw error;
      if (!data?.audioContent) throw new Error('TTS sem conteúdo');
      if (data.audioContent.length < 10240) {
        logDiag('TTS muito curto, possível bloqueio da API');
      }
      const binary = atob(data.audioContent);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      onAudioReady(url);
      logDiag('TTS pronto e associado');
    } catch (err) {
      console.error('Erro no TTS:', err);
      toast({
        title: 'Erro no TTS',
        description: 'Não foi possível gerar áudio agora.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const diagnoseAndPrepare = async () => {
    // Tenta áudio original primeiro (se existir e não for marcador de geração)
    if (originalUrl && originalUrl !== 'GENERATE_ON_DEMAND') {
      const ok = await validateOriginalAudio(originalUrl);
      if (ok) {
        setIsFallbackTTS(false);
        setAudioUrl(originalUrl);
        onAudioReady(originalUrl);
        return;
      }
      logDiag('Original falhou — ativando fallback TTS.');
    }
    await generateTTSFromText();
  };

  if (isGenerating) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">
              Gerando áudio com IA... aguarde.
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
            <Button onClick={diagnoseAndPrepare} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Usa i controlli per riprodurre, mettere in pausa e avanzare.</span>
          </div>
          {isFallbackTTS && (
            <div className="text-xs text-muted-foreground">
              Audio generato automaticamente (TTS)
            </div>
          )}
        </div>
        <audio
          controls
          preload="metadata"
          src={audioUrl}
          aria-label="Ascolta l’audio dell’esercizio"
          className="w-full"
          onError={() => logDiag('Erro no elemento de áudio')}
        />
        {isFallbackTTS && (
          <div className="text-xs text-muted-foreground">Modalità di contingenza TTS</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioGenerator;