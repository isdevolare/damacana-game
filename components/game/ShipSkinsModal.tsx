'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useGame } from '@/lib/store';
import { currentChapter } from '@/lib/config/chapters';
import {
  SHIP_SKINS,
  shipSkinRequirementKey,
  shipSkinUnlocked,
  type ShipSkinDef,
  type ShipSkinRarity,
} from '@/lib/config/shipSkins';
import { clsx } from '@/lib/util';

const RARITY_STYLE: Record<ShipSkinRarity, { border: string; text: string; bg: string; badge: string; glow: string }> = {
  default: {
    border: 'border-white/20',
    text: 'text-white/70',
    bg: 'bg-white/[0.03]',
    badge: 'border-white/15 bg-white/[0.04]',
    glow: '0 0 18px rgba(255,255,255,0.08)',
  },
  rare: {
    border: 'border-cyan/40',
    text: 'text-cyan',
    bg: 'bg-cyan/[0.06]',
    badge: 'border-cyan/35 bg-cyan/10',
    glow: '0 0 22px rgba(92,246,255,0.13)',
  },
  epic: {
    border: 'border-purple/45',
    text: 'text-purple',
    bg: 'bg-purple/[0.08]',
    badge: 'border-purple/40 bg-purple/10',
    glow: '0 0 26px rgba(184,122,255,0.16)',
  },
  legendary: {
    border: 'border-gold/55',
    text: 'text-gold',
    bg: 'bg-gold/[0.08]',
    badge: 'border-gold/50 bg-gold/10',
    glow: '0 0 30px rgba(255,209,102,0.2)',
  },
  cosmic: {
    border: 'border-pink/55',
    text: 'text-pink',
    bg: 'bg-pink/[0.08]',
    badge: 'border-pink/45 bg-pink/10',
    glow: '0 0 34px rgba(255,92,232,0.22)',
  },
};

