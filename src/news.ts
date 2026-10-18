/**
 * Kòd Akademi — nouvèl lokal aplikasyon an (ekran Mizajou).
 * Pou kounye a nouvèl yo se yon lis lokal; `checkForUpdates()` se yon STUB
 * dokimante ki pare pou konekte sou yon backend (EAS Update / REST API)
 * lè sèvè a disponib.
 */

export interface AppNews {
  id: string;
  date: string;
  title_ht: string;
  body_ht: string;
}

export const LOCAL_NEWS: AppNews[] = [
  {
    id: 'n1',
    date: '2026-10-18',
    title_ht: 'Byenveni sou Kòd Akademi! 🎉',
    body_ht:
      'Premye vèsyon aplikasyon an soti ak 24 leson (L01-L24) sou 12 mwa ak 48 egzèsis entèraktif. Aprann pwogramasyon an kreyòl, etap pa etap.',
  },
  {
    id: 'n2',
    date: '2026-10-18',
    title_ht: 'Lekti awotvwa 🔊',
    body_ht:
      'Kounye a ou ka koute chak leson awotvwa: peze bouton «Koute» nan ekran leson an. Ideyal pou aprann pandan w ap mache oswa w ap fè travay.',
  },
  {
    id: 'n3',
    date: '2026-10-18',
    title_ht: 'XP ak pwogrè 🏆',
    body_ht:
      'Chak egzèsis ou reyisi ba ou +10 XP. Pwogrè ou an sove sou telefòn ou, menm si ou fèmen aplikasyon an.',
  },
];

/**
 * STUB — verifye si gen mizajou.
 *
 * Konpòtman aktyèl (san backend): retoune nouvèl lokal yo apre yon ti poz,
 * san chanjman. Lè backend lan pare, ranplase kò fonksyon an pa yon apèl
 * rezo (pa egzanp: GET https://api.kodakademi.app/updates) ki retoune menm
 * fòma AppNews[] la.
 */
export async function checkForUpdates(): Promise<{
  updated: boolean;
  news: AppNews[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return { updated: false, news: LOCAL_NEWS };
}
