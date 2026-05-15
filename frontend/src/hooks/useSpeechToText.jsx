import { useState, useEffect, useRef } from 'react';

const useSpeechToText = (onSilenceDetected) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  
  // NEW: Refs to keep track of the absolute latest state without closure issues
  const transcriptRef = useRef('');
  const isListeningRef = useRef(false);
  const isProcessingRef = useRef(false); // Prevents double-submissions from "late" text

  const SILENCE_DELAY = 4000;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Web Speech API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; 
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log("🎤 Mic started");
      isListeningRef.current = true;
    };

    recognition.onresult = (event) => {
      // If we are already sending to AI, ignore any delayed text trickling in
      if (isProcessingRef.current) return;

      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      
      transcriptRef.current = currentTranscript; // Update our ref
      setTranscript(currentTranscript); // Update UI

      clearTimeout(silenceTimerRef.current);
      
      // Our custom 4-second silence timer
      silenceTimerRef.current = setTimeout(() => {
        if (transcriptRef.current.trim() !== '' && !isProcessingRef.current) {
          console.log("⏱️ 4 seconds silence hit! Submitting...");
          isProcessingRef.current = true; // Lock it down
          onSilenceDetected(transcriptRef.current.trim());
          stopListening();
        }
      }, SILENCE_DELAY);
    };

    recognition.onend = () => {
      console.log("🛑 Mic ended by browser");
      clearTimeout(silenceTimerRef.current);

      // If we are already processing an answer, just let it close peacefully
      if (isProcessingRef.current) return;

      // Chrome killed the mic early! Let's check if the user actually said something.
      if (isListeningRef.current && transcriptRef.current.trim() !== '') {
        console.log("🚀 Browser closed mic early, but we have text. Submitting to AI!");
        isProcessingRef.current = true;
        onSilenceDetected(transcriptRef.current.trim());
        setIsListening(false);
        isListeningRef.current = false;
      } 
      // Chrome killed the mic early and they said NOTHING. Force restart it.
      else if (isListeningRef.current && transcriptRef.current.trim() === '') {
        console.log("🔄 Browser killed mic, but transcript is empty. Restarting...");
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Failed to force restart:", e);
        }
      } else {
        // User manually clicked stop
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      setIsListening(false);
      isListeningRef.current = false;
      clearTimeout(silenceTimerRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearTimeout(silenceTimerRef.current);
    };
  }, [onSilenceDetected]);

  const startListening = () => {
    console.log("▶️ Starting speech recognition");
    setTranscript('');
    transcriptRef.current = '';
    isProcessingRef.current = false; // Unlock processing
    setIsListening(true);
    isListeningRef.current = true;
    
    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.log("Start error:", err);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    clearTimeout(silenceTimerRef.current);
  };

  return { isListening, transcript, startListening, stopListening };
};

export default useSpeechToText;