function ShipPreview({ skin, small = false }: { skin: ShipSkinDef; small?: boolean }) {
  const frameSize = small ? 70 : 86;
  const bodyWidth = `${skin.visual.bodyWidthPct}%`;
  const bodyHeight = `${skin.visual.bodyHeightPct}%`;
  const innerWidth = `${skin.visual.bodyWidthPct * 0.52}%`;
  const innerHeight = `${skin.visual.bodyHeightPct * 0.74}%`;
  const coreSize = `${skin.visual.coreSizePct}%`;
  const renderEffect = () => {
    switch (skin.visual.effect) {
      case 'orbitRing':
        return (
          <>
            <div
              className="absolute left-1/2 top-1/2 rounded-[50%] border"
              style={{
                width: small ? 72 : 88,
                height: small ? 30 : 36,
                borderColor: `${skin.accent}80`,
                boxShadow: `0 0 14px ${skin.glow}`,
                transform: 'translate(-50%, -50%) rotate(-10deg)',
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 rounded-[50%] border border-white/15"
              style={{ width: small ? 82 : 98, height: small ? 18 : 24, transform: 'translate(-50%, -50%) rotate(13deg)' }}
            />
          </>
        );
      case 'fragments':
        return (
          <>
            {[[-23, -18, 8], [24, -8, -16], [-19, 20, -28]].map(([x, y, rotate]) => (
              <div
                key={`${x}-${y}`}
                className="absolute left-1/2 top-1/2 h-2 w-1.5 border border-purple/50 bg-purple/30"
                style={{
                  boxShadow: `0 0 10px ${skin.glow}`,
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotate}deg)`,
                  clipPath: 'polygon(50% 0%, 100% 100%, 0% 74%)',
                }}
              />
            ))}
          </>
        );
      case 'prestigeAura':
        return (
          <>
            <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/25" />
            <div className="absolute left-1/2 top-1/2 h-[96%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink/20" />
          </>
        );
      case 'ascensionAura':
        return (
          <>
            <div className="absolute left-1/2 top-1/2 h-[88%] w-[112%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
            <div className="absolute left-1/2 top-1/2 h-[108%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/25" />
            <div className="absolute left-1/2 top-[18%] h-1 w-10 -translate-x-1/2 rounded-full bg-white/50 blur-sm" />
          </>
        );
      case 'whaleWake':
        return (
          <>
            <div className="absolute left-[18%] top-1/2 h-[54%] w-[78%] -translate-y-1/2 rounded-full border-l border-cyan/25" />
            <div className="absolute left-[8%] top-1/2 h-[34%] w-[70%] -translate-y-1/2 rounded-full border-l border-purple/25" />
            <div className="absolute right-[8%] top-[32%] h-1.5 w-1.5 rounded-full bg-cyan/70 shadow-[0_0_8px_rgba(128,255,244,0.7)]" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={clsx('relative mx-auto flex shrink-0 items-center justify-center', small ? 'h-16 w-20' : 'h-20 w-24')}
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-1/2 rounded-full border opacity-55"
        style={{
          width: frameSize,
          height: frameSize,
          borderColor: `${skin.accent}66`,
          boxShadow: `0 0 ${small ? 16 : 22}px ${skin.glow}`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      {renderEffect()}
      <div
        className="absolute bottom-0 left-1/2 h-8 w-5 -translate-x-1/2 rounded-full blur-md"
        style={{ background: skin.engine, opacity: 0.7, boxShadow: `0 0 16px ${skin.engine}` }}
      />
      <div
        className="absolute border"
        style={{
          width: bodyWidth,
          height: bodyHeight,
          borderRadius: skin.visual.bodyRadius,
          borderColor: `${skin.accent}88`,
          background: `linear-gradient(110deg, ${skin.hull} 8%, ${skin.accent}55 46%, ${skin.hull} 88%)`,
          boxShadow: `0 0 12px ${skin.glow}`,
          clipPath: skin.visual.wingClip,
          opacity: 0.72,
        }}
      />
      <div
        className="absolute border"
        style={{
          width: bodyWidth,
          height: bodyHeight,
          borderRadius: skin.visual.bodyRadius,
          borderColor: `${skin.accent}a0`,
          background: `linear-gradient(180deg, ${skin.accent}44, ${skin.hull} 62%)`,
          boxShadow: `0 0 18px ${skin.glow}`,
          clipPath: skin.visual.bodyClip,
        }}
      />
      <div
        className="absolute border border-white/10"
        style={{
          width: innerWidth,
          height: innerHeight,
          background: `${skin.hull}d8`,
          clipPath: skin.visual.innerClip,
        }}
      />
      <div
        className="absolute left-1/2 top-[33%] -translate-x-1/2 rounded-full bg-white/88"
        style={{ width: coreSize, height: coreSize, boxShadow: `0 0 14px ${skin.accent}` }}
      />
    </div>
  );
}

export function ShipSkinsModal() {
  const show = useGame((s) => s.showShipSkins);
  const setShow = useGame((s) => s.setShowShipSkins);
  const equippedShipSkinId = useGame((s) => s.equippedShipSkinId);
  const equipShipSkin = useGame((s) => s.equipShipSkin);
  const completedChapters = useGame((s) => s.completedChapters);
  const bestBossTier = useGame((s) => s.bestBossTier);
  const runArtifacts = useGame((s) => s.runArtifacts);
  const permanentArtifacts = useGame((s) => s.permanentArtifacts);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const totalAscensions = useGame((s) => s.totalAscensions);
  const t = useTranslations('shipSkins');
  const ui = useTranslations('ui');
  const chapter = currentChapter(completedChapters);
  const context = {
    completedChapters,
    currentChapterId: chapter.id,
    bestBossTier,
    artifactCount: runArtifacts.length + permanentArtifacts.length,
    totalPrestiges,
    totalAscensions,
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/85 p-2 sm:p-6 sm:backdrop-blur-sm"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="max-h-[calc(100dvh_-_1rem_-_env(safe-area-inset-bottom))] w-full max-w-md overflow-y-auto rounded-xl border border-cyan/40 bg-black/92 p-2.5 shadow-[0_0_20px_rgba(92,246,255,0.1)] sm:max-h-[88dvh] sm:p-4 sm:shadow-[0_0_34px_rgba(92,246,255,0.14)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="font-major text-lg text-cyan">{t('title')}</div>
                <div className="mt-1 font-space text-[9px] uppercase tracking-[0.18em] text-white/40">{t('subtitle')}</div>
              </div>
              <button
                type="button"
                onClick={() => setShow(false)}
                className="rounded-md border border-white/15 px-2 py-1 font-space text-[10px] uppercase tracking-widest text-white/65"
              >
                {ui('close')}
              </button>
            </div>

            <div className="grid gap-2">
              {SHIP_SKINS.map((skin) => {
                const unlocked = shipSkinUnlocked(skin, context);
                const equipped = equippedShipSkinId === skin.id || (!equippedShipSkinId && skin.id === 'defaultCoreShip');
                const rarity = RARITY_STYLE[skin.rarity];
                return (
                  <div
                    key={skin.id}
                    className={clsx('relative overflow-hidden rounded-lg border p-2.5', rarity.border, rarity.bg, !unlocked && 'opacity-[0.78]')}
                    style={{ boxShadow: unlocked ? rarity.glow : 'inset 0 0 24px rgba(0,0,0,0.28)' }}
                  >
                    <div
                      className="pointer-events-none absolute inset-x-8 -top-10 h-16 rounded-full blur-2xl"
                      style={{ background: skin.accent, opacity: unlocked ? 0.12 : 0.06 }}
                    />
                    <div className="flex gap-3">
                      <div
                        className={clsx('relative overflow-hidden rounded-lg border bg-black/50 px-1', unlocked ? 'border-white/15' : 'border-white/10')}
                        style={{ boxShadow: `inset 0 0 18px ${skin.glow}` }}
                      >
                        <ShipPreview skin={skin} small />
                        {!unlocked && <div className="absolute inset-0 bg-black/38 backdrop-saturate-50" />}
                        {equipped && <div className="absolute inset-x-2 bottom-1 h-px bg-cyan shadow-[0_0_8px_rgba(92,246,255,0.8)]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate font-space text-[11px] uppercase tracking-[0.14em] text-white/90">
                              {t(`skins.${skin.i18nKey}.name` as any)}
                            </div>
                            <div className={clsx('mt-1 inline-flex rounded border px-1.5 py-0.5 font-space text-[8px] uppercase tracking-[0.16em]', rarity.text, rarity.badge)}>
                              {t(`rarity.${skin.rarity}` as any)}
                            </div>
                          </div>
                          <span className={clsx('shrink-0 rounded border px-1.5 py-0.5 font-space text-[8px] uppercase tracking-[0.14em]', equipped ? 'border-cyan/45 text-cyan' : unlocked ? 'border-white/15 text-white/45' : 'border-danger/35 text-danger/80')}>
                            {equipped ? t('state.equipped') : unlocked ? t('state.unlocked') : t('state.locked')}
                          </span>
                        </div>
                        <div className="mt-1 font-space text-[9px] leading-relaxed text-white/45">
                          {t(`requirements.${shipSkinRequirementKey(skin)}` as any, {
                            count: skin.unlock.count ?? 0,
                          })}
                        </div>
                        {skin.isPremiumPlaceholder && (
                          <div className="mt-1 font-space text-[8px] uppercase tracking-[0.14em] text-gold/75">
                            {t('futurePremium', { price: skin.pricePlaceholder ?? t('soon') })}
                          </div>
                        )}
                        <button
                          type="button"
                          disabled={!unlocked || equipped}
                          onClick={() => equipShipSkin(skin.id)}
                          className={clsx(
                            'mt-2 w-full rounded-md border px-2 py-1.5 font-space text-[9px] uppercase tracking-[0.16em] transition active:scale-95',
                            unlocked && !equipped
                              ? 'border-cyan/45 bg-cyan/10 text-cyan shadow-[0_0_14px_rgba(92,246,255,0.14)]'
                              : 'border-white/10 bg-white/[0.03] text-white/35',
                          )}
                        >
                          {equipped ? t('button.equipped') : unlocked ? t('button.equip') : t('button.locked')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
