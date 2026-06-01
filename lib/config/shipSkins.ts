import { chapterById, type ChapterId } from './chapters';

export type ShipSkinRarity = 'default' | 'common' | 'rare' | 'epic' | 'legendary' | 'cosmic';
export type ShipSkinUnlockType = 'starter' | 'chapterReached' | 'artifactCount' | 'prestigeCount' | 'ascensionCount' | 'skinCredits' | 'futurePremium';
export type ShipSkinShopCategory = 'starter' | 'progression' | 'prestige' | 'premium';
export type ShipSkinAccentEffect = 'none' | 'orbitRing' | 'fragments' | 'prestigeAura' | 'ascensionAura' | 'whaleWake' | 'bladeTrail' | 'iceMist' | 'dragonWake' | 'eclipseHalo' | 'singularity';
export type ShipSkinTrailStyle = 'standard' | 'twin' | 'blade' | 'mist' | 'wake' | 'rift';
export type ShipSkinAuraStyle = 'none' | 'soft' | 'ring' | 'prestige' | 'ascension' | 'corrupt' | 'singularity';

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
    visual: {
      bodyClip: 'polygon(50% 0%, 70% 28%, 92% 48%, 70% 60%, 60% 100%, 50% 78%, 40% 100%, 30% 60%, 8% 48%, 30% 28%)',
      wingClip: 'polygon(12% 36%, 34% 26%, 50% 54%, 66% 26%, 88% 36%, 68% 70%, 50% 60%, 32% 70%)',
      innerClip: 'polygon(50% 0%, 66% 34%, 58% 100%, 50% 78%, 42% 100%, 34% 34%)',
      bodyWidthPct: 82,
      bodyHeightPct: 74,
      bodyRadius: '26%',
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
    visual: {
      bodyClip: 'polygon(50% 0%, 72% 24%, 84% 54%, 64% 70%, 56% 100%, 50% 82%, 44% 100%, 36% 70%, 16% 54%, 28% 24%)',
      wingClip: 'polygon(10% 42%, 38% 24%, 50% 48%, 62% 24%, 90% 42%, 68% 72%, 50% 64%, 32% 72%)',
      innerClip: 'polygon(50% 0%, 62% 38%, 56% 100%, 50% 78%, 44% 100%, 38% 38%)',
      bodyWidthPct: 80,
      bodyHeightPct: 76,
      bodyRadius: '24%',
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
    visual: {
      bodyClip: 'polygon(50% 0%, 74% 20%, 94% 44%, 72% 58%, 88% 96%, 54% 76%, 50% 100%, 46% 76%, 12% 96%, 28% 58%, 6% 44%, 26% 20%)',
      wingClip: 'polygon(0% 36%, 38% 24%, 50% 4%, 62% 24%, 100% 36%, 66% 66%, 50% 92%, 34% 66%)',
      innerClip: 'polygon(50% 6%, 68% 36%, 58% 90%, 50% 70%, 42% 90%, 32% 36%)',
      bodyWidthPct: 92,
      bodyHeightPct: 78,
      bodyRadius: '10%',
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
    visual: {
      bodyClip: 'polygon(64% 0%, 100% 48%, 64% 100%, 48% 68%, 0% 80%, 34% 50%, 0% 20%, 48% 32%)',
      wingClip: 'polygon(0% 14%, 58% 30%, 100% 50%, 58% 70%, 0% 86%, 30% 50%)',
      innerClip: 'polygon(62% 10%, 84% 50%, 56% 90%, 44% 66%, 20% 50%, 44% 34%)',
      bodyWidthPct: 92,
      bodyHeightPct: 70,
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
    visual: {
      bodyClip: 'polygon(50% 0%, 68% 20%, 100% 48%, 64% 60%, 58% 100%, 50% 74%, 42% 100%, 36% 60%, 0% 48%, 32% 20%)',
      wingClip: 'polygon(0% 30%, 42% 24%, 50% 0%, 58% 24%, 100% 30%, 66% 70%, 50% 58%, 34% 70%)',
      innerClip: 'polygon(50% 5%, 62% 38%, 56% 92%, 50% 68%, 44% 92%, 38% 38%)',
      bodyWidthPct: 92,
      bodyHeightPct: 78,
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
    visual: {
      bodyClip: 'polygon(50% 0%, 90% 44%, 70% 54%, 92% 100%, 52% 72%, 50% 96%, 48% 72%, 8% 100%, 30% 54%, 10% 44%)',
      wingClip: 'polygon(4% 20%, 44% 34%, 50% 0%, 56% 34%, 96% 20%, 72% 64%, 50% 58%, 28% 64%)',
      innerClip: 'polygon(50% 4%, 64% 36%, 56% 96%, 50% 72%, 44% 96%, 36% 36%)',
      bodyWidthPct: 94,
      bodyHeightPct: 82,
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
    visual: {
      bodyClip: 'polygon(50% 0%, 78% 28%, 88% 58%, 68% 76%, 58% 100%, 50% 82%, 42% 100%, 32% 76%, 12% 58%, 22% 28%)',
      wingClip: 'polygon(2% 42%, 34% 26%, 50% 48%, 66% 26%, 98% 42%, 74% 72%, 50% 62%, 26% 72%)',
      innerClip: 'polygon(50% 6%, 64% 38%, 58% 94%, 50% 74%, 42% 94%, 36% 38%)',
      bodyWidthPct: 86,
      bodyHeightPct: 74,
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
    visual: {
      bodyClip: 'polygon(50% 0%, 88% 20%, 100% 52%, 82% 86%, 60% 78%, 50% 100%, 40% 78%, 18% 86%, 0% 52%, 12% 20%)',
      wingClip: 'polygon(0% 36%, 28% 18%, 50% 34%, 72% 18%, 100% 36%, 88% 72%, 50% 62%, 12% 72%)',
      innerClip: 'polygon(50% 4%, 72% 40%, 62% 92%, 50% 74%, 38% 92%, 28% 40%)',
      bodyWidthPct: 102,
      bodyHeightPct: 68,
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
    visual: {
      bodyClip: 'polygon(50% 0%, 64% 28%, 100% 46%, 64% 60%, 54% 100%, 50% 70%, 46% 100%, 36% 60%, 0% 46%, 36% 28%)',
      wingClip: 'polygon(0% 34%, 42% 30%, 50% 0%, 58% 30%, 100% 34%, 64% 58%, 50% 96%, 36% 58%)',
      innerClip: 'polygon(50% 0%, 60% 40%, 54% 100%, 50% 64%, 46% 100%, 40% 40%)',
      bodyWidthPct: 86,
      bodyHeightPct: 92,
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
    visual: {
      bodyClip: 'polygon(8% 52%, 22% 20%, 48% 18%, 50% 0%, 52% 18%, 78% 20%, 92% 52%, 76% 86%, 58% 78%, 50% 100%, 42% 78%, 24% 86%)',
      wingClip: 'polygon(0% 44%, 28% 14%, 50% 34%, 72% 14%, 100% 44%, 82% 76%, 50% 66%, 18% 76%)',
      innerClip: 'polygon(50% 4%, 70% 38%, 62% 88%, 50% 74%, 38% 88%, 30% 38%)',
      bodyWidthPct: 108,
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
    visual: {
      bodyClip: 'polygon(50% 0%, 78% 26%, 100% 18%, 76% 54%, 92% 100%, 54% 74%, 50% 92%, 46% 74%, 8% 100%, 24% 54%, 0% 18%, 22% 26%)',
      wingClip: 'polygon(6% 12%, 40% 32%, 50% 2%, 60% 32%, 94% 12%, 70% 58%, 94% 88%, 58% 70%, 50% 98%, 42% 70%, 6% 88%, 30% 58%)',
      innerClip: 'polygon(50% 8%, 66% 38%, 58% 88%, 50% 70%, 42% 88%, 34% 38%)',
      bodyWidthPct: 88,
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
    visual: {
      bodyClip: 'polygon(50% 0%, 76% 18%, 94% 48%, 72% 62%, 96% 100%, 56% 74%, 50% 96%, 44% 74%, 4% 100%, 28% 62%, 6% 48%, 24% 18%)',
      wingClip: 'polygon(0% 24%, 40% 34%, 50% 4%, 60% 34%, 100% 24%, 72% 68%, 50% 58%, 28% 68%)',
      innerClip: 'polygon(50% 4%, 68% 36%, 58% 88%, 50% 66%, 42% 88%, 32% 36%)',
      bodyWidthPct: 100,
      bodyHeightPct: 80,
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
    visual: {
      bodyClip: 'polygon(50% 0%, 78% 18%, 92% 42%, 78% 68%, 66% 100%, 50% 84%, 34% 100%, 22% 68%, 8% 42%, 22% 18%)',
      wingClip: 'polygon(2% 40%, 34% 20%, 50% 42%, 66% 20%, 98% 40%, 74% 80%, 50% 66%, 26% 80%)',
      innerClip: 'polygon(50% 4%, 70% 38%, 60% 96%, 50% 76%, 40% 96%, 30% 38%)',
      bodyWidthPct: 90,
      bodyHeightPct: 84,
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
    visual: {
      bodyClip: 'polygon(50% 0%, 74% 12%, 86% 40%, 100% 34%, 82% 62%, 72% 100%, 52% 82%, 50% 96%, 48% 82%, 28% 100%, 18% 62%, 0% 34%, 14% 40%, 26% 12%)',
      wingClip: 'polygon(0% 32%, 32% 14%, 50% 38%, 68% 14%, 100% 32%, 76% 76%, 50% 62%, 24% 76%)',
      innerClip: 'polygon(50% 4%, 68% 34%, 58% 94%, 50% 72%, 42% 94%, 32% 34%)',
      bodyWidthPct: 104,
      bodyHeightPct: 88,
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
    visual: {
      bodyClip: 'polygon(4% 54%, 18% 20%, 38% 24%, 50% 0%, 62% 24%, 82% 20%, 96% 54%, 82% 88%, 62% 76%, 50% 100%, 38% 76%, 18% 88%)',
      wingClip: 'polygon(0% 46%, 18% 14%, 42% 30%, 50% 6%, 58% 30%, 82% 14%, 100% 46%, 82% 84%, 58% 70%, 50% 92%, 42% 70%, 18% 84%)',
      innerClip: 'polygon(50% 4%, 74% 38%, 66% 82%, 50% 66%, 34% 82%, 26% 38%)',
      bodyWidthPct: 118,
      bodyHeightPct: 78,
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
    visual: {
      bodyClip: 'polygon(50% 0%, 78% 20%, 96% 50%, 74% 56%, 90% 100%, 54% 74%, 50% 92%, 46% 74%, 10% 100%, 26% 56%, 4% 50%, 22% 20%)',
      wingClip: 'polygon(2% 18%, 42% 34%, 50% 2%, 58% 34%, 98% 18%, 72% 62%, 50% 70%, 28% 62%)',
      innerClip: 'polygon(50% 6%, 66% 36%, 58% 90%, 50% 68%, 42% 90%, 34% 36%)',
      bodyWidthPct: 98,
      bodyHeightPct: 82,
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
    visual: {
      bodyClip: 'polygon(18% 18%, 56% 0%, 90% 14%, 100% 46%, 84% 72%, 60% 78%, 52% 100%, 42% 76%, 12% 74%, 0% 50%, 8% 28%)',
      wingClip: 'polygon(6% 44%, 34% 16%, 78% 12%, 100% 42%, 86% 82%, 44% 82%, 12% 66%)',
      innerClip: 'polygon(28% 26%, 58% 8%, 86% 26%, 80% 58%, 58% 66%, 46% 92%, 36% 64%, 16% 56%)',
      bodyWidthPct: 124,
      bodyHeightPct: 78,
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
    visual: {
      bodyClip: 'polygon(4% 52%, 20% 18%, 40% 22%, 50% 0%, 60% 22%, 80% 18%, 96% 52%, 80% 88%, 60% 76%, 50% 100%, 40% 76%, 20% 88%)',
      wingClip: 'polygon(0% 46%, 18% 12%, 42% 30%, 50% 4%, 58% 30%, 82% 12%, 100% 46%, 82% 90%, 58% 70%, 50% 96%, 42% 70%, 18% 90%)',
      innerClip: 'polygon(50% 2%, 74% 36%, 68% 76%, 50% 64%, 32% 76%, 26% 36%)',
      bodyWidthPct: 118,
      bodyHeightPct: 82,
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
    visual: {
      bodyClip: 'polygon(4% 50%, 22% 18%, 42% 24%, 50% 0%, 58% 24%, 78% 18%, 96% 50%, 78% 84%, 58% 76%, 50% 100%, 42% 76%, 22% 84%)',
      wingClip: 'polygon(0% 48%, 16% 8%, 42% 32%, 50% 2%, 58% 32%, 84% 8%, 100% 48%, 84% 92%, 58% 68%, 50% 98%, 42% 68%, 16% 92%)',
      innerClip: 'polygon(50% 0%, 76% 42%, 62% 84%, 50% 66%, 38% 84%, 24% 42%)',
      bodyWidthPct: 116,
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
    visual: {
      bodyClip: 'polygon(22% 18%, 58% 0%, 92% 16%, 100% 44%, 86% 70%, 58% 76%, 48% 100%, 38% 76%, 10% 72%, 0% 48%, 8% 28%)',
      wingClip: 'polygon(8% 42%, 36% 18%, 78% 12%, 100% 38%, 86% 76%, 42% 82%, 10% 66%)',
      innerClip: 'polygon(30% 24%, 58% 8%, 84% 24%, 82% 56%, 58% 66%, 44% 92%, 36% 64%, 16% 54%)',
      bodyWidthPct: 116,
      bodyHeightPct: 74,
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
