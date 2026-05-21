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
    <div className="select-none px-3 pt-1.5 text-center sm:pt-2">
      <motion.div
        key={pulse}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.25 }}
        className="font-vt text-[32px] leading-none text-white drop-shadow-[0_0_12px_rgba(184,122,255,0.45)] sm:text-[36px] sm:drop-shadow-[0_0_18px_rgba(184,122,255,0.55)]"
      >
        {fmt(dmc)}
      </motion.div>
      <div className="mt-0.5 text-[9px] font-space tracking-widest text-purple/80 sm:mt-1 sm:text-[10px]">
        {t('damacana')}
      </div>
      <div className="mt-1 flex min-w-0 items-center justify-center gap-2 text-[9px] font-space text-white/60 sm:mt-1.5 sm:gap-3 sm:text-[10px]">
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
