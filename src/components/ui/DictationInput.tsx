'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface DictationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function DictationInput({ value, onChange, placeholder, className = '', onKeyDown }: DictationInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SR);
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = 'es-CL';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      // Append al valor actual con espacio si ya hay texto
      onChange(value ? `${value} ${transcript}` : transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantener el value actualizado para el onresult
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const current = valueRef.current;
      onChangeRef.current(current ? `${current} ${transcript}` : transcript);
    };
  }, []);

  const toggle = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="relative flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 ${className}`}
        onKeyDown={onKeyDown}
      />
      {isSupported && (
        <button
          type="button"
          onClick={toggle}
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer self-center ${
            isListening
              ? 'bg-red-500 text-white'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
          }`}
          style={isListening ? { animation: 'pulse 1.5s ease-in-out infinite' } : undefined}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}
