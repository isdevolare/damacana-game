import { chapterById, type ChapterId } from './chapters';

export type ShipSkinRarity = 'default' | 'rare' | 'epic' | 'legendary' | 'cosmic';
export type ShipSkinUnlockType = 'starter' | 'chapterReached' | 'artifactCount' | 'prestigeCount' | 'ascensionCount' | 'futurePremium';
export type ShipSkinShopCategory = 'starter' | 'progression' | 'prestige' | 'premium';

export interface ShipSkinDef {
  id: string;
  rarity: ShipSkinRarity;
  i18nKey: string;
  accent: string;
  engine: string;
  hull: string;
  glow: string;
  silhouette: 'core' | 'raider' | 'cruiser' | 'interceptor' | 'vessel' | 'mothership' | 'whale';
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
