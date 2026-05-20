'use client';

import { motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { LEVELS } from '@/lib/config/levels';
import { Form } from '@/lib/svg/forms';
import { audio } from '@/lib/audio/AudioEngine';
import { useRef } from 'react';

export function DamacanaForm() {
  const levelIdx = useGame((s) => s.levelIdx);
  const tap = useGame((s) => s.tapDamacana);
  const combo = useGame((s) => s.combo);
  const tree = useGame((s) => s.tree);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const tapsRef = useRef(0);

  const form = LEVELS[levelIdx].form;
  const halo = tree['halo'];
  const crown = tree['crown'];

  return (
    <div className="relative flex items-center justify-center mt-2 mb-2">
      {halo && (
        <div className="absolute w-[260px] h-[260px] rounded-full border-2 border-cyan/40 animate-spinslow"
             style={{ boxShadow: '0 0 30px rgba(92,246,255,0.35) inset, 0 0 30px rgba(92,246,255,0.25)' }} />
      )}
      {crown && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
          {[0,1,2,3,4].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gold animate-pulse2"
                 style={{ boxShadow: '0 0 10px #ffd166' }} />
          ))}
        </div>
      )}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onPointerDown={(e) => {
          tap(e.clientX, e.clientY);
          tapsRef.current++;
          if (sfxEnabled) {
            if (combo > 3.5) audio.sfxCrit();
            audio.sfxTap(combo);
            audio.sfxBossHit();
          }
        }}
        className="relative w-[220px] h-[220px] focus:outline-none"
        aria-label="damacana"
      >
        <Form form={form} />
      </motion.button>
    </div>
  );
}
