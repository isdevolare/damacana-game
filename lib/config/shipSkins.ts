import { chapterById, type ChapterId } from './chapters';

export type ShipSkinRarity = 'default' | 'rare' | 'epic' | 'legendary' | 'cosmic';
export type ShipSkinUnlockType = 'starter' | 'chapterReached' | 'artifactCount' | 'prestigeCount' | 'ascensionCount' | 'futurePremium';
export type ShipSkinShopCategory = 'starter' | 'progression' | 'prestige' | 'premium';
export type ShipSkinAccentEffect = 'none' | 'orbitRing' | 'fragments' | 'prestigeAura' | 'ascensionAura' | 'whaleWake';

export interface ShipSkinVisual {
  bodyClip: string;
  wingClip: string;
  innerClip: string;
  bodyWidthPct: number;
  bodyHeightPct: number;
  bodyRadius: string;
  coreSizePct: number;
  effect: ShipSkinAccentEffect;
}

export interface ShipSkinDef {
  id: string;
  rarity: ShipSkinRarity;
  i18nKey: string;
  accent: string;
  engine: string;
  hull: string;
  glow: string;
  silhouette: 'core' | 'raider' | 'cruiser' | 'interceptor' | 'vessel' | 'mothership' | 'whale';
  visual: ShipSkinVisual;
  unlock: {
    type: ShipSkinUnlockType;
    chapterId?: ChapterId;
    count?: number;
  };
  isPremiumPlaceholder: boolean;
  shopCategory: ShipSkinShopCategory;
  pricePlaceholder?: string;
  purchasableLater: boolean;
}

export interface ShipSkinUnlockContext {
  completedChapters: ChapterId[];
  currentChapterId: ChapterId;
  bestBossTier: number;
  artifactCount: number;
  totalPrestiges: number;
  totalAscensions: number;
}

