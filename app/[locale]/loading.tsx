export default function Loading() {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#05010d] px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)] text-center text-white">
      <div className="w-full max-w-xs">
        <div className="mx-auto mb-5 h-16 w-16 rounded-[32%] border border-cyan/45 bg-cyan/10 shadow-[0_0_28px_rgba(92,246,255,0.18)]">
          <div className="mx-auto mt-3 h-8 w-6 rounded-full bg-white/85 shadow-[0_0_18px_rgba(92,246,255,0.42)]" />
        </div>
        <div className="font-major text-xl tracking-[0.14em] text-cyan">DAMACANA.EXE</div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-cyan/80 shadow-[0_0_12px_rgba(92,246,255,0.5)]" />
        </div>
      </div>
    </main>
  );
}
