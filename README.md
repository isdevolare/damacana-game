# damacana.exe

A cosmic-absurd idle / clicker game built as a Next.js 14 PWA. You are a
**damacana** (a water entity) floating in space. Tap it to damage an
ever-present boss, earn currency, and evolve through eight escalating forms —
from a single DROP to CLASSIFICATION FAILED and beyond. A deep skill tree,
prestige tiers, a 60-fact Knowledge Codex, achievements, procedural Tone.js
audio, and bilingual UI (English + Turkish) round it out. No backend — all
state lives in `localStorage`.

## Tech stack

- Next.js 14 (App Router, TypeScript strict)
- Tailwind CSS · Framer Motion · Zustand
- Tone.js (fully procedural audio — no audio assets)
- next-intl (en / tr) · next-pwa (installable PWA)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 (English) or http://localhost:3000/tr (Turkish).
Tap "TAP TO START" — audio requires a first user interaction (browser policy).

## Production build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel dashboard](https://vercel.com/new), choose **"Import Project"**
   and connect this Git repository.
3. Vercel auto-detects Next.js — no extra configuration needed. Click **Deploy**.
4. The resulting URL works on mobile and can be installed via
   "Add to Home Screen" (PWA).

See the [Vercel Next.js docs](https://vercel.com/docs/frameworks/nextjs) for details.

## Project layout

- `app/[locale]/` — App Router pages, locale-scoped layout
- `components/game/` — all game UI components
- `lib/config/` — pure data: balance, levels, upgrades, bosses, skill tree,
  events, facts, achievements, progression
- `lib/store.ts` — Zustand store (persisted to `localStorage`)
- `lib/audio/` — Tone.js audio engine
- `i18n/` — English + Turkish translation files

## License

MIT (placeholder).
