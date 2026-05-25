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
  { id: 'sharpDrop',    branch: 'offense', tier: 1, cost: 2,   effect: 'tapMult', value: 0.55 },
  { id: 'cosmicFang',   branch: 'offense', tier: 2, cost: 7,   effect: 'tapMult', value: 1.15 },
  { id: 'critDrop',     branch: 'offense', tier: 3, cost: 16,  effect: 'critChance', value: 0.2 },
  { id: 'bossKiller',   branch: 'offense', tier: 4, cost: 32,  effect: 'bossDmgMult', value: 1.75 },
  { id: 'voidBurst',    branch: 'offense', tier: 5, cost: 60,  effect: 'activeVoidBurst' },
  { id: 'voidClaw',     branch: 'offense', tier: 6, cost: 110, effect: 'tapMult', value: 4.2 },
  // Flow
  { id: 'wideFaucet',   branch: 'flow',    tier: 1, cost: 2,   effect: 'flowMult', value: 0.65 },
  { id: 'flowChannel',  branch: 'flow',    tier: 2, cost: 7,   effect: 'flowMult', value: 1.25 },
  { id: 'autoTap',      branch: 'flow',    tier: 3, cost: 16,  effect: 'autoTapRate', value: 1.2 },
  { id: 'fastPump',     branch: 'flow',    tier: 4, cost: 32,  effect: 'flowMult', value: 1.9 },
  { id: 'flood',        branch: 'flow',    tier: 5, cost: 60,  effect: 'activeFlood' },
  { id: 'infiniteFlow', branch: 'flow',    tier: 6, cost: 110, effect: 'flowMult', value: 4.5 },
  // Void
  { id: 'shardAttractor', branch: 'void',  tier: 1, cost: 2,   effect: 'shardDropMult', value: 0.95 },
  { id: 'halo',           branch: 'void',  tier: 2, cost: 7,   effect: 'visualHalo' },
  { id: 'doubleShard',    branch: 'void',  tier: 3, cost: 16,  effect: 'shardDoubleChance', value: 0.45 },
  { id: 'evolutionShock', branch: 'void',  tier: 4, cost: 32,  effect: 'evolutionBonusMult', value: 3 },
  { id: 'crown',          branch: 'void',  tier: 5, cost: 60,  effect: 'visualCrown' },
  { id: 'guaranteedShards', branch: 'void', tier: 6, cost: 110, effect: 'runShardsBonus', value: 5 },
  // Chaos
  { id: 'startingGift', branch: 'chaos',   tier: 1, cost: 2,   effect: 'startingDmc', value: 1000 },
  { id: 'comboMaster',  branch: 'chaos',   tier: 2, cost: 7,   effect: 'comboMaxOverride', value: 3500 },
  { id: 'luckyTap',     branch: 'chaos',   tier: 3, cost: 16,  effect: 'luckyTap', value: 9 },
  { id: 'eventMagnet',  branch: 'chaos',   tier: 4, cost: 32,  effect: 'eventMagnet' },
  { id: 'timeLoop',     branch: 'chaos',   tier: 5, cost: 60,  effect: 'activeTimeLoop' },
  { id: 'chaosCore',    branch: 'chaos',   tier: 6, cost: 110, effect: 'freeUpgradeChance', value: 0.22 },
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

export interface SkillUnlockContext {
  bossTier: number;
  totalPrestiges: number;
}

export function skillTierUnlocked(tier: number, ctx: SkillUnlockContext): boolean {
  if (ctx.totalPrestiges > 0 && tier <= 6) return true;
  if (tier <= 1) return ctx.bossTier >= 3;
  if (tier === 2) return ctx.bossTier >= 11;
  if (tier === 3) return ctx.bossTier >= 18;
  if (tier === 4) return ctx.bossTier >= 26;
  if (tier === 5) return ctx.bossTier >= 35;
  return ctx.bossTier >= 46 || ctx.totalPrestiges >= 1;
}

export function skillTierRequirementKey(tier: number): string {
  if (tier <= 1) return 'requirements.tier1';
  if (tier === 2) return 'requirements.tier2';
  if (tier === 3) return 'requirements.tier3';
  if (tier === 4) return 'requirements.tier4';
  if (tier === 5) return 'requirements.tier5';
  return 'requirements.tier6';
}
