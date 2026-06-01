'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { audio } from '@/lib/audio/AudioEngine';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n/config';
import { systemRequirementKey, systemUnlocked } from '@/lib/config/systemUnlocks';

const SAVE_STORAGE_KEY = 'damacana_v1';

export function SettingsPanel({ locale }: { locale: string }) {
  const show = useGame((s) => s.showSettings);
  const setShow = useGame((s) => s.setShowSettings);
  const setShowProfile = useGame((s) => s.setShowProfile);
  const setShowCodex = useGame((s) => s.setShowCodex);
  const setShowAchievements = useGame((s) => s.setShowAchievements);
  const setShowShipSkins = useGame((s) => s.setShowShipSkins);
  const replayTutorial = useGame((s) => s.replayTutorial);
  const boss = useGame((s) => s.boss);
  const completedChapters = useGame((s) => s.completedChapters);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const shards = useGame((s) => s.shards);
  const collectedFacts = useGame((s) => s.collectedFacts);
  const lowEffectsMode = useGame((s) => s.lowEffectsMode);
  const setLowEffectsMode = useGame((s) => s.setLowEffectsMode);
  const audioSettings = useGame((s) => s.audio);
  const set = useGame((s) => s.setAudioSetting);
  const t = useTranslations('ui');
  const router = useRouter();
  const pathname = usePathname();
  const [saveText, setSaveText] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [confirmResetSave, setConfirmResetSave] = useState(false);
  const unlockCtx = { bossTier: boss.tier, completedChapters, totalPrestiges, shards };
  const codexUnlocked = collectedFacts.length > 0 || systemUnlocked('codexAdvanced', unlockCtx);

  const apply = (partial: Partial<typeof audioSettings>) => {
    set(partial);
    audio.setSettings(partial);
  };

  const switchLocale = (loc: string) => {
    const current = pathname || '/';
    const stripped = current.replace(/^\/(en|tr)(?=\/|$)/, '') || '/';
    const next = `/${loc}${stripped === '/' ? '' : stripped}`;
    document.cookie = `NEXT_LOCALE=${loc}; path=/; max-age=31536000; samesite=lax`;
    setShow(false);
    router.push(next);
  };

  const openUtility = (open: () => void) => {
    setShow(false);
    open();
  };

  const setTimedSaveMessage = (message: string) => {
    setSaveMessage(message);
    window.setTimeout(() => setSaveMessage(null), 3500);
  };

  const readRawSave = () => {
    try {
      return window.localStorage.getItem(SAVE_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  };

  const exportSave = async () => {
    const raw = readRawSave();
    setSaveText(raw);
    if (!raw) {
      setTimedSaveMessage(t('saveTools.empty'));
      return;
    }
    try {
      await navigator.clipboard?.writeText(raw);
      setTimedSaveMessage(t('saveTools.copied'));
    } catch {
      setTimedSaveMessage(t('saveTools.exported'));
    }
  };

  const copySave = async () => {
    const raw = saveText || readRawSave();
    if (!raw) {
      setTimedSaveMessage(t('saveTools.empty'));
      return;
    }
    try {
      await navigator.clipboard?.writeText(raw);
      setTimedSaveMessage(t('saveTools.copied'));
    } catch {
      setTimedSaveMessage(t('saveTools.copyFailed'));
    }
  };

  const importSave = () => {
    try {
      const parsed = JSON.parse(saveText);
      const payload = parsed && typeof parsed === 'object' && 'state' in parsed ? parsed : { state: parsed, version: 0 };
      if (!payload.state || typeof payload.state !== 'object') throw new Error('Invalid save');
      window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
      setTimedSaveMessage(t('saveTools.imported'));
      window.setTimeout(() => window.location.reload(), 250);
    } catch {
      setTimedSaveMessage(t('saveTools.invalid'));
    }
  };

  const resetLocalSave = () => {
    try {
      window.localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch {
      // The reload still gives the runtime a clean in-memory boot if storage is unavailable.
    }
    window.location.reload();
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
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="max-h-[calc(var(--app-height,100dvh)_-_1rem_-_env(safe-area-inset-bottom))] w-full max-w-sm overflow-y-auto rounded-xl border border-purple/50 bg-black/90 p-3 sm:max-h-[88dvh] sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <div className="font-major text-lg text-purple">{t('settings')}</div>
              <div className="mt-1 font-space text-[9px] uppercase tracking-[0.18em] text-white/35">
                {t('utilityHub')}
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <div className="mb-2 font-space text-[9px] uppercase tracking-[0.2em] text-white/45">
                {t('utilitySystems')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openUtility(() => setShowShipSkins(true))}
                  className="rounded-md border border-cyan/30 bg-cyan/10 px-2 py-2 text-left font-space text-[10px] uppercase tracking-[0.1em] text-cyan"
                >
                  {t('shipSkins')}
                </button>
                <button
                  onClick={() => openUtility(() => setShowProfile(true))}
                  className="rounded-md border border-cyan/30 bg-cyan/10 px-2 py-2 text-left font-space text-[10px] uppercase tracking-[0.1em] text-cyan"
                >
                  {t('profileStats')}
                </button>
                <button
                  onClick={() => openUtility(() => setShowAchievements(true))}
                  className="rounded-md border border-gold/30 bg-gold/10 px-2 py-2 text-left font-space text-[10px] uppercase tracking-[0.1em] text-gold"
                >
                  {t('achievements')}
                </button>
                <button
                  onClick={() => {
                    if (codexUnlocked) openUtility(() => setShowCodex(true));
                  }}
                  disabled={!codexUnlocked}
                  className="rounded-md border border-purple/30 bg-purple/10 px-2 py-2 text-left font-space text-[10px] uppercase tracking-[0.1em] text-purple disabled:opacity-45"
                >
                  {t('codex')}
                  {codexUnlocked ? null : (
                    <span className="mt-1 block font-space text-[8px] uppercase tracking-[0.14em] text-white/35">
                      {t(systemRequirementKey('codexAdvanced') as any)}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => replayTutorial()}
                  className="rounded-md border border-purple/30 bg-purple/10 px-2 py-2 text-left font-space text-[10px] uppercase tracking-[0.1em] text-purple"
                >
                  {t('replayTutorial')}
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <div className="font-space text-[9px] uppercase tracking-[0.2em] text-white/45">
                {t('audio')}
              </div>
              <label className="block">
                <div className="text-[10px] font-space tracking-widest text-white/60 mb-1 flex justify-between">
                  <span>{t('master')}</span>
                  <span>{Math.round(audioSettings.master * 100)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={audioSettings.master}
                  onChange={(e) => apply({ master: parseFloat(e.target.value) })}
                  className="w-full accent-purple"
                />
              </label>
              <label className="block">
                <div className="text-[10px] font-space tracking-widest text-white/60 mb-1 flex justify-between">
                  <span>{t('music')}</span>
                  <span>{Math.round(audioSettings.music * 100)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={audioSettings.music}
                  onChange={(e) => apply({ music: parseFloat(e.target.value) })}
                  className="w-full accent-cyan"
                />
              </label>
              <label className="block">
                <div className="text-[10px] font-space tracking-widest text-white/60 mb-1 flex justify-between">
                  <span>{t('sfx')}</span>
                  <span>{Math.round(audioSettings.sfx * 100)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={audioSettings.sfx}
                  onChange={(e) => apply({ sfx: parseFloat(e.target.value) })}
                  className="w-full accent-pink"
                />
              </label>
              <button
                onClick={() => apply({ muted: !audioSettings.muted })}
                className={`w-full mt-1 text-xs font-space tracking-widest py-2 rounded-md border ${
                  audioSettings.muted ? 'border-danger/60 text-danger bg-danger/10' : 'border-white/20 text-white/80'
                }`}
              >
                {audioSettings.muted ? t('unmute') : t('mute')}
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <div className="text-[10px] font-space tracking-widest text-white/60 mb-2">
                {t('language')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    className={`text-xs font-space py-1.5 rounded-md border ${
                      l === locale
                        ? 'border-purple/60 bg-purple/15 text-purple'
                        : 'border-white/20 text-white/70'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <div className="text-[10px] font-space tracking-widest text-white/60">
                {t('performance')}
              </div>
              <div className="mt-1 font-space text-[9px] leading-relaxed text-white/35">
                {t('performanceAuto')}
              </div>
              <button
                type="button"
                onClick={() => setLowEffectsMode(!lowEffectsMode)}
                className={`mt-3 flex w-full items-center justify-between rounded-md border px-2.5 py-2 font-space text-[10px] uppercase tracking-[0.14em] transition active:scale-[0.98] ${
                  lowEffectsMode
                    ? 'border-cyan/45 bg-cyan/10 text-cyan'
                    : 'border-white/15 bg-white/[0.03] text-white/55'
                }`}
              >
                <span>{t('lowEffectsMode')}</span>
                <span>{lowEffectsMode ? t('on') : t('off')}</span>
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-danger/20 bg-danger/[0.04] p-2.5">
              <div className="font-space text-[9px] uppercase tracking-[0.2em] text-danger/80">
                {t('saveTools.title')}
              </div>
              <div className="mt-1 font-space text-[9px] leading-relaxed text-white/40">
                {t('saveTools.description')}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void exportSave()}
                  className="rounded-md border border-cyan/35 bg-cyan/10 px-2 py-2 font-space text-[9px] uppercase tracking-[0.14em] text-cyan"
                >
                  {t('saveTools.export')}
                </button>
                <button
                  type="button"
                  onClick={() => void copySave()}
                  className="rounded-md border border-white/15 bg-white/[0.03] px-2 py-2 font-space text-[9px] uppercase tracking-[0.14em] text-white/65"
                >
                  {t('saveTools.copy')}
                </button>
              </div>
              <textarea
                value={saveText}
                onChange={(event) => setSaveText(event.target.value)}
                placeholder={t('saveTools.placeholder')}
                spellCheck={false}
                className="mt-2 min-h-20 w-full resize-none rounded-md border border-white/10 bg-black/35 p-2 font-space text-[9px] leading-relaxed text-white/70 outline-none focus:border-cyan/45"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={importSave}
                  className="rounded-md border border-gold/35 bg-gold/10 px-2 py-2 font-space text-[9px] uppercase tracking-[0.14em] text-gold"
                >
                  {t('saveTools.import')}
                </button>
                <button
                  type="button"
                  onClick={() => (confirmResetSave ? resetLocalSave() : setConfirmResetSave(true))}
                  className="rounded-md border border-danger/50 bg-danger/10 px-2 py-2 font-space text-[9px] uppercase tracking-[0.14em] text-danger/85"
                >
                  {confirmResetSave ? t('saveTools.confirmReset') : t('resetAll')}
                </button>
              </div>
              {saveMessage && (
                <div className="mt-2 rounded border border-white/10 bg-white/[0.03] px-2 py-1.5 font-space text-[9px] text-white/55">
                  {saveMessage}
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShow(false)}
                className="flex-1 text-xs font-space tracking-widest py-2 rounded-md border border-white/30 text-white/80"
              >
                {t('close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
