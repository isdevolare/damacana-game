'use client';

import React from 'react';
import type { FormKey } from '../config/levels';

const baseProps = {
  viewBox: '-100 -100 200 200',
  xmlns: 'http://www.w3.org/2000/svg',
};

function DropSVG() {
  return (
    <svg {...baseProps}>
      <defs>
        <radialGradient id="drop_g" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#a8eaff" />
          <stop offset="60%" stopColor="#5cf6ff" />
          <stop offset="100%" stopColor="#0b3b6e" />
        </radialGradient>
      </defs>
      <path
        d="M0 -65 C 35 -25 50 15 30 45 C 10 70 -10 70 -30 45 C -50 15 -35 -25 0 -65 Z"
        fill="url(#drop_g)"
        stroke="#cfeeff"
        strokeWidth="2"
      />
      <ellipse cx="-12" cy="-25" rx="10" ry="16" fill="#fff" opacity="0.55" />
    </svg>
  );
}

function BigDropSVG() {
  return (
    <svg {...baseProps}>
      <defs>
        <radialGradient id="bd_g" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#cdeaff" />
          <stop offset="60%" stopColor="#5cf6ff" />
          <stop offset="100%" stopColor="#143569" />
        </radialGradient>
      </defs>
      <path
        d="M0 -80 C 50 -30 70 20 40 55 C 15 85 -15 85 -40 55 C -70 20 -50 -30 0 -80 Z"
        fill="url(#bd_g)"
        stroke="#e0f4ff"
        strokeWidth="2"
      />
      <ellipse cx="-18" cy="-30" rx="14" ry="22" fill="#fff" opacity="0.55" />
      <circle cx="20" cy="20" r="6" fill="#fff" opacity="0.4" />
    </svg>
  );
}

function OrbSVG() {
  return (
    <svg {...baseProps}>
      <defs>
        <radialGradient id="orb_g" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="40%" stopColor="#9ee8ff" />
          <stop offset="100%" stopColor="#2a1a72" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="0" r="70" fill="url(#orb_g)" stroke="#b87aff" strokeWidth="2" />
      <ellipse cx="-22" cy="-25" rx="14" ry="20" fill="#fff" opacity="0.5" />
      {[-1, 0, 1].map((i) => (
        <ellipse
          key={i}
          cx="0"
          cy="0"
          rx="70"
          ry="20"
          fill="none"
          stroke="#5cf6ff"
          strokeOpacity="0.35"
          transform={`rotate(${i * 30})`}
        />
      ))}
    </svg>
  );
}

function PlanetSVG() {
  return (
    <svg {...baseProps}>
      <defs>
        <radialGradient id="pl_g" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#ffe0fa" />
          <stop offset="40%" stopColor="#b87aff" />
          <stop offset="100%" stopColor="#190744" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="0" rx="92" ry="22" fill="none" stroke="#ffd166" strokeWidth="2" opacity="0.85" />
      <circle cx="0" cy="0" r="65" fill="url(#pl_g)" />
      <ellipse cx="-18" cy="-22" rx="14" ry="20" fill="#fff" opacity="0.55" />
      <ellipse cx="0" cy="0" rx="92" ry="22" fill="none" stroke="#ff5ce8" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

function GalaxySVG() {
  return (
    <svg {...baseProps}>
      <defs>
        <radialGradient id="ga_g" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="30%" stopColor="#ff5ce8" />
          <stop offset="100%" stopColor="#1a063d" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="0" r="90" fill="url(#ga_g)" opacity="0.9" />
      {[0, 60, 120, 180, 240, 300].map((d) => (
        <path
          key={d}
          d="M -80 0 Q -40 -30 0 -10 Q 40 10 80 0"
          fill="none"
          stroke="#5cf6ff"
          strokeOpacity="0.6"
          strokeWidth="2"
          transform={`rotate(${d})`}
        />
      ))}
      <circle cx="0" cy="0" r="14" fill="#fff" />
    </svg>
  );
}

function MilkywaySVG() {
  return (
    <svg {...baseProps}>
      <defs>
        <radialGradient id="mw_g" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="15%" stopColor="#ffd166" />
          <stop offset="60%" stopColor="#b87aff" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="0" r="95" fill="url(#mw_g)" />
      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={i}
          d="M -90 0 Q -30 -45 0 -10 Q 30 25 90 0"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          transform={`rotate(${i * 45})`}
        />
      ))}
      {Array.from({ length: 30 }).map((_, i) => {
        const a = (i * 137.5) * (Math.PI / 180);
        const r = 20 + (i % 8) * 9;
        return (
          <circle
            key={i}
            cx={Math.cos(a) * r}
            cy={Math.sin(a) * r}
            r={0.8 + (i % 3) * 0.7}
            fill="#fff"
            opacity={0.6}
          />
        );
      })}
    </svg>
  );
}

function VoidSVG() {
  return (
    <svg {...baseProps}>
      <defs>
        <radialGradient id="vd_g" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#000" />
          <stop offset="55%" stopColor="#3a0660" />
          <stop offset="80%" stopColor="#ff5ce8" />
          <stop offset="100%" stopColor="#5cf6ff" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="0" r="92" fill="url(#vd_g)" />
      <circle cx="0" cy="0" r="55" fill="#000" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30) * (Math.PI / 180);
        return (
          <line
            key={i}
            x1={Math.cos(a) * 60}
            y1={Math.sin(a) * 60}
            x2={Math.cos(a) * 92}
            y2={Math.sin(a) * 92}
            stroke="#ff5ce8"
            strokeWidth="1"
            opacity="0.7"
          />
        );
      })}
      <text
        x="0"
        y="6"
        textAnchor="middle"
        fill="#ff5ce8"
        fontFamily="monospace"
        fontSize="14"
        fontWeight="bold"
      >
        ERROR
      </text>
    </svg>
  );
}

const MAP: Record<FormKey, React.FC> = {
  DROP: DropSVG,
  BIG_DROP: BigDropSVG,
  ORB: OrbSVG,
  PLANET: PlanetSVG,
  GALAXY: GalaxySVG,
  MILKYWAY: MilkywaySVG,
  VOID: VoidSVG,
};

export function Form({ form }: { form: FormKey }) {
  const C = MAP[form];
  return <C />;
}
