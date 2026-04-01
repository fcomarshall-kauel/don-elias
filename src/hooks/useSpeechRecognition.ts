'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  silenceTimeout?: number; // ms de silencio antes de forzar stop (default: 2500)
  maxDuration?: number;    // ms máximo de escucha total (default: 10000)
  onResult?: (result: SpeechRecognitionResult) => void;
  onEnd?: () => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = 'es-CL', silenceTimeout = 2500, maxDuration = 10000, onResult, onEnd } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasResultRef = useRef(false);

  onResultRef.current = onResult;
  onEndRef.current = onEnd;

  const forceStop = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    clearTimeout(maxTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    // Safety: si onend no se dispara (iOS), forzar el estado
    setTimeout(() => {
      setIsListening(prev => {
        if (prev) onEndRef.current?.();
        return false;
      });
    }, 300);
  }, []);

  const resetSilenceTimer = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      // Si ya tuvimos resultado, forzar cierre tras silencio
      if (hasResultRef.current) {
        forceStop();
      }
    }, silenceTimeout);
  }, [silenceTimeout, forceStop]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      hasResultRef.current = true;
      setTranscript(text);
      onResultRef.current?.({ transcript: text, isFinal: result.isFinal });

      if (result.isFinal) {
        // Resultado final: cerrar pronto
        clearTimeout(silenceTimerRef.current);
        clearTimeout(maxTimerRef.current);
        setTimeout(() => forceStop(), 500);
      } else {
        // Resultado interim: resetear timer de silencio
        resetSilenceTimer();
      }
    };

    recognition.onend = () => {
      clearTimeout(silenceTimerRef.current);
      clearTimeout(maxTimerRef.current);
      setIsListening(false);
      onEndRef.current?.();
    };

    recognition.onerror = (event) => {
      clearTimeout(silenceTimerRef.current);
      clearTimeout(maxTimerRef.current);
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      clearTimeout(silenceTimerRef.current);
      clearTimeout(maxTimerRef.current);
      recognition.abort();
    };
  }, [lang, forceStop, resetSilenceTimer]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    hasResultRef.current = false;
    setTranscript('');
    recognitionRef.current.start();
    setIsListening(true);

    // Timer de silencio inicial (por si nunca llega un resultado)
    resetSilenceTimer();

    // Timer máximo absoluto — nunca escuchar más de maxDuration
    clearTimeout(maxTimerRef.current);
    maxTimerRef.current = setTimeout(() => forceStop(), maxDuration);
  }, [isListening, maxDuration, resetSilenceTimer, forceStop]);

  const stopListening = useCallback(() => {
    forceStop();
  }, [forceStop]);

  return { isListening, transcript, isSupported, startListening, stopListening };
}
