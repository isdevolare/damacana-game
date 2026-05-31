'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
  const isTr = lang === 'tr';

  return (
    <main className="flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#05010d] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)] text-white">
      <section className="w-full max-w-sm rounded-xl border border-danger/35 bg-black/85 p-5 text-center shadow-[0_0_40px_rgba(255,77,109,0.12)]">
        <div className="font-major text-xl text-danger">
          {isTr ? 'Oyun kurtarılabilir' : 'The game can recover'}
        </div>
        <p className="mt-3 font-space text-xs leading-relaxed text-white/60">
          {isTr
            ? 'Beklenmeyen bir hata oluştu. Yerel kayıt verin bu cihazda korunur.'
            : 'An unexpected error occurred. Your local save remains on this device.'}
        </p>
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md border border-cyan/45 bg-cyan/10 px-4 py-2 font-space text-xs uppercase tracking-[0.16em] text-cyan"
          >
            {isTr ? 'Tekrar dene' : 'Try again'}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md border border-white/20 px-4 py-2 font-space text-xs uppercase tracking-[0.16em] text-white/70"
          >
            {isTr ? 'Oyunu yenile' : 'Reload game'}
          </button>
        </div>
      </section>
    </main>
  );
}
