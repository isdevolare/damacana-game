import { chapterById, type ChapterId } from './chapters';

export type ShipSkinRarity = 'default' | 'common' | 'rare' | 'epic' | 'legendary' | 'cosmic';
export type ShipSkinUnlockType = 'starter' | 'chapterReached' | 'artifactCount' | 'prestigeCount' | 'ascensionCount' | 'skinCredits' | 'futurePremium';
export type ShipSkinShopCategory = 'starter' | 'progression' | 'prestige' | 'premium';
export type ShipSkinAccentEffect = 'none' | 'orbitRing' | 'fragments' | 'prestigeAura' | 'ascensionAura' | 'whaleWake' | 'bladeTrail' | 'iceMist' | 'dragonWake' | 'eclipseHalo' | 'singularity';
export type ShipSkinTrailStyle = 'standard' | 'twin' | 'blade' | 'mist' | 'wake' | 'rift';
export type ShipSkinAuraStyle = 'none' | 'soft' | 'ring' | 'prestige' | 'ascension' | 'corrupt' | 'singularity';
export type ShipSkinArchetype =
  | 'coreDiamond'
  | 'scout'
  | 'fighter'
  | 'spear'
  | 'solarGlider'
  | 'haloCruiser'
  | 'voidRazor'
  | 'falcon'
  | 'carrier'
  | 'striker'
  | 'crown'
  | 'eclipse'
  | 'dragon'
  | 'mothership'
  | 'ark'
  | 'whale'
  | 'singularity'
  | 'leviathan';

