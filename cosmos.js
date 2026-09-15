/* ==========================================================================
   SK HOME — COSMOS
   The living background: parallax starfield, drifting nebula, shooting stars,
   weather particles, and a palette that shifts through the day.

   Everything is drawn on one canvas. It pauses when the tab is hidden and
   goes completely still if the OS asks for reduced motion.
   ========================================================================== */
window.Cosmos = (function () {
  "use strict";

  /* ---- Time-of-day palettes -----------------------------------------
     Each band: page background, two nebula colours, and the accent the
     rest of the UI borrows. The renderer blends between adjacent bands
     by fractional hour, so the sky is never the same twice.            */
  /* The day runs blue → rose → amber → gold → amber → pink → violet → blue.
     Every hop is a short trip round the wheel that never enters the greens,
     so no hour of the day lands on a sickly in-between colour. */
  var BANDS = [
    { h: 0,  bg: [ 5,  4, 13], n1: [ 26, 16, 64], n2: [ 13, 40, 71], acc: [124, 159, 255], name: "deep night" },
    { h: 5,  bg: [14,  8, 20], n1: [ 74, 32, 80], n2: [122, 48, 64], acc: [255, 158, 190], name: "dawn"       },
    { h: 8,  bg: [16, 11, 20], n1: [ 96, 44, 72], n2: [122, 90, 58], acc: [255, 190, 138], name: "morning"    },
    { h: 12, bg: [12, 13, 26], n1: [ 58, 86,140], n2: [ 96,110,170], acc: [255, 216, 160], name: "midday"     },
    { h: 16, bg: [14,  9, 22], n1: [ 90, 58,122], n2: [138, 74, 90], acc: [255, 168, 106], name: "afternoon"  },
    { h: 19, bg: [12,  7, 20], n1: [106, 42,106], n2: [ 58, 42,122], acc: [255, 138, 196], name: "dusk"       },
    { h: 22, bg: [ 8,  5, 16], n1: [ 42, 26, 90], n2: [ 26, 42, 90], acc: [167, 139, 250], name: "night"      },
    { h: 24, bg: [ 5,  4, 13], n1: [ 26, 16, 64], n2: [ 13, 40, 71], acc: [124, 159, 255], name: "deep night" }
  ];

  function lerp(a, b, t) { return a + (b - a) * t; }

  function mix(c1, c2, t) {
    return [Math.round(lerp(c1[0], c2[0], t)),
            Math.round(lerp(c1[1], c2[1], t)),
            Math.round(lerp(c1[2], c2[2], t))];
  }

  /* Blending saturated colours in RGB drags them through grey — amber to cyan
     goes muddy right in the middle of the morning. Going round the hue wheel
     instead keeps every in-between colour as vivid as the two ends. */
  function toHsl(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var h = 0, s = 0, l = (mx + mn) / 2, d = mx - mn;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r)      h = ((g - b) / d + (g < b ? 6 : 0));
      else if (mx === g) h = ((b - r) / d + 2);
      else               h = ((r - g) / d + 4);
      h *= 60;
    }
    return [h, s, l];
  }

  function toRgb(hsl) {
    var h = ((hsl[0] % 360) + 360) % 360 / 360, s = hsl[1], l = hsl[2];
    if (!s) { var v = Math.round(l * 255); return [v, v, v]; }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    function hue(t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    return [Math.round(hue(h + 1 / 3) * 255),
            Math.round(hue(h) * 255),
            Math.round(hue(h - 1 / 3) * 255)];
  }

  function mixHsl(c1, c2, t) {
    var a = toHsl(c1), b = toHsl(c2);
    var dh = b[0] - a[0];
    if (dh >  180) dh -= 360;          // always take the short way round
    if (dh < -180) dh += 360;
    return toRgb([a[0] + dh * t, lerp(a[1], b[1], t), lerp(a[2], b[2], t)]);
  }
  function rgb(c, a) {
    return a === undefined ? "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"
                           : "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  /* The sky for a given fractional hour, blended between bands. */
  function paletteAt(hour) {
    for (var i = 0; i < BANDS.length - 1; i++) {
      var a = BANDS[i], b = BANDS[i + 1];
      if (hour >= a.h && hour < b.h) {
        var t = (hour - a.h) / (b.h - a.h);
        // ease so the change lingers mid-band and moves quickly at the edges
        t = t * t * (3 - 2 * t);
        /* Backgrounds are near-black, so plain RGB is right for them; the
           saturated colours go round the hue wheel. */
        return { bg:  mix(a.bg, b.bg, t),
                 n1:  mixHsl(a.n1, b.n1, t),
                 n2:  mixHsl(a.n2, b.n2, t),
                 acc: mixHsl(a.acc, b.acc, t),
                 name: t < 0.5 ? a.name : b.name };
      }
    }
    var last = BANDS[0];
    return { bg: last.bg, n1: last.n1, n2: last.n2, acc: last.acc, name: last.name };
  }

  /* ==================================================================== */

  var cvs, ctx, W = 0, H = 0, DPR = 1;
  var stars = [], nebulae = [], shooting = [], drops = [];
  var mx = 0, my = 0, tx = 0, ty = 0;        // mouse target / smoothed
  var running = false, reduced = false, raf = 0;
  var weather = null;                        // 'rain' | 'snow' | null
  var pal = paletteAt(new Date().getHours());
  var t0 = performance.now();
  var opts = {};

  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    var area = W * H;
    // Density scales with the viewport, capped so phones stay smooth.
    var count = Math.min(opts.maxStars || 420, Math.round(area / 5200));

    stars = [];
    for (var i = 0; i < count; i++) {
      var depth = Math.random();                       // 0 = far, 1 = near
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: lerp(0.35, 1.5, depth * depth),
        a: lerp(0.18, 0.85, depth),
        depth: depth,
        tw: rand(0.4, 1.8),                            // twinkle speed
        ph: rand(0, Math.PI * 2)                       // twinkle phase
      });
    }

    nebulae = [];
    var nCount = W < 700 ? 3 : 5;
    for (var j = 0; j < nCount; j++) {
      nebulae.push({
        x: rand(-0.1, 1.1), y: rand(-0.15, 0.9),       // fractions of W/H
        r: rand(0.28, 0.62),                           // fraction of max(W,H)
        vx: rand(-0.004, 0.004), vy: rand(-0.002, 0.002),
        which: j % 2, a: rand(0.16, 0.34), depth: rand(0.1, 0.5)
      });
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cvs.clientWidth;
    H = cvs.clientHeight;
    cvs.width  = Math.round(W * DPR);
    cvs.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
    if (reduced) draw(0);                              // one static frame
  }

  /* ---- weather particles --------------------------------------------- */
  function seedDrops() {
    drops = [];
    if (!weather) return;
    var n = weather === "snow" ? 90 : 160;
    if (W < 700) n = Math.round(n * 0.55);
    for (var i = 0; i < n; i++) drops.push(newDrop(true));
  }

  function newDrop(initial) {
    return weather === "snow"
      ? { x: Math.random() * W, y: initial ? Math.random() * H : -10,
          r: rand(1, 2.6), vy: rand(14, 34), drift: rand(-14, 14), ph: rand(0, 6.3) }
      : { x: Math.random() * W, y: initial ? Math.random() * H : -20,
          len: rand(9, 22), vy: rand(420, 700), a: rand(0.12, 0.34) };
  }

  /* ---- draw ----------------------------------------------------------- */
  function draw(dt) {
    var now = performance.now();
    var el = (now - t0) / 1000;

    // smooth the pointer so parallax glides instead of snapping
    mx += (tx - mx) * 0.06;
    my += (ty - my) * 0.06;

    ctx.clearRect(0, 0, W, H);

    /* base wash */
    ctx.fillStyle = rgb(pal.bg);
    ctx.fillRect(0, 0, W, H);

    /* nebula clouds — additive, very soft */
    ctx.globalCompositeOperation = "lighter";
    var maxR = Math.max(W, H);
    for (var i = 0; i < nebulae.length; i++) {
      var n = nebulae[i];
      if (!reduced) { n.x += n.vx * dt; n.y += n.vy * dt; }
      if (n.x < -0.35) n.x = 1.35; if (n.x > 1.35) n.x = -0.35;
      if (n.y < -0.4)  n.y = 1.2;  if (n.y > 1.2)  n.y = -0.4;

      var cx = n.x * W - mx * 26 * n.depth;
      var cy = n.y * H - my * 26 * n.depth;
      var r  = n.r * maxR;
      var col = n.which ? pal.n2 : pal.n1;
      // gentle breathing so the sky is never completely static
      var pulse = reduced ? 1 : 1 + Math.sin(el * 0.18 + i) * 0.06;

      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * pulse);
      g.addColorStop(0,    rgb(col, n.a));
      g.addColorStop(0.45, rgb(col, n.a * 0.35));
      g.addColorStop(1,    rgb(col, 0));
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    /* stars — three parallax depths, each twinkling on its own phase */
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s];
      var tw = reduced ? 1 : 0.65 + Math.sin(el * st.tw + st.ph) * 0.35;
      var px = st.x - mx * 34 * st.depth;
      var py = st.y - my * 34 * st.depth;
      ctx.globalAlpha = st.a * tw;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, st.r, 0, 6.2832);
      ctx.fill();

      // the nearest stars get a soft bloom
      if (st.depth > 0.86) {
        ctx.globalAlpha = st.a * tw * 0.22;
        ctx.beginPath();
        ctx.arc(px, py, st.r * 3.4, 0, 6.2832);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    /* shooting stars */
    for (var k = shooting.length - 1; k >= 0; k--) {
      var sh = shooting[k];
      sh.p += dt / sh.life;
      if (sh.p >= 1) { shooting.splice(k, 1); continue; }
      var fade = Math.sin(sh.p * Math.PI);
      var hx = sh.x + sh.dx * sh.p, hy = sh.y + sh.dy * sh.p;
      var tlx = hx - sh.dx * 0.09, tly = hy - sh.dy * 0.09;
      var grd = ctx.createLinearGradient(tlx, tly, hx, hy);
      grd.addColorStop(0, rgb(pal.acc, 0));
      grd.addColorStop(1, rgb(pal.acc, 0.85 * fade));
      ctx.strokeStyle = grd;
      ctx.lineWidth = 1.7;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tlx, tly); ctx.lineTo(hx, hy); ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";

    /* weather */
    if (weather === "rain") {
      ctx.strokeStyle = "rgba(190,215,255,1)";
      ctx.lineWidth = 1;
      for (var d = 0; d < drops.length; d++) {
        var dr = drops[d];
        if (!reduced) dr.y += dr.vy * dt;
        if (dr.y > H + 20) { drops[d] = newDrop(false); continue; }
        ctx.globalAlpha = dr.a;
        ctx.beginPath();
        ctx.moveTo(dr.x, dr.y);
        ctx.lineTo(dr.x - 1.5, dr.y + dr.len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (weather === "snow") {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      for (var f = 0; f < drops.length; f++) {
        var fl = drops[f];
        if (!reduced) {
          fl.y += fl.vy * dt;
          fl.x += Math.sin(el * 0.7 + fl.ph) * fl.drift * dt;
        }
        if (fl.y > H + 8) { drops[f] = newDrop(false); continue; }
        ctx.globalAlpha = 0.45 + Math.sin(el + fl.ph) * 0.2;
        ctx.beginPath(); ctx.arc(fl.x, fl.y, fl.r, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    /* vignette keeps the text legible over a bright nebula */
    var vg = ctx.createRadialGradient(W * 0.5, H * 0.45, Math.min(W, H) * 0.25,
                                      W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  var last = 0;
  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, 0.05);      // clamp after a stall
    last = now;
    draw(dt);
    maybeShoot(dt);
    raf = requestAnimationFrame(frame);
  }

  var shootTimer = 6;
  function maybeShoot(dt) {
    if (reduced) return;
    shootTimer -= dt;
    if (shootTimer > 0) return;
    shootTimer = rand(7, 20);
    var fromLeft = Math.random() < 0.5;
    var dist = rand(W * 0.3, W * 0.62);
    shooting.push({
      x: fromLeft ? rand(-40, W * 0.45) : rand(W * 0.55, W + 40),
      y: rand(-20, H * 0.45),
      dx: (fromLeft ? 1 : -1) * dist,
      dy: dist * rand(0.28, 0.55),
      p: 0, life: rand(0.7, 1.3)
    });
  }

  /* ---- public -------------------------------------------------------- */
  return {
    paletteAt: paletteAt,

    init: function (canvas, options) {
      opts = options || {};
      cvs = canvas;
      ctx = cvs.getContext("2d", { alpha: false });

      reduced = window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      resize();
      window.addEventListener("resize", resize);

      if (!reduced && !opts.noParallax) {
        window.addEventListener("pointermove", function (e) {
          tx = (e.clientX / window.innerWidth  - 0.5) * 2;
          ty = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        // phones: tilt instead of pointer, when the device offers it
        window.addEventListener("deviceorientation", function (e) {
          if (e.gamma == null) return;
          tx = Math.max(-1, Math.min(1, e.gamma / 35));
          ty = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
        }, { passive: true });
      }

      // Don't burn battery painting a tab nobody is looking at.
      document.addEventListener("visibilitychange", function () {
        document.hidden ? this.pause() : this.play();
      }.bind(this));

      if (!reduced) this.play();
      return this;
    },

    play: function () {
      if (running || reduced) return;
      running = true; last = performance.now();
      raf = requestAnimationFrame(frame);
    },

    pause: function () {
      running = false;
      cancelAnimationFrame(raf);
    },

    /* Called once a minute by the clock so the sky tracks the real hour. */
    setHour: function (hour) {
      pal = paletteAt(hour);
      if (reduced) draw(0);
      return pal;
    },

    setWeather: function (kind) {
      if (kind === weather) return;
      weather = kind;
      seedDrops();
    },

    palette: function () { return pal; },
    reduced: function () { return reduced; }
  };
})();
