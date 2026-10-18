/** Kòd Akademi — pwogrè + lang, pèsiste ak AsyncStorage. */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppLang } from './data';

export interface Progress {
  doneLessons: string[];
  doneExercises: string[];
  doneCheckpoints: string[];
  xp: number;
}

const PROGRESS_KEY = 'kod-akademi:progress:v1';
const LANG_KEY = 'kod-akademi:lang:v1';

export const EMPTY_PROGRESS: Progress = {
  doneLessons: [],
  doneExercises: [],
  doneCheckpoints: [],
  xp: 0,
};

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...EMPTY_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      doneLessons: Array.isArray(parsed.doneLessons) ? parsed.doneLessons : [],
      doneExercises: Array.isArray(parsed.doneExercises) ? parsed.doneExercises : [],
      doneCheckpoints: Array.isArray(parsed.doneCheckpoints) ? parsed.doneCheckpoints : [],
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
    };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export async function saveProgress(progress: Progress): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export async function markLessonDone(lessonId: string): Promise<Progress> {
  const p = await loadProgress();
  if (!p.doneLessons.includes(lessonId)) p.doneLessons.push(lessonId);
  await saveProgress(p);
  return p;
}

/** Make egzèsis fini + ajoute XP (10 pa defo). */
export async function markExerciseDone(exerciseId: string, xpGain = 10): Promise<Progress> {
  const p = await loadProgress();
  if (!p.doneExercises.includes(exerciseId)) {
    p.doneExercises.push(exerciseId);
    p.xp += xpGain;
  }
  await saveProgress(p);
  return p;
}

/** Make checkpoint (kesyon rapid) fini + ti XP (+2). Pa konte nan total egzèsis yo. */
export async function markCheckpointDone(checkpointId: string): Promise<Progress> {
  const p = await loadProgress();
  if (!p.doneCheckpoints.includes(checkpointId)) {
    p.doneCheckpoints.push(checkpointId);
    p.xp += 2;
  }
  await saveProgress(p);
  return p;
}

export async function loadLang(): Promise<AppLang> {
  try {
    const raw = await AsyncStorage.getItem(LANG_KEY);
    if (raw === 'ht' || raw === 'fr' || raw === 'en' || raw === 'es') return raw;
    return 'ht';
  } catch {
    return 'ht';
  }
}

export async function saveLang(lang: AppLang): Promise<void> {
  await AsyncStorage.setItem(LANG_KEY, lang);
}
