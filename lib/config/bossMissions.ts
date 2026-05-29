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
  hpCurve: [number, number];
  rewardCurve: [number, number];
  desktopMinions: [number, number];
  mobileMinions: [number, number];
  spawnMs: [number, number];
  pulseMs: [number, number];
  summonMs: [number, number];
  enemyHp: [number, number];
  enemySpeed: [number, number];
  enemyDamage: [number, number];
  pulseDamage: [number, number];
  summonCount: [number, number];
}

const CHAPTER_PROFILES: Record<ChapterId, ChapterCombatProfile> = {
  earth: {
    hpMult: 0.86,
    rewardMult: 1.04,
    hpCurve: [0.8, 1.06],
    rewardCurve: [0.98, 1.48],
    desktopMinions: [2, 4],
    mobileMinions: [2, 3],
    spawnMs: [5200, 3900],
    pulseMs: [5200, 3900],
    summonMs: [15000, 11000],
    enemyHp: [0.68, 1.02],
    enemySpeed: [0.74, 0.94],
    enemyDamage: [0.62, 0.78],
    pulseDamage: [0.58, 0.82],
    summonCount: [1, 2],
  },
  mars: {
    hpMult: 1,
    rewardMult: 1.08,
    hpCurve: [0.88, 1.18],
    rewardCurve: [0.96, 1.44],
    desktopMinions: [3, 5],
    mobileMinions: [3, 4],
    spawnMs: [4100, 3000],
    pulseMs: [4500, 3200],
    summonMs: [12400, 8400],
    enemyHp: [0.9, 1.3],
    enemySpeed: [0.96, 1.16],
    enemyDamage: [0.78, 1],
    pulseDamage: [0.76, 1.05],
    summonCount: [1, 3],
  },
  saturn: {
    hpMult: 0.82,
    rewardMult: 1.48,
    hpCurve: [0.68, 0.88],
    rewardCurve: [1.08, 1.82],
    desktopMinions: [3, 5],
    mobileMinions: [2, 4],
    spawnMs: [4500, 3400],
    pulseMs: [3800, 2650],
    summonMs: [15000, 10800],
    enemyHp: [0.88, 1.12],
    enemySpeed: [0.92, 1.08],
    enemyDamage: [0.72, 0.86],
    pulseDamage: [0.78, 0.96],
    summonCount: [1, 2],
  },
  uranus: {
    hpMult: 1.08,
    rewardMult: 1.48,
    hpCurve: [0.74, 1.24],
    rewardCurve: [1.06, 1.52],
    desktopMinions: [4, 8],
    mobileMinions: [3, 6],
    spawnMs: [4200, 2250],
    pulseMs: [4500, 2300],
    summonMs: [12600, 6500],
    enemyHp: [1.02, 1.7],
    enemySpeed: [1.02, 1.22],
    enemyDamage: [0.84, 1.25],
    pulseDamage: [0.86, 1.42],
    summonCount: [1, 4],
  },
  neptune: {
    hpMult: 1.4,
    rewardMult: 1.48,
    hpCurve: [0.8, 1.18],
    rewardCurve: [0.98, 1.56],
    desktopMinions: [5, 9],
    mobileMinions: [4, 6],
    spawnMs: [3100, 2100],
    pulseMs: [3300, 2100],
    summonMs: [9200, 5900],
    enemyHp: [1.26, 1.9],
    enemySpeed: [1.08, 1.3],
    enemyDamage: [1.04, 1.32],
    pulseDamage: [1.08, 1.46],
    summonCount: [3, 5],
  },
  redDwarf: {
    hpMult: 1.48,
    rewardMult: 1.88,
    hpCurve: [0.72, 1.1],
    rewardCurve: [1.2, 1.7],
    desktopMinions: [5, 9],
    mobileMinions: [4, 6],
    spawnMs: [3000, 2050],
    pulseMs: [3200, 2050],
    summonMs: [8800, 5600],
    enemyHp: [1.18, 1.62],
    enemySpeed: [1.14, 1.34],
    enemyDamage: [1.0, 1.24],
    pulseDamage: [1.0, 1.36],
    summonCount: [3, 5],
  },
  whiteDwarf: {
    hpMult: 1.68,
    rewardMult: 2.08,
    hpCurve: [0.78, 1.16],
    rewardCurve: [1.16, 1.74],
    desktopMinions: [5, 10],
    mobileMinions: [4, 7],
    spawnMs: [2850, 1900],
    pulseMs: [3000, 1900],
    summonMs: [8200, 5200],
    enemyHp: [1.26, 1.76],
    enemySpeed: [1.12, 1.28],
    enemyDamage: [1.06, 1.32],
    pulseDamage: [1.08, 1.42],
    summonCount: [3, 5],
  },
  giantStar: {
    hpMult: 1.98,
    rewardMult: 2.36,
    hpCurve: [0.86, 1.24],
    rewardCurve: [1.14, 1.82],
    desktopMinions: [5, 9],
    mobileMinions: [4, 6],
    spawnMs: [3200, 2150],
    pulseMs: [3100, 2000],
    summonMs: [8600, 5200],
    enemyHp: [1.52, 2.08],
    enemySpeed: [1.02, 1.18],
    enemyDamage: [1.12, 1.4],
    pulseDamage: [1.14, 1.52],
    summonCount: [3, 5],
  },
  supernova: {
    hpMult: 2.3,
    rewardMult: 2.7,
    hpCurve: [0.9, 1.32],
    rewardCurve: [1.2, 2.02],
    desktopMinions: [6, 10],
    mobileMinions: [4, 7],
    spawnMs: [2700, 1750],
    pulseMs: [2800, 1700],
    summonMs: [7600, 4600],
    enemyHp: [1.62, 2.22],
    enemySpeed: [1.18, 1.38],
    enemyDamage: [1.18, 1.54],
    pulseDamage: [1.22, 1.68],
    summonCount: [4, 6],
  },
};