export const SHIP_SKINS: ShipSkinDef[] = [
  {
    id: 'defaultCoreShip',
    rarity: 'default',
    i18nKey: 'defaultCoreShip',
    accent: '#5cf6ff',
    engine: '#ff5ce8',
    hull: '#071923',
    glow: 'rgba(92,246,255,0.72)',
    silhouette: 'core',
    visual: {
      bodyClip: 'polygon(50% 0%, 70% 28%, 92% 48%, 70% 60%, 60% 100%, 50% 78%, 40% 100%, 30% 60%, 8% 48%, 30% 28%)',
      wingClip: 'polygon(12% 36%, 34% 26%, 50% 54%, 66% 26%, 88% 36%, 68% 70%, 50% 60%, 32% 70%)',
      innerClip: 'polygon(50% 0%, 66% 34%, 58% 100%, 50% 78%, 42% 100%, 34% 34%)',
      bodyWidthPct: 82,
      bodyHeightPct: 74,
      bodyRadius: '26%',
      coreSizePct: 23,
      effect: 'none',
    },
    unlock: { type: 'starter' },
    isPremiumPlaceholder: false,
    shopCategory: 'starter',
    purchasableLater: false,
  },
  {
    id: 'marsRaider',
    rarity: 'rare',
    i18nKey: 'marsRaider',
    accent: '#ff6b4a',
    engine: '#ffd166',
    hull: '#210b06',
    glow: 'rgba(255,107,74,0.72)',
    silhouette: 'raider',
    visual: {
      bodyClip: 'polygon(64% 0%, 100% 48%, 64% 100%, 48% 68%, 0% 80%, 34% 50%, 0% 20%, 48% 32%)',
      wingClip: 'polygon(0% 14%, 58% 30%, 100% 50%, 58% 70%, 0% 86%, 30% 50%)',
      innerClip: 'polygon(62% 10%, 84% 50%, 56% 90%, 44% 66%, 20% 50%, 44% 34%)',
      bodyWidthPct: 92,
      bodyHeightPct: 70,
      bodyRadius: '14%',
      coreSizePct: 18,
      effect: 'none',
    },
    unlock: { type: 'chapterReached', chapterId: 'mars' },
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
    purchasableLater: false,
  },
  {
    id: 'saturnOrbitCruiser',
    rarity: 'epic',
    i18nKey: 'saturnOrbitCruiser',
    accent: '#ffd166',
    engine: '#80fff4',
    hull: '#211707',
    glow: 'rgba(255,209,102,0.72)',
    silhouette: 'cruiser',
    visual: {
      bodyClip: 'polygon(50% 0%, 88% 20%, 100% 52%, 82% 86%, 60% 78%, 50% 100%, 40% 78%, 18% 86%, 0% 52%, 12% 20%)',
      wingClip: 'polygon(0% 36%, 28% 18%, 50% 34%, 72% 18%, 100% 36%, 88% 72%, 50% 62%, 12% 72%)',
      innerClip: 'polygon(50% 4%, 72% 40%, 62% 92%, 50% 74%, 38% 92%, 28% 40%)',
      bodyWidthPct: 102,
      bodyHeightPct: 68,
      bodyRadius: '28%',
      coreSizePct: 20,
      effect: 'orbitRing',
    },
    unlock: { type: 'chapterReached', chapterId: 'saturn' },
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
    purchasableLater: false,
  },
  {
    id: 'voidInterceptor',
    rarity: 'epic',
    i18nKey: 'voidInterceptor',
    accent: '#b87aff',
    engine: '#ff5ce8',
    hull: '#120a22',
    glow: 'rgba(184,122,255,0.72)',
    silhouette: 'interceptor',
    visual: {
      bodyClip: 'polygon(50% 0%, 78% 26%, 100% 18%, 76% 54%, 92% 100%, 54% 74%, 50% 92%, 46% 74%, 8% 100%, 24% 54%, 0% 18%, 22% 26%)',
      wingClip: 'polygon(6% 12%, 40% 32%, 50% 2%, 60% 32%, 94% 12%, 70% 58%, 94% 88%, 58% 70%, 50% 98%, 42% 70%, 6% 88%, 30% 58%)',
      innerClip: 'polygon(50% 8%, 66% 38%, 58% 88%, 50% 70%, 42% 88%, 34% 38%)',
      bodyWidthPct: 88,
      bodyHeightPct: 80,
      bodyRadius: '8%',
      coreSizePct: 17,
      effect: 'fragments',
    },
    unlock: { type: 'artifactCount', count: 5 },
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
    purchasableLater: false,
  },
  {
    id: 'prestigeVessel',
    rarity: 'legendary',
    i18nKey: 'prestigeVessel',
    accent: '#ffd166',
    engine: '#ff5ce8',
    hull: '#241607',
    glow: 'rgba(255,209,102,0.72)',
    silhouette: 'vessel',
    visual: {
      bodyClip: 'polygon(50% 0%, 78% 18%, 92% 42%, 78% 68%, 66% 100%, 50% 84%, 34% 100%, 22% 68%, 8% 42%, 22% 18%)',
      wingClip: 'polygon(2% 40%, 34% 20%, 50% 42%, 66% 20%, 98% 40%, 74% 80%, 50% 66%, 26% 80%)',
      innerClip: 'polygon(50% 4%, 70% 38%, 60% 96%, 50% 76%, 40% 96%, 30% 38%)',
      bodyWidthPct: 90,
      bodyHeightPct: 84,
      bodyRadius: '24%',
      coreSizePct: 22,
      effect: 'prestigeAura',
    },
    unlock: { type: 'prestigeCount', count: 1 },
    isPremiumPlaceholder: false,
    shopCategory: 'prestige',
    purchasableLater: false,
  },
  {
    id: 'ascendantMothership',
    rarity: 'cosmic',
    i18nKey: 'ascendantMothership',
    accent: '#ffffff',
    engine: '#5cf6ff',
    hull: '#07070d',
    glow: 'rgba(255,255,255,0.72)',
    silhouette: 'mothership',
    visual: {
      bodyClip: 'polygon(4% 52%, 20% 18%, 40% 22%, 50% 0%, 60% 22%, 80% 18%, 96% 52%, 80% 88%, 60% 76%, 50% 100%, 40% 76%, 20% 88%)',
      wingClip: 'polygon(0% 46%, 18% 12%, 42% 30%, 50% 4%, 58% 30%, 82% 12%, 100% 46%, 82% 90%, 58% 70%, 50% 96%, 42% 70%, 18% 90%)',
      innerClip: 'polygon(50% 2%, 74% 36%, 68% 76%, 50% 64%, 32% 76%, 26% 36%)',
      bodyWidthPct: 118,
      bodyHeightPct: 82,
      bodyRadius: '30%',
      coreSizePct: 24,
      effect: 'ascensionAura',
    },
    unlock: { type: 'ascensionCount', count: 1 },
    isPremiumPlaceholder: false,
    shopCategory: 'prestige',
    purchasableLater: false,
  },
  {
    id: 'cosmicWhaleShip',
    rarity: 'cosmic',
    i18nKey: 'cosmicWhaleShip',
    accent: '#80fff4',
    engine: '#b87aff',
    hull: '#06161f',
    glow: 'rgba(128,255,244,0.72)',
    silhouette: 'whale',
    visual: {
      bodyClip: 'polygon(22% 18%, 58% 0%, 92% 16%, 100% 44%, 86% 70%, 58% 76%, 48% 100%, 38% 76%, 10% 72%, 0% 48%, 8% 28%)',
      wingClip: 'polygon(8% 42%, 36% 18%, 78% 12%, 100% 38%, 86% 76%, 42% 82%, 10% 66%)',
      innerClip: 'polygon(30% 24%, 58% 8%, 84% 24%, 82% 56%, 58% 66%, 44% 92%, 36% 64%, 16% 54%)',
      bodyWidthPct: 116,
      bodyHeightPct: 74,
      bodyRadius: '44%',
      coreSizePct: 19,
      effect: 'whaleWake',
    },
    unlock: { type: 'futurePremium' },
    isPremiumPlaceholder: true,
    shopCategory: 'premium',
    pricePlaceholder: 'future',
    purchasableLater: true,
  },
];

