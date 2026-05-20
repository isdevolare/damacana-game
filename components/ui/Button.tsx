'use client';

import React from 'react';
import { clsx } from '@/lib/util';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'primary', size = 'md', className, ...rest }: Props) {
  const base = 'font-space uppercase tracking-wider border transition-all active:scale-95 select-none';
  const sizes = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2';
  const variants = {
    primary: 'bg-purple/15 border-purple/60 text-purple hover:bg-purple/25',
    ghost: 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10',
    danger: 'bg-danger/15 border-danger/60 text-danger hover:bg-danger/25',
    gold: 'bg-gold/15 border-gold/60 text-gold hover:bg-gold/25',
  };
  return <button className={clsx(base, sizes, variants[variant], className)} {...rest} />;
}
