/** Kòd Akademi — tip navigasyon lokal (san react-navigation). */

import type { AppLang } from './data';
import type { Progress } from './storage';

export type Route =
  | { name: 'home' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'exercises'; lessonId: string }
  | { name: 'languages' }
  | { name: 'updates' }
  | { name: 'settings' }
  | { name: 'module'; moduleId: string }
  | { name: 'moduleLevel'; moduleId: string; levelId: string }
  | { name: 'moduleLesson'; moduleId: string; levelId: string; lessonId: string }
  | { name: 'moduleExercises'; moduleId: string; levelId: string; lessonId: string }
  | { name: 'program' }
  | { name: 'etape'; etapeId: string }
  | { name: 'guideModule'; etapeId: string; moduleId: string }
  | { name: 'guideLesson'; etapeId: string; moduleId: string; lessonId: string }
  | { name: 'guideExercises'; etapeId: string; moduleId: string; lessonId: string }
  | { name: 'guideProject'; etapeId: string; moduleId: string; projectId: string }
  | { name: 'resources' };

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
