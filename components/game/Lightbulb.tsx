'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGame } from '@/lib/store';
import { audio } from '@/lib/audio/AudioEngine';

export function Lightbulb() {
  const bulb = useGame((s) => s.currentBulb);
  const tapBulb = useGame((s) => s.tapBulb);
  const expireBulb = useGame((s) => s.expireBulb);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const [hint, setHint] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    setHint(false);
    setPosition(null);
    if (!bulb) return;
    const updatePosition = () => {
      const arena = document.querySelector<HTMLElement>('[data-combat-arena]');
      if (!arena) return;
      const rect = arena.getBoundingClientRect();
      setPosition({
        left: rect.left + (rect.width * bulb.x) / 100,
        top: rect.top + (rect.height * bulb.y) / 100,
      });
    };
    updatePosition();
    const hintTimer = setTimeout(() => setHint(true), 5000);
    const remaining = bulb.expiresAt - Date.now();
    const expireTimer = setTimeout(() => expireBulb(), Math.max(0, remaining));
    window.addEventListener('resize', updatePosition);
    window.addEventListener('orientationchange', updatePosition);
    return () => {
      clearTimeout(hintTimer);
      clearTimeout(expireTimer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('orientationchange', updatePosition);
    };
  }, [bulb, expireBulb]);

  return (
    <AnimatePresence>
      {bulb && position && (
        <motion.button
          key={bulb.factId}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.6, y: -60 }}
          transition={{ duration: 0.4 }}
          onClick={() => {
            if (sfxEnabled) audio.sfxResearchCollected();
            tapBulb();
          }}
          className="fixed z-40 -ml-6 -mt-6 flex h-12 w-12 items-center justify-center sm:-ml-[30px] sm:-mt-[30px] sm:h-[60px] sm:w-[60px]"
          style={{ left: position.left, top: position.top }}
          aria-label="knowledge bulb"
        >
          {hint && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: -2 }}
              className="absolute -top-6 text-lg"
            >
              💡
            </motion.div>
          )}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-1 rounded-full"
              style={{ boxShadow: '0 0 18px 5px rgba(255,231,150,0.62)' }}
            />
            <svg viewBox="-32 -32 64 64" width="46" height="46" className="sm:h-[52px] sm:w-[52px]">
              <circle cx="0" cy="-6" r="18" fill="#fff6cc" stroke="#ffd166" strokeWidth="2" />
              <path d="M -7 11 h 14 v 5 h -14 z M -5 17 h 10 v 4 h -10 z" fill="#9a8a4a" />
              <path d="M -6 -10 q 6 -8 12 0" fill="none" stroke="#ffae3b" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-gold"
              animate={{ y: [0, 14], opacity: [1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.4 }}
              style={{ left: `${22 + i * 8}px`, top: '38px' }}
            />
          ))}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
