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

  function subline(wx) {
    var now = new Date(), h = now.getHours(), day = now.getDay();

    if (wx && /rain|shower|drizzle/i.test(wx.label))
      return "Rain in " + (C.location.label || "town") + " — good day to stay in and ship.";
    if (wx && /thunder/i.test(wx.label))
      return "Storm outside. Back up your work.";
    if (streak.count >= 3)
      return streak.count + " days in a row. Keep the chain alive.";
    if (day === 1 && h < 12) return "Fresh week. Pick the hard thing first.";
    if (day === 5 && h >= 17) return "Week's done. Ship one more thing or log off.";
    if (h >= 0 && h < 5) return "Late. Whatever it is, it'll be clearer tomorrow.";

    var lines = C.sublines || [];
    return lines.length ? lines[Math.floor(Math.random() * lines.length)] : "";
  }

  paintGreeting(greetingText(new Date()) + ", " + (C.name || "there"));
  $("subline").textContent = subline(null);

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
    var saved = store.get("engine", null);
    ENGINES.forEach(function (e, i) { if (e.key === saved) engineIdx = i; });
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

  function cycleEngine(step) {
    engineIdx = (engineIdx + (step || 1) + ENGINES.length) % ENGINES.length;
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

  function updateHint() {
    var raw = input.value;
    if (!raw.trim()) { hint.textContent = ""; return; }
    var url = asUrl(raw);
    if (url) { hint.innerHTML = "↵&nbsp; Go to <b>" + url.replace(/^https?:\/\//, "") + "</b>"; return; }
    var p = parse(raw);
    hint.innerHTML = p.prefixed
      ? "↵&nbsp; Search <b>" + p.engine.name + "</b>"
      : "↵&nbsp; <b>" + p.engine.name + "</b> &nbsp;·&nbsp; Tab to switch";
  }

  input.addEventListener("input", updateHint);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Tab") { e.preventDefault(); cycleEngine(e.shiftKey ? -1 : 1); }
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
  }

  function focusTick() {
    focus.left--;
    if (focus.left <= 0) {
      if (focus.mode === "focus") {
        focus.done++; store.set("pomodoros", focus.done);
        focus.mode = "break"; focus.left = POM.breakMinutes * 60;
        toast("Focus done — take " + POM.breakMinutes + " minutes.");
      } else {
        focus.mode = "focus"; focus.left = POM.focusMinutes * 60;
        toast("Break over. Back to it.");
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

  var todos = store.get("todos", []) || [];
  var list = $("todo-list"), count = $("todo-count"),
      tInput = $("todo-input"), pHint = $("parse-hint");

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
      li.className = "todo-item" + (t.done ? " done" : "") + (t.bang ? " bang" : "");

      var box = document.createElement("button");
      box.className = "todo-box"; box.type = "button";
      box.setAttribute("aria-label", t.done ? "Mark not done" : "Mark done");
      var chk = svgEl("svg", { viewBox: "0 0 12 12" });
      chk.appendChild(svgEl("path", { d: "M2 6.3l2.6 2.6L10 3.5" }));
      box.appendChild(chk);
      box.addEventListener("click", function () {
        todos[i].done = !todos[i].done; saveTodos(); renderTodos();
      });
      li.appendChild(box);

      var text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = t.text;
      li.appendChild(text);

      if (t.when) {
        var w = document.createElement("span");
        w.className = "todo-when";
        w.textContent = t.when;
        li.appendChild(w);
      }

      var del = document.createElement("button");
      del.className = "todo-del"; del.type = "button";
      del.textContent = "×";
      del.setAttribute("aria-label", "Delete task");
      del.addEventListener("click", function () {
        li.classList.add("removing");
        setTimeout(function () { todos.splice(i, 1); saveTodos(); renderTodos(); }, 220);
      });
      li.appendChild(del);

      list.appendChild(li);
    });
  }

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
    var p = parseTask(v);
    todos.push({ text: p.text, when: p.when, bang: p.bang, done: false });
    tInput.value = ""; pHint.textContent = "";
    saveTodos(); renderTodos();
  });

  renderTodos();

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

      $("subline").textContent = subline(w);

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
       [g.repos, "repos"], [g.followers, "followers"]].forEach(function (s) {
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
    loadWeather(); loadGitHub(); loadHN(); loadMarkets();
  });

  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
