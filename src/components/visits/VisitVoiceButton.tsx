'use client';
import { useCallback, useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { parseVisitVoiceCommand, VisitVoiceCommand } from '@/lib/voiceParser';
import { Mic, MicOff } from 'lucide-react';

interface VisitVoiceButtonProps {
  onCommand: (command: VisitVoiceCommand) => void;
}

export function VisitVoiceButton({ onCommand }: VisitVoiceButtonProps) {
  const [lastTranscript, setLastTranscript] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [parsedCommand, setParsedCommand] = useState<VisitVoiceCommand | null>(null);

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    lang: 'es-CL',
    onResult: ({ transcript: t, isFinal }) => {
      setLastTranscript(t);
      if (isFinal) {
        const command = parseVisitVoiceCommand(t);
        setParsedCommand(command);
        setShowFeedback(true);

        const hasData = command.apt || command.visitorName;
        if (hasData) {
          setTimeout(() => {
            onCommand(command);
            setShowFeedback(false);
            setParsedCommand(null);
            setLastTranscript('');
          }, 1200);
        } else {
          setTimeout(() => {
            setShowFeedback(false);
            setParsedCommand(null);
            setLastTranscript('');
          }, 2500);
        }
      }
    },
    onEnd: useCallback(() => {}, []),
  });

  if (!isSupported) return null;

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setShowFeedback(false);
      setParsedCommand(null);
      startListening();
    }
  };

  return (
    <>
      {(isListening || showFeedback) && (
        <div className="fixed bottom-24 right-6 z-50 max-w-sm animate-[slideIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 px-5 py-4">
            {isListening && !showFeedback && (
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:300ms]" />
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  {lastTranscript || 'Escuchando...'}
                </p>
              </div>
            )}
            {showFeedback && parsedCommand && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Escuché:</p>
                <p className="text-sm font-semibold text-slate-700 mb-2">&ldquo;{lastTranscript}&rdquo;</p>
                {(parsedCommand.apt || parsedCommand.visitorName) ? (
                  <div className="flex flex-wrap gap-1.5">
                    {parsedCommand.apt && (
                      <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Depto. {parsedCommand.apt}
                      </span>
                    )}
                    {parsedCommand.visitorName && (
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {parsedCommand.visitorName}
                      </span>
                    )}
                    {parsedCommand.type && (
                      <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {parsedCommand.type === 'personal' ? 'Personal' : parsedCommand.type === 'empleada' ? 'Empleada' : 'Mantención'}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 font-medium">No entendí. Intenta: &ldquo;Visita para el 502, Juan Pérez&rdquo;</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleClick}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all cursor-pointer ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-200'
            : 'bg-[#0056D2] hover:bg-primary-dark shadow-blue-200'
        }`}
        style={isListening ? { animation: 'pulse 1.5s ease-in-out infinite' } : undefined}
      >
        {isListening ? (
          <MicOff className="w-7 h-7 text-white" />
        ) : (
          <Mic className="w-7 h-7 text-white" />
        )}
      </button>
    </>
  );
}
