'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult?: (result: SpeechRecognitionResult) => void;
  onEnd?: () => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = 'es-CL', onResult, onEnd } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);

  // Mantener refs actualizadas
  onResultRef.current = onResult;
  onEndRef.current = onEnd;

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
      setTranscript(text);
      onResultRef.current?.({ transcript: text, isFinal: result.isFinal });
    };

    recognition.onend = () => {
      setIsListening(false);
      onEndRef.current?.();
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setTranscript('');
    recognitionRef.current.start();
    setIsListening(true);
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
  }, [isListening]);

  return { isListening, transcript, isSupported, startListening, stopListening };
}
