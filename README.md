# SK Home

A personal start page that's alive: a sky that changes with the hour, a greeting
that knows what day it is, your real GitHub activity, and everything one keystroke
away.

No framework, no build step, no `npm install`. Open `index.html` and it runs.

Everything you'd want to change lives in **`config.js`**.

---

## What's on it

**A living sky.** The background is a canvas: a three-layer parallax starfield that
shifts as you move the pointer, drifting nebula clouds, and the occasional shooting
star. The whole palette moves through the day — deep blue at 2am, rose at dawn, amber
through the morning, gold at noon, pink at dusk, violet at night — and the accent
colour of every card, button and chart follows it. **If it's raining where you are,
rain falls on the page.** Snow too.

**A greeting that pays attention.** Time bands plus day-specific overrides: Monday
morning reads differently from Friday night, which reads differently from 3am. The
line underneath reacts to the weather and to your open streak — how many days in a
row you've opened the page.

**Live data, actually live.**

| Card | Source | Refresh |
|---|---|---|
| Weather + 12-hour curve | Open-Meteo | 20 min |
| GitHub stats + 90-day activity heatmap | GitHub public API | 30 min |
| Hacker News front page | HN via Algolia | 20 min |
| Crypto prices + 24h change | CoinGecko | 10 min |

All four are keyless, free, and CORS-open — no signup, no tokens, no server. Each
card only appears if its feed answers, and everything is cached, so offline just
shows the last reading.

**Things to do, not just links.** A pomodoro timer with a progress ring (it counts
your sessions and puts the countdown in the tab title), a countdown to a date you
set, a todo list that parses what you type — `call ravi 4pm !` becomes *call ravi* ·
**4:00 PM** · priority — and a scratchpad. All saved locally.

**Tiles you can rearrange.** Drag any tile; the others slide out of the way and the
new order is saved. "reset order" in the footer puts it back.

**Keyboard-first.** `Ctrl`/`⌘`+`K` opens a fuzzy command palette over every link and
action. `/` focuses search. `1`–`9` open the first nine tiles. Single letters jump
(`g` GitHub, `m` Gmail, `c` Claude). Hold `Alt` to see every shortcut at once.

---

## 1. Try it right now

Double-click `index.html`. It works straight from disk.

For the service worker and "install to phone" it needs to be served over http:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
npx serve                       # or this
```

---

## 2. Deploy to Vercel

**No CLI needed.** Go to [vercel.com/new](https://vercel.com/new) → **Deploy without
Git** / the drag-and-drop area → drop this folder in. You get a URL in about 20
seconds. There's no build step, so answer "Other" to anything Vercel asks.

With the CLI instead:

```bash
npm i -g vercel
cd sk-home
vercel --prod
```

`vercel.json` already sets caching, `noindex`, and a Content-Security-Policy scoped to
exactly the four API origins the page calls.

> **Make it private.** Vercel → project → Settings → Deployment Protection → Vercel
> Authentication. Then only your logged-in account can open the URL. Worth doing —
> the page has your links, notes and todos on it.
>
> If you ever attach a **custom domain**, check the protection's "applies to" setting
> covers it — Vercel Authentication can be scoped to exclude custom domains, which
> would quietly leave a custom domain wide open while the `*.vercel.app` URL stays
> locked.

---

## 3. Set it as your Chrome start page

`chrome://settings/onStartup` → **Open a specific page or set of pages** → **Add a
new page** → paste your URL.

For the 🏠 button: `chrome://settings/appearance` → **Show home button** → second
radio → paste your URL.

The New Tab page needs the extension below — Chrome deliberately won't let a URL
override it.

---

## 4. Make it your New Tab page

The `extension/` folder is a complete Chrome extension with **zero permissions** and
**no network requests of its own** — just your page, stored locally, so a new tab
paints instantly with no connection.

1. `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. **Load unpacked** → select the **`extension`** folder
4. Open a new tab

Chrome shows a "Disable developer mode extensions?" bubble on startup. That's normal
for unpacked extensions — click the **X**, not "Disable".

**After editing `config.js`** (or any shell file), re-copy it into the extension:

```bash
./sync.sh          # macOS / Linux / Git Bash / WSL
sync.bat           # Windows
```

This also re-derives `sw.js`'s cache name from the shell files' content, so the
service worker never serves a stale page after an edit. `./sync.sh --check` (or
`sync.bat --check`) reports what's out of sync without changing anything — useful
before a commit. To have that check run automatically and block a commit that forgot
it:

```bash
git config core.hooksPath .githooks
```

Then hit ↻ on the extension card at `chrome://extensions`.

<details>
<summary>Want the extension to always pull the live Vercel version instead?</summary>

Replace the contents of `extension/newtab.html` with:

```html
<meta http-equiv="refresh" content="0; url=https://YOUR-URL.vercel.app">
```

