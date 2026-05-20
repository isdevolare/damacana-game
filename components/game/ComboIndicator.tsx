'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';

export function ComboIndicator() {
  const combo = useGame((s) => s.combo);
  const show = combo >= 1.4;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.85 }}
          className="pointer-events-none absolute top-[36%] left-1/2 -translate-x-1/2 font-vt text-[28px] text-pink drop-shadow-[0_0_12px_rgba(255,92,232,0.7)]"
        >
          ×{combo.toFixed(1)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
