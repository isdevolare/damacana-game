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
    hpMult: 0.74,
    rewardMult: 1.12,
    hpCurve: [0.68, 0.98],
    rewardCurve: [1.08, 1.7],
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
    hpMult: 0.92,
    rewardMult: 1.15,
    hpCurve: [0.78, 1.1],
    rewardCurve: [1, 1.56],
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
    hpMult: 0.98,
    rewardMult: 1.32,
    hpCurve: [0.72, 1.1],
    rewardCurve: [1, 1.56],
    desktopMinions: [3, 6],
    mobileMinions: [3, 4],
    spawnMs: [4000, 2800],
    pulseMs: [3800, 2650],
    summonMs: [12800, 8600],
    enemyHp: [0.96, 1.38],
    enemySpeed: [0.92, 1.08],
    enemyDamage: [0.82, 1.02],
    pulseDamage: [0.9, 1.18],
    summonCount: [1, 3],
  },
  uranus: {
    hpMult: 1.3,
    rewardMult: 1.24,
    hpCurve: [0.82, 1.24],
    rewardCurve: [0.9, 1.45],
    desktopMinions: [5, 8],
    mobileMinions: [4, 6],
    spawnMs: [3300, 2250],
    pulseMs: [3500, 2300],
    summonMs: [9800, 6500],
    enemyHp: [1.16, 1.7],
    enemySpeed: [1.02, 1.22],
    enemyDamage: [1.04, 1.25],
    pulseDamage: [1.08, 1.42],
    summonCount: [2, 4],
  },
  neptune: {
    hpMult: 1.48,
    rewardMult: 1.36,
    hpCurve: [0.82, 1.24],
    rewardCurve: [0.9, 1.45],
    desktopMinions: [5, 9],
    mobileMinions: [4, 6],
    spawnMs: [3100, 2100],
    pulseMs: [3300, 2100],
    summonMs: [9200, 5900],
    enemyHp: [1.26, 1.9],
    enemySpeed: [1.08, 1.3],
    enemyDamage: [1.12, 1.4],
    pulseDamage: [1.16, 1.58],
    summonCount: [3, 5],
  },
};

function mix([from, to]: [number, number], progress: number) {
  return from + (to - from) * progress;
}

function tunedProgress(info: BossPhaseInfo) {
  if (info.chapter.id !== 'saturn') return info.progress;
  const smootherUntilPhase = 12;
  const hinge = (smootherUntilPhase - 1) / Math.max(1, info.totalPhases - 1);
  const easedHinge = 0.42;
  if (info.progress <= hinge) return (info.progress / hinge) * easedHinge;
  return easedHinge + ((info.progress - hinge) / (1 - hinge)) * (1 - easedHinge);
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
