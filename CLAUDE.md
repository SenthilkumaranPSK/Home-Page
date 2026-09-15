# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"SK Home" — a personal browser start page / New Tab replacement. Static, no framework, no build
step, no `npm install`, no `package.json`. Opening `index.html` directly in a browser runs the
whole thing. It's also distributed as a zero-permission Chrome extension (`extension/`) and as a
PWA (installable on phones via `manifest.webmanifest` + `sw.js`).

The one exception to "fully static" is `api/suggest.js` — a single Vercel serverless function that
proxies search suggestions (see Architecture below). It holds no secrets and proxies a keyless
public endpoint, so it doesn't change the "no credentials, no signup" posture of the rest of the
page — but it does mean the page now has exactly one server-dependent feature. Everything else,
including the page with that feature disabled (`CONFIG.search.suggestEndpoint = null`), is static.

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
Content-Security-Policy scoped to `'self'` plus every external origin `live.js` calls directly
(Open-Meteo, GitHub, HN/Algolia, CoinGecko, Frankfurter, Wikipedia); there is no build command
configured (answer "Other" if Vercel asks). Adding a new external origin anywhere in the code
requires adding it to `connect-src` in `vercel.json` too, or the request will be blocked on the
deployed site (not locally, since CSP is a response header Vercel adds). `api/suggest.js` needs no
CSP entry — the client calls it same-origin, already covered by `'self'`; it does its own
cross-origin fetch server-side, where CSP doesn't apply. `api/` is auto-detected by Vercel with no
`vercel.json` `functions` config and deliberately stays outside `sync.sh`'s `SHELL_FILES` — it's
server-only and never shipped to the Chrome extension.

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
  GitHub public API + repos, HN via Algolia, dev.to's own JSON API, CoinGecko, Frankfurter currency
  rates, Wikipedia on-this-day) is keyless/CORS-open, wrapped through a shared
  `cache(key, ttlMin, fetcher)` helper that reads/writes `localStorage` under a `skhome.live.*`
  namespace, serves cached data instantly if fresh, and falls back to *stale* cached data (rather
  than nothing) if a fetch fails. Fetches never throw uncaught — a dead feed just means its card
  stays hidden. `markets()` additionally falls back to Binance's ticker (+ `rate()` to convert into
  the configured currency) if CoinGecko's free tier rate-limits, chained via `.catch()` inside the
  `cache()` fetcher so it only engages on a real CoinGecko failure. The one true exception to
  "keyless public API, called directly" is `suggest(query)`, which calls this project's own
  `/api/suggest` proxy — a **relative** path when running on the real deployed site (same-origin,
  works on every Vercel preview URL with no config, no CSP entry needed), falling back to the
  absolute `CONFIG.search.suggestEndpoint` only where a relative path can't resolve (the Chrome
  extension, `file://`). Deliberately **not** run through `cache()` — it's per-keystroke, not a
  slow TTL feed, so it relies on the proxy's own edge-cache header instead.

- **`api/suggest.js`** — the project's one serverless function (Vercel Node runtime, zero
  dependencies, auto-detected, no build step). Proxies `suggestqueries.google.com`'s suggest
  endpoint server-side, because none of Google's/Bing's/DuckDuckGo's own suggest endpoints send
  CORS headers, so the browser can't call them directly (verified by hand — no
  `Access-Control-Allow-Origin` on any of them). Always responds `200`, even on upstream failure,
  matching `live.js`'s "every feed fails silently" rule.

- **`app.js`** — everything interactive: DOM wiring, the `store` wrapper around `localStorage`
  (namespaced `skhome.*`, never throws), clock/greeting rendering (greeting text picks a
  `CONFIG.greetings` band, an on-this-day fact, a `CONFIG.specialGreetings` day-override, or the
  streak line, in that priority order — see `subline()`; the fact is checked before the streak line
  deliberately, since the streak count is already shown separately in the `#streak` badge and would
  otherwise permanently shadow the fact for any daily user), tile rendering and drag-to-reorder
  (persisted order overrides `config.js` order), the fuzzy command palette (`Ctrl/Cmd+K` — also
  hosts "Export data"/"Import data", a JSON backup of every `skhome.*` key except the `.live.*`
  caches), search — engine-prefix parsing, `todo `/`note ` quick-add prefixes
  (`parseQuickAdd`), a suggestions dropdown (`maybeSuggest`/`renderSuggest`, modeled on the
  palette's own list/select pattern, guarded against both a stale *and* a since-closed request via
  `sugToken`), and an inline calculator/unit/currency/time-zone converter
  (`evalCalc`/`parseConvert`/`parseTimeConvert` — Enter copies the result instead of navigating,
  with a `document.execCommand` fallback for non-secure contexts where `navigator.clipboard` is
  undefined) — a pomodoro timer (synthesized end-of-session chime via `chime()`, no audio file; a
  canvas-drawn favicon countdown via `paintFavicon()`), todo list and reading list sharing one
  `renderList()` renderer (deletion always looks the item up by reference —
  `array.indexOf(item)` — at click time, never a captured index, so two quick deletes in a row
  can't resolve against a stale, since-shifted index), todo natural-language parsing (`parseTask`
  — pulls time/priority out of free text), notes scratchpad with an optional hand-rolled Markdown
  preview (`renderMarkdown` — bold/code/checklists only, no library), a service-worker
  update toast (listens for `controllerchange`, skipping the first-ever activation on a fresh load),
  and the per-card render functions (`loadWeather`, `loadGitHub`, `loadHN`, `loadDevTo`,
  `loadMarkets`, `loadOnThisDay`) that call into `Live` and paint the DOM. `Cosmos.setPalette`-style
  syncing happens via `syncPalette(hour)`.

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
- **`sw.js` must never cache-first anything under `/api/`.** Same-origin routes under `/api/`
  bypass the service worker's shell cache entirely (see the `url.pathname.startsWith("/api/")`
  guard right after the origin check) — without it, a same-origin API response would get served
  back stale forever after the first hit, since it's never in `SHELL` and never evicted by
  `sync.sh`'s hash bump. Any future `/api/*` route needs this same exclusion to already cover it.
- **Async results in the search hint/suggestions must guard against staleness.** Both
  `maybeSuggest()` and the currency branch of `updateHint()` capture the input's value at request
  time and bail in their `.then()` if `input.value` has since changed — without this, a slower
  older keystroke's response can resolve after a newer one and clobber the UI with outdated data.
  Follow this pattern for any new async per-keystroke lookup.

### What's intentionally not implemented

Gmail unread count, Google Calendar events, and Spotify now-playing are deliberately absent — each
needs real OAuth and a backend to hold *credentials*, which is a meaningfully bigger step than
`api/suggest.js` (which proxies a keyless public endpoint and holds no secrets). See "What's
deliberately not here" in `README.md` before attempting to add them.
