'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useGame } from '@/lib/store';
import { currentChapter } from '@/lib/config/chapters';
import {
  SHIP_SKINS,
  shipSkinById,
  shipSkinPurchasable,
  shipSkinRequirementKey,
  shipSkinUnlockProgress,
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
  common: {
    border: 'border-cyan/25',
    text: 'text-cyan/80',
    bg: 'bg-cyan/[0.035]',
    badge: 'border-cyan/25 bg-cyan/[0.07]',
    glow: '0 0 18px rgba(92,246,255,0.1)',
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

type SkinFilter = 'all' | 'owned' | 'purchasable' | 'locked' | 'cosmic';
type RarityFilter = ShipSkinRarity | 'all';

const FILTERS: SkinFilter[] = ['all', 'owned', 'purchasable', 'locked', 'cosmic'];
const RARITY_FILTERS: RarityFilter[] = ['all', 'common', 'rare', 'epic', 'legendary', 'cosmic'];

function ShipPreview({ skin, small = false, hero = false }: { skin: ShipSkinDef; small?: boolean; hero?: boolean }) {
  const frameSize = hero ? 174 : small ? 82 : 132;
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
      case 'bladeTrail':
        return (
          <div
            className="absolute left-1/2 top-[58%] h-[52%] w-[24%] -translate-x-1/2 blur-sm"
            style={{ background: `linear-gradient(180deg, ${skin.engine}99, transparent)`, clipPath: 'polygon(44% 0%, 56% 0%, 100% 100%, 0% 100%)' }}
          />
        );
      case 'iceMist':
        return (
          <>
            <div className="absolute left-[22%] top-[22%] h-1 w-8 rounded-full bg-cyan/30 blur-sm" />
            <div className="absolute right-[18%] bottom-[22%] h-1 w-10 rounded-full bg-white/25 blur-sm" />
          </>
        );
      case 'dragonWake':
        return (
          <>
            <div className="absolute left-1/2 top-[58%] h-[48%] w-[18%] -translate-x-1/2 rounded-full bg-gold/35 blur-sm" />
            <div className="absolute left-[18%] top-[36%] h-4 w-2 border border-danger/40" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 68%)' }} />
            <div className="absolute right-[18%] top-[36%] h-4 w-2 border border-danger/40" style={{ clipPath: 'polygon(50% 0%, 100% 68%, 0% 100%)' }} />
          </>
        );
      case 'eclipseHalo':
        return (
          <>
            <div className="absolute left-1/2 top-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple/25" />
            <div className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink/20" />
          </>
        );
      case 'singularity':
        return (
          <>
            <div className="absolute left-1/2 top-1/2 h-[108%] w-[108%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink/30" />
            <div className="absolute left-1/2 top-1/2 h-[54%] w-[138%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/20" style={{ transform: 'translate(-50%, -50%) rotate(-18deg)' }} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={clsx('relative mx-auto flex shrink-0 items-center justify-center', hero ? 'h-44 w-full max-w-[260px]' : small ? 'h-[86px] w-[104px]' : 'h-32 w-40')}
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
        style={{ width: coreSize, height: coreSize, background: skin.visual.coreColor, boxShadow: `0 0 14px ${skin.accent}` }}
      />
    </div>
  );
}

export function ShipSkinsModal() {
  const show = useGame((s) => s.showShipSkins);
  const setShow = useGame((s) => s.setShowShipSkins);
  const skinCredits = useGame((s) => s.skinCredits);
  const ownedShipSkinIds = useGame((s) => s.ownedShipSkinIds);
  const equippedShipSkinId = useGame((s) => s.equippedShipSkinId);
  const equipShipSkin = useGame((s) => s.equipShipSkin);
  const buyShipSkin = useGame((s) => s.buyShipSkin);
  const completedChapters = useGame((s) => s.completedChapters);
  const bestBossTier = useGame((s) => s.bestBossTier);
  const runArtifacts = useGame((s) => s.runArtifacts);
  const permanentArtifacts = useGame((s) => s.permanentArtifacts);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const totalAscensions = useGame((s) => s.totalAscensions);
  const t = useTranslations('shipSkins');
  const ui = useTranslations('ui');
  const [filter, setFilter] = useState<SkinFilter>('all');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');
  const [selectedSkinId, setSelectedSkinId] = useState(SHIP_SKINS[0]?.id ?? 'defaultCoreShip');
  const chapter = currentChapter(completedChapters);
  const context = {
    completedChapters,
    currentChapterId: chapter.id,
    bestBossTier,
    artifactCount: runArtifacts.length + permanentArtifacts.length,
    totalPrestiges,
    totalAscensions,
    ownedShipSkinIds: ownedShipSkinIds ?? [],
    skinCredits: skinCredits ?? 0,
  };
  const selectedSkin = shipSkinById(selectedSkinId);
  const selectedUnlocked = shipSkinUnlocked(selectedSkin, context);
  const selectedPurchasable = shipSkinPurchasable(selectedSkin, context);
  const selectedEquipped = equippedShipSkinId === selectedSkin.id || (!equippedShipSkinId && selectedSkin.id === 'defaultCoreShip');
  const selectedProgress = shipSkinUnlockProgress(selectedSkin, context);
  const selectedRarity = RARITY_STYLE[selectedSkin.rarity];
  const filteredSkins = useMemo(() => SHIP_SKINS.filter((skin) => {
    const unlocked = shipSkinUnlocked(skin, context);
    const purchasable = shipSkinPurchasable(skin, context);
    const categoryPass =
      filter === 'owned' ? unlocked :
      filter === 'purchasable' ? purchasable :
      filter === 'locked' ? !unlocked && !purchasable :
      filter === 'cosmic' ? skin.rarity === 'cosmic' :
      true;
    const rarityPass = rarityFilter === 'all' || skin.rarity === rarityFilter;
    return categoryPass && rarityPass;
  }), [context, filter, rarityFilter]);

  const actionLabel = selectedEquipped
    ? t('button.equipped')
    : selectedUnlocked
      ? t('button.equip')
      : selectedPurchasable
        ? t('button.buy')
        : selectedSkin.isPremiumPlaceholder
          ? t('futurePremium')
          : t('button.locked');

  const actionDisabled = selectedEquipped || (!selectedUnlocked && !selectedPurchasable);
  const stateLabel = selectedEquipped
    ? t('state.equipped')
    : selectedUnlocked
      ? t('state.owned')
      : selectedPurchasable
        ? t('state.purchasable')
        : t('state.locked');
  const ownedCount = SHIP_SKINS.filter((skin) => shipSkinUnlocked(skin, context)).length;

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
            className="max-h-[calc(var(--app-height,100dvh)_-_1rem_-_env(safe-area-inset-bottom))] w-full max-w-4xl overflow-y-auto rounded-xl border border-cyan/35 bg-[#030712]/95 p-2.5 shadow-[0_0_28px_rgba(92,246,255,0.12)] sm:max-h-[88dvh] sm:p-4 sm:shadow-[0_0_44px_rgba(92,246,255,0.16)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="font-major text-lg text-cyan">{t('title')}</div>
                <div className="mt-1 font-space text-[9px] uppercase tracking-[0.18em] text-white/40">{t('subtitle')}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <div className="rounded-md border border-gold/35 bg-gold/10 px-2 py-1 font-space text-[10px] uppercase tracking-[0.16em] text-gold">
                    {t('credits')}: {skinCredits ?? 0}
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-space text-[10px] uppercase tracking-[0.16em] text-white/45">
                    {ownedCount}/{SHIP_SKINS.length} {t('ownedCount')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShow(false)}
                className="rounded-md border border-white/15 px-2 py-1 font-space text-[10px] uppercase tracking-widest text-white/65"
              >
                {ui('close')}
              </button>
            </div>

            <section
              className={clsx('relative mb-3 overflow-hidden rounded-xl border bg-white/[0.035] p-3', selectedRarity.border)}
              style={{ boxShadow: `inset 0 0 42px ${selectedSkin.glow}, ${selectedRarity.glow}` }}
            >
              <div className="pointer-events-none absolute inset-x-12 -top-20 h-40 rounded-full blur-3xl" style={{ background: selectedSkin.accent, opacity: 0.16 }} />
              <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_300px]">
                <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/45 py-3">
                  <div className="absolute left-4 top-3 rounded border border-white/10 bg-black/40 px-2 py-1 font-space text-[8px] uppercase tracking-[0.16em] text-white/45">
                    {t('heroPreview')}
                  </div>
                  <ShipPreview skin={selectedSkin} hero />
                </div>
                <div className="relative rounded-lg border border-white/10 bg-black/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-space text-[13px] uppercase tracking-[0.16em] text-white/90">
                        {t(`skins.${selectedSkin.i18nKey}.name` as any)}
                      </div>
                      <div className={clsx('mt-1 inline-flex rounded border px-1.5 py-0.5 font-space text-[8px] uppercase tracking-[0.16em]', selectedRarity.text, selectedRarity.badge)}>
                        {t(`rarity.${selectedSkin.rarity}` as any)}
                      </div>
                    </div>
                    <div className={clsx('rounded border px-2 py-1 font-space text-[8px] uppercase tracking-[0.16em]', selectedEquipped ? 'border-cyan/45 text-cyan' : selectedUnlocked ? 'border-gold/35 text-gold' : selectedPurchasable ? 'border-cyan/35 text-cyan/80' : 'border-danger/35 text-danger/80')}>
                      {stateLabel}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 font-space text-[9px] uppercase tracking-[0.12em] text-white/45">
                    <div><span className="text-white/70">{t('detail.unlock')}</span> · {t(`requirements.${shipSkinRequirementKey(selectedSkin)}` as any, { count: selectedSkin.unlock.count ?? 0 })}</div>
                    <div><span className="text-white/70">{t('detail.effect')}</span> · {t(`effects.${selectedSkin.visual.effect}` as any)}</div>
                    <div><span className="text-white/70">{t('detail.trail')}</span> · {t(`trails.${selectedSkin.visual.trailStyle}` as any)}</div>
                    <div><span className="text-white/70">{t('detail.aura')}</span> · {t(`auras.${selectedSkin.visual.auraStyle}` as any)}</div>
                    {selectedSkin.priceCredits ? (
                      <div><span className="text-white/70">{t('detail.price')}</span> · <span className="text-gold">{t('price', { amount: selectedSkin.priceCredits })}</span></div>
                    ) : null}
                  </div>
                  {selectedProgress && selectedProgress.required > 0 && (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between font-space text-[8px] uppercase tracking-[0.14em] text-white/35">
                        <span>{t('detail.progress')}</span>
                        <span>{Math.min(selectedProgress.current, selectedProgress.required)} / {selectedProgress.required}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (selectedProgress.current / selectedProgress.required) * 100)}%`, background: selectedSkin.accent, boxShadow: `0 0 12px ${selectedSkin.glow}` }} />
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={actionDisabled}
                    onClick={() => {
                      if (selectedUnlocked) equipShipSkin(selectedSkin.id);
                      else if (selectedPurchasable) buyShipSkin(selectedSkin.id);
                    }}
                    className={clsx(
                      'mt-3 w-full rounded-md border px-3 py-2 font-space text-[10px] uppercase tracking-[0.18em] transition active:scale-[0.98]',
                      !actionDisabled
                        ? 'border-cyan/50 bg-cyan/10 text-cyan shadow-[0_0_18px_rgba(92,246,255,0.16)]'
                        : selectedEquipped
                          ? 'border-gold/40 bg-gold/10 text-gold'
                          : 'border-white/10 bg-white/[0.03] text-white/35',
                    )}
                  >
                    {actionLabel}
                  </button>
                </div>
              </div>
            </section>

            <div className="mb-2 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FILTERS.map((filterId) => (
                <button
                  key={filterId}
                  type="button"
                  onClick={() => setFilter(filterId)}
                  className={clsx(
                    'shrink-0 rounded-md border px-2 py-1.5 font-space text-[9px] uppercase tracking-[0.14em] transition',
                    filter === filterId ? 'border-cyan/45 bg-cyan/10 text-cyan' : 'border-white/10 bg-white/[0.03] text-white/45',
                  )}
                >
                  {t(`filters.${filterId}` as any)}
                </button>
              ))}
            </div>
            <div className="mb-3 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {RARITY_FILTERS.map((rarityId) => (
                <button
                  key={rarityId}
                  type="button"
                  onClick={() => setRarityFilter(rarityId)}
                  className={clsx(
                    'shrink-0 rounded-full border px-2 py-1 font-space text-[8px] uppercase tracking-[0.14em] transition',
                    rarityFilter === rarityId
                      ? rarityId === 'all'
                        ? 'border-white/40 bg-white/10 text-white'
                        : `${RARITY_STYLE[rarityId].badge} ${RARITY_STYLE[rarityId].text}`
                      : 'border-white/10 bg-white/[0.02] text-white/35',
                  )}
                >
                  {rarityId === 'all' ? t('filters.all') : t(`rarity.${rarityId}` as any)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-3">
              {filteredSkins.map((skin) => {
                const unlocked = shipSkinUnlocked(skin, context);
                const purchasable = shipSkinPurchasable(skin, context);
                const equipped = equippedShipSkinId === skin.id || (!equippedShipSkinId && skin.id === 'defaultCoreShip');
                const rarity = RARITY_STYLE[skin.rarity];
                const progress = shipSkinUnlockProgress(skin, context);
                return (
                  <div
                    role="button"
                    tabIndex={0}
                    key={skin.id}
                    onClick={() => setSelectedSkinId(skin.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') setSelectedSkinId(skin.id);
                    }}
                    className={clsx(
                      'relative overflow-hidden rounded-lg border p-2 text-left transition active:scale-[0.99]',
                      rarity.border,
                      rarity.bg,
                      selectedSkinId === skin.id && 'ring-1 ring-cyan/45',
                      !unlocked && 'opacity-[0.82]',
                    )}
                    style={{ boxShadow: unlocked ? rarity.glow : 'inset 0 0 24px rgba(0,0,0,0.28)' }}
                  >
                    <div
                      className="pointer-events-none absolute inset-x-8 -top-10 h-16 rounded-full blur-2xl"
                      style={{ background: skin.accent, opacity: unlocked ? 0.12 : 0.06 }}
                    />
                    <div className="flex gap-2.5">
                      <div
                        className={clsx('relative overflow-hidden rounded-lg border bg-black/50 px-1', unlocked ? 'border-white/15' : 'border-white/10')}
                        style={{ boxShadow: `inset 0 0 ${unlocked ? 18 : 10}px ${skin.glow}` }}
                      >
                        <ShipPreview skin={skin} small />
                        {!unlocked && <div className="absolute inset-0 bg-black/48 backdrop-saturate-50" />}
                        {equipped && <div className="absolute inset-x-2 bottom-1 rounded-full border border-cyan/50 bg-cyan/15 px-1 py-0.5 text-center font-space text-[7px] uppercase tracking-[0.12em] text-cyan">{t('state.equipped')}</div>}
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
                          <span className={clsx('shrink-0 rounded border px-1.5 py-0.5 font-space text-[8px] uppercase tracking-[0.14em]', equipped ? 'border-cyan/45 text-cyan' : unlocked ? 'border-gold/30 text-gold/80' : purchasable ? 'border-cyan/35 text-cyan/80' : 'border-danger/35 text-danger/80')}>
                            {equipped ? t('state.equipped') : unlocked ? t('state.owned') : purchasable ? t('state.purchasable') : t('state.locked')}
                          </span>
                        </div>
                        <div className="mt-1 line-clamp-2 font-space text-[9px] leading-relaxed text-white/45">
                          {t(`requirements.${shipSkinRequirementKey(skin)}` as any, {
                            count: skin.unlock.count ?? 0,
                          })}
                        </div>
                        {progress && progress.required > 0 && (
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (progress.current / progress.required) * 100)}%`, background: skin.accent }} />
                          </div>
                        )}
                        {skin.priceCredits ? (
                          <div className="mt-1 font-space text-[9px] uppercase tracking-[0.14em] text-gold">
                            {t('price', { amount: skin.priceCredits })}
                          </div>
                        ) : null}
                        {skin.isPremiumPlaceholder && (
                          <div className="mt-1 font-space text-[8px] uppercase tracking-[0.14em] text-gold/75">
                            {t('futurePremium', { price: skin.pricePlaceholder ?? t('soon') })}
                          </div>
                        )}
                        <button
                          type="button"
                          disabled={(!unlocked && !purchasable) || equipped}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (unlocked) equipShipSkin(skin.id);
                            else if (purchasable) buyShipSkin(skin.id);
                          }}
                          className={clsx(
                            'mt-2 w-full rounded-md border px-2 py-1.5 font-space text-[9px] uppercase tracking-[0.16em] transition active:scale-95',
                            (unlocked || purchasable) && !equipped
                              ? 'border-cyan/45 bg-cyan/10 text-cyan shadow-[0_0_14px_rgba(92,246,255,0.14)]'
                              : 'border-white/10 bg-white/[0.03] text-white/35',
                          )}
                        >
                          {equipped ? t('button.equipped') : unlocked ? t('button.equip') : purchasable ? t('button.buy') : skin.isPremiumPlaceholder ? t('futurePremium') : t('button.locked')}
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
