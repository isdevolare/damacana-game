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

const RARITY_STYLE: Record<ShipSkinRarity, { border: string; text: string; bg: string }> = {
  default: { border: 'border-white/20', text: 'text-white/70', bg: 'bg-white/[0.03]' },
  rare: { border: 'border-cyan/35', text: 'text-cyan', bg: 'bg-cyan/[0.06]' },
  epic: { border: 'border-purple/40', text: 'text-purple', bg: 'bg-purple/[0.07]' },
  legendary: { border: 'border-gold/45', text: 'text-gold', bg: 'bg-gold/[0.07]' },
  cosmic: { border: 'border-pink/45', text: 'text-pink', bg: 'bg-pink/[0.07]' },
};

function ShipPreview({ skin, small = false }: { skin: ShipSkinDef; small?: boolean }) {
  return (
    <div
      className={clsx('relative mx-auto flex shrink-0 items-center justify-center', small ? 'h-16 w-20' : 'h-20 w-24')}
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-1/2 rounded-full border opacity-45"
        style={{
          width: small ? 64 : 78,
          height: small ? 64 : 78,
          borderColor: `${skin.accent}66`,
          boxShadow: `0 0 ${small ? 16 : 22}px ${skin.glow}`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        className="absolute bottom-1 left-1/2 h-7 w-5 -translate-x-1/2 rounded-full blur-md"
        style={{ background: skin.engine, opacity: 0.65 }}
      />
      <div
        className="absolute h-[74%] w-[82%] border"
        style={{
          borderColor: `${skin.accent}88`,
          background: `linear-gradient(180deg, ${skin.accent}44, ${skin.hull} 62%)`,
          boxShadow: `0 0 18px ${skin.glow}`,
          clipPath: skin.silhouette === 'raider'
            ? 'polygon(58% 0%, 100% 48%, 58% 100%, 46% 68%, 0% 76%, 34% 50%, 0% 24%, 46% 32%)'
            : skin.silhouette === 'cruiser'
              ? 'polygon(50% 0%, 88% 22%, 100% 54%, 76% 100%, 50% 82%, 24% 100%, 0% 54%, 12% 22%)'
              : skin.silhouette === 'interceptor'
                ? 'polygon(50% 0%, 78% 28%, 100% 22%, 76% 56%, 92% 100%, 50% 74%, 8% 100%, 24% 56%, 0% 22%, 22% 28%)'
                : skin.silhouette === 'mothership'
                  ? 'polygon(4% 52%, 22% 18%, 42% 22%, 50% 0%, 58% 22%, 78% 18%, 96% 52%, 78% 88%, 58% 76%, 50% 100%, 42% 76%, 22% 88%)'
                  : skin.silhouette === 'whale'
                    ? 'polygon(50% 0%, 88% 18%, 100% 48%, 88% 78%, 62% 74%, 50% 100%, 38% 74%, 12% 78%, 0% 48%, 12% 18%)'
                    : 'polygon(50% 0%, 72% 28%, 96% 46%, 72% 58%, 62% 100%, 50% 78%, 38% 100%, 28% 58%, 4% 46%, 28% 28%)',
        }}
      />
      <div className="absolute top-[31%] h-4 w-4 rounded-full bg-white/85" style={{ boxShadow: `0 0 12px ${skin.accent}` }} />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-xl border border-cyan/40 bg-black/92 p-3 shadow-[0_0_34px_rgba(92,246,255,0.14)] sm:p-4"
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
                    className={clsx('rounded-lg border p-2.5', rarity.border, rarity.bg, !unlocked && 'opacity-72')}
                  >
                    <div className="flex gap-3">
                      <div className="rounded-md border border-white/10 bg-black/40 px-1">
                        <ShipPreview skin={skin} small />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate font-space text-[11px] uppercase tracking-[0.14em] text-white/90">
                              {t(`skins.${skin.i18nKey}.name` as any)}
                            </div>
                            <div className={clsx('mt-0.5 font-space text-[8px] uppercase tracking-[0.16em]', rarity.text)}>
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