function mix([from, to]: [number, number], progress: number) {
  return from + (to - from) * progress;
}

function tunedProgress(info: BossPhaseInfo) {
  if (info.chapter.id !== 'saturn' && info.chapter.id !== 'uranus') return info.progress;
  const smootherUntilPhase = info.chapter.id === 'uranus' ? 8 : 12;
  const hinge = (smootherUntilPhase - 1) / Math.max(1, info.totalPhases - 1);
  const easedHinge = info.chapter.id === 'uranus' ? 0.2 : 0.42;
  if (info.progress <= hinge) return (info.progress / hinge) * easedHinge;
  return easedHinge + ((info.progress - hinge) / (1 - hinge)) * (1 - easedHinge);
}

export function bossPhaseInfo(tier: number): BossPhaseInfo {
  const safeTier = Number.isFinite(tier) ? Math.max(1, Math.floor(tier)) : 1;
  const chapter = CHAPTERS.find((item) => safeTier >= item.levelStart && safeTier <= item.levelEnd) ?? CHAPTERS[CHAPTERS.length - 1];
  const totalPhases = chapter.levelEnd - chapter.levelStart + 1;
  const phase = Math.max(1, Math.min(totalPhases, safeTier - chapter.levelStart + 1));
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
  return profile.hpMult * mix(profile.hpCurve, tunedProgress(info));
}

export function bossPhaseRewardMultiplier(tier: number) {
  const info = bossPhaseInfo(tier);
  const profile = CHAPTER_PROFILES[info.chapter.id];
  return profile.rewardMult * mix(profile.rewardCurve, tunedProgress(info));
}

export function bossPhaseCombatTuning(tier: number, mobile: boolean) {
  const info = bossPhaseInfo(tier);
  const profile = CHAPTER_PROFILES[info.chapter.id];
  const minions = mobile ? profile.mobileMinions : profile.desktopMinions;
  const progress = tunedProgress(info);
  return {
    info,
    maxMinions: Math.round(mix(minions, progress)),
    spawnDelayMs: mix(profile.spawnMs, progress),
    pulseIntervalMs: mix(profile.pulseMs, progress),
    summonIntervalMs: mix(profile.summonMs, progress),
    enemyHpMult: mix(profile.enemyHp, progress),
    enemySpeedMult: mix(profile.enemySpeed, progress),
    enemyDamageMult: mix(profile.enemyDamage, progress),
    pulseDamageMult: mix(profile.pulseDamage, progress),
    summonCount: Math.round(mix(profile.summonCount, progress)),
  };
}
