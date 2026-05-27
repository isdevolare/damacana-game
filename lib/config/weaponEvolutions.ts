import type { ChapterId } from './chapters';
import type { OwnedArtifact } from './artifacts';

export type WeaponEvolutionId =
  | 'multishot'
  | 'chainArc'
  | 'explosiveCore'
  | 'orbitCannon'
  | 'beamPulse'
  | 'corruptedAmmo';

export interface WeaponEvolutionDef {
  id: WeaponEvolutionId;
  i18nKey: WeaponEvolutionId;
  accent: string;
  symbol: string;
}

export interface WeaponEvolutionContext {
  bossTier: number;
  totalPrestiges: number;
  completedChapters: ChapterId[];
  ownedBuildNodeIds: string[];
  upgrades: Record<string, number>;
  runArtifacts: OwnedArtifact[];
  permanentArtifacts: OwnedArtifact[];
}

export const WEAPON_EVOLUTIONS: WeaponEvolutionDef[] = [
  { id: 'multishot', i18nKey: 'multishot', accent: '#5cf6ff', symbol: '≋' },
  { id: 'chainArc', i18nKey: 'chainArc', accent: '#ffd166', symbol: '⌁' },
  { id: 'explosiveCore', i18nKey: 'explosiveCore', accent: '#ff6b4a', symbol: '✹' },
  { id: 'orbitCannon', i18nKey: 'orbitCannon', accent: '#ff5ce8', symbol: '◌' },
  { id: 'beamPulse', i18nKey: 'beamPulse', accent: '#80fff4', symbol: '▰' },
  { id: 'corruptedAmmo', i18nKey: 'corruptedAmmo', accent: '#b87aff', symbol: '◇' },
];

const hasNode = (ctx: WeaponEvolutionContext, id: string) => ctx.ownedBuildNodeIds.includes(id);
const hasChapter = (ctx: WeaponEvolutionContext, id: ChapterId) => ctx.completedChapters.includes(id);
const upgradeLevel = (ctx: WeaponEvolutionContext, id: string) => ctx.upgrades[id] ?? 0;
const hasArtifact = (ctx: WeaponEvolutionContext, id: string) => (
  [...ctx.runArtifacts, ...ctx.permanentArtifacts].some((artifact) => artifact.id === id)
);

export function weaponEvolutionById(id: WeaponEvolutionId) {
  return WEAPON_EVOLUTIONS.find((evolution) => evolution.id === id);
}

export function isWeaponEvolutionUnlocked(id: WeaponEvolutionId, ctx: WeaponEvolutionContext) {
  switch (id) {
    case 'multishot':
      return ctx.bossTier >= 18 || hasChapter(ctx, 'mars') || upgradeLevel(ctx, 'damacanaPump') >= 14 || hasArtifact(ctx, 'splitCurrent');
    case 'explosiveCore':
      return ctx.bossTier >= 26 || hasChapter(ctx, 'mars') || hasNode(ctx, 'clearanceWave') || hasNode(ctx, 'denseCore') || hasArtifact(ctx, 'denseCoreArtifact');
    case 'chainArc':
      return ctx.bossTier >= 35 || hasNode(ctx, 'chainConductor') || hasNode(ctx, 'ruptureFocus') || upgradeLevel(ctx, 'voidLip') >= 10;
    case 'orbitCannon':
      return ctx.bossTier >= 46 || hasChapter(ctx, 'saturn') || hasNode(ctx, 'calibratedRing') || hasArtifact(ctx, 'saturnRingFragment') || hasArtifact(ctx, 'gravityLoop');
    case 'beamPulse':
      return ctx.bossTier >= 58 || hasNode(ctx, 'pressurePipeline') || upgradeLevel(ctx, 'flowEngine') >= 6 || ctx.totalPrestiges >= 2;
    case 'corruptedAmmo':
      return ctx.bossTier >= 71 || hasChapter(ctx, 'uranus') || hasNode(ctx, 'riskEngine') || hasNode(ctx, 'corruptedLens') || hasArtifact(ctx, 'voidThread') || hasArtifact(ctx, 'blackSignal');
  }
}

export function unlockedWeaponEvolutions(ctx: WeaponEvolutionContext) {
  return WEAPON_EVOLUTIONS.filter((evolution) => isWeaponEvolutionUnlocked(evolution.id, ctx));
}
