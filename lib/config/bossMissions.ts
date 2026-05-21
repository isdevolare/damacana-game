import { CHAPTERS, Chapter, ChapterId } from './chapters';

export interface BossPhaseInfo {
  chapter: Chapter;
  phase: number;
  totalPhases: number;
  progress: number;
  finalPhase: boolean;
}

interface ChapterCombatProfile {
  hpMult: number;
  rewardMult: number;
  desktopMinions: [number, number];
  mobileMinions: [number, number];
  spawnMs: [number, number];
  pulseMs: [number, number];
  summonMs: [number, number];
  enemyHp: [number, number];
  enemySpeed: [number, number];
  pulseDamage: [number, number];
  summonCount: [number, number];
}

const CHAPTER_PROFILES: Record<ChapterId, ChapterCombatProfile> = {
  earth: {
    hpMult: 0.86,
    rewardMult: 0.95,
    desktopMinions: [3, 5],
    mobileMinions: [3, 4],
    spawnMs: [4200, 3300],
    pulseMs: [4400, 3400],
    summonMs: [13200, 9300],
    enemyHp: [0.82, 1.18],
    enemySpeed: [0.86, 1.02],
    pulseDamage: [0.75, 1],
    summonCount: [1, 2],
  },
  mars: {
    hpMult: 1,
    rewardMult: 1.08,
    desktopMinions: [4, 6],
    mobileMinions: [3, 5],
    spawnMs: [3600, 2550],
    pulseMs: [3900, 2800],
    summonMs: [11200, 7600],
    enemyHp: [1, 1.42],
    enemySpeed: [1.02, 1.24],
    pulseDamage: [0.92, 1.2],
    summonCount: [2, 3],
  },
  saturn: {
    hpMult: 1.14,
    rewardMult: 1.16,
    desktopMinions: [4, 7],
    mobileMinions: [4, 5],
    spawnMs: [3500, 2450],
    pulseMs: [3800, 2650],
    summonMs: [10800, 7200],
    enemyHp: [1.08, 1.55],
    enemySpeed: [0.96, 1.15],
    pulseDamage: [1, 1.28],
    summonCount: [2, 4],
  },
  uranus: {
    hpMult: 1.3,
    rewardMult: 1.24,
    desktopMinions: [5, 8],
    mobileMinions: [4, 6],
    spawnMs: [3300, 2250],
    pulseMs: [3500, 2300],
    summonMs: [9800, 6500],
    enemyHp: [1.16, 1.7],
    enemySpeed: [1.02, 1.22],
    pulseDamage: [1.08, 1.42],
    summonCount: [2, 4],
  },
  neptune: {
    hpMult: 1.48,
    rewardMult: 1.36,
    desktopMinions: [5, 9],
    mobileMinions: [4, 6],
    spawnMs: [3100, 2100],
    pulseMs: [3300, 2100],
    summonMs: [9200, 5900],
    enemyHp: [1.26, 1.9],
    enemySpeed: [1.08, 1.3],
    pulseDamage: [1.16, 1.58],
    summonCount: [3, 5],
  },
};

function mix([from, to]: [number, number], progress: number) {
  return from + (to - from) * progress;
}

export function bossPhaseInfo(tier: number): BossPhaseInfo {
  const chapter = CHAPTERS.find((item) => tier >= item.levelStart && tier <= item.levelEnd) ?? CHAPTERS[CHAPTERS.length - 1];
  const totalPhases = chapter.levelEnd - chapter.levelStart + 1;
  const phase = Math.max(1, Math.min(totalPhases, tier - chapter.levelStart + 1));
  const progress = totalPhases <= 1 ? 1 : (phase - 1) / (totalPhases - 1);
  return {
    chapter,
    phase,
    totalPhases,
    progress,
    finalPhase: phase >= totalPhases,
  };
}

export function bossPhaseHpMultiplier(tier: number) {
  const info = bossPhaseInfo(tier);
  const profile = CHAPTER_PROFILES[info.chapter.id];
  return profile.hpMult * mix([0.82, 1.24], info.progress);
}

export function bossPhaseRewardMultiplier(tier: number) {
  const info = bossPhaseInfo(tier);
  const profile = CHAPTER_PROFILES[info.chapter.id];
  return profile.rewardMult * mix([0.9, 1.45], info.progress);
}

export function bossPhaseCombatTuning(tier: number, mobile: boolean) {
  const info = bossPhaseInfo(tier);
  const profile = CHAPTER_PROFILES[info.chapter.id];
  const minions = mobile ? profile.mobileMinions : profile.desktopMinions;
  return {
    info,
    maxMinions: Math.round(mix(minions, info.progress)),
    spawnDelayMs: mix(profile.spawnMs, info.progress),
    pulseIntervalMs: mix(profile.pulseMs, info.progress),
    summonIntervalMs: mix(profile.summonMs, info.progress),
    enemyHpMult: mix(profile.enemyHp, info.progress),
    enemySpeedMult: mix(profile.enemySpeed, info.progress),
    pulseDamageMult: mix(profile.pulseDamage, info.progress),
    summonCount: Math.round(mix(profile.summonCount, info.progress)),
  };
}
