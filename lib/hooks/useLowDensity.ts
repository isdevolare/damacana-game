'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/lib/store';

const QUERIES = [
  '(max-width: 640px)',
  '(pointer: coarse)',
  '(prefers-reduced-motion: reduce)',
  '(display-mode: standalone)',
] as const;

/**
 * Whether the app should run in low-density / reduced-effects mode. True when the
 * user enabled lowEffectsMode, when running as an installed PWA, or on touch /
 * small / reduced-motion devices. Use to gate paint-heavy decorative effects
 * (background animations, blur, glow) that overwhelm mobile GPUs.
 *
 * Mirrors the detection CombatArena does internally (kept separate for now so we
 * don't refactor its fragile frame-loop refs). SSR-safe: false on first render,
 * resolved on mount.
 */
export function useLowDensity(): boolean {
  const lowEffectsMode = useGame((s) => s.lowEffectsMode);
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqls = QUERIES.map((q) => window.matchMedia(q));
    const update = () => {
      const standalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
      setMatches(standalone || mqls.some((mql) => mql.matches));
    };
    update();
    mqls.forEach((mql) => mql.addEventListener('change', update));
    return () => mqls.forEach((mql) => mql.removeEventListener('change', update));
  }, []);

  return lowEffectsMode || matches;
}
