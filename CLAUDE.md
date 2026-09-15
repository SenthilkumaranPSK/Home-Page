# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"SK Home" — a personal browser start page / New Tab replacement. Static, no framework, no build
step, no `npm install`, no `package.json`. Opening `index.html` directly in a browser runs the
whole thing. It's also distributed as a zero-permission Chrome extension (`extension/`) and as a
PWA (installable on phones via `manifest.webmanifest` + `sw.js`).

Full feature/customization writeup is in `README.md` — read it for user-facing behavior (keyboard
shortcuts, card list, config options). This file focuses on the architecture.

## Commands

There is no build/lint/test tooling in this repo — it's plain HTML/CSS/JS served as-is.

**Run it locally** (only needed for the service worker / PWA install; opening `index.html` directly
works for everything else):
```bash
python3 -m http.server 8000     # then open http://localhost:8000
npx serve
```

**Sync changes into the Chrome extension** — required any time `index.html`, `styles.css`,
`app.js`, `config.js`, `cosmos.js`, `live.js`, or `manifest.webmanifest` change, because
`extension/` is a committed copy, not a symlink:
```bash
./sync.sh          # macOS / Linux / Git Bash / WSL
sync.bat           # Windows cmd (thin wrapper around sync.ps1)
./sync.sh --check  # report drift, change nothing — exit 1 if stale (both platforms)
```
`sync.sh` regenerates `extension/newtab.html` from `index.html` (stripping PWA-only tags and
flipping `data-page="web"` → `data-page="ext"`), copies the other shell files verbatim, and
rewrites `sw.js`'s `CACHE` constant to a hash of the shell files' content (line endings stripped
first, so a CRLF checkout doesn't spuriously bump it — see `.gitattributes`). After syncing, reload
the unpacked extension at `chrome://extensions`. `.githooks/pre-commit` runs `sync.sh --check` and
blocks the commit if it's stale; opt in once with `git config core.hooksPath .githooks`.

**Deploy**: Vercel, no CLI needed — drag-and-drop the folder at vercel.com/new, or `vercel --prod`.
`vercel.json` sets cache headers, `noindex`/`nosniff`/no-referrer headers, and a
Content-Security-Policy scoped to `'self'` plus exactly the four API origins `live.js` calls; there
is no build command configured (answer "Other" if Vercel asks). Adding a new external origin
anywhere in the code requires adding it to `connect-src` in `vercel.json` too, or the request will
be blocked on the deployed site (not locally, since CSP is a response header Vercel adds).

## Architecture

Four script files load in a fixed order from `index.html`, each an IIFE, each depending on the
previous being loaded first:

```
config.js  →  cosmos.js  →  live.js  →  app.js
```

- **`config.js`** — plain data only (no logic). Defines `const CONFIG = {...}`: name, weather
  location, GitHub username, market coins, feed toggles, countdown target, pomodoro lengths,
  greeting time bands, sublines, search engines, link groups, and motion/behavior `options`. This
  is the file end users edit; everything else reads from the global `CONFIG`.

- **`cosmos.js`** — `window.Cosmos`, the canvas background. Owns the time-of-day color system: a
  `BANDS` table (hour → background/nebula/accent RGB) that's linearly interpolated by fractional
  hour so the sky palette is continuous, never stepped. Renders a parallax starfield, drifting
  nebula, occasional shooting stars, and weather-reactive particles (rain/snow) on a single
  `<canvas id="sky">`. Self-pauses on `visibilitychange` and respects `prefers-reduced-motion` and
  `CONFIG.options.animateBackground/weatherParticles/maxStars`.

- **`live.js`** — `window.Live`, all external data fetching. Every feed (Open-Meteo weather,
  GitHub public API, HN via Algolia, CoinGecko) is keyless/CORS-open, wrapped through a shared
  `cache(key, ttlMin, fetcher)` helper that reads/writes `localStorage` under a `skhome.live.*`
  namespace, serves cached data instantly if fresh, and falls back to *stale* cached data (rather
  than nothing) if a fetch fails. Fetches never throw uncaught — a dead feed just means its card
  stays hidden.

- **`app.js`** — everything interactive: DOM wiring, the `store` wrapper around `localStorage`
  (namespaced `skhome.*`, never throws), clock/greeting rendering (greeting text picks a
  `CONFIG.greetings` band or a `CONFIG.specialGreetings` day-override, first match wins), tile
  rendering and drag-to-reorder (persisted order overrides `config.js` order), the fuzzy command
  palette (`Ctrl/Cmd+K`), search-with-engine-prefix parsing, pomodoro timer, todo list with
  natural-language parsing (`parseTask` — pulls time/priority out of free text), notes scratchpad,
  and the per-card render functions (`loadWeather`, `loadGitHub`, `loadHN`, `loadMarkets`) that
  call into `Live` and paint the DOM. `Cosmos.setPalette`-style syncing happens via
  `syncPalette(hour)`.

Reading order for a non-trivial UI change: `config.js` (what data exists) → the relevant section of
`app.js` (how it's rendered/wired) → `styles.css` (how it looks) → `cosmos.js`/`live.js` only if
touching the background or a live-data card.

### Key invariants to preserve

- **No external assets at paint time.** No webfonts, no CDN, no favicon services — icons are
  inline SVG paths in `app.js` (`icon()`/`svgEl()`), not files. Don't introduce a `<link>` to an
  external font or icon service.
- **Every live feed must fail silently and cache-first.** New feeds should go through
  `Live`'s `cache()`/`json()` pattern and hide their card (`hidden` attribute) rather than show an
  error state.
- **Motion must be gateable.** Any new animation/particle effect should check the relevant
  `CONFIG.options` flag and bail out when `prefers-reduced-motion` is set (see the `REDUCED` check
  near the top of `app.js` and the equivalent in `cosmos.js`).
- **`extension/` is a build artifact of `sync.sh`, not hand-edited.** Never edit files under
  `extension/` directly except `manifest.json` and the `icons/` set — everything else gets
  overwritten by the next sync.
- **All personalization lives in `config.js`.** Don't hardcode a user's name, links, or location
  into `app.js`/`cosmos.js`/`live.js`; add a `CONFIG` field instead.
- **All persisted state is local-only.** Notes, todos, tile order, streak, and timer counts live in
  `localStorage` (`skhome.*` keys) and are never sent anywhere — keep it that way.
- **Never hand-edit `CACHE` in `sw.js`.** It's derived from the shell files' content by
  `sync.sh`/`sync.ps1` — run the script instead of typing a new version string.

### What's intentionally not implemented

Gmail unread count, Google Calendar events, and Spotify now-playing are deliberately absent — each
needs OAuth and a backend to hold credentials, which this static page doesn't have. See "What's
deliberately not here" in `README.md` before attempting to add them.
