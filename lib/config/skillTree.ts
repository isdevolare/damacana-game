export type SkillBranch = 'offense' | 'flow' | 'void' | 'chaos';

export type SkillEffect =
  | 'tapMult'
  | 'flowMult'
  | 'critChance'
  | 'critMult'
  | 'bossDmgMult'
  | 'autoTapRate'
  | 'shardDropMult'
  | 'shardDoubleChance'
  | 'evolutionBonusMult'
  | 'runShardsBonus'
  | 'startingDmc'
  | 'comboMaxOverride'
  | 'luckyTap'
  | 'eventMagnet'
  | 'freeUpgradeChance'
  | 'activeVoidBurst'
  | 'activeFlood'
  | 'activeTimeLoop'
  | 'visualHalo'
  | 'visualCrown';

export interface SkillNode {
  id: string;
  branch: SkillBranch;
  tier: number;
  cost: number;
  effect: SkillEffect;
  value?: number;
}

export const SKILL_TREE: SkillNode[] = [
  // Offense
  { id: 'sharpDrop',    branch: 'offense', tier: 1, cost: 1,  effect: 'tapMult', value: 0.25 },
  { id: 'cosmicFang',   branch: 'offense', tier: 2, cost: 3,  effect: 'tapMult', value: 0.5 },
  { id: 'critDrop',     branch: 'offense', tier: 3, cost: 5,  effect: 'critChance', value: 0.1 },
  { id: 'bossKiller',   branch: 'offense', tier: 4, cost: 8,  effect: 'bossDmgMult', value: 1.0 },
  { id: 'voidBurst',    branch: 'offense', tier: 5, cost: 12, effect: 'activeVoidBurst' },
  { id: 'voidClaw',     branch: 'offense', tier: 6, cost: 20, effect: 'tapMult', value: 2.0 },
  // Flow
  { id: 'wideFaucet',   branch: 'flow',    tier: 1, cost: 1,  effect: 'flowMult', value: 0.25 },
  { id: 'flowChannel',  branch: 'flow',    tier: 2, cost: 3,  effect: 'flowMult', value: 0.5 },
  { id: 'autoTap',      branch: 'flow',    tier: 3, cost: 5,  effect: 'autoTapRate', value: 0.5 },
  { id: 'fastPump',     branch: 'flow',    tier: 4, cost: 8,  effect: 'flowMult', value: 1.0 },
  { id: 'flood',        branch: 'flow',    tier: 5, cost: 12, effect: 'activeFlood' },
  { id: 'infiniteFlow', branch: 'flow',    tier: 6, cost: 20, effect: 'flowMult', value: 2.0 },
  // Void
  { id: 'shardAttractor', branch: 'void',  tier: 1, cost: 1,  effect: 'shardDropMult', value: 0.5 },
  { id: 'halo',           branch: 'void',  tier: 2, cost: 3,  effect: 'visualHalo' },
  { id: 'doubleShard',    branch: 'void',  tier: 3, cost: 5,  effect: 'shardDoubleChance', value: 0.25 },
  { id: 'evolutionShock', branch: 'void',  tier: 4, cost: 8,  effect: 'evolutionBonusMult', value: 2 },
  { id: 'crown',          branch: 'void',  tier: 5, cost: 12, effect: 'visualCrown' },
  { id: 'guaranteedShards', branch: 'void', tier: 6, cost: 20, effect: 'runShardsBonus', value: 5 },
  // Chaos
  { id: 'startingGift', branch: 'chaos',   tier: 1, cost: 1,  effect: 'startingDmc', value: 100 },
  { id: 'comboMaster',  branch: 'chaos',   tier: 2, cost: 3,  effect: 'comboMaxOverride', value: 10 },
  { id: 'luckyTap',     branch: 'chaos',   tier: 3, cost: 5,  effect: 'luckyTap' },
  { id: 'eventMagnet',  branch: 'chaos',   tier: 4, cost: 8,  effect: 'eventMagnet' },
  { id: 'timeLoop',     branch: 'chaos',   tier: 5, cost: 12, effect: 'activeTimeLoop' },
  { id: 'chaosCore',    branch: 'chaos',   tier: 6, cost: 20, effect: 'freeUpgradeChance', value: 0.1 },
];

export const BRANCHES: SkillBranch[] = ['offense', 'flow', 'void', 'chaos'];

export function nodesOfBranch(b: SkillBranch): SkillNode[] {
  return SKILL_TREE.filter((n) => n.branch === b).sort((a, c) => a.tier - c.tier);
}

export function nodeById(id: string): SkillNode | undefined {
  return SKILL_TREE.find((n) => n.id === id);
}

export function previousNode(node: SkillNode): SkillNode | undefined {
  if (node.tier === 1) return undefined;
  return SKILL_TREE.find((n) => n.branch === node.branch && n.tier === node.tier - 1);
}