Updates then land without running `sync.sh` — at the cost of a network round-trip and
a flash on every new tab, and it won't work offline.
</details>

---

## 5. Put it on your phone

**Android (Chrome)** — open your URL → ⋮ → **Add to Home screen** → **Install**.
**iPhone (Safari)** — open the URL → Share → **Add to Home Screen**.

It gets an icon, opens full-screen with no address bar, and works offline. On a phone
the starfield parallax follows your device tilt instead of a pointer.

---

## 6. Customising

Open **`config.js`** — plain objects with comments.

| What | Where |
|---|---|
| Your name | `name` |
| Greeting wording and time bands | `greetings` (`from`/`to` are 24h hours) |
| Monday/Friday/weekend greetings | `specialGreetings` (`day`: 0=Sun … 6=Sat) |
| The rotating line underneath | `sublines` |
| Weather city | `location` — lat/lon from [open-meteo.com](https://open-meteo.com) |
| GitHub username | `github.user` |
| Coins and currency | `markets` |
| Countdown target | `countdown` |
| Pomodoro lengths | `pomodoro` |
| Your links | `groups` → `links` |
| Search engines and prefixes | `engines` (first is the default) |
| Motion switches, clock format | `options` |

Set `github`, `markets`, `feeds` or `countdown` to `null` to hide that card.

**Adding a link** — one line in the right group:

```js
{ name: "Notion", url: "https://notion.so", key: "n", color: "#ffffff", icon: "note" },
```

`key` is a single-press shortcut · `color` is the tile accent · `icon` is one of
`spark chat mail code play note user bolt book keyboard terminal globe cloud folder
calendar search chart` — leave it out for a letter monogram, like Kimi's **K**.

### If the motion is too much

In `config.options`:

```js
animateBackground: false,   // freeze the sky (keeps the colours)
weatherParticles:  false,   // no rain or snow
entranceAnimation: false,   // no staggered reveal
tiltTiles:         false,   // no 3D tilt
cursorGlow:        false,   // no light following the pointer
maxStars:          200,     // lighter starfield on an old machine
```

All of it is also skipped automatically if your OS is set to "reduce motion", and the
sky stops painting entirely whenever the tab isn't visible.

---

## 7. Keyboard

| Key | Does |
|---|---|
| `Ctrl`/`⌘` + `K` | Command palette over every link and action |
| `/` | Jump to the search box |
| `Tab` (in search) | Cycle search engine |
| `1`–`9` | Open the first nine tiles |
| a letter | Open the link with that `key` |
| hold `Alt` | Reveal every shortcut badge |
| `Esc` | Close the palette / clear search |

**Search prefixes** — prefix, space, then your query: `p ` Perplexity · `c ` Claude ·
`gpt ` ChatGPT · `y ` YouTube · `gh ` GitHub · `d ` DeepSeek · `g ` Google. Anything
that looks like a domain (`github.com/you`, `localhost:3000`) is opened rather than
searched.

---

## What's deliberately not here

Three things get asked for and can't be done honestly from a static page, so the page
doesn't fake them:

- **Gmail unread count** — needs OAuth, and the token needs a server to live on.
- **Google Calendar events** — the ICS feed refuses cross-origin browser reads.
- **Spotify now-playing** — OAuth again.

Each needs a backend holding your credentials. Vercel serverless functions (an `api/`
folder, still no build step) are the small next step if you want them — say the word
and I'll add it.

---

## Why it's still fast

- **Nothing external is fetched to paint the page.** No webfonts, no CDN, no icon
  service. Five local files.
- **No favicon lookups.** Most start pages fetch one per tile — 20+ round-trips that
  break offline. These icons are SVG paths in the source.
- **Greeting and clock render before first paint.** No flash of the wrong hour.
- **Live feeds start after the page is on screen**, never before, and all four are
  cached.
- **A service worker caches the shell**, so from the second visit the page doesn't
  touch the network to load.
- The sky pauses when the tab is hidden.

Measured in headless Chrome: first contentful paint ~310 ms cold, 5 requests.

---

## Files

```
index.html            markup
styles.css            all visuals
cosmos.js             the living sky — starfield, nebula, weather, palettes
live.js               the data feeds
app.js                everything you interact with
config.js         ←   edit this
sw.js                 offline cache
manifest.webmanifest  installable on phones
vercel.json           cache + security headers (incl. CSP)
sync.sh / sync.bat    sync extension/ + bump sw.js's cache name (--check to verify only)
sync.ps1              PowerShell logic sync.bat calls into
.githooks/pre-commit  blocks a commit if sync.sh --check fails (opt in, see above)
.gitattributes        keeps line endings consistent so the cache hash doesn't drift
assets/               icons
extension/            the Chrome New Tab extension
```

Notes, todos, tile order, streak and timer counts live in your browser's
`localStorage` — on that one device, never sent anywhere.
