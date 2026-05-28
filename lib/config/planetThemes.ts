import type { ArcId, ChapterId } from './chapters';

export type PlanetThemeEffect = 'calm' | 'dust' | 'rings' | 'iceFog' | 'storm' | 'ember' | 'flare';

export interface PlanetTheme {
  id: ChapterId;
  backgroundGradient: string;
  planetGradient: string;
  arenaTint: string;
  arenaBorder: string;
  gridColor: string;
  particleColor: string;
  particleGlow: string;
  uiAccent: string;
  ambientGlow: string;
  starDensity: number;
  dustDensity: number;
  dustColor: string;
  effect: PlanetThemeEffect;
}

export interface FutureArcThemeHook {
  id: Exclude<ArcId, 'planet' | 'star'>;
  accent: string;
  ambientGlow: string;
  backgroundHint: string;
}

export const PLANET_THEMES: Record<ChapterId, PlanetTheme> = {
  earth: {
    id: 'earth',
    backgroundGradient:
      'radial-gradient(circle at 50% 24%, rgba(20,96,150,0.52) 0%, rgba(8,24,52,0.82) 42%, #030711 100%)',
    planetGradient:
      'radial-gradient(circle at 34% 28%, rgba(245,255,255,0.9) 0 4%, #5cf6ff 13%, #287dff 35%, #11326d 63%, rgba(3,9,22,0.92) 100%)',
    arenaTint: 'rgba(92,246,255,0.16)',
    arenaBorder: 'rgba(92,246,255,0.34)',
    gridColor: 'rgba(92,246,255,0.2)',
    particleColor: '#5cf6ff',
    particleGlow: 'rgba(92,246,255,0.62)',
    uiAccent: '#5cf6ff',
    ambientGlow: 'rgba(92,246,255,0.42)',
    starDensity: 66,
    dustDensity: 5,
    dustColor: 'rgba(92,246,255,0.48)',
    effect: 'calm',
  },
  mars: {
    id: 'mars',
    backgroundGradient:
      'radial-gradient(circle at 50% 22%, rgba(142,51,24,0.58) 0%, rgba(46,15,14,0.84) 45%, #050409 100%)',
    planetGradient:
      'radial-gradient(circle at 34% 27%, rgba(255,231,192,0.82) 0 5%, #ff9b4a 15%, #d4492f 43%, #5a1715 72%, rgba(11,5,7,0.95) 100%)',
    arenaTint: 'rgba(255,107,74,0.18)',
    arenaBorder: 'rgba(255,107,74,0.38)',
    gridColor: 'rgba(255,154,84,0.2)',
    particleColor: '#ff8a4a',
    particleGlow: 'rgba(255,107,74,0.62)',
    uiAccent: '#ff6b4a',
    ambientGlow: 'rgba(255,107,74,0.44)',
    starDensity: 52,
    dustDensity: 13,
    dustColor: 'rgba(255,126,74,0.52)',
    effect: 'dust',
  },
  saturn: {
    id: 'saturn',
    backgroundGradient:
      'radial-gradient(circle at 50% 22%, rgba(124,88,26,0.48) 0%, rgba(28,22,10,0.86) 46%, #040409 100%)',
    planetGradient:
      'radial-gradient(circle at 35% 28%, rgba(255,248,214,0.88) 0 5%, #ffd166 18%, #b97f2f 48%, #3a260f 78%, rgba(7,5,4,0.96) 100%)',
    arenaTint: 'rgba(255,209,102,0.16)',
    arenaBorder: 'rgba(255,209,102,0.36)',
    gridColor: 'rgba(255,209,102,0.2)',
    particleColor: '#ffd166',
    particleGlow: 'rgba(255,209,102,0.58)',
    uiAccent: '#ffd166',
    ambientGlow: 'rgba(255,209,102,0.38)',
    starDensity: 72,
    dustDensity: 8,
    dustColor: 'rgba(255,209,102,0.45)',
    effect: 'rings',
  },
  uranus: {
    id: 'uranus',
    backgroundGradient:
      'radial-gradient(circle at 50% 24%, rgba(92,222,226,0.36) 0%, rgba(12,41,56,0.86) 45%, #03060d 100%)',
    planetGradient:
      'radial-gradient(circle at 34% 28%, rgba(245,255,255,0.86) 0 5%, #bffcff 20%, #80fff4 48%, #1c6470 76%, rgba(4,10,16,0.96) 100%)',
    arenaTint: 'rgba(128,255,244,0.14)',
    arenaBorder: 'rgba(128,255,244,0.34)',
    gridColor: 'rgba(128,255,244,0.18)',
    particleColor: '#80fff4',
    particleGlow: 'rgba(128,255,244,0.56)',
    uiAccent: '#80fff4',
    ambientGlow: 'rgba(128,255,244,0.36)',
    starDensity: 58,
    dustDensity: 10,
    dustColor: 'rgba(180,255,255,0.34)',
    effect: 'iceFog',
  },
  neptune: {
    id: 'neptune',
    backgroundGradient:
      'radial-gradient(circle at 50% 22%, rgba(36,55,140,0.5) 0%, rgba(18,13,58,0.9) 44%, #02030a 100%)',
    planetGradient:
      'radial-gradient(circle at 35% 27%, rgba(211,226,255,0.78) 0 4%, #4a7dff 20%, #2b36a3 48%, #271060 72%, rgba(5,3,16,0.98) 100%)',
    arenaTint: 'rgba(74,125,255,0.18)',
    arenaBorder: 'rgba(115,98,255,0.38)',
    gridColor: 'rgba(115,98,255,0.18)',
    particleColor: '#7b6dff',
    particleGlow: 'rgba(115,98,255,0.62)',
    uiAccent: '#7b6dff',
    ambientGlow: 'rgba(74,125,255,0.44)',
    starDensity: 82,
    dustDensity: 14,
    dustColor: 'rgba(184,122,255,0.42)',
    effect: 'storm',
  },
  redDwarf: {
    id: 'redDwarf',
    backgroundGradient:
      'radial-gradient(circle at 50% 22%, rgba(122,20,20,0.58) 0%, rgba(42,8,12,0.9) 44%, #050207 100%)',
    planetGradient:
      'radial-gradient(circle at 34% 28%, rgba(255,219,176,0.9) 0 4%, #ff4d3d 18%, #8f1719 50%, #2a050a 78%, rgba(5,2,7,0.98) 100%)',
    arenaTint: 'rgba(255,77,61,0.18)',
    arenaBorder: 'rgba(255,77,61,0.38)',
    gridColor: 'rgba(255,109,74,0.2)',
    particleColor: '#ff6b4a',
    particleGlow: 'rgba(255,77,61,0.62)',
    uiAccent: '#ff4d3d',
    ambientGlow: 'rgba(255,77,61,0.44)',
    starDensity: 88,
    dustDensity: 16,
    dustColor: 'rgba(255,92,61,0.5)',
    effect: 'ember',
  },
  whiteDwarf: {
    id: 'whiteDwarf',
    backgroundGradient:
      'radial-gradient(circle at 50% 20%, rgba(210,252,255,0.46) 0%, rgba(24,55,76,0.88) 42%, #02060d 100%)',
    planetGradient:
      'radial-gradient(circle at 34% 27%, rgba(255,255,255,0.98) 0 8%, #dffcff 22%, #8fdfff 48%, #264c72 74%, rgba(3,8,16,0.98) 100%)',
    arenaTint: 'rgba(223,252,255,0.15)',
    arenaBorder: 'rgba(223,252,255,0.36)',
    gridColor: 'rgba(223,252,255,0.18)',
    particleColor: '#dffcff',
    particleGlow: 'rgba(223,252,255,0.64)',
    uiAccent: '#dffcff',
    ambientGlow: 'rgba(223,252,255,0.46)',
    starDensity: 96,
    dustDensity: 8,
    dustColor: 'rgba(210,252,255,0.38)',
    effect: 'flare',
  },
  giantStar: {
    id: 'giantStar',
    backgroundGradient:
      'radial-gradient(circle at 50% 22%, rgba(170,95,18,0.56) 0%, rgba(64,29,8,0.88) 45%, #060308 100%)',
    planetGradient:
      'radial-gradient(circle at 35% 28%, rgba(255,244,197,0.92) 0 5%, #ffb23f 18%, #d46b28 48%, #4d1c09 76%, rgba(8,3,4,0.98) 100%)',
    arenaTint: 'rgba(255,178,63,0.17)',
    arenaBorder: 'rgba(255,178,63,0.38)',
    gridColor: 'rgba(255,178,63,0.2)',
    particleColor: '#ffb23f',
    particleGlow: 'rgba(255,178,63,0.62)',
    uiAccent: '#ffb23f',
    ambientGlow: 'rgba(255,178,63,0.46)',
    starDensity: 80,
    dustDensity: 18,
    dustColor: 'rgba(255,178,63,0.46)',
    effect: 'flare',
  },
  supernova: {
    id: 'supernova',
    backgroundGradient:
      'radial-gradient(circle at 50% 22%, rgba(255,92,232,0.48) 0%, rgba(122,54,24,0.72) 36%, rgba(25,5,34,0.94) 70%, #030108 100%)',
    planetGradient:
      'radial-gradient(circle at 36% 28%, rgba(255,255,255,0.86) 0 4%, #ffb23f 14%, #ff5ce8 38%, #6720a0 68%, rgba(7,2,14,0.98) 100%)',
    arenaTint: 'rgba(255,92,232,0.18)',
    arenaBorder: 'rgba(255,92,232,0.42)',
    gridColor: 'rgba(255,178,63,0.18)',
    particleColor: '#ff5ce8',
    particleGlow: 'rgba(255,92,232,0.64)',
    uiAccent: '#ff5ce8',
    ambientGlow: 'rgba(255,92,232,0.48)',
    starDensity: 104,
    dustDensity: 20,
    dustColor: 'rgba(255,178,63,0.42)',
    effect: 'storm',
  },
};

export const FUTURE_ARC_THEME_HOOKS: Record<Exclude<ArcId, 'planet' | 'star'>, FutureArcThemeHook> = {
  galaxy: {
    id: 'galaxy',
    accent: '#ff5ce8',
    ambientGlow: 'rgba(255,92,232,0.44)',
    backgroundHint: 'spiral dust lanes and deep parallax',
  },
  blackHole: {
    id: 'blackHole',
    accent: '#ffffff',
    ambientGlow: 'rgba(255,255,255,0.35)',
    backgroundHint: 'accretion rings and lensing shadows',
  },
  anomaly: {
    id: 'anomaly',
    accent: '#b87aff',
    ambientGlow: 'rgba(184,122,255,0.5)',
    backgroundHint: 'unstable void fractures and corrupted signals',
  },
};

export function planetThemeForChapter(id: ChapterId): PlanetTheme {
  return PLANET_THEMES[id];
}
