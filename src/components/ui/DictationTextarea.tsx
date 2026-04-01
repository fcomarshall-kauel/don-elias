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
  const stopTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  valueRef.current = value;
  onChangeRef.current = onChange;

  const forceStop = () => {
    clearTimeout(stopTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setTimeout(() => setIsListening(false), 300);
  };

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SR);
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = 'es-CL';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      clearTimeout(stopTimerRef.current);
      const transcript = event.results[0][0].transcript;
      const current = valueRef.current;
      onChangeRef.current(current ? `${current} ${transcript}` : transcript);
      setTimeout(() => forceStop(), 300);
    };

    recognition.onend = () => {
      clearTimeout(stopTimerRef.current);
      setIsListening(false);
    };
    recognition.onerror = () => {
      clearTimeout(stopTimerRef.current);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => { clearTimeout(stopTimerRef.current); recognition.abort(); };
  }, []);

  const toggle = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      forceStop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = setTimeout(() => forceStop(), 8000);
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
