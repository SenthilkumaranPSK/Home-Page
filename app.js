/* ==========================================================================
   SK HOME — app
   Edit config.js, not this file.
   ========================================================================== */
(function () {
  "use strict";

  var C    = (typeof CONFIG !== "undefined" && CONFIG) || {};
  var OPT  = C.options || {};
  var $    = function (id) { return document.getElementById(id); };
  var body = document.body;

  var REDUCED = window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NARROW  = window.matchMedia &&
                window.matchMedia("(max-width: 760px)").matches;

  if (REDUCED || OPT.entranceAnimation === false) body.classList.add("no-anim");

  /* ---- storage (never throws) ---------------------------------------- */
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem("skhome." + k);
            return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem("skhome." + k, JSON.stringify(v)); } catch (e) {}
    },
    del: function (k) { try { localStorage.removeItem("skhome." + k); } catch (e) {} }
  };

  /* ---- toast --------------------------------------------------------- */
  var toastEl = $("toast"), toastTimer;
  function toast(msg) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.remove("out");
    toastTimer = setTimeout(function () {
      toastEl.classList.add("out");
      setTimeout(function () { toastEl.hidden = true; }, 320);
    }, 2200);
  }

  /* ====================================================================
     ICONS — generic glyphs drawn inline. No requests, no brand logos.
     ==================================================================== */
  var ICONS = {
    spark:    "M12 3l1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6z",
    chat:     "M20 12a7 7 0 0 1-7 7H8l-4 3v-4.6A7 7 0 0 1 4 12a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7z",
    mail:     "M3 6.5h18v11H3zM3 7l9 6.5L21 7",
    code:     "M9 17l-5-5 5-5M15 7l5 5-5 5",
    play:     "M7 4.5l12 7.5-12 7.5z",
    note:     "M6 3.5h12v17l-6-3.5-6 3.5zM9 8h6",
    user:     "M4.5 20a7.5 7.5 0 0 1 15 0M12 11a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2z",
    bolt:     "M13.5 3L5 13.5h5.5L10 21l8.5-10.5H13z",
    book:     "M4 5a2.5 2.5 0 0 1 2.5-2.5H19V19H6.5A2.5 2.5 0 0 0 4 21.5zM19 19v2.5H6.5",
    keyboard: "M3 6.5h18v11H3zM7 10h.01M11 10h.01M15 10h.01M8 14h8",
    terminal: "M5 4.5h14v15H5zM8 10l2.5 2L8 14M13 15h4",
    globe:    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 9.5h17M3.5 14.5h17M12 3a15 15 0 0 1 0 18A15 15 0 0 1 12 3z",
    cloud:    "M7 19a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.4 10 3.75 3.75 0 0 1 17 19z",
    folder:   "M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h8A1.5 1.5 0 0 1 20.5 9v8.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z",
    calendar: "M4 6.5h16v14H4zM4 11h16M8.5 3.5v4M15.5 3.5v4",
    search:   "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
    chart:    "M4 20V4M4 20h16M8 17v-5M12.5 17V8M17 17v-7",
    timer:    "M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M9 2.5h6",
    sun:      "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
    rain:     "M7 16a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.4 7 3.75 3.75 0 0 1 17 16M8.5 19l-1 2.5M12 19l-1 2.5M15.5 19l-1 2.5",
    snow:     "M7 16a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.4 7 3.75 3.75 0 0 1 17 16M9 19.5h.01M12 21h.01M15 19.5h.01",
    storm:    "M7 16a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.4 7 3.75 3.75 0 0 1 17 16M12.5 14l-2.5 4h3l-2 3.5"
  };

  var NS = "http://www.w3.org/2000/svg";

  function svgEl(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function icon(name, stroke) {
    var d = ICONS[name];
    if (!d) return null;
    var s = svgEl("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
      "stroke-width": stroke || 1.9, "stroke-linecap": "round", "stroke-linejoin": "round" });
    var p = svgEl("path", { d: d });
    if (name === "play") { p.setAttribute("fill", "currentColor"); p.setAttribute("stroke", "none"); }
    s.appendChild(p);
    return s;
  }

  /* ====================================================================
     COSMOS — start the sky, and keep the UI palette in step with it
     ==================================================================== */
  var sky = null;

  function syncPalette(hour) {
    if (!sky) return null;
    var p = sky.setHour(hour);
    var root = document.documentElement.style;
    root.setProperty("--bg",     "rgb(" + p.bg.join(",")  + ")");
    root.setProperty("--accent", "rgb(" + p.acc.join(",") + ")");
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", "rgb(" + p.bg.join(",") + ")");
    return p;
  }

  if (window.Cosmos && OPT.animateBackground !== false) {
    sky = window.Cosmos.init($("sky"), { maxStars: OPT.maxStars });
  } else if (window.Cosmos) {
    // Palette still applies even with the animation switched off.
    var flat = window.Cosmos.paletteAt(new Date().getHours());
    document.documentElement.style.setProperty("--bg", "rgb(" + flat.bg.join(",") + ")");
    document.documentElement.style.setProperty("--accent", "rgb(" + flat.acc.join(",") + ")");
  }

  var palNow = syncPalette(new Date().getHours() + new Date().getMinutes() / 60)
            || { acc: [167, 139, 250] };

  /* ====================================================================
     GREETING + STREAK + PERSONALITY
     ==================================================================== */
  function bandFor(h) {
    var bands = C.greetings || [];
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i];
      var hit = b.from <= b.to ? (h >= b.from && h <= b.to)
                               : (h >= b.from || h <= b.to);
      if (hit) return b.text;
    }
    return "Hello";
  }

  function greetingText(now) {
    var h = now.getHours(), day = now.getDay();
    var sp = C.specialGreetings || [];
    for (var i = 0; i < sp.length; i++) {
      var s = sp[i];
      if (s.day !== day) continue;
      var hit = s.from <= s.to ? (h >= s.from && h <= s.to)
                               : (h >= s.from || h <= s.to);
      if (hit) return s.text;
    }
    return bandFor(h);
  }

  /* Open streak — how many days in a row this page has been opened. */
  function bumpStreak() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var key = today.getTime();
    var s = store.get("streak", null);

    if (!s) s = { last: key, count: 1, best: 1 };
    else if (s.last !== key) {
      var gap = Math.round((key - s.last) / 86400000);
      s.count = gap === 1 ? s.count + 1 : 1;
      s.last = key;
      s.best = Math.max(s.best || 0, s.count);
    }
    store.set("streak", s);
    return s;
  }

  var streak = bumpStreak();

  var greetEl = $("greeting"), lastGreet = "";

  /* Colour each letter along a gradient from text to the live accent. */
  function letterColor(i, n) {
    var from = [236, 233, 245], to = palNow.acc;
    var t = n <= 1 ? 1 : i / (n - 1);
    return "rgb(" + Math.round(from[0] + (to[0] - from[0]) * t) + ","
                  + Math.round(from[1] + (to[1] - from[1]) * t) + ","
                  + Math.round(from[2] + (to[2] - from[2]) * t) + ")";
  }

  function paintGreeting(text) {
    if (text === lastGreet) return;
    lastGreet = text;
    greetEl.textContent = "";
    var chars = text.split("");
    chars.forEach(function (ch, i) {
      var s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--i", i);
      s.style.background = "none";
      s.style.color = letterColor(i, chars.length);
      s.textContent = ch;
      greetEl.appendChild(s);
    });
    greetEl.setAttribute("aria-label", text);
  }

  function recolorGreeting() {
    var chars = greetEl.querySelectorAll(".ch");
    for (var i = 0; i < chars.length; i++) {
      chars[i].style.color = letterColor(i, chars.length);
    }
  }

  paintGreeting(greetingText(new Date()) + ", " + (C.name || "there"));

  if (streak.count > 1) {
    var st = $("streak");
    st.innerHTML = "";
    var f = icon("bolt", 2);
    if (f) { f.style.width = "13px"; f.style.height = "13px"; f.style.color = "var(--accent)"; st.appendChild(f); }
    var span = document.createElement("span");
    span.innerHTML = "<b>" + streak.count + "-day</b> streak" +
      (streak.best > streak.count ? " · best " + streak.best : "");
    st.appendChild(span);
    st.hidden = false;
  }

  /* ====================================================================
     CLOCK — per-digit, so only the digit that changed animates
     ==================================================================== */
  var clockEl = $("clock"), dateEl = $("datestr");
  var clockCells = [];

  function clockString(now) {
    var h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    var hh, ampm = "";
    if (OPT.use24Hour) hh = String(h).padStart(2, "0");
    else { hh = String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0"); ampm = h < 12 ? "AM" : "PM"; }
    var out = hh + ":" + String(m).padStart(2, "0");
    if (OPT.showSeconds !== false) out += ":" + String(s).padStart(2, "0");
    return { text: out, ampm: ampm };
  }

  function buildClock(str, ampm) {
    clockEl.textContent = "";
    clockCells = [];
    for (var i = 0; i < str.length; i++) {
      var sp = document.createElement("span");
      if (str[i] === ":") { sp.className = "colon"; sp.textContent = ":"; }
      else { sp.className = "d"; sp.textContent = str[i]; }
      if (i >= 6) sp.classList.add("sec");
      clockEl.appendChild(sp);
      clockCells.push(sp);
    }
    if (ampm) {
      var a = document.createElement("span");
      a.className = "ampm";
      a.textContent = ampm;
      clockEl.appendChild(a);
      clockCells.push(a);
    }
  }

  var lastHourSynced = -1;

  function tick() {
    var now = new Date();
    var cs = clockString(now);

    if (clockCells.length !== cs.text.length + (cs.ampm ? 1 : 0)) {
      buildClock(cs.text, cs.ampm);
    } else {
      for (var i = 0; i < cs.text.length; i++) {
        var cell = clockCells[i];
        if (cell.textContent === cs.text[i]) continue;
        cell.textContent = cs.text[i];
        if (!REDUCED) {
          cell.classList.remove("flip");
          void cell.offsetWidth;          // restart the animation
          cell.classList.add("flip");
        }
      }
      var amCell = clockCells[cs.text.length];
      if (amCell && cs.ampm && amCell.textContent !== cs.ampm) amCell.textContent = cs.ampm;
    }

    dateEl.textContent = now.toLocaleDateString(undefined,
      { weekday: "long", day: "numeric", month: "long" });

    paintGreeting(greetingText(now) + ", " + (C.name || "there"));

    // Re-blend the sky once a minute.
    var frac = now.getHours() + now.getMinutes() / 60;
    if (Math.floor(frac * 60) !== lastHourSynced) {
      lastHourSynced = Math.floor(frac * 60);
      var p = syncPalette(frac);
      if (p) { palNow = p; recolorGreeting(); }
    }
  }

  tick();
  setInterval(tick, OPT.showSeconds === false ? 5000 : 1000);

  /* ====================================================================
     TILES — render, tilt, spotlight, drag to reorder
     ==================================================================== */
  var ALL = [];

  function orderedLinks(group) {
    var saved = store.get("order." + group.title, null);
    var links = (group.links || []).slice();
    if (!saved) return links;
    var byName = {};
    links.forEach(function (l) { byName[l.name] = l; });
    var out = [];
    saved.forEach(function (n) { if (byName[n]) { out.push(byName[n]); delete byName[n]; } });
    links.forEach(function (l) { if (byName[l.name]) out.push(l); });  // new links go last
    return out;
  }

  function markFor(link) {
    var el = document.createElement("span");
    el.className = "tile-mark";
    var g = link.icon && icon(link.icon);
    if (g) el.appendChild(g);
    else el.textContent = (link.name || "?").trim().charAt(0).toUpperCase();
    return el;
  }

  function renderTiles() {
    var host = $("groups");
    host.textContent = "";
    ALL = [];
    var n = 0;

    (C.groups || []).forEach(function (group) {
      var sec = document.createElement("div");

      var h = document.createElement("h2");
      h.className = "group-title";
      h.textContent = group.title;
      sec.appendChild(h);

      var grid = document.createElement("div");
      grid.className = "tiles";
      grid.dataset.group = group.title;

      orderedLinks(group).forEach(function (link) {
        n++;
        ALL.push({ link: link, group: group.title });

        var a = document.createElement("a");
        a.className = "tile";
        a.href = link.url;
        a.dataset.name = link.name;
        /* Chromium starts its own native link-drag on mousedown+move, which
           swallows our pointer events. Opt the anchor out of it. */
        a.draggable = false;
        a.addEventListener("dragstart", function (e) { e.preventDefault(); });
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
      host.appendChild(sec);
    });

    wireTiles();
    $("reset-order").hidden = !hasCustomOrder();
  }

  function hasCustomOrder() {
    return (C.groups || []).some(function (g) { return store.get("order." + g.title, null); });
  }

  /* ---- 3D tilt + pointer spotlight ----------------------------------- */
  function wireTiles() {
    var tiles = document.querySelectorAll(".tile");
    var tiltOn = OPT.tiltTiles !== false && !REDUCED && !NARROW;

    Array.prototype.forEach.call(tiles, function (t) {
      var frame = 0;

      t.addEventListener("pointermove", function (e) {
        if (dragState.active) return;
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = 0;
          var r = t.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          t.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          t.style.setProperty("--my", (py * 100).toFixed(1) + "%");
          if (tiltOn) {
            var ry = (px - 0.5) * 13, rx = (0.5 - py) * 11;
            t.style.transform =
              "perspective(620px) rotateX(" + rx.toFixed(2) + "deg) rotateY("
              + ry.toFixed(2) + "deg) translateZ(6px)";
          }
        });
      });

      t.addEventListener("pointerleave", function () {
        if (dragState.active) return;
        t.style.transform = "";
      });

      // A tile opened by keyboard flashes before it navigates.
      t.addEventListener("click", function (e) {
        if (dragState.moved) { e.preventDefault(); dragState.moved = false; }
      });
    });

    wireDrag();
  }

  /* ---- drag to reorder, with FLIP ------------------------------------- */
  var dragState = { active: false, moved: false };

  function flip(grid, mutate) {
    var kids = Array.prototype.slice.call(grid.children);
    var before = kids.map(function (k) { return k.getBoundingClientRect(); });
    mutate();
    kids.forEach(function (k, i) {
      if (k === dragState.el) return;
      var after = k.getBoundingClientRect();
      var dx = before[i].left - after.left, dy = before[i].top - after.top;
      if (!dx && !dy) return;
      k.style.transition = "none";
      k.style.transform = "translate(" + dx + "px," + dy + "px)";
      requestAnimationFrame(function () {
        k.classList.add("shifting");
        k.style.transition = "";
        k.style.transform = "";
        setTimeout(function () { k.classList.remove("shifting"); }, 340);
      });
    });
  }

  function wireDrag() {
    Array.prototype.forEach.call(document.querySelectorAll(".tiles"), function (grid) {
      grid.addEventListener("pointerdown", function (e) {
        var tile = e.target.closest(".tile");
        if (!tile || e.button !== 0) return;

        var startX = e.clientX, startY = e.clientY;
        var origin = null, started = false;

        function move(ev) {
          var dx = ev.clientX - startX, dy = ev.clientY - startY;

          if (!started) {
            if (Math.abs(dx) + Math.abs(dy) < 7) return;
            started = true;
            dragState.active = true;
            dragState.el = tile;
            dragState.moved = true;
            origin = tile.getBoundingClientRect();
            tile.style.transform = "";
            tile.classList.add("dragging");
            body.classList.add("dragging");
            try { tile.setPointerCapture(ev.pointerId); } catch (err) {}
          }

          tile.style.transform = "translate(" + dx + "px," + dy + "px) scale(1.04)";

          // Which sibling is the pointer currently over?
          var over = null;
          Array.prototype.forEach.call(grid.children, function (k) {
            if (k === tile) return;
            var r = k.getBoundingClientRect();
            if (ev.clientX >= r.left && ev.clientX <= r.right &&
                ev.clientY >= r.top  && ev.clientY <= r.bottom) over = k;
          });

          if (over) {
            var kids = Array.prototype.slice.call(grid.children);
            var from = kids.indexOf(tile), to = kids.indexOf(over);
            flip(grid, function () {
              if (from < to) grid.insertBefore(tile, over.nextSibling);
              else           grid.insertBefore(tile, over);
            });
            // keep the dragged tile under the cursor after the DOM move
            var now = tile.getBoundingClientRect();
            startX += now.left - origin.left;
            startY += now.top  - origin.top;
            origin = now;
            tile.style.transform =
              "translate(" + (ev.clientX - startX) + "px," + (ev.clientY - startY) + "px) scale(1.04)";
          }
        }

        function up(ev) {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          window.removeEventListener("pointercancel", up);
          if (!started) return;

          tile.classList.remove("dragging");
          body.classList.remove("dragging");
          tile.style.transition = "transform .34s cubic-bezier(.16,1,.3,1)";
          tile.style.transform = "";
          setTimeout(function () { tile.style.transition = ""; }, 360);

          dragState.active = false;
          // keep .moved true just long enough to swallow the click
          setTimeout(function () { dragState.moved = false; }, 60);

          var order = Array.prototype.map.call(grid.children, function (k) { return k.dataset.name; });
          store.set("order." + grid.dataset.group, order);
          $("reset-order").hidden = false;
          toast("Order saved");
        }

        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        window.addEventListener("pointercancel", up);
      });
    });
  }

  $("reset-order").addEventListener("click", function () {
    (C.groups || []).forEach(function (g) { store.del("order." + g.title); });
    renderTiles();
    toast("Original order restored");
  });

  renderTiles();

  function go(url, el) {
    if (el && !REDUCED) {
      el.classList.add("fired");
      setTimeout(function () { el.classList.remove("fired"); }, 400);
    }
    var open = function () {
      if (OPT.openLinksInNewTab) window.open(url, "_blank", "noopener");
      else window.location.href = url;
    };
    el && !REDUCED ? setTimeout(open, 130) : open();
  }

  /* ====================================================================
     SEARCH
     ==================================================================== */
  var ENGINES = (C.engines && C.engines.length) ? C.engines
    : [{ key: "g", name: "Google", url: "https://www.google.com/search?q=%s", color: "#4285f4" }];

  var engineIdx = 0;
  (function () {
    // The default must be a cyclable engine — if someone marks their first
    // entry `bang: true`, fall through to the first one that isn't.
    for (var i = 0; i < ENGINES.length; i++) {
      if (!ENGINES[i].bang) { engineIdx = i; break; }
    }
    var saved = store.get("engine", null);
    ENGINES.forEach(function (e, i) { if (e.key === saved && !e.bang) engineIdx = i; });
  })();

  var input = $("search-input"), pill = $("engine-pill"), hint = $("search-hint");

  function paintPill(bump) {
    var e = ENGINES[engineIdx];
    pill.textContent = e.name;
    pill.style.setProperty("--engine-color", e.color || "var(--accent)");
    if (bump && !REDUCED) {
      pill.classList.remove("bump"); void pill.offsetWidth; pill.classList.add("bump");
    }
  }

  /* `bang: true` engines are prefix-only — Tab steps over them, so adding a
     dozen bangs to config.js never lengthens the rotation. Bounded by the
     engine count so an all-bang list can't spin forever; it just stops. */
  function cycleEngine(step) {
    var dir = step < 0 ? -1 : 1;
    for (var n = 0; n < ENGINES.length; n++) {
      engineIdx = (engineIdx + dir + ENGINES.length) % ENGINES.length;
      if (!ENGINES[engineIdx].bang) break;
    }
    store.set("engine", ENGINES[engineIdx].key);
    paintPill(true);
    updateHint();
  }

  paintPill(false);
  if (NARROW) input.placeholder = "Search the web…";

  function asUrl(q) {
    q = q.trim();
    if (!q || /\s/.test(q)) return null;
    if (/^https?:\/\//i.test(q)) return q;
    if (/^localhost(:\d+)?(\/.*)?$/i.test(q)) return "http://" + q;
    if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(q)) return "https://" + q;
    return null;
  }

  function parse(raw) {
    var sp = raw.indexOf(" ");
    if (sp > 0) {
      var head = raw.slice(0, sp).toLowerCase();
      for (var i = 0; i < ENGINES.length; i++) {
        if (ENGINES[i].key === head)
          return { engine: ENGINES[i], query: raw.slice(sp + 1).trim(), prefixed: true };
      }
    }
    return { engine: ENGINES[engineIdx], query: raw.trim(), prefixed: false };
  }

  /* ---- quick add — "todo buy milk" / "note idea for project" go straight
     into the Todo/Notes cards below instead of searching. Checked first,
     since neither word can ever be mistaken for a calculator/URL/search. */
  function parseQuickAdd(raw) {
    var m = raw.match(/^(todo|note)\s+(.+)$/i);
    return m ? { kind: m[1].toLowerCase(), text: m[2].trim() } : null;
  }

  /* ---- inline calculator ----------------------------------------------
     Whitespace is REQUIRED around every operator ("10 - 5", not "10-5")
     so a plain search like "2024-2025" or a phone-like "12-34-56" never
     gets swallowed as arithmetic — Enter intercepts navigation entirely
     for a recognized expression, so a false match would eat a real search. */
  var CALC_RE = /^\d+(\.\d+)?(\s+[+\-*/%]\s+\d+(\.\d+)?)+$/;

  function evalCalc(expr) {
    // No parens / unary minus here — CALC_RE never admits them (it can't,
    // without reopening the "2024-2025 looks like subtraction" false-positive
    // problem), so a recursive-descent branch for them would be unreachable.
    var i = 0;
    function skip() { while (expr[i] === " ") i++; }
    function num() {
      skip();
      var start = i;
      while (i < expr.length && /[\d.]/.test(expr[i])) i++;
      return start === i ? null : parseFloat(expr.slice(start, i));
    }
    function term() {
      var v = num();
      if (v == null) return null;
      for (;;) {
        skip();
        var op = expr[i];
        if (op !== "*" && op !== "/" && op !== "%") break;
        i++;
        var rhs = num();
        if (rhs == null) return null;
        if (op === "*") v *= rhs;
        else { if (rhs === 0) return null; v = op === "/" ? v / rhs : v % rhs; }
      }
      return v;
    }
    function expression() {
      var v = term();
      if (v == null) return null;
      for (;;) {
        skip();
        var op = expr[i];
        if (op !== "+" && op !== "-") break;
        i++;
        var rhs = term();
        if (rhs == null) return null;
        v = op === "+" ? v + rhs : v - rhs;
      }
      return v;
    }
    var result = expression();
    skip();
    return (i === expr.length && result != null && isFinite(result)) ? result : null;
  }

  function trimNum(n) { return String(Math.round(n * 1e6) / 1e6); }

  /* ---- inline unit / currency converter --------------------------------
     The regex shape is deliberately loose; the *lookup* against these
     tables is what's strict, so a plain 3-word search like "10 people in
     office" just falls through to a normal search instead of erroring. */
  var UNITS = {
    length: { m: 1, meter: 1, meters: 1, km: 1000, kilometer: 1000, kilometers: 1000,
              cm: .01, centimeter: .01, centimeters: .01, mm: .001, millimeter: .001,
              mi: 1609.344, mile: 1609.344, miles: 1609.344,
              ft: .3048, foot: .3048, feet: .3048, in: .0254, inch: .0254, inches: .0254,
              yd: .9144, yard: .9144, yards: .9144 },
    weight: { kg: 1, kilogram: 1, kilograms: 1, g: .001, gram: .001, grams: .001,
              lb: .453592, lbs: .453592, pound: .453592, pounds: .453592,
              oz: .0283495, ounce: .0283495, ounces: .0283495 },
    volume: { l: 1, liter: 1, liters: 1, litre: 1, litres: 1, ml: .001, milliliter: .001,
              gal: 3.78541, gallon: 3.78541, gallons: 3.78541 }
  };
  var TEMP_UNITS = ["c", "celsius", "f", "fahrenheit", "k", "kelvin"];
  /* Matches exactly what api.frankfurter.dev supports — gating against a real
     list (not just "any two 3-letter words") avoids treating things like
     "5 min to fix" or "2 job to day" as a currency pair, which would
     otherwise get stuck showing "converting…" forever (the lookup fails,
     so nothing ever replaces that hint). */
  var CURRENCIES = ["aud","brl","cad","chf","cny","czk","dkk","eur","gbp","hkd",
    "huf","idr","ils","inr","isk","jpy","krw","mxn","myr","nok","nzd","php",
    "pln","ron","sek","sgd","thb","try","usd","zar"];

  function convertTemp(v, from, to) {
    var c;
    if (from === "c" || from === "celsius") c = v;
    else if (from === "f" || from === "fahrenheit") c = (v - 32) * 5 / 9;
    else if (from === "k" || from === "kelvin") c = v - 273.15;
    else return null;
    if (to === "c" || to === "celsius") return c;
    if (to === "f" || to === "fahrenheit") return c * 9 / 5 + 32;
    if (to === "k" || to === "kelvin") return c + 273.15;
    return null;
  }

  function findUnit(token) {
    for (var cat in UNITS) if (UNITS[cat].hasOwnProperty(token)) return { cat: cat, factor: UNITS[cat][token] };
    return null;
  }

  function parseConvert(raw) {
    var m = raw.match(/^([\d.]+)\s*([a-z]+)\s+(?:to|in)\s+([a-z]+)$/i);
    if (!m) return null;
    var amount = parseFloat(m[1]), from = m[2].toLowerCase(), to = m[3].toLowerCase();
    if (isNaN(amount)) return null;

    if (TEMP_UNITS.indexOf(from) !== -1 && TEMP_UNITS.indexOf(to) !== -1) {
      var t = convertTemp(amount, from, to);
      return t == null ? null : { type: "unit", value: t, unit: to };
    }

    var fu = findUnit(from), tu = findUnit(to);
    if (fu && tu && fu.cat === tu.cat)
      return { type: "unit", value: amount * fu.factor / tu.factor, unit: to };

    if (CURRENCIES.indexOf(from) !== -1 && CURRENCIES.indexOf(to) !== -1)
      return { type: "currency", amount: amount, from: from, to: to };

    return null;
  }

  /* ---- inline time-zone converter ---------------------------------------
     Real IANA zone names via Intl (DST-correct), not a hand-rolled offset
     table — just a small alias map from common abbreviations.             */
  var TZ_ALIAS = {
    ist: "Asia/Kolkata", pst: "America/Los_Angeles", pdt: "America/Los_Angeles",
    est: "America/New_York", edt: "America/New_York",
    cst: "America/Chicago", cdt: "America/Chicago",
    mst: "America/Denver", mdt: "America/Denver",
    gmt: "UTC", utc: "UTC", bst: "Europe/London", cet: "Europe/Paris", jst: "Asia/Tokyo"
  };

  function tzOffsetMinutes(date, zone) {
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    }).formatToParts(date).forEach(function (p) { parts[p.type] = p.value; });
    var asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    return (asUTC - date.getTime()) / 60000;
  }

  function parseTimeConvert(raw) {
    var m = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s+([a-z]{2,4})\s+(?:to|in)\s+([a-z]{2,4})$/i);
    if (!m) return null;
    var fromZone = TZ_ALIAS[m[4].toLowerCase()], toZone = TZ_ALIAS[m[5].toLowerCase()];
    if (!fromZone || !toZone) return null;

    var hh = parseInt(m[1], 10), mm = m[2] ? parseInt(m[2], 10) : 0, ap = m[3];
    if (hh > 23 || mm > 59) return null;
    if (ap) { ap = ap.toLowerCase(); if (ap === "pm" && hh < 12) hh += 12; if (ap === "am" && hh === 12) hh = 0; }

    var now = new Date();
    var localAsUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh, mm);
    // Two-pass: fromZone's offset can differ between "now" and the target
    // time if a DST transition falls in between (rare, but the target date
    // could be in a different DST period than today) — refine once using
    // a first approximation of the target instant instead of "now".
    var approxUTC = new Date(localAsUTC - tzOffsetMinutes(now, fromZone) * 60000);
    var offFrom = tzOffsetMinutes(approxUTC, fromZone);
    var actualUTC = new Date(localAsUTC - offFrom * 60000);

    var out = new Intl.DateTimeFormat("en-US", { timeZone: toZone, hour: "numeric", minute: "2-digit" }).format(actualUTC);
    return { type: "time", value: out };
  }

  /* ---- developer conversions -------------------------------------------
     Colour, epoch, base64 and byte sizes. Every pattern here is anchored on
     a literal marker — a leading "#", an "rgb(", or a "ts "/"b64 " keyword —
     except the byte sizes, which need a unit the UNITS tables above don't
     define. That's what keeps this branch from stealing plain searches, and
     it's why it runs LAST, after the unit/currency/time converters have had
     their turn: anything reaching here already failed every other parse. */
  var BYTE_UNITS = {
    b: 1, byte: 1, bytes: 1,
    /* kb/mb/gb are 1024-based here, not the SI 1000. Every place a developer
       actually meets these numbers — file managers, `ls -lh`, disk usage —
       uses 1024, so "1048576 b to mb" reading 1 is the useful answer. The
       explicit kib/mib/gib spellings are accepted as aliases, not as a
       second, differing scale. */
    kb: 1024, kib: 1024,
    mb: 1048576, mib: 1048576,
    gb: 1073741824, gib: 1073741824,
    tb: 1099511627776, tib: 1099511627776
  };

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var l = (max + min) / 2, h = 0, s = 0;
    if (max !== min) {
      var d = max - min;
      s = l > .5 ? d / (2 - max - min) : d / (max + min);
      if (max === r)      h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else                h = (r - g) / d + 4;
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  function hexToRgb(hex) {
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }

  function toHex(n) { return ("0" + n.toString(16)).slice(-2); }

  /* btoa/atob are Latin-1 only — they throw on "café" and on any emoji.
     Round-tripping through UTF-8 bytes first makes both directions total. */
  function b64Encode(str) {
    var bytes = new TextEncoder().encode(str), bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function b64Decode(str) {
    var bin = atob(str), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function parseDevCalc(raw) {
    var s = raw.trim(), m;

    /* #3b82f6 to rgb | to hsl | to hex */
    m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})\s+(?:to|in)\s+(rgb|hsl|hex)$/i);
    if (m) {
      var c = hexToRgb(m[1].toLowerCase()), want = m[2].toLowerCase();
      if (want === "rgb") return { value: "rgb(" + c.join(", ") + ")" };
      if (want === "hex") return { value: "#" + c.map(toHex).join("") };
      var hsl = rgbToHsl(c[0], c[1], c[2]);
      return { value: "hsl(" + hsl[0] + ", " + hsl[1] + "%, " + hsl[2] + "%)" };
    }

    /* rgb(59,130,246) to hex — parens and the rgb prefix both optional */
    m = s.match(/^(?:rgba?\s*\(?\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?\s+(?:to|in)\s+(hex|hsl|rgb)$/i);
    if (m) {
      var r = +m[1], g = +m[2], b = +m[3];
      if (r > 255 || g > 255 || b > 255) return null;
      var w = m[4].toLowerCase();
      if (w === "hex") return { value: "#" + [r, g, b].map(toHex).join("") };
      if (w === "rgb") return { value: "rgb(" + r + ", " + g + ", " + b + ")" };
      var h = rgbToHsl(r, g, b);
      return { value: "hsl(" + h[0] + ", " + h[1] + "%, " + h[2] + "%)" };
    }

    /* ts 1718000000 — seconds or milliseconds, told apart by digit count.
       "ts now" goes the other way and hands back the current epoch. */
    m = s.match(/^ts\s+(\d{1,13})$/i);
    if (m) {
      var n = parseInt(m[1], 10);
      var ms = m[1].length > 10 ? n : n * 1000;
      var d = new Date(ms);
      if (isNaN(d.getTime())) return null;
      return { value: d.toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit"
      }) };
    }
    if (/^ts\s+now$/i.test(s)) return { value: String(Math.floor(Date.now() / 1000)) };

    /* b64 hello / b64d aGVsbG8= */
    m = s.match(/^b64\s+(.+)$/i);
    if (m) { try { return { value: b64Encode(m[1]) }; } catch (e) { return null; } }

    m = s.match(/^b64d\s+(\S+)$/i);
    if (m) {
      try {
        var out = b64Decode(m[1]);
        // atob is lenient — it happily "decodes" plenty of non-base64 text
        // into replacement characters. Treat that as a miss so the input
        // falls through to being an ordinary search.
        return out && out.indexOf("\uFFFD") === -1 ? { value: out } : null;
      } catch (e) { return null; }
    }

    /* 1048576 b to mb */
    m = s.match(/^([\d.]+)\s*([a-z]+)\s+(?:to|in)\s+([a-z]+)$/i);
    if (m) {
      var amt = parseFloat(m[1]);
      var from = BYTE_UNITS[m[2].toLowerCase()], to = BYTE_UNITS[m[3].toLowerCase()];
      if (!isNaN(amt) && from && to) return { value: trimNum(amt * from / to) + " " + m[3].toUpperCase() };
    }

    return null;
  }

  /* ---- suggestions dropdown ---------------------------------------------
     Modeled on the command palette's list/select pattern (see below).     */
  var sug = [], sugSel = -1, sugTimer, sugToken = 0;
  var sugList = $("search-suggest");

  function closeSuggest() {
    sugToken++; // invalidates any in-flight fetch — see maybeSuggest()
    clearTimeout(sugTimer);
    sug = []; sugSel = -1;
    sugList.hidden = true;
    sugList.textContent = "";
  }

  function renderSuggest(items) {
    sugList.textContent = "";
    if (!items.length) { sugList.hidden = true; return; }
    items.forEach(function (text, i) {
      var li = document.createElement("li");
      li.className = "suggest-item";
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      li.textContent = text;
      li.addEventListener("mouseenter", function () { selectSuggest(i); });
      // mousedown (not click) + preventDefault so this registers before
      // the input's blur handler would otherwise close the dropdown first.
      li.addEventListener("mousedown", function (e) {
        e.preventDefault();
        input.value = text;
        closeSuggest();
        submitSearch();
      });
      sugList.appendChild(li);
    });
    sugSel = -1;
    sugList.hidden = false;
  }

  function selectSuggest(i) {
    var nodes = sugList.querySelectorAll(".suggest-item");
    if (!nodes.length) return;
    sugSel = (i + nodes.length) % nodes.length;
    for (var n = 0; n < nodes.length; n++)
      nodes[n].setAttribute("aria-selected", n === sugSel ? "true" : "false");
    nodes[sugSel].scrollIntoView({ block: "nearest" });
  }

  function maybeSuggest(raw) {
    clearTimeout(sugTimer);
    if (!window.Live || raw.trim().length < 2) { closeSuggest(); return; }
    var myToken = ++sugToken;
    sugTimer = setTimeout(function () {
      window.Live.suggest(raw).then(function (items) {
        // Both guards matter: input.value catches "user kept typing";
        // sugToken catches "the dropdown was explicitly closed (blur,
        // Escape) while this request was still in flight" — without it,
        // a slow response can silently reopen a dropdown the user just
        // dismissed, since input.value alone wouldn't have changed.
        if (input.value !== raw || sugToken !== myToken) return;
        sug = items;
        renderSuggest(items);
      });
    }, 180);
  }

  var lastCalcResult = null; // what Enter should copy, if a result is showing

  function updateHint() {
    var raw = input.value;
    lastCalcResult = null;

    if (!raw.trim()) { hint.textContent = ""; closeSuggest(); return; }

    var qa = parseQuickAdd(raw);
    if (qa) {
      hint.innerHTML = "↵&nbsp; Add to <b>" + (qa.kind === "todo" ? "Todo" : "Notes") + "</b>";
      closeSuggest();
      return;
    }

    if (CALC_RE.test(raw)) {
      var calc = evalCalc(raw);
      if (calc != null) {
        lastCalcResult = trimNum(calc);
        hint.innerHTML = "↵&nbsp; = <b>" + lastCalcResult + "</b> &nbsp;·&nbsp; copy";
        closeSuggest();
        return;
      }
    }

    var conv = parseConvert(raw);
    if (conv) {
      closeSuggest();
      if (conv.type === "unit") {
        lastCalcResult = trimNum(conv.value) + " " + conv.unit;
        hint.innerHTML = "↵&nbsp; = <b>" + lastCalcResult + "</b> &nbsp;·&nbsp; copy";
        return;
      }
      var myRaw = raw;
      hint.innerHTML = "↵&nbsp; converting…";
      if (window.Live) {
        window.Live.rate(conv.from, conv.to).then(function (r) {
          if (input.value !== myRaw) return; // user kept typing — hint has already moved on
          if (r == null) {
            // Known currency codes but the lookup still failed (API hiccup) —
            // fall back to a normal search hint instead of leaving the UI
            // stuck on "converting…" forever.
            var p = parse(myRaw);
            hint.innerHTML = p.prefixed
              ? "↵&nbsp; Search <b>" + p.engine.name + "</b>"
              : "↵&nbsp; <b>" + p.engine.name + "</b> &nbsp;·&nbsp; Tab to switch";
            maybeSuggest(myRaw);
            return;
          }
          lastCalcResult = trimNum(conv.amount * r) + " " + conv.to.toUpperCase();
          hint.innerHTML = "↵&nbsp; = <b>" + lastCalcResult + "</b> &nbsp;·&nbsp; copy";
        });
      }
      return;
    }

    var timeConv = parseTimeConvert(raw);
    if (timeConv) {
      lastCalcResult = timeConv.value;
      hint.innerHTML = "↵&nbsp; = <b>" + timeConv.value + "</b> &nbsp;·&nbsp; copy";
      closeSuggest();
      return;
    }

    var dev = parseDevCalc(raw);
    if (dev) {
      lastCalcResult = dev.value;
      // Unlike every other result here, this one can be arbitrary text —
      // "b64d PHNjcmlwdD4=" decodes to markup. Escape before innerHTML.
      hint.innerHTML = "↵&nbsp; = <b>" + escapeHtml(dev.value) + "</b> &nbsp;·&nbsp; copy";
      closeSuggest();
      return;
    }

    var url = asUrl(raw);
    if (url) {
      hint.innerHTML = "↵&nbsp; Go to <b>" + url.replace(/^https?:\/\//, "") + "</b>";
      closeSuggest();
      return;
    }

    var p = parse(raw);
    hint.innerHTML = p.prefixed
      ? "↵&nbsp; Search <b>" + p.engine.name + "</b>"
      : "↵&nbsp; <b>" + p.engine.name + "</b> &nbsp;·&nbsp; Tab to switch";

    maybeSuggest(raw);
  }

  function copyResult(text) {
    text = String(text);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast("Copied " + text);
      }).catch(function () { legacyCopy(text); });
      return;
    }
    legacyCopy(text);
  }

  /* navigator.clipboard needs a secure context — undefined on file:// and
     plain http://, both of which this project explicitly supports testing
     from (see README). Without a fallback, Enter on a calculator result
     would silently do nothing there. */
  function legacyCopy(text) {
    var ok = false;
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      ok = document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) {}
    toast(ok ? "Copied " + text : text); // show the value either way
  }

  function submitSearch() {
    var qa = parseQuickAdd(input.value.trim());
    if (qa) {
      if (qa.kind === "todo") {
        addTodo(parseTask(qa.text));
        toast("Added to todo");
      } else {
        notes.value = (notes.value ? notes.value + "\n" : "") + qa.text;
        store.set("notes", notes.value);
        notesStatus.textContent = "saved";
        setTimeout(function () { notesStatus.textContent = ""; }, 1300);
        if (previewOn) notesPreview.innerHTML = renderMarkdown(notes.value);
        toast("Added to notes");
      }
      input.value = ""; updateHint();
      return;
    }

    if (lastCalcResult != null) {
      copyResult(lastCalcResult);
      return;
    }
    var raw = input.value.trim();
    if (!raw) return;
    var url = asUrl(raw);
    if (url) { go(url); return; }
    var p = parse(raw);
    if (!p.query) return;
    go(p.engine.url.replace("%s", encodeURIComponent(p.query)));
  }

  input.addEventListener("input", updateHint);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Tab") { e.preventDefault(); cycleEngine(e.shiftKey ? -1 : 1); }
    else if (e.key === "ArrowDown") { if (!sugList.hidden && sug.length) { e.preventDefault(); selectSuggest(sugSel + 1); } }
    else if (e.key === "ArrowUp")   { if (!sugList.hidden && sug.length) { e.preventDefault(); selectSuggest(sugSel - 1); } }
    else if (e.key === "Enter") {
      if (!sugList.hidden && sugSel >= 0 && sug[sugSel] != null) {
        e.preventDefault();
        input.value = sug[sugSel];
        closeSuggest();
        submitSearch();
      }
      // else: let the form's own submit event fire normally
    }
    else if (e.key === "Escape") {
      if (!sugList.hidden) closeSuggest();
      else { input.value = ""; updateHint(); input.blur(); }
    }
  });

  input.addEventListener("blur", function () { setTimeout(closeSuggest, 0); });

  $("search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    submitSearch();
  });

  pill.addEventListener("click", function () { cycleEngine(1); input.focus(); });

  if (OPT.autofocusSearch !== false && !NARROW) input.focus();

  /* ====================================================================
     FOCUS TIMER
     ==================================================================== */
  var POM = C.pomodoro || { focusMinutes: 25, breakMinutes: 5 };
  var RING_LEN = 2 * Math.PI * 52;

  var focus = {
    mode: "focus", left: POM.focusMinutes * 60, running: false,
    done: store.get("pomodoros", 0), timer: null
  };

  var fTime = $("focus-time"), fState = $("focus-state"),
      fToggle = $("focus-toggle"), fRing = $("ring-fg"),
      fCount = $("focus-count"), fCard = $("focus-card");

  function total() { return (focus.mode === "focus" ? POM.focusMinutes : POM.breakMinutes) * 60; }

  /* ---- soft chime when a session ends — zero audio files, synthesized
     with the browser's own AudioContext. ---------------------------------*/
  function chime() {
    if (OPT.focusChime === false) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime;
      [880, 1320].forEach(function (freq, i) {
        var osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.02 + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1 + i * 0.08);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + 1.2 + i * 0.08);
      });
      setTimeout(function () { ctx.close(); }, 1500);
    } catch (e) {}
  }

  /* ---- favicon shows the countdown while a session is running ---------
     Extends the existing "timer in the tab title" trick to the favicon
     itself — canvas-drawn, no new image assets.                          */
  var favEl = document.querySelector('link[rel="icon"]');
  var favOrigHref = favEl ? favEl.getAttribute("href") : null;
  var favOrigType = favEl ? favEl.getAttribute("type") : null;
  var favCanvas = document.createElement("canvas");
  favCanvas.width = 32; favCanvas.height = 32;
  var favCtx = favCanvas.getContext("2d");
  var lastFavMin = null;

  function paintFavicon() {
    if (!favEl) return;
    if (!focus.running) {
      if (lastFavMin !== null) {
        favEl.setAttribute("type", favOrigType || "image/svg+xml");
        favEl.setAttribute("href", favOrigHref);
        lastFavMin = null;
      }
      return;
    }
    var m = Math.ceil(focus.left / 60);
    if (m === lastFavMin) return;
    lastFavMin = m;
    var ctx = favCtx;
    ctx.clearRect(0, 0, 32, 32);
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.fillStyle = focus.mode === "focus" ? "#a78bfa" : "#34d399";
    ctx.fill();
    var frac = (total() - focus.left) / total();
    ctx.beginPath();
    ctx.arc(16, 16, 15, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.stroke();
    ctx.fillStyle = "#0b0714";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(m), 16, 17);
    favEl.setAttribute("type", "image/png");
    favEl.setAttribute("href", favCanvas.toDataURL("image/png"));
  }

  function paintFocus() {
    var m = Math.floor(focus.left / 60), s = focus.left % 60;
    fTime.textContent = m + ":" + String(s).padStart(2, "0");
    fRing.style.strokeDashoffset = RING_LEN * (1 - (total() - focus.left) / total());
    fState.textContent = focus.running ? (focus.mode === "focus" ? "focusing" : "break")
                                       : (focus.left === total() ? "ready" : "paused");
    fToggle.textContent = focus.running ? "Pause" : (focus.left === total() ? "Start" : "Resume");
    fCard.classList.toggle("break", focus.mode === "break");
    fCount.textContent = focus.done ? focus.done + " session" + (focus.done > 1 ? "s" : "") + " today" : "";
    document.title = focus.running
      ? fTime.textContent + " · " + (focus.mode === "focus" ? "Focus" : "Break")
      : "SK";
    paintFavicon();
  }

  function focusTick() {
    focus.left--;
    if (focus.left <= 0) {
      if (focus.mode === "focus") {
        focus.done++; store.set("pomodoros", focus.done);
        focus.mode = "break"; focus.left = POM.breakMinutes * 60;
        toast("Focus done — take " + POM.breakMinutes + " minutes.");
        chime();
      } else {
        focus.mode = "focus"; focus.left = POM.focusMinutes * 60;
        toast("Break over. Back to it.");
        chime();
      }
    }
    paintFocus();
  }

  fToggle.addEventListener("click", function () {
    focus.running = !focus.running;
    clearInterval(focus.timer);
    if (focus.running) focus.timer = setInterval(focusTick, 1000);
    paintFocus();
  });

  $("focus-reset").addEventListener("click", function () {
    clearInterval(focus.timer);
    focus.running = false; focus.mode = "focus"; focus.left = POM.focusMinutes * 60;
    paintFocus();
  });

  fRing.style.strokeDasharray = RING_LEN;
  paintFocus();

  /* ====================================================================
     COUNTDOWN
     ==================================================================== */
  if (C.countdown && C.countdown.date) {
    var target = new Date(C.countdown.date + "T00:00:00");
    if (!isNaN(target)) {
      var card = $("countdown-card");
      $("countdown-label").textContent = C.countdown.label || "Countdown";
      $("countdown-date").textContent = target.toLocaleDateString(undefined,
        { day: "numeric", month: "short", year: "numeric" });

      var today0 = new Date(); today0.setHours(0, 0, 0, 0);
      var days = Math.ceil((target - today0) / 86400000);
      $("cd-days").textContent = days >= 0 ? days : "—";
      $("cd-sub").textContent = days < 0 ? "Passed"
        : days === 0 ? "Today." : Math.ceil(days / 7) + " weeks · " + days + " days";

      // progress since the start of the year the target falls in
      var yearStart = new Date(target.getFullYear(), 0, 1);
      var span = target - yearStart, gone = today0 - yearStart;
      var pct = Math.max(0, Math.min(100, (gone / span) * 100));
      setTimeout(function () { $("cd-fill").style.width = pct.toFixed(1) + "%"; }, 400);

      card.hidden = false;
    }
  }

  /* ====================================================================
     TODO (with smart parsing) + NOTES
     ==================================================================== */
  var DAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

  /* Pulls a time / day / priority out of free text.
     "call ravi 4pm !"  ->  { text:"call ravi", when:"4:00 PM", bang:true }  */
  function parseTask(raw) {
    var out = { text: raw.trim(), when: "", bang: false };

    if (/(^|\s)!+(\s|$)/.test(out.text)) {
      out.bang = true;
      out.text = out.text.replace(/(^|\s)!+(\s|$)/g, " ").trim();
    }

    var when = [];

    var dayRe = new RegExp("\\b(today|tomorrow|tmr|" + DAYS.join("|") + "|mon|tue|wed|thu|fri|sat|sun)\\b", "i");
    var dm = out.text.match(dayRe);
    if (dm) {
      var w = dm[1].toLowerCase();
      if (w === "tmr") w = "tomorrow";
      var full = DAYS.filter(function (d) { return d.indexOf(w) === 0; })[0];
      when.push(full ? full.charAt(0).toUpperCase() + full.slice(1)
                     : w.charAt(0).toUpperCase() + w.slice(1));
      out.text = out.text.replace(dm[0], " ").trim();
    }

    var tm = out.text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
          || out.text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (tm) {
      var hh = parseInt(tm[1], 10), mm = tm[2] ? parseInt(tm[2], 10) : 0, ap = tm[3];
      if (ap) { ap = ap.toLowerCase(); if (ap === "pm" && hh < 12) hh += 12; if (ap === "am" && hh === 12) hh = 0; }
      var d = new Date(); d.setHours(hh, mm, 0, 0);
      when.push(d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }));
      out.text = out.text.replace(tm[0], " ").trim();
    }

    out.text = out.text.replace(/\s{2,}/g, " ").replace(/\s+$/, "");
    out.when = when.join(" ");
    if (!out.text) { out.text = raw.trim(); out.when = ""; }
    return out;
  }

  /* ---- shared list renderer --------------------------------------------
     Todo and Reading share the exact same row shape (checkbox, text,
     optional badge, delete-with-animation) — one renderer, parameterized,
     instead of two copies that would drift apart under future edits.
     `onDelete`/`onToggle` receive the ITEM, not an index — deletion always
     looks the item up by reference at click time (`splice(indexOf(item))`),
     so two quick deletes in a row (each carrying its own 220ms removal
     animation) can never resolve against a stale, since-shifted index. */
  function renderList(container, items, emptyText, opts) {
    container.textContent = "";
    if (!items.length) {
      var empty = document.createElement("li");
      empty.className = "todo-empty";
      empty.textContent = emptyText;
      container.appendChild(empty);
      return;
    }

    items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "todo-item" + (opts.done(item) ? " done" : "") +
        (opts.bang && opts.bang(item) ? " bang" : "");

      var box = document.createElement("button");
      box.className = "todo-box"; box.type = "button";
      box.setAttribute("aria-label", opts.done(item) ? opts.undoneLabel : opts.doneLabel);
      var chk = svgEl("svg", { viewBox: "0 0 12 12" });
      chk.appendChild(svgEl("path", { d: "M2 6.3l2.6 2.6L10 3.5" }));
      box.appendChild(chk);
      box.addEventListener("click", function () { opts.onToggle(item); });
      li.appendChild(box);

      var textEl = document.createElement(opts.href ? "a" : "span");
      textEl.className = "todo-text";
      textEl.textContent = opts.text(item);
      if (opts.href) {
        textEl.href = opts.href(item);
        textEl.addEventListener("click", function (e) { e.preventDefault(); opts.onOpen(item); });
      }
      li.appendChild(textEl);

      if (opts.meta) {
        var m = opts.meta(item);
        if (m) li.appendChild(m);
      }

      var del = document.createElement("button");
      del.className = "todo-del"; del.type = "button";
      del.textContent = "×";
      del.setAttribute("aria-label", opts.deleteLabel);
      del.addEventListener("click", function () {
        li.classList.add("removing");
        setTimeout(function () { opts.onDelete(item); }, 220);
      });
      li.appendChild(del);

      container.appendChild(li);
    });
  }

  var todos = store.get("todos", []) || [];
  var list = $("todo-list"), count = $("todo-count"),
      tInput = $("todo-input"), pHint = $("parse-hint"),
      tools = $("todo-tools"), clearBtn = $("todo-clear");

  /* Deliberately not persisted. This page is a new tab — it opens dozens of
     times a day, and a filter left on "Done" would greet you with what looks
     like an empty todo list every morning. Every load starts on "All". */
  var todoFilter = "all";

  function saveTodos() { store.set("todos", todos); }

  /* Single add path for both the card's own form and the "todo buy milk"
     quick-add in the search bar. Bounces the view off "Done" first —
     otherwise adding a task from a filtered list appears to do nothing. */
  function addTodo(p) {
    todos.push({ text: p.text, when: p.when, bang: p.bang, done: false });
    if (todoFilter === "done") todoFilter = "all";
    saveTodos(); renderTodos();
  }

  var FILTER_EMPTY = {
    all:    "Nothing yet. Add one above.",
    active: "Nothing left to do.",
    done:   "Nothing completed yet."
  };

  /* renderList's callbacks take the ITEM, and this card's onToggle/onDelete
     resolve it with todos.indexOf(t) at click time — so handing the renderer
     a filtered copy is safe by construction. The view narrows; every write
     still lands on the real array. */
  function renderTodos() {
    var open = todos.filter(function (t) { return !t.done; }).length;
    var doneCount = todos.length - open;

    count.textContent = !todos.length ? ""
      : doneCount ? open + " open · " + doneCount + " done"
      : open + " open";

    tools.hidden = !todos.length;
    clearBtn.hidden = !doneCount;
    Array.prototype.forEach.call(tools.querySelectorAll(".todo-filter"), function (b) {
      var on = b.getAttribute("data-filter") === todoFilter;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    var shown = todoFilter === "all" ? todos : todos.filter(function (t) {
      return todoFilter === "done" ? t.done : !t.done;
    });

    renderList(list, shown, FILTER_EMPTY[todoFilter], {
      text: function (t) { return t.text; },
      done: function (t) { return t.done; },
      bang: function (t) { return t.bang; },
      doneLabel: "Mark done", undoneLabel: "Mark not done", deleteLabel: "Delete task",
      meta: function (t) {
        if (!t.when) return null;
        var w = document.createElement("span");
        w.className = "todo-when";
        w.textContent = t.when;
        return w;
      },
      onToggle: function (t) { t.done = !t.done; saveTodos(); renderTodos(); },
      onDelete: function (t) {
        var idx = todos.indexOf(t);
        if (idx !== -1) todos.splice(idx, 1);
        saveTodos(); renderTodos();
      }
    });
  }

  tools.addEventListener("click", function (e) {
    var btn = e.target.closest(".todo-filter");
    if (!btn) return;
    todoFilter = btn.getAttribute("data-filter");
    renderTodos();
  });

  clearBtn.addEventListener("click", function () {
    var n = 0;
    // Spliced in place rather than reassigning `todos` — saveTodos() and the
    // quick-add path in submitSearch() both close over this same binding.
    for (var i = todos.length - 1; i >= 0; i--) {
      if (todos[i].done) { todos.splice(i, 1); n++; }
    }
    if (!n) return;
    // Nothing is left to look at under "Done" once it's cleared.
    if (todoFilter === "done") todoFilter = "all";
    saveTodos(); renderTodos();
    toast(n === 1 ? "Cleared 1 task" : "Cleared " + n + " tasks");
  });

  tInput.addEventListener("input", function () {
    var v = tInput.value.trim();
    if (!v) { pHint.textContent = ""; return; }
    var p = parseTask(v);
    pHint.textContent = (p.when || p.bang)
      ? [p.when, p.bang ? "priority" : ""].filter(Boolean).join(" · ")
      : "";
  });

  $("todo-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = tInput.value.trim();
    if (!v) return;
    addTodo(parseTask(v));
    tInput.value = ""; pHint.textContent = "";
  });

  renderTodos();

  /* ====================================================================
     READING LIST — paste a link, save it locally for later
     ==================================================================== */
  var reading = store.get("reading", []) || [];
  var rList = $("reading-list"), rCount = $("reading-count"), rInput = $("reading-input");

  function saveReading() { store.set("reading", reading); }

  function renderReading() {
    rCount.textContent = reading.length ? reading.length + " saved" : "";

    renderList(rList, reading, "Nothing saved yet.", {
      text: function (r) { return r.title || r.hostname; },
      done: function (r) { return r.read; },
      href: function (r) { return r.url; },
      doneLabel: "Mark read", undoneLabel: "Mark unread", deleteLabel: "Remove",
      onOpen: function (r) { go(r.url); },
      onToggle: function (r) { r.read = !r.read; saveReading(); renderReading(); },
      onDelete: function (r) {
        var idx = reading.indexOf(r);
        if (idx !== -1) reading.splice(idx, 1);
        saveReading(); renderReading();
      }
    });
  }

  $("reading-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = rInput.value.trim();
    if (!v) return;
    // Deliberately dumb split (no NLP, unlike parseTask above) — the URL is
    // whatever comes before the first space, the rest is an optional title.
    var sp = v.indexOf(" ");
    var head = sp > 0 ? v.slice(0, sp) : v;
    var rest = sp > 0 ? v.slice(sp + 1).trim() : "";
    var url = asUrl(head);
    if (!url) { toast("Not a valid URL"); return; }
    var hostname;
    try { hostname = new URL(url).hostname; } catch (e2) { hostname = url; }
    reading.push({ id: Date.now(), url: url, title: rest, hostname: hostname, addedAt: Date.now(), read: false });
    rInput.value = "";
    saveReading(); renderReading();
  });

  renderReading();

  var notes = $("notes"), notesStatus = $("notes-status"), saveTimer;
  notes.value = store.get("notes", "") || "";
  notes.addEventListener("input", function () {
    clearTimeout(saveTimer);
    notesStatus.textContent = "saving…";
    saveTimer = setTimeout(function () {
      store.set("notes", notes.value);
      notesStatus.textContent = "saved";
      setTimeout(function () { notesStatus.textContent = ""; }, 1300);
    }, 400);
  });

  /* ---- markdown preview — a hand-written subset (bold, code, checklists),
     not a library: matches the project's "no npm install" rule.          */
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function mdInline(t) {
    return t.replace(/`([^`]+)`/g, "<code>$1</code>")
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }
  function renderMarkdown(src) {
    if (!src.trim()) return '<span style="color:var(--muted)">Nothing here yet.</span>';
    return escapeHtml(src).split("\n").map(function (line) {
      var m = line.match(/^(\s*)-\s\[( |x|X)\]\s(.*)$/);
      if (m) {
        var on = m[2].toLowerCase() === "x";
        return m[1] + '<label><input type="checkbox" disabled' + (on ? " checked" : "") +
               "> " + mdInline(m[3]) + "</label>";
      }
      return mdInline(line) || "&nbsp;";
    }).join("<br>");
  }

  var notesPreview = $("notes-preview"), previewBtn = $("notes-preview-toggle");
  var previewOn = false;
  previewBtn.addEventListener("click", function () {
    previewOn = !previewOn;
    previewBtn.classList.toggle("on", previewOn);
    previewBtn.textContent = previewOn ? "edit" : "preview";
    notes.hidden = previewOn;
    notesPreview.hidden = !previewOn;
    if (previewOn) notesPreview.innerHTML = renderMarkdown(notes.value);
  });

  /* ====================================================================
     BACKUP — export/import your own data as a JSON file. Everything here
     lives only in this browser's localStorage (see `store` above), so
     clearing site data or switching machines loses it without this.
     ==================================================================== */
  function exportData() {
    var data = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      // skip skhome.live.* — those are just re-fetchable API caches, not
      // real user data, and would only bloat the backup file.
      if (k && k.indexOf("skhome.") === 0 && k.indexOf("skhome.live.") !== 0) {
        data[k] = localStorage.getItem(k);
      }
    }
    var blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), data: data }, null, 2)],
      { type: "application/json" }
    );
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "sk-home-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Backup downloaded");
  }

  var importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = "application/json";
  importInput.hidden = true;
  document.body.appendChild(importInput);
  importInput.addEventListener("change", function () {
    var file = importInput.files[0];
    importInput.value = "";
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        var data = parsed && parsed.data ? parsed.data : parsed;
        var n = 0;
        for (var k in data) {
          if (k.indexOf("skhome.") === 0) { localStorage.setItem(k, data[k]); n++; }
        }
        if (!n) { toast("Nothing to restore in that file"); return; }
        toast("Restored " + n + " item" + (n === 1 ? "" : "s") + " — reloading…");
        setTimeout(function () { location.reload(); }, 700);
      } catch (e) {
        toast("That file isn't a valid backup");
      }
    };
    reader.readAsText(file);
  });
  function importData() { importInput.click(); }

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
                 run: function () { engineIdx = i; store.set("engine", e.key); paintPill(true); updateHint(); input.focus(); } });
    });
    out.push({ label: focus.running ? "Pause focus timer" : "Start focus timer",
               meta: "timer", icon: "timer", run: function () { fToggle.click(); } });
    out.push({ label: "Reset tile order", meta: "layout", icon: "folder",
               run: function () { $("reset-order").click(); } });
    out.push({ label: "Toggle weather details", meta: "view", icon: "cloud",
               run: function () { $("weather").click(); } });
    out.push({ label: "Export data (backup)", meta: "data", icon: "folder", run: exportData });
    out.push({ label: "Import data (restore)", meta: "data", icon: "folder", run: importData });
    return out;
  }

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
      li.style.setProperty("--i", Math.min(i, 12));

      var mark = document.createElement("span");
      mark.className = "palette-mark";
      var g = c.icon && icon(c.icon);
      if (g) mark.appendChild(g); else mark.textContent = c.label.charAt(0).toUpperCase();
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
    for (var n = 0; n < nodes.length; n++)
      nodes[n].setAttribute("aria-selected", n === psel ? "true" : "false");
    nodes[psel].scrollIntoView({ block: "nearest" });
  }

  function openPalette()  { pwrap.hidden = false; pinput.value = ""; renderPalette(); pinput.focus(); }
  function closePalette() { pwrap.hidden = true; if (OPT.autofocusSearch !== false && !NARROW) input.focus(); }

  pinput.addEventListener("input", renderPalette);
  pinput.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown")    { e.preventDefault(); select(psel + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); select(psel - 1); }
    else if (e.key === "Enter")   { e.preventDefault(); if (pitems[psel]) { var c = pitems[psel]; closePalette(); c.run(); } }
    else if (e.key === "Escape")  { e.preventDefault(); closePalette(); }
  });
  $("palette-backdrop").addEventListener("click", closePalette);

  /* ====================================================================
     KEYBOARD
     ==================================================================== */
  function typing(el) {
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault(); pwrap.hidden ? openPalette() : closePalette(); return;
    }
    if (e.key === "Escape" && !pwrap.hidden) { closePalette(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey || !pwrap.hidden) return;
    if (typing(document.activeElement)) return;

    if (e.key === "/") { e.preventDefault(); input.focus(); input.select(); return; }

    if (e.key >= "1" && e.key <= "9") {
      var hit = ALL[Number(e.key) - 1];
      if (hit) {
        e.preventDefault();
        go(hit.link.url, document.querySelector('.tile[data-name="' + CSS.escape(hit.link.name) + '"]'));
      }
      return;
    }

    if (/^[a-z]$/i.test(e.key)) {
      var k = e.key.toLowerCase();
      for (var i = 0; i < ALL.length; i++) {
        if ((ALL[i].link.key || "").toLowerCase() === k) {
          e.preventDefault();
          go(ALL[i].link.url, document.querySelector('.tile[data-name="' + CSS.escape(ALL[i].link.name) + '"]'));
          return;
        }
      }
    }
  });

  document.addEventListener("keydown", function (e) { if (e.key === "Alt") body.classList.add("keys-visible"); });
  document.addEventListener("keyup",   function (e) { if (e.key === "Alt") body.classList.remove("keys-visible"); });
  window.addEventListener("blur", function () { body.classList.remove("keys-visible"); });

  /* ====================================================================
     CURSOR GLOW
     ==================================================================== */
  if (OPT.cursorGlow !== false && !REDUCED && !NARROW) {
    var glow = $("cursor-glow"), gFrame = 0, gx = 0, gy = 0;
    window.addEventListener("pointermove", function (e) {
      gx = e.clientX; gy = e.clientY;
      if (!body.classList.contains("pointer-active")) body.classList.add("pointer-active");
      if (gFrame) return;
      gFrame = requestAnimationFrame(function () {
        gFrame = 0;
        glow.style.transform = "translate3d(" + gx + "px," + gy + "px,0)";
      });
    }, { passive: true });
  }

  /* ====================================================================
     LIVE DATA — every card appears only if its feed answers
     ==================================================================== */
  function wxIcon(kind, isDay) {
    var name = kind === "sun" ? (isDay ? "sun" : "spark") : kind;
    return icon(ICONS[name] ? name : "cloud", 1.8);
  }

  function loadWeather() {
    if (!window.Live) return;
    window.Live.weather().then(function (w) {
      if (!w) return;

      var box = $("weather");
      var gi = $("weather-icon");
      gi.textContent = "";
      var g = wxIcon(w.kind, w.isDay);
      if (g) gi.appendChild(g);
      $("weather-temp").textContent = Math.round(w.temp) + w.unit;
      $("weather-label").textContent = w.label;
      box.hidden = false;


      if (sky && OPT.weatherParticles !== false) {
        sky.setWeather(w.kind === "rain" || w.kind === "storm" ? "rain"
                     : w.kind === "snow" ? "snow" : null);
      }

      /* drawer: stats + a 12-hour temperature curve */
      var stats = $("wx-stats");
      stats.innerHTML = "";
      [["Feels like", Math.round(w.feels) + w.unit],
       ["High / low", Math.round(w.max) + "° / " + Math.round(w.min) + "°"],
       ["Humidity",   w.humidity + "%"],
       ["Wind",       Math.round(w.wind) + " km/h"],
       ["Sunrise",    w.sunrise],
       ["Sunset",     w.sunset]].forEach(function (row) {
        var l = document.createElement("span"); l.textContent = row[0];
        var v = document.createElement("b");    v.textContent = row[1];
        stats.appendChild(l); stats.appendChild(v);
      });

      drawWxChart(w);

      box.addEventListener("click", function () {
        var d = $("wx-drawer");
        var open = d.hidden;
        d.hidden = !open;
        box.setAttribute("aria-expanded", String(open));
      });
    });
  }

  function drawWxChart(w) {
    var host = $("wx-chart");
    host.textContent = "";
    var pts = w.hours;
    if (!pts || pts.length < 2) return;

    var W = 520, H = 88, padY = 18, padX = 14;
    var temps = pts.map(function (p) { return p.temp; });
    var lo = Math.min.apply(null, temps), hi = Math.max.apply(null, temps);
    if (hi - lo < 1) { hi = lo + 1; }

    var x = function (i) { return padX + (i / (pts.length - 1)) * (W - padX * 2); };
    var y = function (t) { return H - padY - ((t - lo) / (hi - lo)) * (H - padY * 2); };

    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none" });

    /* precipitation bars behind the curve */
    pts.forEach(function (p, i) {
      if (!p.pop) return;
      var h = (p.pop / 100) * (H - padY);
      svg.appendChild(svgEl("rect", {
        x: x(i) - 5, y: H - h, width: 10, height: h, rx: 2,
        fill: "currentColor", opacity: (0.05 + (p.pop / 100) * 0.2).toFixed(3)
      }));
    });

    var line = pts.map(function (p, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.temp).toFixed(1); }).join(" ");

    var grad = svgEl("linearGradient", { id: "wxg", x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(svgEl("stop", { offset: "0%",   "stop-color": "currentColor", "stop-opacity": ".35" }));
    grad.appendChild(svgEl("stop", { offset: "100%", "stop-color": "currentColor", "stop-opacity": "0" }));
    var defs = svgEl("defs"); defs.appendChild(grad); svg.appendChild(defs);

    svg.appendChild(svgEl("path", {
      d: line + " L" + x(pts.length - 1).toFixed(1) + " " + H + " L" + x(0).toFixed(1) + " " + H + " Z",
      fill: "url(#wxg)"
    }));

    var stroke = svgEl("path", { d: line, fill: "none", stroke: "currentColor",
      "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" });
    svg.appendChild(stroke);

    pts.forEach(function (p, i) {
      if (i % 3 && i !== pts.length - 1) return;
      svg.appendChild(svgEl("circle", { cx: x(i), cy: y(p.temp), r: 2.6, fill: "currentColor" }));
      var lbl = svgEl("text", { x: x(i), y: y(p.temp) - 9, "text-anchor": "middle",
        "font-size": "10", fill: "currentColor", opacity: ".75" });
      lbl.textContent = Math.round(p.temp) + "°";
      svg.appendChild(lbl);
      var t = svgEl("text", { x: x(i), y: H - 2, "text-anchor": "middle",
        "font-size": "9", fill: "currentColor", opacity: ".45" });
      t.textContent = p.t;
      svg.appendChild(t);
    });

    svg.style.color = "var(--accent)";
    host.appendChild(svg);

    if (!REDUCED) {
      var len = stroke.getTotalLength ? stroke.getTotalLength() : 600;
      stroke.style.strokeDasharray = len;
      stroke.style.strokeDashoffset = len;
      stroke.style.transition = "stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)";
      requestAnimationFrame(function () { stroke.style.strokeDashoffset = 0; });
    }
  }

  function loadGitHub() {
    if (!window.Live) return;
    window.Live.github().then(function (g) {
      if (!g) return;
      $("gh-card").hidden = false;
      $("gh-meta").textContent = "@" + g.user;

      var stats = $("gh-stats");
      stats.innerHTML = "";
      [[g.total90, "events / 90d"], [g.streak, "day streak"],
       [g.repos, "repos"], [g.followers, "followers"],
       [g.totalStars, "total stars"], [g.longestStreak, "90d best streak"],
       [g.topLanguage || "—", "top language"]].forEach(function (s) {
        var d = document.createElement("div"); d.className = "gh-stat";
        var b = document.createElement("b"); b.textContent = s[0];
        var l = document.createElement("span"); l.textContent = s[1];
        d.appendChild(b); d.appendChild(l); stats.appendChild(d);
      });

      var max = Math.max.apply(null, g.days.map(function (d) { return d.count; })) || 1;
      var grid = $("gh-grid");
      grid.innerHTML = "";
      g.days.forEach(function (d, i) {
        var cell = document.createElement("div");
        cell.className = "gh-day";
        var lv = d.count === 0 ? 0 : Math.min(4, Math.ceil((d.count / max) * 4));
        cell.dataset.lv = lv;
        cell.style.setProperty("--i", i);
        cell.title = d.date + " · " + d.count + (d.count === 1 ? " event" : " events");
        grid.appendChild(cell);
      });

      var rec = $("gh-recent");
      rec.innerHTML = "";
      g.recent.forEach(function (r) {
        var li = document.createElement("li");
        li.innerHTML = r.verb + " <b>" + r.repo + "</b>";
        rec.appendChild(li);
      });
    });
  }

  function loadHN() {
    if (!window.Live) return;
    window.Live.hackernews().then(function (items) {
      if (!items || !items.length) return;
      $("hn-card").hidden = false;
      var ul = $("hn-list");
      ul.innerHTML = "";
      items.forEach(function (it) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = it.url; a.target = "_blank"; a.rel = "noopener";
        a.textContent = it.title;
        var s = document.createElement("small");
        s.textContent = it.points + " points · " + it.comments + " comments";
        a.appendChild(s);
        li.appendChild(a); ul.appendChild(li);
      });
    });
  }

  function loadDevTo() {
    if (!window.Live) return;
    window.Live.devto().then(function (items) {
      if (!items || !items.length) return;
      $("devto-card").hidden = false;
      var ul = $("devto-list");
      ul.innerHTML = "";
      items.forEach(function (it) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = it.url; a.target = "_blank"; a.rel = "noopener";
        a.textContent = it.title;
        var s = document.createElement("small");
        s.textContent = it.points + " reactions · " + it.comments + " comments";
        a.appendChild(s);
        li.appendChild(a); ul.appendChild(li);
      });
    });
  }

  function loadMarkets() {
    if (!window.Live) return;
    window.Live.markets().then(function (rows) {
      if (!rows || !rows.length) return;
      $("market-card").hidden = false;
      $("market-meta").textContent = rows[0].currency;
      var ul = $("market-list");
      ul.innerHTML = "";
      rows.forEach(function (r) {
        var li = document.createElement("li");
        var sym = document.createElement("span"); sym.className = "sym"; sym.textContent = r.label;
        var px  = document.createElement("span"); px.className  = "px";
        px.textContent = r.price != null
          ? r.price.toLocaleString(undefined, { maximumFractionDigits: r.price < 100 ? 2 : 0 })
          : "—";
        var ch = document.createElement("span");
        var up = (r.change || 0) >= 0;
        ch.className = "ch " + (up ? "up" : "down");
        ch.textContent = (up ? "▲ " : "▼ ") + Math.abs(r.change || 0).toFixed(2) + "%";
        li.appendChild(sym); li.appendChild(px); li.appendChild(ch);
        ul.appendChild(li);
      });
    });
  }

  /* ====================================================================
     BOOT
     ==================================================================== */
  Array.prototype.forEach.call(document.querySelectorAll(".reveal"), function (el) {
    el.style.setProperty("--d", el.dataset.delay || 0);
  });

  requestAnimationFrame(function () { body.classList.add("ready"); });

  /* Live feeds start only once the page is on screen. */
  function afterPaint(fn) {
    if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 2500 });
    else setTimeout(fn, 320);
  }
  afterPaint(function () {
    loadWeather(); loadGitHub(); loadHN(); loadDevTo(); loadMarkets();
  });

  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () {
      // hadController is false on the very first-ever load in this browser
      // (no SW controlling yet) — only show the toast for a REAL update
      // later, not for the initial install taking control.
      var hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register("sw.js").catch(function () {});
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (!hadController) { hadController = true; return; }
        clearTimeout(toastTimer);
        toastEl.textContent = "Update ready — ";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "refresh";
        btn.className = "toast-action";
        btn.addEventListener("click", function () { location.reload(); });
        toastEl.appendChild(btn);
        toastEl.hidden = false;
        toastEl.classList.remove("out");
      });
    });
  }
})();
