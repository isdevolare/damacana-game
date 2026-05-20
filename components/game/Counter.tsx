'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useGame, selectPerTap, selectPerSec } from '@/lib/store';
import { fmt } from '@/lib/util';
import { useTranslations } from 'next-intl';

export function Counter() {
  const dmc = useGame((s) => s.damacana);
  const shards = useGame((s) => s.shards);
  const perTap = useGame(selectPerTap);
  const perSec = useGame(selectPerSec);
  const t = useTranslations('ui');
  const [pulse, setPulse] = useState(0);
  const prev = useRef(dmc);
  useEffect(() => {
    if (dmc > prev.current) setPulse((p) => p + 1);
    prev.current = dmc;
  }, [dmc]);

  return (
    <div className="text-center pt-2 px-3 select-none">
      <motion.div
        key={pulse}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.25 }}
        className="font-vt text-[36px] leading-none text-white drop-shadow-[0_0_18px_rgba(184,122,255,0.55)]"
      >
        {fmt(dmc)}
      </motion.div>
      <div className="text-[10px] font-space tracking-widest text-purple/80 mt-1">
        {t('damacana')}
      </div>
      <div className="flex items-center justify-center gap-3 mt-1.5 text-[10px] font-space text-white/60">
        <span>
          <span className="text-cyan">{fmt(perTap)}</span> / {t('tap')}
        </span>
        <span>
          <span className="text-cyan">{fmt(perSec)}</span> / {t('sec')}
        </span>
        <span className="text-purple">
          ◇ <span className="text-gold">{fmt(shards)}</span>
        </span>
      </div>
    </div>
  );
}
