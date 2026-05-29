export type ShipSkinRarity = 'default' | 'rare' | 'epic' | 'legendary' | 'cosmic';

export interface ShipSkinDef {
  id: string;
  rarity: ShipSkinRarity;
  nameKey: string;
  accent: string;
  engine: string;
  hull: string;
  glow: string;
  unlock: 'starter' | 'futureShop' | 'futureDrop';
}

export const SHIP_SKINS: ShipSkinDef[] = [
  {
    id: 'defaultCoreShip',
    rarity: 'default',
    nameKey: 'shipSkins.defaultCoreShip',
    accent: '#5cf6ff',
    engine: '#ff5ce8',
    hull: '#071923',
    glow: 'rgba(92,246,255,0.72)',
    unlock: 'starter',
  },
  {
    id: 'rareVectorWing',
    rarity: 'rare',
    nameKey: 'shipSkins.rareVectorWing',
    accent: '#80fff4',
    engine: '#ffd166',
    hull: '#061b24',
    glow: 'rgba(128,255,244,0.72)',
    unlock: 'futureShop',
  },
  {
    id: 'epicVoidInterceptor',
    rarity: 'epic',
    nameKey: 'shipSkins.epicVoidInterceptor',
    accent: '#b87aff',
    engine: '#ff5ce8',
    hull: '#120a22',
    glow: 'rgba(184,122,255,0.72)',
    unlock: 'futureShop',
  },
  {
    id: 'legendarySolarCarrier',
    rarity: 'legendary',
    nameKey: 'shipSkins.legendarySolarCarrier',
    accent: '#ffd166',
    engine: '#ff6b4a',
    hull: '#241607',
    glow: 'rgba(255,209,102,0.72)',
    unlock: 'futureDrop',
  },
  {
    id: 'cosmicSingularityMothership',
    rarity: 'cosmic',
    nameKey: 'shipSkins.cosmicSingularityMothership',
    accent: '#ffffff',
    engine: '#5cf6ff',
    hull: '#07070d',
    glow: 'rgba(255,255,255,0.72)',
    unlock: 'futureShop',
  },
];

export const DEFAULT_SHIP_SKIN_ID = 'defaultCoreShip';
