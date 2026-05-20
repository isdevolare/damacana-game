'use client';

import { useGame } from '@/lib/store';
import { ProgressBar } from '../ui/ProgressBar';
import { isMegaBoss } from '@/lib/config/bosses';
import { useTranslations } from 'next-intl';
import { audio } from '@/lib/audio/AudioEngine';
import { motion } from 'framer-motion';
import { currentChapter } from '@/lib/config/chapters';

export function BossPanel() {
  const boss = useGame((s) => s.boss);
  const completedChapters = useGame((s) => s.completedChapters);
  const tap = useGame((s) => s.tapDamacana);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const combo = useGame((s) => s.combo);
  const t = useTranslations();
  const mega = isMegaBoss(boss.tier);
  const elite = boss.isElite;
  const chapter = currentChapter(completedChapters);
  const finalBoss = boss.tier === chapter.finalBossTier;
  const name = elite
    ? t(`elite.${boss.nameKey}` as any)
    : t(`bosses.${boss.nameKey}` as any);

  const accent = elite ? '#b87aff' : mega ? '#ffd166' : '#ff3d6e';
  const borderCls = elite
    ? 'border-purple/70 bg-purple/10'
    : mega
    ? 'border-gold/70 bg-gold/10'
    : 'border-danger/50 bg-danger/5';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onPointerDown={(e) => {
        tap(e.clientX, e.clientY);
        if (sfxEnabled) {
          audio.sfxTap(combo);
          audio.sfxBossHit();
        }
      }}
      className={`mx-3 mb-2 rounded-lg border ${borderCls} p-2 cursor-pointer select-none`}
    >
      <div className="flex justify-between items-baseline">
        <div className="font-space text-[11px] tracking-widest uppercase text-white/80">
          {elite && <span className="text-purple mr-1">★ {t('ui.elite')}</span>}
          {!elite && mega && <span className="text-gold mr-1">★ {t('ui.mega')}</span>}
          {finalBoss && <span className="text-cyan mr-1">{t('chapters.finalBoss')}</span>}
          <span style={{ color: accent }}>T{boss.tier}</span> · {name}
        </div>
        <div className="font-vt text-white/70 text-sm">
          {Math.max(0, Math.ceil(boss.hpCur))}/{boss.hpMax}
        </div>
      </div>
      <div className="mt-1">
        <ProgressBar value={boss.hpCur} max={boss.hpMax} color={accent} height={8} />
      </div>
    </motion.div>
  );
}