export const DEFAULT_SHIP_SKIN_ID = 'defaultCoreShip';

export function shipSkinById(id: string | undefined | null): ShipSkinDef {
  return SHIP_SKINS.find((skin) => skin.id === id) ?? SHIP_SKINS[0];
}

export function shipSkinRequirementKey(skin: ShipSkinDef): string {
  switch (skin.unlock.type) {
    case 'starter':
      return 'starter';
    case 'chapterReached':
      return skin.unlock.chapterId ? `chapter_${skin.unlock.chapterId}` : 'locked';
    case 'artifactCount':
      return 'artifacts';
    case 'prestigeCount':
      return 'prestige';
    case 'ascensionCount':
      return 'ascension';
    case 'futurePremium':
      return 'futurePremium';
    default:
      return 'locked';
  }
}

export function shipSkinUnlocked(skin: ShipSkinDef, context: ShipSkinUnlockContext): boolean {
  switch (skin.unlock.type) {
    case 'starter':
      return true;
    case 'chapterReached':
      if (!skin.unlock.chapterId) return false;
      return (
        context.currentChapterId === skin.unlock.chapterId ||
        context.completedChapters.includes(skin.unlock.chapterId) ||
        context.bestBossTier >= chapterById(skin.unlock.chapterId).levelStart
      );
    case 'artifactCount':
      return context.artifactCount >= (skin.unlock.count ?? 0);
    case 'prestigeCount':
      return context.totalPrestiges >= (skin.unlock.count ?? 0);
    case 'ascensionCount':
      return context.totalAscensions >= (skin.unlock.count ?? 0);
    case 'futurePremium':
      return false;
    default:
      return false;
  }
}
