import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseLiveSpeechAgentOptions {
  language?: string;
  onTranscriptChange?: (text: string) => void;
}

export function useLiveSpeechAgent({
  language = 'en-IN',
  onTranscriptChange,
}: UseLiveSpeechAgentOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [liveInterim, setLiveInterim] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interimStr = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += transcriptSegment + ' ';
          } else {
            interimStr += transcriptSegment;
          }
        }

        setLiveInterim(interimStr);

        if (finalStr && onTranscriptChange) {
          onTranscriptChange(finalStr.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning/error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission blocked. Please allow microphone access in your browser or Android settings.');
          setIsListening(false);
          shouldListenRef.current = false;
        } else if (event.error === 'no-speech') {
          // Normal timeout when doctor pauses speaking
        } else {
          setSpeechError(`Voice capture note: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If user didn't explicitly click stop, automatically restart continuous listener
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.warn('Restart speech recognition error:', e);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
          setLiveInterim('');
        }
      };

      recognitionRef.current = recognition;
    } catch (e: any) {
      console.error('Speech recognition initialization error:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        shouldListenRef.current = false;
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [language, onTranscriptChange]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldListenRef.current = true;
    setSpeechError(null);
    try {
      recognitionRef.current.lang = language || 'en-IN';
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
      console.warn('Speech start caught:', e);
    }
  }, [language]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    setIsListening(false);
    setLiveInterim('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    liveInterim,
    speechError,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
