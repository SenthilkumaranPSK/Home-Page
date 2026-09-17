/* ==========================================================================
   SK HOME — CONFIG
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit. Everything personal lives here.
   After editing, run ./sync.sh (or sync.bat) to update the Chrome extension.
   ========================================================================== */

const CONFIG = {

  /* ---- Who you are -------------------------------------------------- */
  name: "SK",

  /* ---- Weather location ----------------------------------------------
     No API key, no signup, no location permission prompt.
     Find lat/lon for any city at https://open-meteo.com                 */
  location: {
    label: "Salem",
    lat: 11.664,
    lon: 78.146,
    units: "celsius",              // "celsius" | "fahrenheit"
  },

  /* ---- Live data ------------------------------------------------------
     All keyless and free. Set any block to null to hide that card.      */
  github: {
    user: "SenthilkumaranPSK",
  },

  markets: {
    currency: "inr",               // inr, usd, eur…
    coins: [
      { id: "bitcoin",  label: "BTC" },
      { id: "ethereum", label: "ETH" },
      { id: "solana",   label: "SOL" },
    ],
  },

  feeds: {
    hackernews: true,              // front page, refreshed every 20 min
    devto:      true,              // dev.to's own front page, refreshed every 20 min
    onThisDay:  true,               // a Wikipedia "on this day" fact, folded into the subline
  },

  /* ---- Search suggestions -----------------------------------------------
     Absolute URL to the /api/suggest proxy this project ships (see
     api/suggest.js) — needed because the Chrome extension and file://
     testing have no /api/ route, so a relative path would 404 there.
     Point it at your own Vercel deployment once you've pushed one, or set
     to null to disable suggestions entirely.                              */
  search: {
    suggestEndpoint: "https://hey-sk.vercel.app/api/suggest",
  },

  /* ---- Countdown ------------------------------------------------------
     Something to keep in front of you. Set to null to hide it.          */
  countdown: {
    label: "Next milestone",
    date: "2026-12-31",            // YYYY-MM-DD
  },

  /* ---- Focus timer ---------------------------------------------------- */
  pomodoro: {
    focusMinutes: 25,
    breakMinutes: 5,
  },

  /* ---- Greeting -------------------------------------------------------
     Time bands. `from`/`to` are 24h hours; a band may wrap past midnight.
     `text` gets your name appended: "Good morning" -> "Good morning, SK"  */
  greetings: [
    { from: 5,  to: 7,  text: "Early start"    },
    { from: 8,  to: 11, text: "Good morning"   },
    { from: 12, to: 16, text: "Good afternoon" },
    { from: 17, to: 20, text: "Good evening"   },
    { from: 21, to: 23, text: "Winding down"   },
    { from: 0,  to: 4,  text: "Still up"       },
  ],

  /* ---- Greetings that override the band on a specific day + time ------
     First match wins. day: 0=Sunday … 6=Saturday.                       */
  specialGreetings: [
    { day: 1, from: 5,  to: 11, text: "Monday. Let's go"   },
    { day: 5, from: 17, to: 23, text: "Friday night"       },
    { day: 6, from: 8,  to: 20, text: "Saturday"           },
    { day: 0, from: 8,  to: 20, text: "Sunday reset"       },
  ],

  /* ---- Rotating subline ------------------------------------------------
     A different one each open. Weather and streaks can override these.   */
  sublines: [
    "What are we building today?",
    "Ship something small.",
    "One thing at a time.",
    "Momentum beats motivation.",
    "Make it work, then make it fast.",
    "Read the error message.",
    "Commit early, commit often.",
    "The best portfolio is a finished project.",
    "Focus is a choice you make repeatedly.",
    "Done is better than perfect.",
    "Delete more code than you write.",
    "Slow is smooth, smooth is fast.",
  ],

  /* ---- Search engines --------------------------------------------------
     `key` is the prefix you type followed by a space:  p react hooks
     Tab cycles engines. The first entry is the default.

     `bang: true` keeps an entry OUT of the Tab cycle — it still works as a
     typed prefix, it just doesn't take a turn in the rotation. That's what
     makes it safe to add as many of these as you like: a dozen bangs would
     otherwise mean a dozen presses of Tab to get back to Google.          */
  engines: [
    { key: "g",   name: "Google",     url: "https://www.google.com/search?q=%s",              color: "#4285f4" },
    { key: "p",   name: "Perplexity", url: "https://www.perplexity.ai/search?q=%s",           color: "#20b8cd" },
    { key: "c",   name: "Claude",     url: "https://claude.ai/new?q=%s",                      color: "#d97757" },
    { key: "gpt", name: "ChatGPT",    url: "https://chat.openai.com/?q=%s",                   color: "#10a37f" },
    { key: "y",   name: "YouTube",    url: "https://www.youtube.com/results?search_query=%s", color: "#ff0033" },
    { key: "gh",  name: "GitHub",     url: "https://github.com/search?q=%s",                  color: "#8b949e" },
    { key: "d",   name: "DeepSeek",   url: "https://chat.deepseek.com/?q=%s",                 color: "#4d6bfe" },

    /* Bangs — typed prefixes only, never in the Tab cycle. */
    { key: "!w",   name: "Wikipedia",      url: "https://en.wikipedia.org/w/index.php?search=%s", color: "#a2a9b1", bang: true },
    { key: "!r",   name: "Reddit",         url: "https://www.reddit.com/search/?q=%s",            color: "#ff4500", bang: true },
    { key: "!so",  name: "Stack Overflow", url: "https://stackoverflow.com/search?q=%s",          color: "#f48024", bang: true },
    { key: "!npm", name: "npm",            url: "https://www.npmjs.com/search?q=%s",              color: "#cb3837", bang: true },
    { key: "!mdn", name: "MDN",            url: "https://developer.mozilla.org/en-US/search?q=%s", color: "#83d0f2", bang: true },
  ],

  /* ---- Your links ------------------------------------------------------
     name  : label on the tile
     url   : where it goes
     key   : optional single-key shortcut (press it anywhere, not typing)
     color : accent colour for the tile
     icon  : optional glyph — spark chat mail code play note user bolt book
             keyboard terminal globe cloud folder calendar search chart
             Leave it out for a letter monogram.

     You can also just drag tiles around on the page; the order is saved.  */
  groups: [
    {
      title: "AI",
      links: [
        { name: "Claude",     url: "https://claude.ai",                   key: "c", color: "#d97757", icon: "spark"  },
        { name: "ChatGPT",    url: "https://chat.openai.com",             key: "o", color: "#10a37f", icon: "chat"   },
        { name: "Gemini",     url: "https://gemini.google.com",           key: "e", color: "#4285f4", icon: "spark"  },
        { name: "Grok",       url: "https://grok.com",                    key: "x", color: "#c9d1d9", icon: "bolt"   },
        { name: "DeepSeek",   url: "https://chat.deepseek.com",                     color: "#4d6bfe", icon: "chat"   },
        { name: "Kimi",       url: "https://kimi.com",                              color: "#6f5bf5"                 },
        { name: "Perplexity", url: "https://www.perplexity.ai",           key: "p", color: "#20b8cd", icon: "search" },
        { name: "AI Studio",  url: "https://aistudio.google.com",                   color: "#f9ab00", icon: "spark"  },
      ],
    },
    {
      title: "Dev",
      links: [
        { name: "GitHub",    url: "https://github.com/SenthilkumaranPSK", key: "g", color: "#c9d1d9", icon: "code"     },
        { name: "Vercel",    url: "https://vercel.com/dashboard",         key: "v", color: "#e2e8f0", icon: "cloud"    },
        { name: "Portfolio", url: "https://senthilkumaran.vercel.app",    key: "f", color: "#a78bfa", icon: "globe"    },
        { name: "Localhost", url: "http://localhost:3000",                          color: "#64748b", icon: "terminal" },
      ],
    },
    {
      title: "Work",
      links: [
        { name: "Gmail",    url: "https://mail.google.com",                  key: "m", color: "#ea4335", icon: "mail"     },
        { name: "WhatsApp", url: "https://web.whatsapp.com",                 key: "w", color: "#25d366", icon: "chat"     },
        { name: "Keep",     url: "https://keep.google.com",                  key: "k", color: "#fbbc04", icon: "note"     },
        { name: "LinkedIn", url: "https://linkedin.com/in/senthilkumaran75", key: "l", color: "#0a66c2", icon: "user"     },
        { name: "Calendar", url: "https://calendar.google.com",                        color: "#1a73e8", icon: "calendar" },
        { name: "Drive",    url: "https://drive.google.com",                           color: "#00ac47", icon: "folder"   },
      ],
    },
    {
      title: "Study",
      links: [
        { name: "Typing",   url: "https://monkeytype.com", key: "t", color: "#e2b714", icon: "keyboard" },
        { name: "YouTube",  url: "https://youtube.com",    key: "y", color: "#ff0033", icon: "play"     },
        { name: "LeetCode", url: "https://leetcode.com",             color: "#ffa116", icon: "code"     },
        { name: "Kaggle",   url: "https://kaggle.com",               color: "#20beff", icon: "chart"    },
      ],
    },
  ],

  /* ---- Behaviour -------------------------------------------------------- */
  options: {
    showSeconds:       true,
    use24Hour:         false,
    autofocusSearch:   true,
    openLinksInNewTab: false,
    focusChime:        true,   // soft sound when a focus/break session ends

    /* Motion. All of this is skipped automatically if your OS is set to
       "reduce motion" — these switches are for when you just want calm.  */
    animateBackground: true,   // the living sky
    weatherParticles:  true,   // rain / snow falling on the page
    entranceAnimation: true,   // staggered reveal on open
    tiltTiles:         true,   // 3D tilt toward the cursor
    cursorGlow:        true,   // light that follows your pointer
    maxStars:          420,    // lower this if an old machine struggles
  },
};
