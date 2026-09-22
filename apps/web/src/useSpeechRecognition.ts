import { useCallback, useEffect, useRef, useState } from "react";

// Browser-native speech-to-text — no backend involved. The transcript is
// just handed back to the caller as text, which flows through the exact
// same parse pipeline as typed input.
export function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(
    () => typeof window !== "undefined" && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition),
  );

  const start = useCallback((onTranscript: (text: string) => void) => {
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    setError(null);
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      onTranscript(text);
    };
    recognition.onerror = () => {
      setError("Couldn't access the microphone.");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { isSupported, isListening, error, start, stop };
}
