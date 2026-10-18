/** Kòd Akademi — tip navigasyon lokal (san react-navigation). */

import type { AppLang } from './data';
import type { Progress } from './storage';

export type Route =
  | { name: 'home' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'exercises'; lessonId: string }
  | { name: 'languages' }
  | { name: 'updates' }
  | { name: 'settings' };

export type Navigate = (route: Route) => void;

export interface ScreenProps {
  navigate: Navigate;
  goBack: () => void;
  lang: AppLang;
  progress: Progress;
  refresh: () => Promise<void>;
}

export const MONTH_NAMES_HT = [
  'Janvye', 'Fevriye', 'Mas', 'Avril', 'Me', 'Jen',
  'Jiyè', 'Out', 'Septanm', 'Oktòb', 'Novanm', 'Desanm',
];
