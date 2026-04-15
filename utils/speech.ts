import * as Speech from 'expo-speech';

export function speak(text: string, language: string = 'it-IT'): void {
  if (!text) return;
  Speech.speak(text, { language });
}

export function stopSpeech(): void {
  Speech.stop();
}