export interface ShipSkinVisual {
  bodyClip: string;
  wingClip: string;
  innerClip: string;
  bodyWidthPct: number;
  bodyHeightPct: number;
  bodyRadius: string;
  coreSizePct: number;
  effect: ShipSkinAccentEffect;
  coreColor: string;
  trailStyle: ShipSkinTrailStyle;
  auraStyle: ShipSkinAuraStyle;
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
  archetype: ShipSkinArchetype;
  visual: ShipSkinVisual;
  unlock: {
    type: ShipSkinUnlockType;
    chapterId?: ChapterId;
    count?: number;
  };
  priceCredits?: number;
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
  ownedShipSkinIds: string[];
  skinCredits: number;
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
    archetype: 'coreDiamond',
    visual: {
      bodyClip: 'polygon(50% 0%, 64% 18%, 72% 50%, 58% 82%, 50% 100%, 42% 82%, 28% 50%, 36% 18%)',
      wingClip: 'polygon(16% 42%, 38% 26%, 50% 40%, 62% 26%, 84% 42%, 66% 66%, 50% 58%, 34% 66%)',
      innerClip: 'polygon(50% 10%, 61% 44%, 54% 82%, 50% 92%, 46% 82%, 39% 44%)',
      bodyWidthPct: 74,
      bodyHeightPct: 80,
      bodyRadius: '18%',
      coreSizePct: 23,
      effect: 'none',
      coreColor: '#ffffff',
      trailStyle: 'standard',
      auraStyle: 'soft',
    },
    unlock: { type: 'starter' },
    isPremiumPlaceholder: false,
    shopCategory: 'starter',
    purchasableLater: false,
  },
  {
    id: 'scoutCore',
    rarity: 'common',
    i18nKey: 'scoutCore',
    accent: '#80fff4',
    engine: '#5cf6ff',
    hull: '#08151a',
    glow: 'rgba(128,255,244,0.62)',
    silhouette: 'core',
    archetype: 'scout',
    visual: {
      bodyClip: 'polygon(50% 0%, 63% 22%, 59% 92%, 50% 100%, 41% 92%, 37% 22%)',
      wingClip: 'polygon(6% 48%, 39% 32%, 50% 22%, 61% 32%, 94% 48%, 64% 60%, 50% 52%, 36% 60%)',
      innerClip: 'polygon(50% 8%, 58% 36%, 54% 88%, 50% 96%, 46% 88%, 42% 36%)',
      bodyWidthPct: 86,
      bodyHeightPct: 70,
      bodyRadius: '12%',
      coreSizePct: 20,
      effect: 'none',
      coreColor: '#dffcff',
      trailStyle: 'standard',
      auraStyle: 'soft',
    },
    unlock: { type: 'skinCredits' },
    priceCredits: 80,
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
    purchasableLater: false,
  },
  {
    id: 'iceRunner',
    rarity: 'rare',
    i18nKey: 'iceRunner',
    accent: '#bffcff',
    engine: '#80fff4',
    hull: '#071522',
    glow: 'rgba(191,252,255,0.66)',
    silhouette: 'interceptor',
    archetype: 'spear',
    visual: {
      bodyClip: 'polygon(50% 0%, 58% 12%, 54% 92%, 50% 100%, 46% 92%, 42% 12%)',
      wingClip: 'polygon(20% 56%, 43% 38%, 50% 8%, 57% 38%, 80% 56%, 58% 66%, 50% 94%, 42% 66%)',
      innerClip: 'polygon(50% 4%, 55% 34%, 52% 84%, 50% 96%, 48% 84%, 45% 34%)',
      bodyWidthPct: 64,
      bodyHeightPct: 112,
      bodyRadius: '4%',
      coreSizePct: 18,
      effect: 'iceMist',
      coreColor: '#ffffff',
      trailStyle: 'mist',
      auraStyle: 'soft',
    },
    unlock: { type: 'skinCredits' },
    priceCredits: 180,
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
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
    archetype: 'fighter',
    visual: {
      bodyClip: 'polygon(50% 0%, 74% 34%, 96% 46%, 76% 62%, 62% 100%, 50% 76%, 38% 100%, 24% 62%, 4% 46%, 26% 34%)',
      wingClip: 'polygon(0% 34%, 36% 26%, 50% 42%, 64% 26%, 100% 34%, 76% 78%, 50% 62%, 24% 78%)',
      innerClip: 'polygon(50% 8%, 66% 40%, 56% 86%, 50% 70%, 44% 86%, 34% 40%)',
      bodyWidthPct: 108,
      bodyHeightPct: 76,
      bodyRadius: '14%',
      coreSizePct: 18,
      effect: 'none',
      coreColor: '#ffd166',
      trailStyle: 'twin',
      auraStyle: 'soft',
    },
    unlock: { type: 'chapterReached', chapterId: 'mars' },
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
    purchasableLater: false,
  },
  {
    id: 'crimsonDart',
    rarity: 'rare',
    i18nKey: 'crimsonDart',
    accent: '#ff3d6e',
    engine: '#ffb347',
    hull: '#1d0608',
    glow: 'rgba(255,61,110,0.7)',
    silhouette: 'raider',
    archetype: 'fighter',
    visual: {
      bodyClip: 'polygon(50% 0%, 63% 18%, 58% 100%, 50% 82%, 42% 100%, 37% 18%)',
      wingClip: 'polygon(2% 40%, 39% 32%, 50% 8%, 61% 32%, 98% 40%, 63% 58%, 50% 50%, 37% 58%)',
      innerClip: 'polygon(50% 8%, 58% 36%, 54% 88%, 50% 76%, 46% 88%, 42% 36%)',
      bodyWidthPct: 98,
      bodyHeightPct: 88,
      bodyRadius: '10%',
      coreSizePct: 16,
      effect: 'bladeTrail',
      coreColor: '#ffd1dd',
      trailStyle: 'blade',
      auraStyle: 'soft',
    },
    unlock: { type: 'skinCredits' },
    priceCredits: 220,
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
    purchasableLater: false,
  },
  {
    id: 'solarBlade',
    rarity: 'rare',
    i18nKey: 'solarBlade',
    accent: '#ffb347',
    engine: '#ff5c3d',
    hull: '#1e0d04',
    glow: 'rgba(255,179,71,0.68)',
    silhouette: 'raider',
    archetype: 'solarGlider',
    visual: {
      bodyClip: 'polygon(50% 0%, 62% 28%, 56% 88%, 50% 100%, 44% 88%, 38% 28%)',
      wingClip: 'polygon(0% 30%, 42% 42%, 50% 14%, 58% 42%, 100% 30%, 72% 70%, 50% 58%, 28% 70%)',
      innerClip: 'polygon(50% 8%, 59% 38%, 53% 84%, 50% 94%, 47% 84%, 41% 38%)',
      bodyWidthPct: 124,
      bodyHeightPct: 76,
      bodyRadius: '12%',
      coreSizePct: 17,
      effect: 'bladeTrail',
      coreColor: '#fff3b0',
      trailStyle: 'blade',
      auraStyle: 'soft',
    },
    unlock: { type: 'skinCredits' },
    priceCredits: 260,
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
    purchasableLater: false,
  },
  {
    id: 'dustRunner',
    rarity: 'common',
    i18nKey: 'dustRunner',
    accent: '#d9a45f',
    engine: '#ff6b4a',
    hull: '#160f08',
    glow: 'rgba(217,164,95,0.58)',
    silhouette: 'raider',
    archetype: 'scout',
    visual: {
      bodyClip: 'polygon(50% 0%, 70% 30%, 66% 76%, 52% 100%, 48% 100%, 34% 76%, 30% 30%)',
      wingClip: 'polygon(8% 54%, 36% 34%, 50% 46%, 64% 34%, 92% 54%, 68% 72%, 50% 62%, 32% 72%)',
      innerClip: 'polygon(50% 8%, 62% 40%, 56% 82%, 50% 92%, 44% 82%, 38% 40%)',
      bodyWidthPct: 90,
      bodyHeightPct: 70,
      bodyRadius: '20%',
      coreSizePct: 18,
      effect: 'none',
      coreColor: '#ffe0a8',
      trailStyle: 'standard',
      auraStyle: 'soft',
    },
    unlock: { type: 'skinCredits' },
    priceCredits: 130,
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
    archetype: 'haloCruiser',
    visual: {
      bodyClip: 'polygon(6% 50%, 22% 22%, 42% 30%, 50% 8%, 58% 30%, 78% 22%, 94% 50%, 78% 78%, 58% 70%, 50% 92%, 42% 70%, 22% 78%)',
      wingClip: 'polygon(0% 44%, 28% 18%, 50% 36%, 72% 18%, 100% 44%, 86% 70%, 50% 62%, 14% 70%)',
      innerClip: 'polygon(50% 14%, 70% 42%, 60% 78%, 50% 66%, 40% 78%, 30% 42%)',
      bodyWidthPct: 124,
      bodyHeightPct: 66,
      bodyRadius: '28%',
      coreSizePct: 20,
      effect: 'orbitRing',
      coreColor: '#fff3b0',
      trailStyle: 'standard',
      auraStyle: 'ring',
    },
    unlock: { type: 'chapterReached', chapterId: 'saturn' },
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
    purchasableLater: false,
  },
  {
    id: 'plasmaNeedle',
    rarity: 'epic',
    i18nKey: 'plasmaNeedle',
    accent: '#ff5ce8',
    engine: '#ffd166',
    hull: '#18051a',
    glow: 'rgba(255,92,232,0.7)',
    silhouette: 'interceptor',
    archetype: 'falcon',
    visual: {
      bodyClip: 'polygon(50% 0%, 66% 24%, 62% 72%, 76% 100%, 52% 78%, 50% 96%, 48% 78%, 24% 100%, 38% 72%, 34% 24%)',
      wingClip: 'polygon(0% 34%, 34% 28%, 50% 6%, 66% 28%, 100% 34%, 70% 62%, 50% 54%, 30% 62%)',
      innerClip: 'polygon(50% 8%, 60% 40%, 55% 78%, 50% 66%, 45% 78%, 40% 40%)',
      bodyWidthPct: 112,
      bodyHeightPct: 82,
      bodyRadius: '8%',
      coreSizePct: 15,
      effect: 'bladeTrail',
      coreColor: '#ffd9ff',
      trailStyle: 'blade',
      auraStyle: 'corrupt',
    },
    unlock: { type: 'skinCredits' },
    priceCredits: 700,
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
    purchasableLater: false,
  },
  {
    id: 'frostCarrier',
    rarity: 'epic',
    i18nKey: 'frostCarrier',
    accent: '#9ee7ff',
    engine: '#ffffff',
    hull: '#06111f',
    glow: 'rgba(158,231,255,0.7)',
    silhouette: 'cruiser',
    archetype: 'carrier',
    visual: {
      bodyClip: 'polygon(4% 52%, 18% 18%, 42% 20%, 50% 4%, 58% 20%, 82% 18%, 96% 52%, 82% 88%, 62% 82%, 50% 98%, 38% 82%, 18% 88%)',
      wingClip: 'polygon(0% 48%, 24% 12%, 50% 34%, 76% 12%, 100% 48%, 84% 80%, 50% 70%, 16% 80%)',
      innerClip: 'polygon(50% 10%, 74% 42%, 66% 76%, 50% 64%, 34% 76%, 26% 42%)',
      bodyWidthPct: 132,
      bodyHeightPct: 72,
      bodyRadius: '32%',
      coreSizePct: 21,
      effect: 'iceMist',
      coreColor: '#ffffff',
      trailStyle: 'mist',
      auraStyle: 'ring',
    },
    unlock: { type: 'chapterReached', chapterId: 'uranus' },
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
    archetype: 'voidRazor',
    visual: {
      bodyClip: 'polygon(50% 0%, 70% 30%, 100% 14%, 72% 60%, 88% 100%, 50% 72%, 12% 100%, 28% 60%, 0% 14%, 30% 30%)',
      wingClip: 'polygon(0% 10%, 42% 36%, 50% 4%, 58% 36%, 100% 10%, 70% 64%, 100% 92%, 50% 70%, 0% 92%, 30% 64%)',
      innerClip: 'polygon(50% 10%, 64% 40%, 56% 78%, 50% 66%, 44% 78%, 36% 40%)',
      bodyWidthPct: 118,
      bodyHeightPct: 80,
      bodyRadius: '8%',
      coreSizePct: 17,
      effect: 'fragments',
      coreColor: '#ffb8ff',
      trailStyle: 'rift',
      auraStyle: 'corrupt',
    },
    unlock: { type: 'artifactCount', count: 5 },
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
    purchasableLater: false,
  },
  {
    id: 'nebulaStriker',
    rarity: 'epic',
    i18nKey: 'nebulaStriker',
    accent: '#a78bfa',
    engine: '#5cf6ff',
    hull: '#0b0820',
    glow: 'rgba(167,139,250,0.72)',
    silhouette: 'interceptor',
    archetype: 'striker',
    visual: {
      bodyClip: 'polygon(58% 0%, 82% 18%, 96% 52%, 70% 64%, 84% 100%, 54% 76%, 46% 94%, 38% 72%, 4% 84%, 30% 54%, 12% 30%)',
      wingClip: 'polygon(2% 50%, 36% 34%, 58% 4%, 66% 36%, 100% 30%, 72% 70%, 48% 58%, 24% 74%)',
      innerClip: 'polygon(58% 8%, 70% 38%, 58% 82%, 48% 70%, 40% 86%, 38% 42%)',
      bodyWidthPct: 118,
      bodyHeightPct: 82,
      bodyRadius: '14%',
      coreSizePct: 18,
      effect: 'fragments',
      coreColor: '#e9d5ff',
      trailStyle: 'rift',
      auraStyle: 'corrupt',
    },
    unlock: { type: 'skinCredits' },
    priceCredits: 920,
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
    archetype: 'crown',
    visual: {
      bodyClip: 'polygon(50% 0%, 66% 24%, 82% 12%, 76% 54%, 64% 100%, 50% 82%, 36% 100%, 24% 54%, 18% 12%, 34% 24%)',
      wingClip: 'polygon(0% 46%, 30% 18%, 50% 42%, 70% 18%, 100% 46%, 76% 82%, 50% 66%, 24% 82%)',
      innerClip: 'polygon(50% 8%, 68% 40%, 58% 86%, 50% 70%, 42% 86%, 32% 40%)',
      bodyWidthPct: 110,
      bodyHeightPct: 88,
      bodyRadius: '24%',
      coreSizePct: 22,
      effect: 'prestigeAura',
      coreColor: '#fff3b0',
      trailStyle: 'blade',
      auraStyle: 'prestige',
    },
    unlock: { type: 'prestigeCount', count: 1 },
    isPremiumPlaceholder: false,
    shopCategory: 'prestige',
    purchasableLater: false,
  },
  {
    id: 'dragonCoreShip',
    rarity: 'legendary',
    i18nKey: 'dragonCoreShip',
    accent: '#ff6b4a',
    engine: '#ffd166',
    hull: '#240703',
    glow: 'rgba(255,107,74,0.74)',
    silhouette: 'vessel',
    archetype: 'dragon',
    visual: {
      bodyClip: 'polygon(54% 0%, 76% 14%, 84% 38%, 100% 32%, 82% 58%, 74% 96%, 54% 82%, 48% 100%, 42% 80%, 20% 92%, 14% 60%, 0% 42%, 18% 38%, 28% 14%)',
      wingClip: 'polygon(0% 34%, 30% 10%, 50% 38%, 70% 10%, 100% 34%, 76% 78%, 50% 60%, 24% 78%)',
      innerClip: 'polygon(54% 6%, 68% 34%, 58% 84%, 50% 70%, 42% 88%, 34% 34%)',
      bodyWidthPct: 122,
      bodyHeightPct: 90,
      bodyRadius: '18%',
      coreSizePct: 19,
      effect: 'dragonWake',
      coreColor: '#fff3b0',
      trailStyle: 'twin',
      auraStyle: 'prestige',
    },
    unlock: { type: 'skinCredits' },
    priceCredits: 1800,
    isPremiumPlaceholder: false,
    shopCategory: 'prestige',
    purchasableLater: false,
  },
  {
    id: 'goldenMothership',
    rarity: 'legendary',
    i18nKey: 'goldenMothership',
    accent: '#ffd166',
    engine: '#ffffff',
    hull: '#201405',
    glow: 'rgba(255,209,102,0.78)',
    silhouette: 'mothership',
    archetype: 'mothership',
    visual: {
      bodyClip: 'polygon(0% 54%, 14% 22%, 34% 28%, 50% 6%, 66% 28%, 86% 22%, 100% 54%, 88% 86%, 66% 78%, 50% 100%, 34% 78%, 12% 86%)',
      wingClip: 'polygon(0% 50%, 12% 10%, 38% 34%, 50% 12%, 62% 34%, 88% 10%, 100% 50%, 88% 90%, 62% 72%, 50% 92%, 38% 72%, 12% 90%)',
      innerClip: 'polygon(50% 10%, 78% 42%, 68% 76%, 50% 62%, 32% 76%, 22% 42%)',
      bodyWidthPct: 138,
      bodyHeightPct: 82,
      bodyRadius: '30%',
      coreSizePct: 23,
      effect: 'prestigeAura',
      coreColor: '#fff7c8',
      trailStyle: 'twin',
      auraStyle: 'prestige',
    },
    unlock: { type: 'skinCredits' },
    priceCredits: 2600,
    isPremiumPlaceholder: false,
    shopCategory: 'prestige',
    purchasableLater: false,
  },
  {
    id: 'eclipseHunter',
    rarity: 'legendary',
    i18nKey: 'eclipseHunter',
    accent: '#b87aff',
    engine: '#ff5ce8',
    hull: '#05050d',
    glow: 'rgba(184,122,255,0.74)',
    silhouette: 'interceptor',
    archetype: 'eclipse',
    visual: {
      bodyClip: 'polygon(50% 0%, 76% 24%, 94% 50%, 74% 58%, 86% 90%, 54% 76%, 50% 94%, 46% 76%, 14% 90%, 26% 58%, 6% 50%, 24% 24%)',
      wingClip: 'polygon(0% 50%, 42% 34%, 50% 4%, 58% 34%, 100% 50%, 66% 66%, 50% 72%, 34% 66%)',
      innerClip: 'polygon(50% 8%, 66% 38%, 58% 82%, 50% 68%, 42% 82%, 34% 38%)',
      bodyWidthPct: 122,
      bodyHeightPct: 74,
      bodyRadius: '10%',
      coreSizePct: 18,
      effect: 'eclipseHalo',
      coreColor: '#ffccff',
      trailStyle: 'rift',
      auraStyle: 'corrupt',
    },
    unlock: { type: 'chapterReached', chapterId: 'neptune' },
    isPremiumPlaceholder: false,
    shopCategory: 'progression',
    purchasableLater: false,
  },
  {
    id: 'starbornLeviathan',
    rarity: 'cosmic',
    i18nKey: 'starbornLeviathan',
    accent: '#ffffff',
    engine: '#ffd166',
    hull: '#060917',
    glow: 'rgba(255,255,255,0.78)',
    silhouette: 'whale',
    archetype: 'leviathan',
    visual: {
      bodyClip: 'polygon(6% 34%, 34% 8%, 68% 0%, 96% 22%, 100% 52%, 82% 78%, 56% 78%, 48% 100%, 38% 76%, 10% 70%, 0% 52%)',
      wingClip: 'polygon(0% 48%, 28% 14%, 74% 10%, 100% 38%, 88% 82%, 50% 86%, 18% 68%)',
      innerClip: 'polygon(24% 34%, 56% 10%, 86% 28%, 78% 58%, 56% 68%, 46% 92%, 36% 66%, 14% 56%)',
      bodyWidthPct: 144,
      bodyHeightPct: 82,
      bodyRadius: '46%',
      coreSizePct: 20,
      effect: 'ascensionAura',
      coreColor: '#ffffff',
      trailStyle: 'wake',
      auraStyle: 'ascension',
    },
    unlock: { type: 'futurePremium' },
    isPremiumPlaceholder: true,
    shopCategory: 'premium',
    pricePlaceholder: 'future',
    purchasableLater: true,
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
    archetype: 'ark',
    visual: {
      bodyClip: 'polygon(50% 0%, 66% 18%, 80% 48%, 66% 82%, 56% 100%, 50% 88%, 44% 100%, 34% 82%, 20% 48%, 34% 18%)',
      wingClip: 'polygon(10% 50%, 34% 18%, 50% 34%, 66% 18%, 90% 50%, 70% 88%, 50% 68%, 30% 88%)',
      innerClip: 'polygon(50% 8%, 68% 40%, 60% 78%, 50% 66%, 40% 78%, 32% 40%)',
      bodyWidthPct: 94,
      bodyHeightPct: 116,
      bodyRadius: '30%',
      coreSizePct: 24,
      effect: 'ascensionAura',
      coreColor: '#ffffff',
      trailStyle: 'twin',
      auraStyle: 'ascension',
    },
    unlock: { type: 'ascensionCount', count: 1 },
    isPremiumPlaceholder: false,
    shopCategory: 'prestige',
    purchasableLater: false,
  },
  {
    id: 'singularityArk',
    rarity: 'cosmic',
    i18nKey: 'singularityArk',
    accent: '#ff5ce8',
    engine: '#80fff4',
    hull: '#03040a',
    glow: 'rgba(255,92,232,0.78)',
    silhouette: 'mothership',
    archetype: 'singularity',
    visual: {
      bodyClip: 'polygon(10% 48%, 28% 16%, 46% 28%, 50% 0%, 54% 28%, 72% 16%, 90% 48%, 72% 82%, 54% 72%, 50% 100%, 46% 72%, 28% 82%)',
      wingClip: 'polygon(0% 48%, 18% 8%, 44% 34%, 50% 2%, 56% 34%, 82% 8%, 100% 48%, 82% 92%, 56% 66%, 50% 98%, 44% 66%, 18% 92%)',
      innerClip: 'polygon(50% 12%, 70% 44%, 58% 72%, 50% 62%, 42% 72%, 30% 44%)',
      bodyWidthPct: 124,
      bodyHeightPct: 90,
      bodyRadius: '26%',
      coreSizePct: 21,
      effect: 'singularity',
      coreColor: '#ffffff',
      trailStyle: 'rift',
      auraStyle: 'singularity',
    },
    unlock: { type: 'skinCredits' },
    priceCredits: 6000,
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
    archetype: 'whale',
    visual: {
      bodyClip: 'polygon(10% 28%, 44% 4%, 78% 12%, 100% 38%, 88% 68%, 58% 78%, 48% 100%, 38% 76%, 8% 68%, 0% 48%)',
      wingClip: 'polygon(6% 44%, 34% 18%, 78% 10%, 100% 36%, 86% 78%, 42% 84%, 10% 66%)',
      innerClip: 'polygon(28% 28%, 58% 10%, 84% 26%, 78% 56%, 58% 66%, 44% 90%, 36% 64%, 14% 54%)',
      bodyWidthPct: 136,
      bodyHeightPct: 76,
      bodyRadius: '44%',
      coreSizePct: 19,
      effect: 'whaleWake',
      coreColor: '#dffcff',
      trailStyle: 'wake',
      auraStyle: 'ascension',
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
    case 'skinCredits':
      return 'skinCredits';
    case 'futurePremium':
      return 'futurePremium';
    default:
      return 'locked';
  }
}

