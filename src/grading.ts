/**
 * Kòd Akademi — lojik koreksyon egzèsis (RÈG EGZÈSIS OBLIGATWA).
 *
 * Chak egzèsis gen yon chan tèks + bouton soumèt. Repons lan normalize
 * (trim, miniskil, konprese espas) epi konpare ak `accepted`.
 * - Bon → "Bon! ✅" + explanation_ht + XP +10, egzèsis make fini.
 * - Pa bon → konte tantativ; < 3 → "Pa bon. Reeseye 🔄" + "{n} chans ankò".
 * - Tantativ == 3 → revele "Men bon repons lan:" + correct_ht + explanation_ht (pa gen XP).
 * Pou qcm: chwa yo afiche kòm lis A/B/C/D; aksepte lèt la oswa tèks la.
 */

import { normalize, type Exercise } from './data';

const QCM_LETTERS = ['a', 'b', 'c', 'd'];

/** Retire prefiks "A) " / "B) " elatriye nan yon chwa oswa repons kòrèk. */
export function stripChoicePrefix(s: string): string {
  return s.replace(/^[a-dA-D]\)\s*/, '').trim();
}

/**
 * Tout repons akseptab pou yon egzèsis, normalize:
 * - tout valè `accepted`
 * - tèks correct_ht a (san prefiks lèt)
 * - pou qcm: lèt chwa kòrèk la (a/b/c/d)
 */
export function acceptedAnswers(ex: Exercise): string[] {
  const set = new Set<string>();
  for (const a of ex.accepted) set.add(normalize(a));
  set.add(normalize(stripChoicePrefix(ex.correct_ht)));

  if (ex.type === 'qcm' && ex.choices && ex.choices.length > 0) {
    const correctText = normalize(stripChoicePrefix(ex.correct_ht));
    ex.choices.forEach((choice, i) => {
      if (normalize(stripChoicePrefix(choice)) === correctText && i < QCM_LETTERS.length) {
        set.add(QCM_LETTERS[i]);
      }
    });
  }
  return [...set];
}

/** Verifye si repons itilizatè a bon. */
export function isCorrectAnswer(ex: Exercise, answer: string): boolean {
  const n = normalize(answer);
  if (n.length === 0) return false;
  return acceptedAnswers(ex).includes(n);
}

export type GradeState =
  | { kind: 'idle' }
  | { kind: 'correct' }
  | { kind: 'retry'; attemptsLeft: number }
  | { kind: 'revealed' };

/**
 * Aplike règ la: tantativ < 3 → reeseye; == 3 → revele repons lan.
 * @param attempts kantite tantativ DEJA fèt (avan soumèt sa a)
 */
export function gradeSubmission(
  ex: Exercise,
  answer: string,
  attempts: number,
): { state: GradeState; xpEarned: number } {
  if (isCorrectAnswer(ex, answer)) {
    return { state: { kind: 'correct' }, xpEarned: 10 };
  }
  const newAttempts = attempts + 1;
  if (newAttempts >= 3) {
    return { state: { kind: 'revealed' }, xpEarned: 0 };
  }
  return {
    state: { kind: 'retry', attemptsLeft: 3 - newAttempts },
    xpEarned: 0,
  };
}
