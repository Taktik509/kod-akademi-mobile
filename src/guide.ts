/**
 * Kòd Akademi — Gid Konplè Pwogramasyon kòm kolòn vetebral kourikoulòm nan.
 * Chaje src/data/guide/guide.json (7 etap → 16 modil → leson/egzèsis/pwojè)
 * ak resources.json (lyen ofisyèl). Egzèsis gid yo konvèti nan tip `Exercise`
 * pou re-itilize grading.ts (3 tantativ), ExerciseDetail, ak XP storage.
 */

import type { Checkpoint, Exercise } from './data';

import guideJson from './data/guide/guide.json';
import resourcesJson from './data/guide/resources.json';

export interface GuideExercise {
  id: string;
  type: 'qcm' | 'code';
  prompt_ht: string;
  choices?: string[];
  code?: string;
  accepted: string[];
  correct_ht: string;
  explanation_ht: string;
}

export interface GuideLesson {
  id: string;
  title_ht: string;
  body_ht: string;
  code: string;
  code_lang: string;
  expert_note_ht: string;
  exercises: GuideExercise[];
  checkpoints?: Checkpoint[];
}

export interface GuideProject {
  id: string;
  title_ht: string;
  description_ht: string;
  objectives_ht: string[];
  criteria_ht: string[];
}

export interface GuideModule {
  id: string;
  title_ht: string;
  description_ht: string;
  pass_criteria_ht?: string;
  related_lessons: string[];
  related_modules: string[];
  lessons: GuideLesson[];
  projects: GuideProject[];
}

export interface GuideEtape {
  id: string;
  numero: number;
  icon: string;
  title_ht: string;
  description_ht: string;
  modules: GuideModule[];
}

export interface Guide {
  id: string;
  title_ht: string;
  version: string;
  description_ht: string;
  etapes: GuideEtape[];
}

export interface GuideResource {
  name: string;
  url: string;
  description_ht: string;
}

export interface GuideResourceGroup {
  id: string;
  title_ht: string;
  items: GuideResource[];
}

export const GUIDE: Guide = guideJson as unknown as Guide;
export const RESOURCE_GROUPS: GuideResourceGroup[] =
  (resourcesJson as unknown as { groups: GuideResourceGroup[] }).groups;

export function getEtape(etapeId: string): GuideEtape | undefined {
  return GUIDE.etapes.find((e) => e.id === etapeId);
}

export function getGuideModule(
  etapeId: string,
  moduleId: string,
): { etape: GuideEtape; module: GuideModule } | undefined {
  const etape = getEtape(etapeId);
  if (!etape) return undefined;
  const module = etape.modules.find((m) => m.id === moduleId);
  if (!module) return undefined;
  return { etape, module };
}

export function getGuideLesson(
  etapeId: string,
  moduleId: string,
  lessonId: string,
):
  | { etape: GuideEtape; module: GuideModule; lesson: GuideLesson }
  | undefined {
  const found = getGuideModule(etapeId, moduleId);
  if (!found) return undefined;
  const lesson = found.module.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  return { etape: found.etape, module: found.module, lesson };
}

export function getGuideProject(
  etapeId: string,
  moduleId: string,
  projectId: string,
):
  | { etape: GuideEtape; module: GuideModule; project: GuideProject }
  | undefined {
  const found = getGuideModule(etapeId, moduleId);
  if (!found) return undefined;
  const project = found.module.projects.find((p) => p.id === projectId);
  if (!project) return undefined;
  return { etape: found.etape, module: found.module, project };
}

/**
 * Konvèti yon egzèsis gid an `Exercise` pou grading.ts ak ExerciseDetail.
 * Tip 'code' → 'lib' (repons lib), 'qcm' rete 'qcm'.
 */
export function guideExerciseToExercise(
  lessonId: string,
  ex: GuideExercise,
): Exercise {
  return {
    id: ex.id,
    lessonId,
    type: ex.type === 'qcm' ? 'qcm' : 'lib',
    prompt_ht: ex.prompt_ht,
    choices: ex.choices,
    code: ex.code,
    accepted: ex.accepted,
    correct_ht: ex.correct_ht,
    explanation_ht: ex.explanation_ht,
  };
}

/** Kantite total leson gid (pou pwogrè). */
export function countGuideLessons(): number {
  return GUIDE.etapes.reduce(
    (n, e) => n + e.modules.reduce((m, mod) => m + mod.lessons.length, 0),
    0,
  );
}

/** Kantite total egzèsis gid (pou pwogrè). */
export function countGuideExercises(): number {
  return GUIDE.etapes.reduce(
    (n, e) =>
      n +
      e.modules.reduce(
        (m, mod) =>
          m + mod.lessons.reduce((k, l) => k + l.exercises.length, 0),
        0,
      ),
    0,
  );
}
