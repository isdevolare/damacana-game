import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: '#b87aff',
        pink: '#ff5ce8',
        cyan: '#5cf6ff',
        blueish: '#4a7dff',
        gold: '#ffd166',
        danger: '#ff3d6e',
        greenish: '#5cffa0',
        cosmos: '#05010d',
      },
      fontFamily: {
        vt: ['var(--font-vt323)', 'monospace'],
        space: ['var(--font-space-mono)', 'monospace'],
        major: ['var(--font-major-mono)', 'monospace'],
      },
      animation: {
        starfield: 'starfield 60s linear infinite',
        flow: 'flow 6s linear infinite',
        pulse2: 'pulse2 2s ease-in-out infinite',
        spinslow: 'spinslow 8s linear infinite',
      },
      keyframes: {
        starfield: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 -1000px' },
        },
        flow: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '0.6' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        pulse2: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        spinslow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
