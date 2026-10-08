# Handover — QR Trái Tim

Written 2026-10-08 so a new session can pick up cold. Read this, then `docs/PLAN.md` (original design), then `Z_prompt_typer.md` (the user's own requests, newest at the bottom of the file).

## 1. What the project is

React (Vite) app for Vercel. A heart-shaped QR code opens an interactive animated gift page.

```
/            -> redirects to /home
/home        admin dashboard (login required): pick an occasion -> QR, manage photos
/qr/:occasion  black page + heart QR (encodes the gift URL)
/birthday    gift experience (public, what the QR opens)
/anniversary gift experience (public)
```

Stack: Vite 8, React 19, react-router 8 (data router, `react-router/dom`), `qrcode`, `@supabase/supabase-js`, vitest + jsqr. UI copy is Vietnamese. Dev port **5176**. Target domain `qr-app.vercel.app` (custom domain to be added later).

## 2. What has been done

**Round 1 (original brief) — complete and verified in a browser**
- Heart QR: QR rotated 225° into a diamond plus two semicircle lobes of decorative modules, red on a white heart plate, level-H error correction, `gap = 1`, `margin = 3`. Decodes with jsQR in unit tests, and a real screenshot decodes with OpenCV (also when shrunk and blurred). Not yet scanned with a physical phone.
- Birthday flow: gate -> matrix-rain intro with particle text -> cake (press-and-hold the flame to blow out, confetti, music-box tune) -> wish tags -> flip-book letter -> shooting-star sky.
- Anniversary flow: gate -> "I ♥ YOU" intro -> live days-together counter -> flip-book letter -> particle-heart finale.
- Shared engines in `src/shared/` (canvas hook, Starfield, MatrixRain, ParticleText, Confetti, FloatingHearts, FlipBook, SceneGate, WebAudio music box). `prefers-reduced-motion` is honoured in CSS and in the canvas components.
- Scripts `clean_restart.ps1`, `deploy_local.ps1`, `deploy_vercel.ps1` (modelled on `C:\Caro-app`, port 5176).
- `vercel.json` with SPA rewrite.

**Round 2 (user's follow-up list in `Z_prompt_typer.md`) — implemented by a later session; I (this session) only confirmed the code exists, tests pass and the build succeeds. I did not re-check these visually.**
1. `/home` management page, main picker moved into it. Files in `src/features/admin/` (`HomePage`, `LoginForm`, `PhotoManager`, `useAdminSession`). Photos stored in Supabase (`src/shared/lib/supabase.js`, `src/shared/lib/photos.js`: list, add, replace, delete, reorder, resize before upload, max 16). Birthday page fetches photos and shows a new `PhotoHeartScene` (photos pop up, then fly into a heart outline) between cake and wishes when photos exist.
2. Gate title -> "Gửi kẻ hốn chíp". 3. Cake title -> "Chúc mừng sinh nhật {name}!". 5. Names: recipient "Mẹ Hấu", sender "Bố Hấu" (all in `src/features/birthday/content.js`).
5b. Page-flip animation fix: z-index change in `FlipBook.jsx` (turned pages stay above the stack while swinging).
6. Intro words now `3, 2, 1, HAPPY, BIRTHDAY, TO YOU, MẸ HẤU ♥`.
7. Cake scene has gifts and balloons (`CakeDecor.jsx`).

**Supabase** (see memory `supabase-admin-setup`): project `sudfxyhjksqjmarwcevp`; table `gift_photos`, public bucket `gift-photos`; RLS write access only for `app_metadata.role = 'admin'`; admin is a Supabase Auth user mapped from `VITE_ADMIN_USERNAME` / `VITE_ADMIN_EMAIL` in `.env`. The password is not in the repo.

**Checks at handover:** `npm test` -> 3 files, 13 tests pass. `npm run build` succeeds.

## 3. What has NOT been done

1. **Nothing is committed.** Branch `main`, everything new is untracked (`src/`, `docs/`, `package.json`, scripts, config). Also `image.png` and `qr heart.png` show as deleted in git status; confirm that was intended before committing (they are the user's QR reference images).
2. **Never deployed.** `.vercel/` does not exist, project not linked.
3. **`deploy_vercel.ps1` does not sync env vars to Vercel.** The deployed build needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_ADMIN_USERNAME`, `VITE_ADMIN_EMAIL`, otherwise `/home` shows "Thiếu VITE_SUPABASE…" and no photos load. Add a sync step like the Caro script's `vercel env add` loop (these are public client values, not secrets; never put the Supabase service_role key anywhere).
4. **Round-2 items I could not finish from the prompt:** item 4 ("Bây giờ chọn một điều ước cho ngày sinh nhật của Cậu -> ") has no replacement text, and item 7 ends mid-sentence ("also add"). Ask the user what they meant. The wish-scene title currently reads "Bây giờ… chọn một điều ước cho ngày sinh nhật của Mẹ Hấu."
5. **Round-2 visual verification.** Walk `/home` (login, add, switch order, replace, delete photos), the photo-heart scene with 1, 5 and 16 photos, the fixed page flip, the new intro words and the cake decor in a real browser at 390×844.
6. **Anniversary content is placeholder** (`Em` / `Anh`, 2024-02-14) and was not updated for round 2.
7. **Real phone scan test** of the heart QR (iPhone and Android) is still outstanding.
8. Domain: `qr-app.vercel.app` is only reachable after the first deploy. When a custom domain exists, set `VITE_SITE_URL` so QR codes always point at it.
9. Music is synthesised (no audio files); the user may later want real tracks.
10. `/home` is protected by login in the UI only; real protection is the RLS policies. Public gift pages read photos with the anon key, which is intended.

## 4. Suggested next steps (in order)

1. Ask the user about round-2 items 4 and 7.
2. Start `npx vite --port 5176`, run a Playwright walk (see approach below), fix anything broken.
3. Update `deploy_vercel.ps1` to sync the four `VITE_*` vars, then deploy; confirm `/birthday` and `/home` work on the live URL and the QR points at it.
4. Commit on a branch (not `main`).

## 5. Practical notes

- **Run tests in PowerShell**, not Git Bash: in this environment `npm test` / `npx vitest` from Git Bash sometimes reports "2 failed, no tests" (drive-letter case in the cwd); PowerShell passes.
- Dev server: `npx vite --port 5176 --strictPort`. When opened on localhost, the QR encodes the LAN IP (`__LAN_HOST__` in `vite.config.js`) so a phone on the same Wi-Fi can scan it.
- Browser testing: Python Playwright and OpenCV are installed (`cv2.QRCodeDetector` decodes the QR from screenshots). Playwright's click waits for "stable" elements, so use `force=True` on pulsing/swinging buttons (`.gate`, `.sky-star`, `.wish-tag`).
- Reference sites for the gift pages: `birthday-gift-cake.netlify.app` and `happybirthday.dlove.vn` (the latter blanks itself when it detects devtools; neutralise `console.*` in an init script to inspect it).
- `.env` holds `VERCEL_ACCESS_TOKEN` and Supabase values and is git-ignored. Do not print it.
- `Z_updating_prompt.md` is empty; `Z_prompt_typer.md` is the user's scratch prompt file and is modified but uncommitted.
