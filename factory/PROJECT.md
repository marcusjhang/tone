# Tone — project brief for factory agents

Read this before every task. It is the durable context; the per-run goal is the
task. `HANDOVER.md` (repo root) is the authoritative product handover — read it
too, and `docs/research-domain.md` for the color science.

## What Tone is

A free, no-login web app that reproduces a Korean personal-color consultation
from one selfie and returns a full result sheet in English.

One-liner: *One selfie. Your color type, your palette, and everything to do with it.*

Objective: viral first (mass user acquisition, shareable result card), monetize
later. The reveal is the product; an accurate label is not the point.

## Stack (fixed — do not substitute)

- **Vite + React + TypeScript**, built as a static SPA (no backend, no accounts).
- **Tailwind CSS** for styling.
- **MediaPipe Tasks Vision** (`@mediapipe/tasks-vision`, WASM) for on-device face
  landmark detection. Runs in the browser; no image is ever uploaded.
- **Vitest + React Testing Library** for tests.
- English-first. Type labels/lighting copy stay localizable.

## Commands (must stay working after every change)

- `npm install` — install deps.
- `npm run build` — type-check + production build (must pass).
- `npm test` — `vitest run` (must pass, non-watch).
- `npm run dev` — local dev server.

## Non-negotiable product constraints (from HANDOVER.md §9)

- **Confidence always shown**; never one authoritative verdict. Always offer
  **secondary type matches**.
- **Deterministic**: the same photo + same inputs → the same result. No randomness.
- Frame worst colors as **"less flattering on you"** — blame the color pairing,
  never the person. Worst colors are optional and shown second.
- No color-psychology claims. Use "styling suggestion" language.
- State clearly it is **not a medical diagnosis**.
- **Deep-skin accuracy is a launch gate**, not an afterthought.
- Minimize retention of facial images: process on-device, do not persist or
  transmit the selfie.

## Domain model

- 12 types: Spring (Warm, Light, Bright), Summer (Cool, Light, Mute),
  Autumn (Warm, Deep, Mute), Winter (Cool, Deep, Bright).
- Four axes: warm↔cool, light↔deep, bright↔muted, low↔high contrast.
- Model a type as a normalized object `{season, dominant_axis, label, confidence,
  secondary_types[]}` with an alias layer (Bright↔Clear↔Vivid↔Strong, Mute↔Soft,
  Deep↔Dark) — never a flat enum.
- Palettes: best colors, worst colors (each with a safer substitute), neutral/basics
  — English name + hex.

## Scope

- **V1 in:** prep guidance; guided camera with lighting/filter checks; the drape
  reveal; type + confidence + secondary types; best/worst/neutral palettes;
  fashion, makeup, hair, jewelry, glasses, nails; shareable card; PDF export.
- **V1 out:** shopping/affiliate, accounts/history, native apps, wardrobe scanning,
  virtual try-on, men's/wedding packages, any social/friend feature.

## Working agreement

- Make the smallest change that satisfies the spec; leave the repo building and
  testing green.
- Do not commit. Work only inside the workspace you are given.
- `node_modules/`, `dist/`, and `.psf/` are gitignored — do not add them to git.
- Prefer small, composable modules with pure functions for anything in the color
  pipeline so it can be unit-tested deterministically.