export function shipSkinUnlocked(skin: ShipSkinDef, context: ShipSkinUnlockContext): boolean {
  if ((context.ownedShipSkinIds ?? []).includes(skin.id)) return true;
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
    case 'skinCredits':
      return false;
    case 'futurePremium':
      return false;
    default:
      return false;
  }
}

export function shipSkinPurchasable(skin: ShipSkinDef, context: ShipSkinUnlockContext): boolean {
  if (shipSkinUnlocked(skin, context)) return false;
  if (skin.unlock.type !== 'skinCredits' || skin.isPremiumPlaceholder) return false;
  return context.skinCredits >= (skin.priceCredits ?? Number.MAX_SAFE_INTEGER);
}

export function shipSkinUnlockProgress(skin: ShipSkinDef, context: ShipSkinUnlockContext): { current: number; required: number } | null {
  switch (skin.unlock.type) {
    case 'skinCredits':
      return { current: Math.min(context.skinCredits, skin.priceCredits ?? 0), required: skin.priceCredits ?? 0 };
    case 'artifactCount':
      return { current: context.artifactCount, required: skin.unlock.count ?? 0 };
    case 'prestigeCount':
      return { current: context.totalPrestiges, required: skin.unlock.count ?? 0 };
    case 'ascensionCount':
      return { current: context.totalAscensions, required: skin.unlock.count ?? 0 };
    case 'chapterReached':
      if (!skin.unlock.chapterId) return null;
      return { current: context.bestBossTier, required: chapterById(skin.unlock.chapterId).levelStart };
    default:
      return null;
  }
}
