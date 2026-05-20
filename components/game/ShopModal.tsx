'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { SHOP_ITEMS } from '@/lib/config/progression';
import { audio } from '@/lib/audio/AudioEngine';

export function ShopModal() {
  const show = useGame((s) => s.showShop);
  const setShow = useGame((s) => s.setShowShop);
  const crystals = useGame((s) => s.crystals);
  const shop = useGame((s) => s.shop);
  const buy = useGame((s) => s.buyShopItem);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const t = useTranslations();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[53] bg-black/92 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShow(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-cyan/50 bg-black/90 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-major text-lg text-cyan">{t('shop.title')}</div>
              <button
                onClick={() => setShow(false)}
                className="text-xs font-space border border-white/30 px-2 py-1 rounded-md text-white/80"
              >
                {t('ui.close')}
              </button>
            </div>
            <div className="text-[11px] font-space text-white/60 mb-3">
              ✦ <span className="text-cyan">{crystals}</span> singularity crystals
            </div>
            <div className="flex flex-col gap-2">
              {SHOP_ITEMS.map((item) => {
                const count = shop[item.id];
                const can = crystals >= item.cost;
                return (
                  <div
                    key={item.id}
                    className="rounded-md border border-white/15 bg-white/[0.04] p-2 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-space text-[11px] text-white uppercase tracking-wider">
                        {t(`shop.${item.id}.name`)}
                      </div>
                      <div className="font-space text-[9px] text-white/55">
                        {t(`shop.${item.id}.desc`)} · {t('ui.owned')}: {count}
                      </div>
                    </div>
                    <button
                      disabled={!can}
                      onClick={() => {
                        if (sfxEnabled) audio.sfxUpgrade();
                        buy(item.id);
                      }}
                      className="text-[11px] font-space border rounded px-3 py-1.5 shrink-0"
                      style={{
                        borderColor: can ? '#5cf6ff' : 'rgba(255,255,255,0.2)',
                        color: can ? '#5cf6ff' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {t('ui.buy')} ✦{item.cost}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
