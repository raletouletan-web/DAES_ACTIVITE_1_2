import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

const VoiceRecorder: React.FC<Props> = ({ onTranscript, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    transcriptRef.current = '';

    recognition.onstart = () => {
      setIsRecording(true);
      setIsTranscribing(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      transcriptRef.current = finalTranscript || interimTranscript;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setIsTranscribing(false);

      if (event.error === 'not-allowed') {
        alert("Veuillez autoriser l'accès au microphone pour utiliser la saisie vocale.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsTranscribing(true);

      // Simulate a brief transcription delay for UX
      setTimeout(() => {
        if (transcriptRef.current.trim()) {
          onTranscript(transcriptRef.current.trim());
        }
        setIsTranscribing(false);
      }, 800);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  if (!supported) {
    return (
      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl text-sm border border-amber-200">
        <MicOff size={18} />
        <span>La saisie vocale n'est pas supportée par votre navigateur. Veuillez utiliser Chrome ou Edge.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isTranscribing ? (
        <div className="flex items-center gap-3 bg-sky-50 px-5 py-3 rounded-xl border border-sky-200">
          <Loader2 size={20} className="text-sky-500 animate-spin" />
          <span className="text-sky-600 text-sm font-medium">Transcription en cours…</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : isRecording ? (
        <button
          onClick={stopRecording}
          disabled={disabled}
          className="flex items-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-3 rounded-xl border-2 border-red-300 transition-all duration-200 cursor-pointer"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-red-400 rounded-full animate-pulse-ring opacity-50" />
            <div className="relative w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-recording-pulse">
              <Square size={14} className="text-white" fill="white" />
            </div>
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold block">Arrêter l'enregistrement</span>
            <span className="text-xs text-red-400">Enregistrement en cours…</span>
          </div>
        </button>
      ) : (
        <button
          onClick={startRecording}
          disabled={disabled}
          className="flex items-center gap-3 bg-sky-50 hover:bg-sky-100 text-sky-600 px-5 py-3 rounded-xl border-2 border-sky-200 hover:border-sky-300 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
            <Mic size={16} className="text-white" />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold block">Saisie vocale</span>
            <span className="text-xs text-sky-400">Cliquez pour parler</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default VoiceRecorder;
