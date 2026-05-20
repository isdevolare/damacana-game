export type FactCategory = 'cosmos' | 'quantum' | 'earth' | 'life' | 'future' | 'water';

export interface Fact {
  id: string;
  category: FactCategory;
  level: number | null;
  rewardShards: number;
}

export const CATEGORIES: FactCategory[] = ['cosmos', 'quantum', 'earth', 'life', 'future', 'water'];

export const CATEGORY_COLOR: Record<FactCategory, string> = {
  cosmos: '#b87aff',
  quantum: '#ff5ce8',
  earth: '#5cffa0',
  life: '#5cf6ff',
  future: '#ffd166',
  water: '#7ec8ff',
};

export const CATEGORY_GLYPH: Record<FactCategory, string> = {
  cosmos: '🌌',
  quantum: '⚛',
  earth: '🌍',
  life: '🧬',
  future: '🔭',
  water: '💧',
};

export const FACTS: Fact[] = [
  // Cosmos (level 3-4, then null)
  { id: 'cosmos_ageUniverse',      category: 'cosmos', level: 3,    rewardShards: 1 },
  { id: 'cosmos_observableSize',   category: 'cosmos', level: 3,    rewardShards: 1 },
  { id: 'cosmos_galaxyCount',      category: 'cosmos', level: 3,    rewardShards: 1 },
  { id: 'cosmos_blackHoleTime',    category: 'cosmos', level: 3,    rewardShards: 2 },
  { id: 'cosmos_andromedaCollision', category: 'cosmos', level: 4,  rewardShards: 2 },
  { id: 'cosmos_cmb',              category: 'cosmos', level: null, rewardShards: 1 },
  { id: 'cosmos_fermiParadox',     category: 'cosmos', level: null, rewardShards: 2 },
  { id: 'cosmos_darkMatter',       category: 'cosmos', level: null, rewardShards: 2 },
  { id: 'cosmos_voyager',          category: 'cosmos', level: null, rewardShards: 1 },
  { id: 'cosmos_greatAttractor',   category: 'cosmos', level: null, rewardShards: 2 },

  // Quantum (level 4-5, then null)
  { id: 'quantum_superposition',   category: 'quantum', level: 4,    rewardShards: 2 },
  { id: 'quantum_entanglement',    category: 'quantum', level: 4,    rewardShards: 2 },
  { id: 'quantum_observerEffect',  category: 'quantum', level: 5,    rewardShards: 2 },
  { id: 'quantum_tunneling',       category: 'quantum', level: 5,    rewardShards: 2 },
  { id: 'quantum_emptyAtom',       category: 'quantum', level: null, rewardShards: 1 },
  { id: 'quantum_waveParticle',    category: 'quantum', level: null, rewardShards: 2 },
  { id: 'quantum_planck',          category: 'quantum', level: null, rewardShards: 2 },
  { id: 'quantum_zeroPoint',       category: 'quantum', level: null, rewardShards: 2 },
  { id: 'quantum_manyWorlds',      category: 'quantum', level: null, rewardShards: 3 },
  { id: 'quantum_foam',            category: 'quantum', level: null, rewardShards: 2 },

  // Earth (level 1-2)
  { id: 'earth_innerCore',         category: 'earth', level: 1,    rewardShards: 1 },
  { id: 'earth_age',               category: 'earth', level: 1,    rewardShards: 1 },
  { id: 'earth_olympusMons',       category: 'earth', level: 2,    rewardShards: 1 },
  { id: 'earth_pacific',           category: 'earth', level: 2,    rewardShards: 1 },
  { id: 'earth_continentsMove',    category: 'earth', level: null, rewardShards: 1 },
  { id: 'earth_breath',            category: 'earth', level: null, rewardShards: 1 },
  { id: 'earth_lightning',         category: 'earth', level: null, rewardShards: 1 },
  { id: 'earth_glassRain',         category: 'earth', level: null, rewardShards: 2 },
  { id: 'earth_lightToAndromeda',  category: 'earth', level: null, rewardShards: 1 },
  { id: 'earth_oxygenApocalypse',  category: 'earth', level: null, rewardShards: 2 },

  // Life (level 2)
  { id: 'life_lastAncestor',       category: 'life', level: 2,    rewardShards: 2 },
  { id: 'life_youAreShip',         category: 'life', level: 2,    rewardShards: 1 },
  { id: 'life_brainPower',         category: 'life', level: 2,    rewardShards: 1 },
  { id: 'life_sharks',             category: 'life', level: null, rewardShards: 1 },
  { id: 'life_tardigrades',        category: 'life', level: null, rewardShards: 2 },
  { id: 'life_octopus',            category: 'life', level: null, rewardShards: 1 },
  { id: 'life_trees',              category: 'life', level: null, rewardShards: 1 },
  { id: 'life_whaleLanguage',      category: 'life', level: null, rewardShards: 1 },
  { id: 'life_immortalJellyfish',  category: 'life', level: null, rewardShards: 2 },
  { id: 'life_dnaTeaspoon',        category: 'life', level: null, rewardShards: 1 },

  // Future (level 5-6)
  { id: 'future_sunDeath',         category: 'future', level: 5, rewardShards: 2 },
  { id: 'future_heatDeath',        category: 'future', level: 6, rewardShards: 3 },
  { id: 'future_lastStars',        category: 'future', level: 6, rewardShards: 3 },
  { id: 'future_protonDecay',      category: 'future', level: 6, rewardShards: 2 },
  { id: 'future_frozenCosmos',     category: 'future', level: 6, rewardShards: 2 },
  { id: 'future_simulation',       category: 'future', level: null, rewardShards: 2 },
  { id: 'future_greatFilter',      category: 'future', level: null, rewardShards: 2 },
  { id: 'future_aiAscent',         category: 'future', level: null, rewardShards: 2 },
  { id: 'future_generationShips',  category: 'future', level: null, rewardShards: 1 },
  { id: 'future_theEnd',           category: 'future', level: null, rewardShards: 3 },

  // Water (level 0-1)
  { id: 'water_origin',            category: 'water', level: 0, rewardShards: 1 },
  { id: 'water_marianaDepth',      category: 'water', level: 0, rewardShards: 1 },
  { id: 'water_iceWeird',          category: 'water', level: 0, rewardShards: 1 },
  { id: 'water_71percent',         category: 'water', level: 0, rewardShards: 1 },
  { id: 'water_europa',            category: 'water', level: 0, rewardShards: 2 },
  { id: 'water_timeCapsule',       category: 'water', level: 1, rewardShards: 1 },
  { id: 'water_heavyWater',        category: 'water', level: 1, rewardShards: 1 },
  { id: 'water_everywhere',        category: 'water', level: null, rewardShards: 1 },
  { id: 'water_deepLayers',        category: 'water', level: null, rewardShards: 1 },
  { id: 'water_antarcticLakes',    category: 'water', level: null, rewardShards: 1 },
];

export function factById(id: string): Fact | undefined {
  return FACTS.find((f) => f.id === id);
}

export function factsByCategory(cat: FactCategory): Fact[] {
  return FACTS.filter((f) => f.category === cat);
}

export function pickFactForLevel(level: number, collected: Set<string>): Fact | undefined {
  const pool = FACTS.filter((f) => f.level === level && !collected.has(f.id));
  if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  // fallback: any uncollected fact
  const any = FACTS.filter((f) => !collected.has(f.id));
  if (any.length === 0) return undefined;
  return any[Math.floor(Math.random() * any.length)];
}

export function pickRandomBonusFact(collected: Set<string>): Fact | undefined {
  const pool = FACTS.filter((f) => !collected.has(f.id));
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function categoryComplete(cat: FactCategory, collected: Set<string>): boolean {
  return factsByCategory(cat).every((f) => collected.has(f.id));
}
