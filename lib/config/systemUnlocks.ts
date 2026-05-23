import type { ChapterId } from './chapters';

export type SystemId = 'abilities' | 'anomalies' | 'research' | 'buildTree' | 'codexAdvanced' | 'prestige';

export interface SystemUnlockContext {
  bossTier: number;
  completedChapters: ChapterId[];
  totalPrestiges: number;
  shards: number;
}

export function systemUnlocked(id: SystemId, ctx: SystemUnlockContext) {
  switch (id) {
    case 'abilities':
      return ctx.bossTier >= 5 || ctx.completedChapters.length > 0;
    case 'anomalies':
      return ctx.bossTier >= 10 || ctx.completedChapters.includes('earth');
    case 'research':
      return ctx.bossTier >= 11 || ctx.completedChapters.includes('earth');
    case 'buildTree':
      return ctx.bossTier >= 26 || ctx.completedChapters.includes('mars');
    case 'codexAdvanced':
      return ctx.bossTier >= 46 || ctx.completedChapters.includes('saturn');
    case 'prestige':
      return ctx.bossTier >= 71 || ctx.completedChapters.includes('neptune') || ctx.totalPrestiges > 0 || ctx.shards > 0;
    default:
      return false;
  }
}

export function systemRequirementKey(id: SystemId) {
  switch (id) {
    case 'abilities':
      return 'unlockReq.abilities';
    case 'anomalies':
      return 'unlockReq.anomalies';
    case 'research':
      return 'unlockReq.research';
    case 'buildTree':
      return 'unlockReq.buildTree';
    case 'codexAdvanced':
      return 'unlockReq.codexAdvanced';
    case 'prestige':
      return 'unlockReq.prestige';
    default:
      return 'unlockReq.default';
  }
}
