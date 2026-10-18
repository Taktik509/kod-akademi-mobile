/** Kòd Akademi — lekti awotvwa leson yo ak expo-speech. */

import * as Speech from 'expo-speech';
import type { AppLang } from './data';

/** Pale tèks la awotvwa. Kreyòl pa gen vwa sistèm → itilize fransè kòm fallback. */
export function speakText(text: string, lang: AppLang): void {
  stopSpeaking();
  Speech.speak(text, {
    language: lang === 'ht' ? 'fr' : lang,
    rate: 0.95,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}

/** Pale leson an antye: tit + kò + nòt ekspè. */
export function speakLesson(
  title: string,
  body: string,
  expertNote: string,
  lang: AppLang,
): void {
  speakText(`${title}. ${body}. ${expertNote}`, lang);
}
