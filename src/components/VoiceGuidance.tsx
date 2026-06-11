import React, { createContext, useContext, useEffect, useState } from 'react';

interface VoiceContextProps {
  enabled: boolean;
  setEnabled: (val: boolean) => void;
  speak: (text: string) => void;
  stop: () => void;
}

const VoiceContext = createContext<VoiceContextProps>({
  enabled: false,
  setEnabled: () => {},
  speak: () => {},
  stop: () => {}
});

export const useVoiceGuidance = () => useContext(VoiceContext);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('ecotracker_voice_guidance') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('ecotracker_voice_guidance', String(enabled));
    if (!enabled) {
      window.speechSynthesis?.cancel();
    } else {
      speak("Voice guidance enabled. Hover or select options to read aloud.");
    }
  }, [enabled]);

  const speak = (text: string) => {
    if (!enabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Cancel current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for better comprehension
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <VoiceContext.Provider value={{ enabled, setEnabled, speak, stop }}>
      {children}
    </VoiceContext.Provider>
  );
};

// A helper attribute injector for speaking on hover/focus
export function useVoiceTrigger(text: string) {
  const { speak } = useVoiceGuidance();
  return {
    onMouseEnter: () => speak(text),
    onFocus: () => speak(text)
  };
}
