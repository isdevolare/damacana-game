export type ChapterId = 'earth' | 'mars' | 'saturn' | 'uranus' | 'neptune';
export type ArcId = 'planet' | 'star' | 'galaxy' | 'blackHole' | 'anomaly';

export interface Chapter {
  id: ChapterId;
  arcId: 'planet';
  order: number;
  planetGlyph: string;
  accent: string;
  glow: string;
  levelStart: number;
  levelEnd: number;
  finalBossTier: number;
  background:
    | 'earth'
    | 'mars'
    | 'saturn'
    | 'uranus'
    | 'neptune';
}

export interface FutureArcChapter {
  id: string;
  i18nKey: string;
}

export interface FutureArc {
  id: Exclude<ArcId, 'planet'>;
  order: number;
  i18nKey: string;
  chapters: FutureArcChapter[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'earth',
    arcId: 'planet',
    order: 1,
    planetGlyph: '⊕',
    accent: '#5cf6ff',
    glow: 'rgba(92,246,255,0.42)',
    levelStart: 1,
    levelEnd: 10,
    finalBossTier: 10,
    background: 'earth',
  },
  {
    id: 'mars',
    arcId: 'planet',
    order: 2,
    planetGlyph: '♂',
    accent: '#ff6b4a',
    glow: 'rgba(255,107,74,0.42)',
    levelStart: 11,
    levelEnd: 25,
    finalBossTier: 25,
    background: 'mars',
  },
  {
    id: 'saturn',
    arcId: 'planet',
    order: 3,
    planetGlyph: '♄',
    accent: '#ffd166',
    glow: 'rgba(255,209,102,0.38)',
    levelStart: 26,
    levelEnd: 45,
    finalBossTier: 45,
    background: 'saturn',
  },
  {
    id: 'uranus',
    arcId: 'planet',
    order: 4,
    planetGlyph: '♅',
    accent: '#80fff4',
    glow: 'rgba(128,255,244,0.36)',
    levelStart: 46,
    levelEnd: 70,
    finalBossTier: 70,
    background: 'uranus',
  },
  {
    id: 'neptune',
    arcId: 'planet',
    order: 5,
    planetGlyph: '♆',
    accent: '#4a7dff',
    glow: 'rgba(74,125,255,0.42)',
    levelStart: 71,
    levelEnd: 100,
    finalBossTier: 100,
    background: 'neptune',
  },
];

export const FUTURE_ARCS: FutureArc[] = [
  {
    id: 'star',
    order: 2,
    i18nKey: 'star',
    chapters: [
      { id: 'redDwarf', i18nKey: 'redDwarf' },
      { id: 'whiteDwarf', i18nKey: 'whiteDwarf' },
      { id: 'giantStar', i18nKey: 'giantStar' },
      { id: 'supernova', i18nKey: 'supernova' },
    ],
  },
  {
    id: 'galaxy',
    order: 3,
    i18nKey: 'galaxy',
    chapters: [
      { id: 'milkyWay', i18nKey: 'milkyWay' },
      { id: 'andromeda', i18nKey: 'andromeda' },
      { id: 'collidingGalaxy', i18nKey: 'collidingGalaxy' },
    ],
  },
  {
    id: 'blackHole',
    order: 4,
    i18nKey: 'blackHole',
    chapters: [
      { id: 'stellarBlackHole', i18nKey: 'stellarBlackHole' },
      { id: 'supermassiveBlackHole', i18nKey: 'supermassiveBlackHole' },
      { id: 'singularity', i18nKey: 'singularity' },
    ],
  },
  {
    id: 'anomaly',
    order: 5,
    i18nKey: 'anomaly',
    chapters: [
      { id: 'voidSea', i18nKey: 'voidSea' },
      { id: 'realityFracture', i18nKey: 'realityFracture' },
      { id: 'classificationFailed', i18nKey: 'classificationFailed' },
    ],
  },
];

export function chapterById(id: ChapterId): Chapter {
  return CHAPTERS.find((chapter) => chapter.id === id) ?? CHAPTERS[0];
}

export function currentChapter(completedChapters: ChapterId[]): Chapter {
  return CHAPTERS.find((chapter) => !completedChapters.includes(chapter.id)) ?? CHAPTERS[CHAPTERS.length - 1];
}

export function nextChapter(id: ChapterId): Chapter | null {
  const chapter = chapterById(id);
  return CHAPTERS.find((candidate) => candidate.order === chapter.order + 1) ?? null;
}

export function firstCompletableChapter(
  completedChapters: ChapterId[],
  _levelIdx: number,
  defeatedBossTier: number,
): Chapter | null {
  return (
    CHAPTERS.find(
      (chapter) =>
        !completedChapters.includes(chapter.id) &&
        defeatedBossTier >= chapter.finalBossTier,
    ) ?? null
  );
}

export function chapterForLevel(levelIdx: number): Chapter {
  const displayLevel = levelIdx + 1;
  return CHAPTERS.find((chapter) => displayLevel >= chapter.levelStart && displayLevel <= chapter.levelEnd) ?? CHAPTERS[CHAPTERS.length - 1];
}
