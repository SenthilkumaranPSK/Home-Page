/* ==========================================================================
   SK HOME — app
   No framework, no build step, no network on first paint.
   Edit config.js, not this file.
   ========================================================================== */
(function () {
  "use strict";

  var C   = (typeof CONFIG !== "undefined" && CONFIG) || {};
  var OPT = C.options || {};
  var $   = function (id) { return document.getElementById(id); };

  /* ---- storage (never throws, even in private mode) ------------------ */
  var store = {
    get: function (k, fallback) {
      try {
        var v = localStorage.getItem("skhome." + k);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { localStorage.setItem("skhome." + k, JSON.stringify(v)); } catch (e) {}
    }
  };

  /* ====================================================================
     THEME  — applied first so nothing repaints
     ==================================================================== */
  (function applyTheme() {
    var t = C.theme || {};
    var root = document.documentElement;
    var map = { bg: "--bg", accent: "--accent", accent2: "--accent2",
                text: "--text", muted: "--muted" };
    for (var k in map) if (t[k]) root.style.setProperty(map[k], t[k]);
    if (t.stars  === false) root.dataset.stars  = "off";
    if (t.aurora === false) root.dataset.aurora = "off";
    if (t.bg) {
      var m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute("content", t.bg);
    }
  })();

  /* ====================================================================
     ICONS — generic glyphs, drawn inline. No requests, no brand logos.
     ==================================================================== */
  var P = { fill: "none", stroke: "currentColor", w: 1.9 };
  var ICONS = {
    spark:    'M12 3l1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6z',
    chat:     'M20 12a7 7 0 0 1-7 7H8l-4 3v-4.6A7 7 0 0 1 4 12a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7z',
    mail:     'M3 6.5h18v11H3zM3 7l9 6.5L21 7',
    code:     'M9 17l-5-5 5-5M15 7l5 5-5 5',
    play:     'M7 4.5l12 7.5-12 7.5z',
    note:     'M6 3.5h12v17l-6-3.5-6 3.5zM9 8h6',
    user:     'M4.5 20a7.5 7.5 0 0 1 15 0M12 11a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2z',
    bolt:     'M13.5 3L5 13.5h5.5L10 21l8.5-10.5H13z',
    book:     'M4 5a2.5 2.5 0 0 1 2.5-2.5H19V19H6.5A2.5 2.5 0 0 0 4 21.5zM19 19v2.5H6.5',
    keyboard: 'M3 6.5h18v11H3zM7 10h.01M11 10h.01M15 10h.01M8 14h8',
    terminal: 'M5 4.5h14v15H5zM8 10l2.5 2L8 14M13 15h4',
    globe:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 9.5h17M3.5 14.5h17M12 3a15 15 0 0 1 0 18A15 15 0 0 1 12 3z',
    cloud:    'M7 19a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.4 10 3.75 3.75 0 0 1 17 19z',
    folder:   'M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h8A1.5 1.5 0 0 1 20.5 9v8.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z',
    calendar: 'M4 6.5h16v14H4zM4 11h16M8.5 3.5v4M15.5 3.5v4',
    search:   'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    chart:    'M4 20V4M4 20h16M8 17v-5M12.5 17V8M17 17v-7'
  };

  function icon(name) {
    var d = ICONS[name];
    if (!d) return null;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", P.fill);
    svg.setAttribute("stroke", P.stroke);
    svg.setAttribute("stroke-width", P.w);
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    if (name === "play") { path.setAttribute("fill", "currentColor"); path.setAttribute("stroke", "none"); }
    svg.appendChild(path);
    return svg;
  }

  function markFor(link) {
    var el = document.createElement("span");
    el.className = "tile-mark";
    var g = link.icon && icon(link.icon);
    if (g) el.appendChild(g);
    else el.textContent = (link.name || "?").trim().charAt(0).toUpperCase();
    return el;
  }

  /* ====================================================================
     GREETING + CLOCK
     ==================================================================== */
  function greetingFor(h) {
    var bands = C.greetings || [];
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i];
      var hit = b.from <= b.to ? (h >= b.from && h <= b.to)
                               : (h >= b.from || h <= b.to);   // wraps midnight
      if (hit) return b.text;
    }
    return "Hello";
  }

  var greetingEl = $("greeting"), clockEl = $("clock"), dateEl = $("datestr");
  var lastGreeting = "";

  function tick() {
    var now = new Date();
    var h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();

    var g = greetingFor(h) + ", " + (C.name || "there");
    if (g !== lastGreeting) { greetingEl.textContent = g; lastGreeting = g; }

    var hh, ampm = "";
    if (OPT.use24Hour) {
      hh = String(h).padStart(2, "0");
    } else {
      hh = String(h % 12 === 0 ? 12 : h % 12);
      ampm = h < 12 ? "AM" : "PM";
    }

    var html = hh + ":" + String(m).padStart(2, "0");
    if (OPT.showSeconds !== false) html += '<span class="sec">:' + String(s).padStart(2, "0") + "</span>";
    if (ampm) html += '<span class="ampm">' + ampm + "</span>";
    clockEl.innerHTML = html;

    dateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: "long", day: "numeric", month: "long"
    });
  }

  tick();
  setInterval(tick, OPT.showSeconds === false ? 15000 : 1000);

  var lines = C.sublines || [];
  if (lines.length) $("subline").textContent = lines[Math.floor(Math.random() * lines.length)];

  /* ====================================================================
     LINK TILES
     ==================================================================== */
  var ALL = [];
  (C.groups || []).forEach(function (g) {
    (g.links || []).forEach(function (l) { ALL.push({ link: l, group: g.title }); });
  });

  (function renderTiles() {
    var frag = document.createDocumentFragment();
    var n = 0;

    (C.groups || []).forEach(function (group) {
      var sec = document.createElement("div");

      var h = document.createElement("h2");
      h.className = "group-title";
      h.textContent = group.title;
      sec.appendChild(h);

      var grid = document.createElement("div");
      grid.className = "tiles";

      (group.links || []).forEach(function (link) {
        n++;
        var a = document.createElement("a");
        a.className = "tile";
        a.href = link.url;
        a.style.setProperty("--tile", link.color || "var(--accent)");
        if (OPT.openLinksInNewTab) { a.target = "_blank"; a.rel = "noopener"; }

        a.appendChild(markFor(link));

        var name = document.createElement("span");
        name.className = "tile-name";
        name.textContent = link.name;
        a.appendChild(name);

        var badge = n <= 9 ? String(n) : (link.key || "");
        if (badge) {
          var k = document.createElement("span");
          k.className = "tile-key";
          k.textContent = badge;
          a.appendChild(k);
        }
        grid.appendChild(a);
      });

      sec.appendChild(grid);
      frag.appendChild(sec);
    });

    $("groups").appendChild(frag);
  })();

  function go(url) {
    if (OPT.openLinksInNewTab) window.open(url, "_blank", "noopener");
    else window.location.href = url;
  }

  /* ====================================================================
     SEARCH
     ==================================================================== */
  var ENGINES = C.engines && C.engines.length
    ? C.engines
    : [{ key: "g", name: "Google", url: "https://www.google.com/search?q=%s", color: "#4285f4" }];

  var engineIdx = 0;
  (function restoreEngine() {
    var saved = store.get("engine", null);
    for (var i = 0; i < ENGINES.length; i++) if (ENGINES[i].key === saved) engineIdx = i;
  })();

  var input = $("search-input"), pill = $("engine-pill"), hint = $("search-hint");

  function paintPill() {
    var e = ENGINES[engineIdx];
    pill.textContent = e.name;
    pill.style.setProperty("--engine-color", e.color || "var(--accent)");
  }

  function cycleEngine(step) {
    engineIdx = (engineIdx + (step || 1) + ENGINES.length) % ENGINES.length;
    store.set("engine", ENGINES[engineIdx].key);
    paintPill();
    updateHint();
  }

  paintPill();

  /* No Tab key on a phone — don't advertise one, and don't autofocus
     into a keyboard the moment the page opens. */
  var narrow = window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
  if (narrow) input.placeholder = "Search the web…";

  /* Looks like somewhere to go rather than something to look up. */
  function asUrl(q) {
    q = q.trim();
    if (!q || /\s/.test(q)) return null;
    if (/^https?:\/\//i.test(q)) return q;
    if (/^localhost(:\d+)?(\/.*)?$/i.test(q)) return "http://" + q;
    if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(q)) return "https://" + q;
    return null;
  }

  /* Returns {engine, query} honouring a typed prefix like "p react hooks". */
  function parse(raw) {
    var sp = raw.indexOf(" ");
    if (sp > 0) {
      var head = raw.slice(0, sp).toLowerCase();
      for (var i = 0; i < ENGINES.length; i++) {
        if (ENGINES[i].key === head) {
          return { engine: ENGINES[i], query: raw.slice(sp + 1).trim(), prefixed: true };
        }
      }
    }
    return { engine: ENGINES[engineIdx], query: raw.trim(), prefixed: false };
  }

  function updateHint() {
    var raw = input.value;
    if (!raw.trim()) { hint.textContent = ""; return; }
    var url = asUrl(raw);
    if (url) { hint.textContent = "↵  Go to " + url.replace(/^https?:\/\//, ""); return; }
    var p = parse(raw);
    hint.textContent = p.prefixed
      ? "↵  Search " + p.engine.name
      : "↵  " + p.engine.name + "  ·  Tab to switch";
  }

  input.addEventListener("input", updateHint);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); cycleEngine(1); }
    else if (e.key === "Tab" && e.shiftKey) { e.preventDefault(); cycleEngine(-1); }
    else if (e.key === "Escape") { input.value = ""; updateHint(); input.blur(); }
  });

  $("search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var raw = input.value.trim();
    if (!raw) return;
    var url = asUrl(raw);
    if (url) { go(url); return; }
    var p = parse(raw);
    if (!p.query) return;
    go(p.engine.url.replace("%s", encodeURIComponent(p.query)));
  });

  pill.addEventListener("click", function () { cycleEngine(1); input.focus(); });

  if (OPT.autofocusSearch !== false && !narrow) input.focus();

  /* ====================================================================
     COMMAND PALETTE
     ==================================================================== */
  var pwrap = $("palette-wrap"), pinput = $("palette-input"), plist = $("palette-list");
  var pitems = [], psel = 0;

  function commands() {
    var out = ALL.map(function (x) {
      return { label: x.link.name, meta: x.group, color: x.link.color,
               icon: x.link.icon, run: function () { go(x.link.url); } };
    });
    ENGINES.forEach(function (e, i) {
      out.push({ label: "Search with " + e.name, meta: "engine", color: e.color, icon: "search",
                 run: function () { engineIdx = i; store.set("engine", e.key); paintPill(); updateHint(); input.focus(); } });
    });
    out.push({ label: "Toggle notes panel", meta: "view", icon: "note",
               run: function () { var p = $("panels"); p.hidden = !p.hidden; store.set("panelsHidden", p.hidden); } });
    return out;
  }

  /* Subsequence match — "gth" finds "GitHub". Earlier hits score higher. */
  function score(text, q) {
    if (!q) return 1;
    text = text.toLowerCase(); q = q.toLowerCase();
    var at = text.indexOf(q);
    if (at === 0) return 1000;
    if (at > 0)   return 500 - at;
    var ti = 0, s = 0;
    for (var qi = 0; qi < q.length; qi++) {
      var f = text.indexOf(q[qi], ti);
      if (f === -1) return 0;
      s += 20 - Math.min(19, f - ti);
      ti = f + 1;
    }
    return s;
  }

  function renderPalette() {
    var q = pinput.value.trim();
    pitems = commands()
      .map(function (c) { return { c: c, s: score(c.label + " " + (c.meta || ""), q) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 40)
      .map(function (r) { return r.c; });

    psel = 0;
    plist.textContent = "";

    if (!pitems.length) {
      var empty = document.createElement("li");
      empty.className = "palette-empty";
      empty.textContent = "Nothing matches “" + q + "”";
      plist.appendChild(empty);
      return;
    }

    pitems.forEach(function (c, i) {
      var li = document.createElement("li");
      li.className = "palette-item";
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === 0 ? "true" : "false");
      li.style.setProperty("--tile", c.color || "var(--accent)");

      var mark = document.createElement("span");
      mark.className = "palette-mark";
      var g = c.icon && icon(c.icon);
      if (g) mark.appendChild(g);
      else mark.textContent = c.label.charAt(0).toUpperCase();
      li.appendChild(mark);

      var label = document.createElement("span");
      label.textContent = c.label;
      li.appendChild(label);

      if (c.meta) {
        var meta = document.createElement("span");
        meta.className = "palette-group";
        meta.textContent = c.meta;
        li.appendChild(meta);
      }

      li.addEventListener("mouseenter", function () { select(i); });
      li.addEventListener("click", function () { closePalette(); c.run(); });
      plist.appendChild(li);
    });
  }

  function select(i) {
    var nodes = plist.querySelectorAll(".palette-item");
    if (!nodes.length) return;
    psel = (i + nodes.length) % nodes.length;
    for (var n = 0; n < nodes.length; n++) {
      nodes[n].setAttribute("aria-selected", n === psel ? "true" : "false");
    }
    nodes[psel].scrollIntoView({ block: "nearest" });
  }

  function openPalette() {
    pwrap.hidden = false;
    pinput.value = "";
    renderPalette();
    pinput.focus();
  }

  function closePalette() {
    pwrap.hidden = true;
    if (OPT.autofocusSearch !== false) input.focus();
  }

  pinput.addEventListener("input", renderPalette);

  pinput.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown")      { e.preventDefault(); select(psel + 1); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); select(psel - 1); }
    else if (e.key === "Enter")     { e.preventDefault(); if (pitems[psel]) { var c = pitems[psel]; closePalette(); c.run(); } }
    else if (e.key === "Escape")    { e.preventDefault(); closePalette(); }
  });

  $("palette-backdrop").addEventListener("click", closePalette);

  /* ====================================================================
     GLOBAL KEYBOARD
     ==================================================================== */
  function typing(el) {
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      pwrap.hidden ? openPalette() : closePalette();
      return;
    }
    if (e.key === "Escape" && !pwrap.hidden) { closePalette(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey || !pwrap.hidden) return;
    if (typing(document.activeElement)) return;

    if (e.key === "/") { e.preventDefault(); input.focus(); input.select(); return; }

    if (e.key >= "1" && e.key <= "9") {
      var hit = ALL[Number(e.key) - 1];
      if (hit) { e.preventDefault(); go(hit.link.url); }
      return;
    }

    if (/^[a-z]$/i.test(e.key)) {
      var k = e.key.toLowerCase();
      for (var i = 0; i < ALL.length; i++) {
        if ((ALL[i].link.key || "").toLowerCase() === k) {
          e.preventDefault();
          go(ALL[i].link.url);
          return;
        }
      }
    }
  });

  /* Hold Alt to reveal every shortcut badge at once. */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Alt") document.body.classList.add("keys-visible");
  });
  document.addEventListener("keyup", function (e) {
    if (e.key === "Alt") document.body.classList.remove("keys-visible");
  });
  window.addEventListener("blur", function () { document.body.classList.remove("keys-visible"); });

  (function footKeys() {
    var withKeys = ALL.filter(function (x) { return x.link.key; }).slice(0, 4);
    if (withKeys.length) {
      $("foot-keys").textContent =
        withKeys.map(function (x) { return x.link.key + " " + x.link.name; }).join("  ·  ");
    }
  })();

  /* ====================================================================
     NOTES + TODO
     ==================================================================== */
  if (OPT.showNotes !== false) {
    var panels = $("panels");
    panels.hidden = !!store.get("panelsHidden", false);

    /* notes */
    var notes = $("notes"), notesStatus = $("notes-status"), saveTimer;
    notes.value = store.get("notes", "") || "";

    notes.addEventListener("input", function () {
      clearTimeout(saveTimer);
      notesStatus.textContent = "saving…";
      saveTimer = setTimeout(function () {
        store.set("notes", notes.value);
        notesStatus.textContent = "saved";
        setTimeout(function () { notesStatus.textContent = ""; }, 1400);
      }, 400);
    });

    /* todo */
    var todos = store.get("todos", []) || [];
    var list = $("todo-list"), count = $("todo-count");

    function saveTodos() { store.set("todos", todos); }

    function renderTodos() {
      list.textContent = "";
      var open = todos.filter(function (t) { return !t.done; }).length;
      count.textContent = todos.length ? open + " open" : "";

      if (!todos.length) {
        var li = document.createElement("li");
        li.className = "todo-empty";
        li.textContent = "Nothing yet. Add one above.";
        list.appendChild(li);
        return;
      }

      todos.forEach(function (t, i) {
        var li = document.createElement("li");
        li.className = "todo-item" + (t.done ? " done" : "");

        var box = document.createElement("button");
        box.className = "todo-box";
        box.type = "button";
        box.setAttribute("aria-label", t.done ? "Mark not done" : "Mark done");
        var check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        check.setAttribute("viewBox", "0 0 12 12");
        var cp = document.createElementNS("http://www.w3.org/2000/svg", "path");
        cp.setAttribute("d", "M2 6.3l2.6 2.6L10 3.5");
        check.appendChild(cp);
        box.appendChild(check);
        box.addEventListener("click", function () {
          todos[i].done = !todos[i].done;
          saveTodos(); renderTodos();
        });
        li.appendChild(box);

        var text = document.createElement("span");
        text.className = "todo-text";
        text.textContent = t.text;
        li.appendChild(text);

        var del = document.createElement("button");
        del.className = "todo-del";
        del.type = "button";
        del.textContent = "×";
        del.setAttribute("aria-label", "Delete task");
        del.addEventListener("click", function () {
          todos.splice(i, 1); saveTodos(); renderTodos();
        });
        li.appendChild(del);

        list.appendChild(li);
      });
    }

    $("todo-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("todo-input").value.trim();
      if (!v) return;
      todos.push({ text: v, done: false });
      $("todo-input").value = "";
      saveTodos(); renderTodos();
    });

    renderTodos();
  }

  /* ====================================================================
     WEATHER — deferred until after first paint. Never blocks.
     Open-Meteo: free, no API key, no account, no location prompt.
     ==================================================================== */
  if (OPT.showWeather !== false && C.location) {
    var WCODE = {
      0:  ["Clear",      "sun"],    1:  ["Mostly clear", "sun"],
      2:  ["Partly cloudy", "cloud"], 3: ["Overcast",  "cloud"],
      45: ["Fog",        "cloud"],  48: ["Rime fog",   "cloud"],
      51: ["Drizzle",    "rain"],   53: ["Drizzle",    "rain"],  55: ["Drizzle", "rain"],
      61: ["Light rain", "rain"],   63: ["Rain",       "rain"],  65: ["Heavy rain", "rain"],
      66: ["Freezing rain", "rain"],67: ["Freezing rain", "rain"],
      71: ["Snow",       "snow"],   73: ["Snow",       "snow"],  75: ["Heavy snow", "snow"],
      77: ["Snow grains","snow"],
      80: ["Showers",    "rain"],   81: ["Showers",    "rain"],  82: ["Heavy showers", "rain"],
      85: ["Snow showers","snow"],  86: ["Snow showers","snow"],
      95: ["Thunderstorm","storm"], 96: ["Thunderstorm","storm"], 99: ["Thunderstorm","storm"]
    };

    var WICON = {
      sun:   'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
      cloud: 'M7 19a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.4 10 3.75 3.75 0 0 1 17 19z',
      rain:  'M7 16a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.4 7 3.75 3.75 0 0 1 17 16M8.5 19l-1 2.5M12 19l-1 2.5M15.5 19l-1 2.5',
      snow:  'M7 16a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.4 7 3.75 3.75 0 0 1 17 16M9 19.5h.01M12 21h.01M15 19.5h.01',
      storm: 'M7 16a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.4 7 3.75 3.75 0 0 1 17 16M12.5 14l-2.5 4h3l-2 3.5'
    };

    var paintWeather = function (d) {
      var meta  = WCODE[d.code] || ["", "cloud"];
      var box   = $("weather");
      var glyph = $("weather-icon");

      glyph.textContent = "";
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "1.8");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      var pth = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pth.setAttribute("d", WICON[meta[1]]);
      svg.appendChild(pth);
      glyph.appendChild(svg);

      var unit = (C.location.units === "fahrenheit") ? "°F" : "°C";
      $("weather-temp").textContent = Math.round(d.temp) + unit;
      $("weather-meta").textContent =
        meta[0] + "  ·  " + Math.round(d.min) + "–" + Math.round(d.max) + "°  ·  " + (C.location.label || "");
      box.hidden = false;
    };

    var loadWeather = function () {
      var cached = store.get("weather", null);
      if (cached && Date.now() - cached.at < 30 * 60 * 1000) { paintWeather(cached); return; }

      var loc = C.location;
      var url = "https://api.open-meteo.com/v1/forecast"
        + "?latitude="  + encodeURIComponent(loc.lat)
        + "&longitude=" + encodeURIComponent(loc.lon)
        + "&current=temperature_2m,weather_code"
        + "&daily=temperature_2m_max,temperature_2m_min"
        + "&forecast_days=1&timezone=auto"
        + (loc.units === "fahrenheit" ? "&temperature_unit=fahrenheit" : "");

      fetch(url)
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (j) {
          var d = {
            temp: j.current.temperature_2m,
            code: j.current.weather_code,
            max:  j.daily.temperature_2m_max[0],
            min:  j.daily.temperature_2m_min[0],
            at:   Date.now()
          };
          store.set("weather", d);
          paintWeather(d);
        })
        .catch(function () {
          /* Offline or blocked — show the last known reading if we have one. */
          if (cached) paintWeather(cached);
        });
    };

    /* Strictly after first paint, so nothing on screen waits for the network. */
    if (window.requestIdleCallback) requestIdleCallback(loadWeather, { timeout: 2000 });
    else setTimeout(loadWeather, 300);
  }

  /* ====================================================================
     SERVICE WORKER — web only. Extension pages don't need or allow it.
     ==================================================================== */
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
