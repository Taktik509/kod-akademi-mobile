/**
 * Kòd Akademi — 16 modil langaj (src/data/modules/*.json).
 * Chaje via import estatik; ekspòte fonksyon aksè pou ekran yo.
 * Egzèsis modil yo konvèti nan tip `Exercise` (src/data.ts) pou re-itilize
 * grading.ts, konpozan ExerciseDetail, ak XP storage san chanjman.
 */

import type { Checkpoint, Exercise } from './data';

import bashJson from './data/modules/bash.json';
import cssJson from './data/modules/css.json';
import dartJson from './data/modules/dart.json';
import flutterJson from './data/modules/flutter.json';
import htmlJson from './data/modules/html.json';
import javascriptJson from './data/modules/javascript.json';
import kotlinJson from './data/modules/kotlin.json';
import nodejsJson from './data/modules/nodejs.json';
import phpJson from './data/modules/php.json';
import postgresqlJson from './data/modules/postgresql.json';
import pythonJson from './data/modules/python.json';
import reactNativeJson from './data/modules/react-native.json';
import sqlJson from './data/modules/sql.json';
import sqliteJson from './data/modules/sqlite.json';
import swiftJson from './data/modules/swift.json';
import typescriptJson from './data/modules/typescript.json';

export interface ModuleExercise {
  id: string;
  type: 'qcm' | 'code';
  prompt_ht: string;
  choices?: string[];
  code?: string;
  accepted: string[];
  correct_ht: string;
  explanation_ht: string;
}

export interface ModuleLesson {
  id: string;
  title_ht: string;
  body_ht: string;
  code: string;
  code_lang: string;
  expert_note_ht: string;
  exercises: ModuleExercise[];
  checkpoints?: Checkpoint[];
}

export interface ModuleLevel {
  id: string;
  title_ht: string;
  lessons: ModuleLesson[];
}

export interface Module {
  id: string;
  name: string;
  category_ht: string;
  description_ht: string;
  levels: ModuleLevel[];
}

function asModule(j: unknown): Module {
  return j as Module;
}

export const MODULES: Module[] = [
  asModule(bashJson),
  asModule(cssJson),
  asModule(dartJson),
  asModule(flutterJson),
  asModule(htmlJson),
  asModule(javascriptJson),
  asModule(kotlinJson),
  asModule(nodejsJson),
  asModule(phpJson),
  asModule(postgresqlJson),
  asModule(pythonJson),
  asModule(reactNativeJson),
  asModule(sqlJson),
  asModule(sqliteJson),
  asModule(swiftJson),
  asModule(typescriptJson),
];

export function getModule(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getLevel(
  moduleId: string,
  levelId: string,
): { module: Module; level: ModuleLevel } | undefined {
  const module = getModule(moduleId);
  if (!module) return undefined;
  const level = module.levels.find((l) => l.id === levelId);
  if (!level) return undefined;
  return { module, level };
}

export function getLesson(
  moduleId: string,
  levelId: string,
  lessonId: string,
): { module: Module; level: ModuleLevel; lesson: ModuleLesson } | undefined {
  const found = getLevel(moduleId, levelId);
  if (!found) return undefined;
  const lesson = found.level.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  return { module: found.module, level: found.level, lesson };
}

/**
 * Konvèti yon egzèsis modil an `Exercise` (src/data.ts) pou grading.ts
 * ak ExerciseDetail travay san chanjman. Tip 'code' → 'lib' (repons lib).
 */
export function moduleExerciseToExercise(
  lesson: ModuleLesson,
  ex: ModuleExercise,
): Exercise {
  return {
    id: ex.id,
    lessonId: lesson.id,
    type: ex.type === 'qcm' ? 'qcm' : 'lib',
    prompt_ht: ex.prompt_ht,
    choices: ex.choices,
    code: ex.code,
    accepted: ex.accepted,
    correct_ht: ex.correct_ht,
    explanation_ht: ex.explanation_ht,
  };
}

/** Jwenn modil ki koresponn ak non yon langaj nan languages.json ('Node.js' → nodejs...). */
export function moduleForLanguageName(name: string): Module | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
  const target = norm(name);
  return MODULES.find((m) => norm(m.id) === target || norm(m.name) === target);
}
