'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame, type GameState } from '@/lib/store';

/**
 * Subscribe to a store value but only propagate it to React at most once per
 * `intervalMs`. Use for VISUAL-only consumers of high-frequency fields (e.g.
 * damacana, which tickAuto updates ~60×/s): it stops those components from
 * re-rendering every frame while still showing a near-live value.
 *
 * IMPORTANT: the returned value can lag by up to `intervalMs`. Never use it for
 * correctness-sensitive logic (purchases, affordability gating). Those must read
 * the precise value from the store (useGame.getState() / a store action).
 *
 * The store subscription callback runs on every change, but it only triggers a
 * React update at the throttled cadence (leading + trailing, so the final value
 * is never dropped).
 */
export function useThrottledGameValue<T>(selector: (s: GameState) => T, intervalMs = 180): T {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const [value, setValue] = useState(() => selector(useGame.getState()));
  const latestRef = useRef(value);
  const lastEmitRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const flush = () => {
      lastEmitRef.current = Date.now();
      timerRef.current = null;
      setValue(latestRef.current);
    };
    const unsubscribe = useGame.subscribe((state) => {
      latestRef.current = selectorRef.current(state);
      const elapsed = Date.now() - lastEmitRef.current;
      if (elapsed >= intervalMs) {
        flush();
      } else if (timerRef.current === null) {
        // schedule a trailing flush so the latest value isn't stuck stale
        timerRef.current = setTimeout(flush, intervalMs - elapsed);
      }
    });
    // sync once on mount in case the value changed between render and subscribe
    latestRef.current = selectorRef.current(useGame.getState());
    setValue(latestRef.current);
    return () => {
      unsubscribe();
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [intervalMs]);

  return value;
}
