/**
 * Kòd Akademi — done pataje (lessons.json, exercises.json, ui.json, languages.json)
 * + tip TypeScript + normalize pou koreksyon egzèsis yo.
 */

// ---------- Tip ----------

export interface LessonCode {
  lang: string;
  code: string;
}

export interface Lesson {
  id: string;
  month: number; // 1-12
  domain: string;
  title_ht: string;
  title_fr?: string;
  title_en?: string;
  title_es?: string;
  body_ht: string;
  body_fr?: string;
  body_en?: string;
  body_es?: string;
  code: LessonCode;
  expert_note_ht: string;
  expert_note_fr?: string;
  expert_note_en?: string;
  expert_note_es?: string;
  checkpoints?: Checkpoint[];
}

export type ExerciseType = 'lib' | 'qcm' | 'konplete' | 'jwenn-erè';

export interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  prompt_ht: string;
  choices?: string[];
  code?: string;
  accepted: string[];
  correct_ht: string;
  explanation_ht: string;
}

/**
 * Checkpoint — ti egzèsis an tan reyèl apre chak konsèp kle nan yon leson.
 * Règ 3 itilizatè a: kesyon rapid qcm oswa vre/fo, koreksyon enstantane
 * ak sistèm 3-tantativ la. Nan tèks leson an: makè [[CHECK:<id>]].
 */
export type CheckpointType = 'qcm' | 'vrai-faux' | 'code';

export interface Checkpoint {
  id: string;
  type: CheckpointType;
  prompt_ht: string;
  choices?: string[];
  code?: string;
  accepted: string[];
  correct_ht: string;
  explanation_ht: string;
}

/** Retire makè [[CHECK:...]] nan yon tèks (pou vwa a pa li yo). */
export function stripCheckMarkers(s: string): string {
  return s.replace(/\s*\[\[CHECK:[^\]]+\]\]/g, '');
}

export type BodyBlock =
  | { kind: 'text'; text: string }
  | { kind: 'check'; id: string };

/** Koupe kò leson an an blòk tèks + checkpoint dapre makè [[CHECK:id]]. */
export function splitBodyWithChecks(body: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  const re = /\[\[CHECK:([^\]]+)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const text = body.slice(last, m.index).trim();
    if (text.length > 0) blocks.push({ kind: 'text', text });
    blocks.push({ kind: 'check', id: m[1] });
    last = m.index + m[0].length;
  }
  const tail = body.slice(last).trim();
  if (tail.length > 0) blocks.push({ kind: 'text', text: tail });
  if (blocks.length === 0 && body.trim().length > 0) {
    blocks.push({ kind: 'text', text: body.trim() });
  }
  return blocks;
}

/**
 * Konvèti yon checkpoint an `Exercise` pou grading.ts (3 tantativ) travay san chanjman.
 * 'vrai-faux' → 'qcm' (2 chwa A/B); 'code' → 'lib' (repons lib).
 */
export function checkpointToExercise(cp: Checkpoint): Exercise {
  return {
    id: cp.id,
    lessonId: '',
    type: cp.type === 'qcm' || cp.type === 'vrai-faux' ? 'qcm' : 'lib',
    prompt_ht: cp.prompt_ht,
    choices: cp.choices,
    code: cp.code,
    accepted: cp.accepted,
    correct_ht: cp.correct_ht,
    explanation_ht: cp.explanation_ht,
  };
}

export interface LanguageItem {
  name: string;
  description_ht: string;
  alternatives: string[];
}

export interface LanguageCategory {
  category_ht: string;
  items: LanguageItem[];
}

export type AppLang = 'ht' | 'fr' | 'en' | 'es';

// ---------- Enpòte JSON ----------

import lessonsJson from './data/lessons.json';
import exercisesJson from './data/exercises.json';
import languagesJson from './data/languages.json';

export const LESSONS: Lesson[] = lessonsJson as unknown as Lesson[];
export const EXERCISES: Exercise[] = exercisesJson as unknown as Exercise[];
export const LANGUAGE_CATEGORIES: LanguageCategory[] =
  languagesJson as unknown as LanguageCategory[];

// ---------- normalize ----------

/** Normalize yon repons: retire espas, miniskil, konprese espas yo. */
export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Tit leson an nan lang itilizatè a (fallback kreyòl). */
export function lessonTitle(lesson: Lesson, lang: AppLang): string {
  const key = `title_${lang}` as keyof Lesson;
  const v = lesson[key];
  return typeof v === 'string' && v.length > 0 ? v : lesson.title_ht;
}

/** Kò leson an nan lang itilizatè a (fallback kreyòl). */
export function lessonBody(lesson: Lesson, lang: AppLang): string {
  const key = `body_${lang}` as keyof Lesson;
  const v = lesson[key];
  return typeof v === 'string' && v.length > 0 ? v : lesson.body_ht;
}

/** Nòt ekspè a nan lang itilizatè a (fallback kreyòl). */
export function lessonExpertNote(lesson: Lesson, lang: AppLang): string {
  const key = `expert_note_${lang}` as keyof Lesson;
  const v = lesson[key];
  return typeof v === 'string' && v.length > 0 ? v : lesson.expert_note_ht;
}

export function lessonsForMonth(month: number): Lesson[] {
  return LESSONS.filter((l) => l.month === month);
}

export function exercisesForLesson(lessonId: string): Exercise[] {
  return EXERCISES.filter((e) => e.lessonId === lessonId);
}

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
