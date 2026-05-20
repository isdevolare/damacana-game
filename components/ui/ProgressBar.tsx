'use client';

import React from 'react';

export function ProgressBar({
  value,
  max,
  color = '#ff3d6e',
  height = 10,
  label,
}: {
  value: number;
  max: number;
  color?: string;
  height?: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className="w-full">
      {label && <div className="text-[10px] font-space text-white/60 mb-1">{label}</div>}
      <div
        className="w-full rounded-sm overflow-hidden bg-white/10 border border-white/15 relative"
        style={{ height }}
      >
        <div
          className="h-full transition-[width] duration-150"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
    </div>
  );
}
