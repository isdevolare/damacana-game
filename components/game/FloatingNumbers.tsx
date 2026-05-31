'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { useEffect, useState } from 'react';
import { fmt } from '@/lib/util';

export function FloatingNumbers() {
  const nums = useGame((s) => s.floatingNumbers);
  const lowEffectsMode = useGame((s) => s.lowEffectsMode);
  const [lowDensity, setLowDensity] = useState(false);
  // Auto-prune is handled by the slice in tapDamacana (sliding window).
  // We just render the current list.

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const query = window.matchMedia('(max-width: 640px), (pointer: coarse), (prefers-reduced-motion: reduce)');
    const update = () => setLowDensity(lowEffectsMode || query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [lowEffectsMode]);

  const renderedNums = lowDensity ? nums.slice(-3) : nums;

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <AnimatePresence>
        {renderedNums.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: lowDensity ? -48 : -80, scale: lowDensity ? 1.05 : n.crit ? 1.5 : 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: lowDensity ? 0.65 : 1 }}
            className={`absolute font-vt text-base ${
              lowDensity
                ? n.crit ? 'text-gold' : 'text-cyan'
                : n.crit ? 'text-gold drop-shadow-[0_0_12px_rgba(255,209,102,0.8)]' : 'text-cyan drop-shadow-[0_0_8px_rgba(92,246,255,0.7)]'
            }`}
            style={{ left: n.x, top: n.y, transform: 'translate(-50%, -50%)' }}
          >
            +{fmt(n.value)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
