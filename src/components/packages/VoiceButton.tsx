'use client';
import { useCallback, useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { parseVoiceCommand, VoiceCommand } from '@/lib/voiceParser';
import { Mic, MicOff } from 'lucide-react';

interface VoiceButtonProps {
  onCommand: (command: VoiceCommand) => void;
}

export function VoiceButton({ onCommand }: VoiceButtonProps) {
  const [lastTranscript, setLastTranscript] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [parsedCommand, setParsedCommand] = useState<VoiceCommand | null>(null);

  const handleEnd = useCallback(() => {
    // Se ejecuta cuando termina de escuchar
  }, []);

  const { isListening, transcript, isSupported, startListening, stopListening } = useSpeechRecognition({
    lang: 'es-CL',
    onResult: ({ transcript: t, isFinal }) => {
      setLastTranscript(t);
      if (isFinal) {
        const command = parseVoiceCommand(t);
        setParsedCommand(command);
        setShowFeedback(true);

        if (command.action !== 'unknown') {
          // Dar tiempo para mostrar feedback antes de ejecutar
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
    onEnd: handleEnd,
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
      {/* Transcript bubble */}
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
                {parsedCommand.action !== 'unknown' ? (
                  <div className="flex flex-wrap gap-1.5">
                    {parsedCommand.type && (
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {parsedCommand.type === 'food' ? 'Comida' : parsedCommand.type === 'supermercado' ? 'Super' : parsedCommand.type === 'normal' ? 'Paquete' : 'Otros'}
                      </span>
                    )}
                    {parsedCommand.apt && (
                      <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Depto. {parsedCommand.apt}
                      </span>
                    )}
                    {parsedCommand.provider && (
                      <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {parsedCommand.provider}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 font-medium">No entendí el comando. Intenta: &ldquo;Paquete para el 502&rdquo;</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mic button */}
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
