# QR Trái Tim — Implementation Plan

Source brief: `Z_prompt_typer.md`. Target domain: `qr-trai-tim-app.vercel.app` (custom domain added later).

## 1. Product flow

```
/                     Page 1  Occasion picker (dropdown: Birthday / Anniversary)
  └─ select ─────────▶ /qr/:occasion   Page 2  Black page + heart-shaped QR (encodes page 3 URL)
                          └─ scan / tap ▶ /birthday | /anniversary   Page 3  Interactive animated gift
```

- Selecting an option navigates immediately (no extra button) with a View Transition cross-fade.
- Page 2 is intentionally bare: black background, glowing heart QR, one caption, two small icons (back, download PNG). Tapping the heart opens page 3 (desktop testing convenience).
- Every feature lives under its own route on the main domain, so new occasions = new feature folder + one entry in `src/config/occasions.js`.

## 2. Heart QR — geometry (the core risk)

Matches `image.png`: QR rotated 45° into a diamond, two semicircle "lobes" filled with decorative modules on the two upper edges.

1. `qrcode.create(url, { errorCorrectionLevel: 'H' })` → `n × n` module matrix (H = 30% recovery, absorbs the decoration).
2. Work in QR grid coordinates. Lobes = circles of radius `n/2` centred on the midpoints of the **bottom** (`(n/2, n)`) and **right** (`(n, n/2)`) sides — the two sides that touch the only finder-free corner (bottom-right).
3. Fill lobe cells with seeded random modules (deterministic per URL), skipping a 1-module `gap` band around the QR so finder/timing patterns keep a clean border.
4. Rotate the group `225°` about the QR centre → bottom-right corner points up (heart cleft), the three finders land at left, right and bottom tip (same as reference).
5. Scannability: red modules on a **white heart-shaped plate** (heart union expanded by a 3-module margin = quiet zone), plate glowing on the black page. Normal polarity works on every scanner (inverted light-on-dark does not).
6. Render as a single SVG path built from horizontal runs + hairline stroke to hide anti-alias seams at 45°.

**Verification**
- Unit test (vitest): rasterise the heart exactly like the SVG (inverse 225° transform), decode with `jsQR`, assert decoded text === URL. Plus structural tests (QR modules untouched, lobes never inside the gap band, deterministic output).
- Manual: screenshot the real page in Chromium (Playwright) and decode with OpenCV.

## 3. Page 3 — Birthday experience (scene state machine)

| # | Scene | Reference | Interaction |
|---|-------|-----------|-------------|
| 0 | Gate | — | "Chạm để mở quà" — unlocks audio |
| 1 | Intro | dlove | Pink matrix letter rain + particle text `3 → 2 → 1 → HAPPY → BIRTHDAY → TO → YOU → ♥` |
| 2 | Cake | birthday-gift-cake | SVG cake, flickering candle; **press & hold flame** (progress ring) to blow out → smoke, confetti, music-box "Happy Birthday" |
| 3 | Wish | birthday-gift-cake | 4 swinging gift tags; tap one to choose |
| 4 | Letter | both | 3D flip book — tap / swipe to turn pages |
| 5 | Sky | birthday-gift-cake | Wish becomes a star; tap to launch a shooting star; replay |

Ambient layers: twinkling starfield canvas, floating hearts/petals. Mute toggle top-right. `prefers-reduced-motion` respected.

All copy (name, letter pages, wishes, sender) in `src/features/birthday/content.js`.

## 4. Page 3 — Anniversary experience

Reuses the same engines: Gate → crimson heart-rain + particle text `I → ♥ → YOU` → live "days together" counter from `startDate` → flip book of memories → particle heart finale + replay. Copy in `src/features/anniversary/content.js`.

## 5. Architecture

```
src/
  main.jsx, App.jsx              router (react-router v7, viewTransition navigation)
  config/occasions.js            occasion registry (id, label, route)
  config/siteUrl.js              base URL for QR: VITE_SITE_URL → LAN IP in dev → window.origin
  shared/
    components/  Starfield, MatrixRain, ParticleText, FlipBook, Confetti, FloatingHearts, SceneGate, MuteButton
    hooks/       useCanvas (DPR + resize + rAF), usePrefersReducedMotion
    lib/         rng (seeded), audio (WebAudio music box), heartPath
  features/
    occasion-picker/   Page 1
    heart-qr/          Page 2 + buildHeartQr (pure) + tests
    birthday/          Page 3 birthday scenes + content
    anniversary/       Page 3 anniversary scenes + content
```

- Stack: Vite + React 19 (JS), `react-router`, `qrcode`. No UI framework, plain CSS per feature. Dev: vitest, jsqr.
- No image assets: cake, tags, hearts are SVG/CSS; music synthesised (no licensing issues, tiny bundle).
- Dev QR: when opened on `localhost`, the QR encodes the machine's LAN IP (injected by `vite.config.js`) so a phone on the same Wi-Fi can scan it.

## 6. Deployment

- `vercel.json`: SPA rewrite to `index.html` (deep links `/birthday` work from QR).
- `clean_restart.ps1` — free port 5176 (Caro uses 5175), then run `deploy_local.ps1`.
- `deploy_local.ps1` — check node/npm, install if needed, `vite --host --port 5176 --strictPort`.
- `deploy_vercel.ps1` — token from env / `.env` (`VERCEL_ACCESS_TOKEN`), test + build, `vercel link --project qr-trai-tim-app`, `vercel deploy --prod`.
- Custom domain later: Vercel → Project → Domains; optionally set `VITE_SITE_URL` so QR codes always point at the canonical domain.

## 7. Build order

1. Scaffold Vite/React, router, global styles, scripts, vercel.json.
2. `buildHeartQr` + jsQR decode test (gate: must pass before UI).
3. Page 1 + Page 2 UI, PNG download.
4. Shared engines (canvas hook, starfield, matrix, particle text, confetti, flip book, audio).
5. Birthday scenes. 6. Anniversary scenes.
7. Verify: `npm test`, `npm run build`, Playwright walk-through screenshots at 390×844, OpenCV decode of real page.

## 8. Out of scope (v1)

Per-recipient customisation via URL/DB, photo uploads, microphone "blow" detection, i18n toggle. The registry + content files are the extension points.
