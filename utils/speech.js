import * as Speech from 'expo-speech';

export function speak(text, language = 'it-IT') {
  if (!text) return;
  Speech.speak(text, { language });
}

export function stopSpeech() {
  Speech.stop();
}
