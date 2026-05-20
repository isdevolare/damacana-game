'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { useEffect } from 'react';
import { fmt } from '@/lib/util';

export function FloatingNumbers() {
  const nums = useGame((s) => s.floatingNumbers);
  // Auto-prune is handled by the slice in tapDamacana (sliding window).
  // We just render the current list.

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <AnimatePresence>
        {nums.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -80, scale: n.crit ? 1.5 : 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className={`absolute font-vt text-base ${
              n.crit ? 'text-gold drop-shadow-[0_0_12px_rgba(255,209,102,0.8)]' : 'text-cyan drop-shadow-[0_0_8px_rgba(92,246,255,0.7)]'
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
