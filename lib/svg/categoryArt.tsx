'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { FactCategory } from '../config/facts';

const box = { viewBox: '-50 -50 100 100', xmlns: 'http://www.w3.org/2000/svg' };

function CosmosArt() {
  return (
    <svg {...box}>
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
        {[0, 72, 144, 216, 288].map((d) => (
          <path
            key={d}
            d="M -40 0 Q -16 -14 4 -4 Q 24 6 40 0"
            fill="none"
            stroke="#b87aff"
            strokeWidth="2.5"
            strokeOpacity="0.7"
            transform={`rotate(${d})`}
          />
        ))}
        <circle cx="0" cy="0" r="7" fill="#fff" />
      </motion.g>
    </svg>
  );
}

function QuantumArt() {
  return (
    <svg {...box}>
      <circle cx="0" cy="0" r="6" fill="#ff5ce8" />
      {[0, 60, 120].map((d, i) => (
        <g key={d} transform={`rotate(${d})`}>
          <ellipse cx="0" cy="0" rx="38" ry="14" fill="none" stroke="#ff5ce8" strokeWidth="1.5" strokeOpacity="0.6" />
          <motion.circle
            r="4"
            fill="#fff"
            animate={{ rotate: 360 }}
            transition={{ duration: 2 + i, repeat: Infinity, ease: 'linear' }}
            style={{ offsetPath: "path('M 38 0 A 38 14 0 1 1 -38 0 A 38 14 0 1 1 38 0')" } as React.CSSProperties}
          />
        </g>
      ))}
    </svg>
  );
}

function EarthArt() {
  return (
    <svg {...box}>
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}>
        <circle cx="0" cy="0" r="34" fill="#0a3d2a" stroke="#5cffa0" strokeWidth="2" />
        <path d="M -20 -14 Q -6 -22 8 -12 Q 2 0 -14 4 Z" fill="#5cffa0" opacity="0.85" />
        <path d="M 6 8 Q 22 2 26 16 Q 14 24 2 18 Z" fill="#5cffa0" opacity="0.85" />
        <ellipse cx="-10" cy="18" rx="8" ry="5" fill="#5cffa0" opacity="0.6" />
      </motion.g>
    </svg>
  );
}

function LifeArt() {
  return (
    <svg {...box}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const y = -36 + i * 14;
        return (
          <motion.g
            key={i}
            animate={{ scaleX: [1, 0.3, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          >
            <line x1="-22" y1={y} x2="22" y2={y} stroke="#5cf6ff" strokeWidth="2" strokeOpacity="0.7" />
            <circle cx="-22" cy={y} r="3.5" fill="#5cf6ff" />
            <circle cx="22" cy={y} r="3.5" fill="#5cf6ff" />
          </motion.g>
        );
      })}
    </svg>
  );
}

function FutureArt() {
  return (
    <svg {...box}>
      <circle cx="0" cy="0" r="36" fill="none" stroke="#ffd166" strokeWidth="3" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={Math.cos(a) * 30}
            y1={Math.sin(a) * 30}
            x2={Math.cos(a) * 36}
            y2={Math.sin(a) * 36}
            stroke="#ffd166"
            strokeWidth="2"
          />
        );
      })}
      <motion.line
        x1="0" y1="0" x2="0" y2="-24" stroke="#fff" strokeWidth="3" strokeLinecap="round"
        animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      <motion.line
        x1="0" y1="0" x2="16" y2="0" stroke="#ffd166" strokeWidth="2.5" strokeLinecap="round"
        animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      <circle cx="0" cy="0" r="3.5" fill="#fff" />
    </svg>
  );
}

function WaterArt() {
  return (
    <svg {...box}>
      {[
        { x: -20, d: 0 },
        { x: 4, d: 0.6 },
        { x: 24, d: 1.2 },
      ].map((drop) => (
        <motion.path
          key={drop.x}
          d="M0 -16 C 9 -4 13 6 6 14 C 1 19 -7 19 -12 14 C -19 6 -9 -4 0 -16 Z"
          fill="#7ec8ff"
          stroke="#cdeaff"
          strokeWidth="1.5"
          transform={`translate(${drop.x} 0)`}
          animate={{ y: [-12, 14, -12], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: drop.d, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}

const ART: Record<FactCategory, React.FC> = {
  cosmos: CosmosArt,
  quantum: QuantumArt,
  earth: EarthArt,
  life: LifeArt,
  future: FutureArt,
  water: WaterArt,
};

export function CategoryArt({ category }: { category: FactCategory }) {
  const C = ART[category];
  return <C />;
}
