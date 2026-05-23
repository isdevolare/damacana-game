'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { audio } from '@/lib/audio/AudioEngine';
import { useGame } from '@/lib/store';

export function AudioUnlockPrompt() {
  const hasStarted = useGame((s) => s.hasStarted);
  const levelIdx = useGame((s) => s.levelIdx);
  const settings = useGame((s) => s.audio);
  const t = useTranslations('ui');
  const inFlight = useRef(false);
  const [unlocked, setUnlocked] = useState(() => audio.isUnlocked());

  const unlockAudio = useCallback(async () => {
    if (!hasStarted || settings.muted || inFlight.current) return;
    if (audio.isUnlocked()) {
      setUnlocked(true);
      return;
    }
    inFlight.current = true;
    try {
      const ok = await audio.unlock(levelIdx, settings);
      setUnlocked(ok);
      if (ok) audio.sfxUpgrade();
    } finally {
      inFlight.current = false;
    }
  }, [hasStarted, levelIdx, settings]);

  useEffect(() => {
    setUnlocked(audio.isUnlocked());
  }, [hasStarted, settings.muted]);

  useEffect(() => {
    if (!hasStarted || settings.muted || unlocked) return;

    const onFirstGesture = () => {
      void unlockAudio();
    };

    window.addEventListener('pointerdown', onFirstGesture, { once: true, passive: true });
    window.addEventListener('touchstart', onFirstGesture, { once: true, passive: true });
    window.addEventListener('keydown', onFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    };
  }, [hasStarted, settings.muted, unlockAudio, unlocked]);

  if (!hasStarted || settings.muted || unlocked) return null;

  return (
    <button
      type="button"
      onClick={() => void unlockAudio()}
      className="fixed left-1/2 z-50 -translate-x-1/2 rounded-full border border-cyan/45 bg-black/85 px-3 py-2 font-space text-[10px] uppercase tracking-[0.18em] text-cyan shadow-[0_0_22px_rgba(92,246,255,0.18)] backdrop-blur-sm transition active:scale-[0.98] hover:bg-cyan/10"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
    >
      {t('enableSound')}
    </button>
  );
}
