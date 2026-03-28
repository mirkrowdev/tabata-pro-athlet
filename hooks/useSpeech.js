import * as Speech from 'expo-speech';

export default function useSpeech() {
  const speak = (text) => {
    if (!text) return;
    Speech.speak(text, { language: 'it-IT' });
  };

  const stop = () => {
    Speech.stop();
  };

  return { speak, stop };
}
