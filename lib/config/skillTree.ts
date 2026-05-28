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
  { id: 'sharpDrop',    branch: 'offense', tier: 1, cost: 40,    effect: 'tapMult', value: 0.8 },
  { id: 'cosmicFang',   branch: 'offense', tier: 2, cost: 180,   effect: 'tapMult', value: 1.65 },
  { id: 'critDrop',     branch: 'offense', tier: 3, cost: 650,   effect: 'critChance', value: 0.28 },
  { id: 'bossKiller',   branch: 'offense', tier: 4, cost: 2200,  effect: 'bossDmgMult', value: 2.35 },
  { id: 'voidBurst',    branch: 'offense', tier: 5, cost: 8500,  effect: 'activeVoidBurst' },
  { id: 'voidClaw',     branch: 'offense', tier: 6, cost: 18000, effect: 'tapMult', value: 5.8 },
  // Flow
  { id: 'wideFaucet',   branch: 'flow',    tier: 1, cost: 40,    effect: 'flowMult', value: 0.9 },
  { id: 'flowChannel',  branch: 'flow',    tier: 2, cost: 180,   effect: 'flowMult', value: 1.75 },
  { id: 'autoTap',      branch: 'flow',    tier: 3, cost: 650,   effect: 'autoTapRate', value: 1.8 },
  { id: 'fastPump',     branch: 'flow',    tier: 4, cost: 2200,  effect: 'flowMult', value: 2.65 },
  { id: 'flood',        branch: 'flow',    tier: 5, cost: 8500,  effect: 'activeFlood' },
  { id: 'infiniteFlow', branch: 'flow',    tier: 6, cost: 18000, effect: 'flowMult', value: 6.2 },
  // Void
  { id: 'shardAttractor', branch: 'void',  tier: 1, cost: 40,    effect: 'shardDropMult', value: 1.25 },
  { id: 'halo',           branch: 'void',  tier: 2, cost: 180,   effect: 'visualHalo' },
  { id: 'doubleShard',    branch: 'void',  tier: 3, cost: 650,   effect: 'shardDoubleChance', value: 0.55 },
  { id: 'evolutionShock', branch: 'void',  tier: 4, cost: 2200,  effect: 'evolutionBonusMult', value: 4 },
  { id: 'crown',          branch: 'void',  tier: 5, cost: 8500,  effect: 'visualCrown' },
  { id: 'guaranteedShards', branch: 'void', tier: 6, cost: 18000, effect: 'runShardsBonus', value: 12 },
  // Chaos
  { id: 'startingGift', branch: 'chaos',   tier: 1, cost: 40,    effect: 'startingDmc', value: 5000 },
  { id: 'comboMaster',  branch: 'chaos',   tier: 2, cost: 180,   effect: 'comboMaxOverride', value: 5000 },
  { id: 'luckyTap',     branch: 'chaos',   tier: 3, cost: 650,   effect: 'luckyTap', value: 12 },
  { id: 'eventMagnet',  branch: 'chaos',   tier: 4, cost: 2200,  effect: 'eventMagnet' },
  { id: 'timeLoop',     branch: 'chaos',   tier: 5, cost: 8500,  effect: 'activeTimeLoop' },
  { id: 'chaosCore',    branch: 'chaos',   tier: 6, cost: 18000, effect: 'freeUpgradeChance', value: 0.28 },
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

export function skillTreeSurchargeMultiplier(ownedCount: number): number {
  if (ownedCount >= 20) return 4;
  if (ownedCount >= 15) return 2.5;
  if (ownedCount >= 10) return 1.75;
  if (ownedCount >= 6) return 1.25;
  return 1;
}

export function skillNodeCost(node: SkillNode, ownedCount: number): number {
  return Math.ceil(node.cost * skillTreeSurchargeMultiplier(ownedCount));
}

export function skillBranchOwnedCount(tree: Record<string, boolean>, branch: SkillBranch): number {
  return SKILL_TREE.filter((node) => node.branch === branch && tree[node.id]).length;
}

export function skillBranchRequiredCount(tier: number): number {
  if (tier >= 6) return 5;
  if (tier >= 5) return 4;
  if (tier >= 4) return 3;
  if (tier >= 3) return 2;
  return 0;
}

export function skillTotalRequiredCount(tier: number): number {
  if (tier >= 6) return 14;
  if (tier >= 5) return 10;
  if (tier >= 4) return 6;
  if (tier >= 3) return 4;
  return 0;
}
