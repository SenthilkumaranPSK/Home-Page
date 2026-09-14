/* ==========================================================================
   SK HOME — CONFIG
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit. Everything personal lives here.
   After editing, run ./sync.sh (or sync.bat on Windows) to update the
   Chrome extension copy too.
   ========================================================================== */

const CONFIG = {

  /* ---- Who you are -------------------------------------------------- */
  name: "SK",

  /* ---- Weather location ---------------------------------------------
     No API key, no signup, no location permission prompt.
     Find lat/lon for any city at https://open-meteo.com  */
  location: {
    label: "Salem",
    lat: 11.664,
    lon: 78.146,
    units: "celsius",            // "celsius" | "fahrenheit"
  },

  /* ---- Greeting time bands ------------------------------------------
     from/to are hours in 24h local time (inclusive of `from`,
     inclusive of `to`). Edit the text to taste.                        */
  greetings: [
    { from: 5,  to: 11, text: "Good morning"   },
    { from: 12, to: 16, text: "Good afternoon" },
    { from: 17, to: 20, text: "Good evening"   },
    { from: 21, to: 4,  text: "Still up"       },  // wraps past midnight
  ],

  /* ---- Rotating subline under the greeting --------------------------
     A different one each time the page opens.                          */
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
  ],

  /* ---- Search engines ------------------------------------------------
     `key` is the prefix you type followed by a space, e.g.  p react hooks
     Press Tab in the search box to cycle engines.
     The first entry is the default.                                     */
  engines: [
    { key: "g",   name: "Google",     url: "https://www.google.com/search?q=%s",        color: "#4285f4" },
    { key: "p",   name: "Perplexity", url: "https://www.perplexity.ai/search?q=%s",     color: "#20b8cd" },
    { key: "c",   name: "Claude",     url: "https://claude.ai/new?q=%s",                color: "#d97757" },
    { key: "gpt", name: "ChatGPT",    url: "https://chat.openai.com/?q=%s",             color: "#10a37f" },
    { key: "y",   name: "YouTube",    url: "https://www.youtube.com/results?search_query=%s", color: "#ff0033" },
    { key: "gh",  name: "GitHub",     url: "https://github.com/search?q=%s",            color: "#8b949e" },
    { key: "d",   name: "DeepSeek",   url: "https://chat.deepseek.com/?q=%s",           color: "#4d6bfe" },
  ],

  /* ---- Your links ----------------------------------------------------
     name  : label on the tile
     url   : where it goes
     key   : optional single-key shortcut (press it anywhere, not typing)
     color : accent for the tile monogram
     icon  : optional — one of the built-in glyphs in app.js:
             spark chat mail code play note user bolt book keyboard
             terminal globe cloud folder calendar search chart
             Leave it out and you get a clean letter monogram.          */
  groups: [
    {
      title: "AI",
      links: [
        { name: "Claude",      url: "https://claude.ai",                  key: "c", color: "#d97757", icon: "spark"  },
        { name: "ChatGPT",     url: "https://chat.openai.com",            key: "o", color: "#10a37f", icon: "chat"   },
        { name: "Gemini",      url: "https://gemini.google.com",          key: "e", color: "#4285f4", icon: "spark"  },
        { name: "Grok",        url: "https://grok.com",                   key: "x", color: "#c9d1d9", icon: "bolt"   },
        { name: "DeepSeek",    url: "https://chat.deepseek.com",                    color: "#4d6bfe", icon: "chat"   },
        { name: "Kimi",        url: "https://kimi.com",                             color: "#6f5bf5"                 },
        { name: "Perplexity",  url: "https://www.perplexity.ai",          key: "p", color: "#20b8cd", icon: "search" },
        { name: "AI Studio",   url: "https://aistudio.google.com",                  color: "#f9ab00", icon: "spark"  },
      ],
    },
    {
      title: "Dev",
      links: [
        { name: "GitHub",      url: "https://github.com/SenthilkumaranPSK", key: "g", color: "#c9d1d9", icon: "code"     },
        { name: "Vercel",      url: "https://vercel.com/dashboard",         key: "v", color: "#e2e8f0", icon: "cloud"    },
        { name: "Portfolio",   url: "https://senthilkumaran.vercel.app",    key: "f", color: "#a78bfa", icon: "globe"    },
        { name: "Localhost",   url: "http://localhost:3000",                          color: "#64748b", icon: "terminal" },
      ],
    },
    {
      title: "Work",
      links: [
        { name: "Gmail",       url: "https://mail.google.com",           key: "m", color: "#ea4335", icon: "mail"     },
        { name: "WhatsApp",    url: "https://web.whatsapp.com",          key: "w", color: "#25d366", icon: "chat"     },
        { name: "Keep",        url: "https://keep.google.com",           key: "k", color: "#fbbc04", icon: "note"     },
        { name: "LinkedIn",    url: "https://linkedin.com/in/senthilkumaran75", key: "l", color: "#0a66c2", icon: "user" },
        { name: "Calendar",    url: "https://calendar.google.com",                 color: "#1a73e8", icon: "calendar" },
        { name: "Drive",       url: "https://drive.google.com",                    color: "#00ac47", icon: "folder"   },
      ],
    },
    {
      title: "Study",
      links: [
        { name: "Typing",      url: "https://monkeytype.com",            key: "t", color: "#e2b714", icon: "keyboard" },
        { name: "YouTube",     url: "https://youtube.com",               key: "y", color: "#ff0033", icon: "play"     },
        { name: "LeetCode",    url: "https://leetcode.com",                        color: "#ffa116", icon: "code"     },
        { name: "Kaggle",      url: "https://kaggle.com",                          color: "#20beff", icon: "chart"    },
      ],
    },
  ],

  /* ---- Behaviour ------------------------------------------------------ */
  options: {
    showSeconds:      true,   // ticking seconds on the clock
    use24Hour:        false,  // false = 9:41 PM, true = 21:41
    showWeather:      true,
    showNotes:        true,   // scratchpad + todo panel
    autofocusSearch:  true,   // cursor in the search box on load
    openLinksInNewTab: false, // true = every tile opens a new tab
  },

  /* ---- Theme ----------------------------------------------------------
     Any valid CSS colour. Restart-safe, no build step.                   */
  theme: {
    bg:       "#0b0714",   // page background
    accent:   "#a78bfa",   // primary purple
    accent2:  "#6366f1",   // secondary indigo
    text:     "#ece9f5",
    muted:    "#8b85a3",
    stars:    true,        // subtle CSS starfield
    aurora:   true,        // soft gradient glow behind the greeting
  },
};
