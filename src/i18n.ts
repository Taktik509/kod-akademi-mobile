/** Kòd Akademi — i18n: chaje ui.json, t(kle) ak entèpolasyon {n}. */

import uiJson from './data/ui.json';
import type { AppLang } from './data';

type UIKeys = Record<string, string>;

const UI: Record<AppLang, UIKeys> = uiJson as unknown as Record<AppLang, UIKeys>;

let currentLang: AppLang = 'ht';

export function setLang(lang: AppLang): void {
  currentLang = lang;
}

export function getLang(): AppLang {
  return currentLang;
}

/** Tradui yon kle UI. Sipòte {n} tankou nan 'attemptsLeft'. */
export function t(key: string, params?: Record<string, string | number>): string {
  const table = UI[currentLang] ?? UI.ht;
  let text = table[key] ?? UI.ht[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v));
    }
  }
  return text;
}

export const LANGS: { code: AppLang; label: string }[] = [
  { code: 'ht', label: 'Kreyòl' },
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];
