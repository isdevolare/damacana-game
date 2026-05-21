'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { audio } from '@/lib/audio/AudioEngine';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n/config';

export function SettingsPanel({ locale }: { locale: string }) {
  const show = useGame((s) => s.showSettings);
  const setShow = useGame((s) => s.setShowSettings);
  const setShowProfile = useGame((s) => s.setShowProfile);
  const setShowResearch = useGame((s) => s.setShowResearch);
  const setShowBuildTree = useGame((s) => s.setShowBuildTree);
  const audioSettings = useGame((s) => s.audio);
  const set = useGame((s) => s.setAudioSetting);
  const reset = useGame((s) => s.reset);
  const t = useTranslations('ui');
  const router = useRouter();
  const pathname = usePathname();

  const apply = (partial: Partial<typeof audioSettings>) => {
    set(partial);
    audio.setSettings(partial);
  };

  const switchLocale = (loc: string) => {
    let next = pathname || '/';
    const stripped = next.replace(/^\/(en|tr)(?=\/|$)/, '') || '/';
    next = loc === 'en' ? stripped : `/${loc}${stripped}`;
    router.push(next);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-xl border border-purple/50 bg-black/90 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-major text-lg text-purple mb-4">{t('settings')}</div>

            <button
              onClick={() => {
                setShow(false);
                setShowProfile(true);
              }}
              className="mb-2 w-full rounded-md border border-cyan/35 bg-cyan/10 px-3 py-2 text-left font-space text-xs uppercase tracking-widest text-cyan"
            >
              {t('profileStats')}
            </button>
            <button
              onClick={() => {
                setShow(false);
                setShowResearch(true);
              }}
              className="mb-2 w-full rounded-md border border-purple/35 bg-purple/10 px-3 py-2 text-left font-space text-xs uppercase tracking-widest text-purple"
            >
              {t('research')}
            </button>
            <button
              onClick={() => {
                setShow(false);
                setShowBuildTree(true);
              }}
              className="mb-4 w-full rounded-md border border-gold/35 bg-gold/10 px-3 py-2 text-left font-space text-xs uppercase tracking-widest text-gold"
            >
              {t('buildTree')}
            </button>

            <div className="space-y-3">
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

            <div className="mt-5">
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

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  if (confirm('Reset all progress?')) reset();
                }}
                className="flex-1 text-[10px] font-space tracking-widest py-2 rounded-md border border-danger/50 text-danger/80"
              >
                {t('resetAll')}
              </button>
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
