export interface Achievement {
  id: string;
  // Triggered by checker that reads state
  check: (s: AchievementState) => boolean;
}

export interface AchievementState {
  levelIdx: number;
  bestLevel: number;
  totalPrestiges: number;
  bossKillsThisRun: number;
  bossKillsLifetime: number;
  bestBossTier: number;
  collectedFacts: string[];
  shards: number;
  treeOwnedCount: number;
  bestCombo: number;
  fastestLevel6Ms: number | null;
  totalPlayMs: number;
  voidBurstUses: number;
  cosmosComplete: boolean;
  unlockedCount: number;
}

const NON_TERMINAL_IDS = [
  'firstDrop', 'evolving', 'classified', 'reset', 'loopContinues', 'eternal',
  'bossHunter', 'bossMaster', 'megaSlayer', 'knowledgeBegins', 'polymath',
  'omniscient', 'cosmosCalls', 'shardHoarder', 'skillForest', 'comboLord',
  'speedrunner', 'patientOne', 'voidResponds',
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'firstDrop',        check: (s) => s.bestLevel >= 1 },
  { id: 'evolving',         check: (s) => s.bestLevel >= 3 },
  { id: 'classified',       check: (s) => s.bestLevel >= 6 },
  { id: 'reset',            check: (s) => s.totalPrestiges >= 1 },
  { id: 'loopContinues',    check: (s) => s.totalPrestiges >= 5 },
  { id: 'eternal',          check: (s) => s.totalPrestiges >= 25 },
  { id: 'bossHunter',       check: (s) => s.bossKillsThisRun >= 50 },
  { id: 'bossMaster',       check: (s) => s.bossKillsLifetime >= 500 },
  { id: 'megaSlayer',       check: (s) => s.bestBossTier >= 25 },
  { id: 'knowledgeBegins',  check: (s) => s.collectedFacts.length >= 1 },
  { id: 'polymath',         check: (s) => s.collectedFacts.length >= 30 },
  { id: 'omniscient',       check: (s) => s.collectedFacts.length >= 60 },
  { id: 'cosmosCalls',      check: (s) => s.cosmosComplete },
  { id: 'shardHoarder',     check: (s) => s.shards >= 100 },
  { id: 'skillForest',      check: (s) => s.treeOwnedCount >= 12 },
  { id: 'comboLord',        check: (s) => s.bestCombo >= 10 },
  { id: 'speedrunner',      check: (s) => s.fastestLevel6Ms !== null && s.fastestLevel6Ms <= 20 * 60 * 1000 },
  { id: 'patientOne',       check: (s) => s.totalPlayMs >= 24 * 60 * 60 * 1000 },
  { id: 'voidResponds',     check: (s) => s.voidBurstUses >= 50 },
  { id: 'unclassifiable',   check: (s) => s.unlockedCount >= NON_TERMINAL_IDS.length },
];

export const NON_TERMINAL_ACHIEVEMENT_IDS = NON_TERMINAL_IDS;
