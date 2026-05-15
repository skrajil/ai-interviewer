import { useState } from 'react';

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text) => {
    if (!window.speechSynthesis) {
      console.error('Text-to-speech not supported in this browser.');
      return;
    }

    // Cancel any current speech before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Optional: Tweak the voice settings to sound a bit more natural
    utterance.rate = 0.9; // Slightly slower than default for clarity
    utterance.pitch = 1.0; 

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stopSpeaking, isSpeaking };
};

export default useTextToSpeech;