import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface SpeakOptions {
  rate?: number; // 0.1 - 10
  pitch?: number; // 0 - 2
}

function countWords(text: string) {
  return (text.trim().match(/\b\w+\b/g) || []).length;
}

export function useSpeechSynthesis(defaultLang: string = 'it-IT') {
  const [supported, setSupported] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const queueCountRef = useRef(0);

  // Load voices when available
  useEffect(() => {
    const hasSupport = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setSupported(hasSupport);
    if (!hasSupport) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const italianVoice = useMemo(() => {
    if (!voices.length) return null;
    // Prefer an Italian voice
    const it = voices.find(v => v.lang?.toLowerCase().startsWith('it'));
    if (it) return it;
    // Fallback: any female-like voice or default
    const femaleLike = voices.find(v => /female|women|alice|sara|laura/i.test(v.name));
    return femaleLike || voices[0];
  }, [voices]);

  const estimateDurationSec = useCallback((text: string, rate: number = 1.0) => {
    // Rough estimate: default ~170 wpm at rate 1.0
    const baseWpm = 170;
    const words = countWords(text);
    const baseSeconds = (words / baseWpm) * 60; // at rate 1.0
    // Web Speech duration roughly inversely proportional to rate
    const seconds = baseSeconds / Math.max(rate, 0.1);
    return seconds;
  }, []);

  const recommendedRateForText = useCallback((text: string, targetSeconds: number = 24) => {
    const baseWpm = 170;
    const words = countWords(text);
    const baseSeconds = (words / baseWpm) * 60; // at rate 1.0
    // rate = baseSeconds / targetSeconds (clamped)
    const raw = baseSeconds / Math.max(targetSeconds, 1);
    // Clamp between 0.7 (slower -> longer) and 1.0 (normal)
    const rate = Math.min(1.0, Math.max(0.7, raw));
    return rate;
  }, []);

  const speak = useCallback((text: string, opts: SpeakOptions = {}) => {
    if (!supported) return;
    // Stop any current speech
    window.speechSynthesis.cancel();
    setPaused(false);

    const rate = typeof opts.rate === 'number' ? opts.rate : 1.0;
    const pitch = typeof opts.pitch === 'number' ? opts.pitch : 1.0;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    queueCountRef.current = lines.length;
    if (queueCountRef.current === 0) return;

    setSpeaking(true);

    lines.forEach((line, idx) => {
      const uttr = new SpeechSynthesisUtterance(line);
      uttr.lang = italianVoice?.lang || defaultLang;
      if (italianVoice) uttr.voice = italianVoice;
      uttr.rate = rate;
      uttr.pitch = pitch;

      uttr.onend = () => {
        queueCountRef.current -= 1;
        if (queueCountRef.current <= 0) {
          setSpeaking(false);
          setPaused(false);
        }
      };
      uttr.onpause = () => setPaused(true);
      uttr.onresume = () => setPaused(false);

      // Small stagger to ensure queue order
      setTimeout(() => window.speechSynthesis.speak(uttr), idx * 10);
    });
  }, [supported, italianVoice, defaultLang]);

  const pause = useCallback(() => {
    if (!supported) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    }
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    queueCountRef.current = 0;
  }, [supported]);

  return {
    supported,
    voices,
    speaking,
    paused,
    speak,
    pause,
    resume,
    stop,
    estimateDurationSec,
    recommendedRateForText,
  };
}
