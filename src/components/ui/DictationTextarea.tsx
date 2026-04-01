'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface DictationTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function DictationTextarea({ value, onChange, placeholder, className = '', rows = 5 }: DictationTextareaProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  valueRef.current = value;
  onChangeRef.current = onChange;

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
      const current = valueRef.current;
      onChangeRef.current(current ? `${current} ${transcript}` : transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
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
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />
      {isSupported && (
        <button
          type="button"
          onClick={toggle}
          className={`absolute bottom-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
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
