export type ChapterId = 'earth' | 'mars' | 'saturn' | 'uranus' | 'neptune';

export interface Chapter {
  id: ChapterId;
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

export const CHAPTERS: Chapter[] = [
  {
    id: 'earth',
    order: 1,
    planetGlyph: '⊕',
    accent: '#5cf6ff',
    glow: 'rgba(92,246,255,0.42)',
    levelStart: 0,
    levelEnd: 1,
    finalBossTier: 5,
    background: 'earth',
  },
  {
    id: 'mars',
    order: 2,
    planetGlyph: '♂',
    accent: '#ff6b4a',
    glow: 'rgba(255,107,74,0.42)',
    levelStart: 2,
    levelEnd: 2,
    finalBossTier: 10,
    background: 'mars',
  },
  {
    id: 'saturn',
    order: 3,
    planetGlyph: '♄',
    accent: '#ffd166',
    glow: 'rgba(255,209,102,0.38)',
    levelStart: 3,
    levelEnd: 3,
    finalBossTier: 15,
    background: 'saturn',
  },
  {
    id: 'uranus',
    order: 4,
    planetGlyph: '♅',
    accent: '#80fff4',
    glow: 'rgba(128,255,244,0.36)',
    levelStart: 4,
    levelEnd: 4,
    finalBossTier: 20,
    background: 'uranus',
  },
  {
    id: 'neptune',
    order: 5,
    planetGlyph: '♆',
    accent: '#4a7dff',
    glow: 'rgba(74,125,255,0.42)',
    levelStart: 5,
    levelEnd: 6,
    finalBossTier: 25,
    background: 'neptune',
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
  levelIdx: number,
  defeatedBossTier: number,
): Chapter | null {
  return (
    CHAPTERS.find(
      (chapter) =>
        !completedChapters.includes(chapter.id) &&
        levelIdx >= chapter.levelEnd &&
        defeatedBossTier >= chapter.finalBossTier,
    ) ?? null
  );
}

export function chapterForLevel(levelIdx: number): Chapter {
  return CHAPTERS.find((chapter) => levelIdx >= chapter.levelStart && levelIdx <= chapter.levelEnd) ?? CHAPTERS[CHAPTERS.length - 1];
}
