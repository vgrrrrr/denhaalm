# haalm — the den haalm companion app

A cozy alpine home for your Haalm animals. Buy a **den haalm** product, scan the QR code
on it, and a baby companion moves into the Haalm — a Tamagotchi-style alpine world where
you feed, clean, cuddle and play with your animal until it grows up.

## Running

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

The app is a pure client-side prototype: no backend, all state lives in
`localStorage` (`haalm-v1`). QR scanning is mocked — tap the scanner or enter a
demo code such as `HAALM-GIGI`, `HAALM-BENI`, … to unlock an animal.

## What's inside

- **Onboarding → Scan → Unlock** flow using the brand wordmark and confetti unlock moment
- **Home Meadow** — the world is the UI: the animal lives inside the alpine scene with a
  compact status capsule (hunger / happiness / energy / cleanliness)
- **Care** — Feed (costs treats), Clean (bubbles), Sleep (energy regenerates over real
  time), Cuddle — each with soft overlay animations
- **Leveling & growth** — care and play earn XP; animals level up and grow from baby to
  grown form at Lv. 8. Stats drift down over real time, sleep restores energy
- **Economy** — treats & hearts earned in minigames and via a daily streak bonus
- **Four playable minigames** — Berry Bounce (catch), Hill Dash (runner), Leaf Match
  (memory), Cloud Hop (timing), each paying out treats / hearts / XP with best scores
- **The Haalm map** — full vertically scrolling illustrated map with visitable places
  that boost your animal's stats
- **Herd** — collection screen for all eight canonical animals plus locked slots
- **Profile** — parent settings (sound, child-safe mode, …) and demo reset

## Living world & effects

- Time-of-day scenes (dawn / day / evening / night) with drifting clouds, birds and
  butterflies by day, moon, stars and fireflies at night (`/#/home?phase=night` forces
  a phase for demos)
- Pets are alive: breathing, contact shadow, spontaneous idle behaviors (hopping,
  looking around, wiggling, strolling with direction flip), need-emote thought bubbles,
  and tap reactions with particle bursts
- Every character sits on a grass meadow patch (also visually grounds assets whose
  feet were cropped in the source art)
- Care feedback: flying snack, rising bubbles, sparkles, stat floaters
- Level-up toasts and a full baby-to-grown evolution ceremony
- The Alm map shows the active pet at its current location; clouds drift over the map

## Design

Strictly follows the den haalm brand style sheet and the v0 rebuild spec in the asset
pack: Jost (self-hosted, the geometric companion to the wordmark) as the only UI font,
brand wordmarks used as images (never typeset), the exact pastel palette, and the
supplied transparent character assets (repaired: alpha holes inpainted, stray
matte-cut artifacts removed).

Tech: Vite + React + TypeScript, framer-motion, react-router (hash routing), zustand
with localStorage persistence.
