/* ==========================================================================
   SK HOME — LIVE
   Real data, fetched straight from the browser. Every endpoint here is
   keyless, CORS-open and free — no signup, no server, no secrets in the page.
   The one exception is search suggestions (see `suggest` below), which is
   proxied through this project's single small serverless function because
   no major engine's own suggest endpoint allows direct browser fetches.

   Everything is cached in localStorage and every call fails silently: if a
   feed is down or you're offline, its card just doesn't appear.
   ========================================================================== */
window.Live = (function () {
  "use strict";

  var C = (typeof CONFIG !== "undefined" && CONFIG) || {};

  /* ---- tiny cache ---------------------------------------------------- */
  function cache(key, ttlMin, fetcher) {
    var k = "skhome.live." + key;
    var hit = null;
    try { hit = JSON.parse(localStorage.getItem(k) || "null"); } catch (e) {}

    var fresh = hit && (Date.now() - hit.at < ttlMin * 60000);
    if (fresh) return Promise.resolve(hit.data);

    return fetcher()
      .then(function (data) {
        try { localStorage.setItem(k, JSON.stringify({ at: Date.now(), data: data })); } catch (e) {}
        return data;
      })
      .catch(function () {
        return hit ? hit.data : null;     // stale beats nothing
      });
  }

  function json(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  /* ====================================================================
     WEATHER — Open-Meteo. No key, no account, no location prompt.
     Returns current conditions plus a 12-hour temperature curve.
     ==================================================================== */
  var WMO = {
    0:["Clear","sun"], 1:["Mostly clear","sun"], 2:["Partly cloudy","cloud"], 3:["Overcast","cloud"],
    45:["Fog","cloud"], 48:["Rime fog","cloud"],
    51:["Drizzle","rain"], 53:["Drizzle","rain"], 55:["Drizzle","rain"],
    56:["Freezing drizzle","rain"], 57:["Freezing drizzle","rain"],
    61:["Light rain","rain"], 63:["Rain","rain"], 65:["Heavy rain","rain"],
    66:["Freezing rain","rain"], 67:["Freezing rain","rain"],
    71:["Snow","snow"], 73:["Snow","snow"], 75:["Heavy snow","snow"], 77:["Snow grains","snow"],
    80:["Showers","rain"], 81:["Showers","rain"], 82:["Heavy showers","rain"],
    85:["Snow showers","snow"], 86:["Snow showers","snow"],
    95:["Thunderstorm","storm"], 96:["Thunderstorm","storm"], 99:["Thunderstorm","storm"]
  };

  function weather() {
    var loc = C.location;
    if (!loc) return Promise.resolve(null);

    return cache("weather", 20, function () {
      var url = "https://api.open-meteo.com/v1/forecast"
        + "?latitude=" + encodeURIComponent(loc.lat)
        + "&longitude=" + encodeURIComponent(loc.lon)
        + "&current=temperature_2m,apparent_temperature,weather_code,is_day,relative_humidity_2m,wind_speed_10m"
        + "&hourly=temperature_2m,precipitation_probability"
        + "&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset"
        + "&forecast_days=2&timezone=auto"
        + (loc.units === "fahrenheit" ? "&temperature_unit=fahrenheit" : "");

      return json(url).then(function (j) {
        var meta = WMO[j.current.weather_code] || ["", "cloud"];
        // the next 12 hours, starting from the current hour
        var now = new Date();
        var idx = j.hourly.time.findIndex(function (t) { return new Date(t) >= now; });
        if (idx < 0) idx = 0;
        var hours = [];
        for (var i = idx; i < Math.min(idx + 12, j.hourly.time.length); i++) {
          hours.push({
            t: j.hourly.time[i].slice(11, 16),
            temp: j.hourly.temperature_2m[i],
            pop: j.hourly.precipitation_probability
                 ? j.hourly.precipitation_probability[i] : 0
          });
        }
        return {
          temp: j.current.temperature_2m,
          feels: j.current.apparent_temperature,
          humidity: j.current.relative_humidity_2m,
          wind: j.current.wind_speed_10m,
          isDay: !!j.current.is_day,
          code: j.current.weather_code,
          label: meta[0], kind: meta[1],
          max: j.daily.temperature_2m_max[0],
          min: j.daily.temperature_2m_min[0],
          sunrise: j.daily.sunrise[0].slice(11, 16),
          sunset:  j.daily.sunset[0].slice(11, 16),
          hours: hours,
          unit: loc.units === "fahrenheit" ? "°F" : "°C"
        };
      });
    });
  }

  /* ====================================================================
     GITHUB — public REST API. 60 requests/hour per IP, unauthenticated.
     Profile stats plus a 90-day activity heatmap built from public events.
     ==================================================================== */
  function github() {
    var user = C.github && C.github.user;
    if (!user) return Promise.resolve(null);

    /* Cache key bumped from "github" — the cached shape gained totalStars/
       longestStreak/topLanguage, and a stale pre-existing entry from before
       that change would otherwise render as literal "undefined" for up to
       30 minutes after this update ships. */
    return cache("github2", 30, function () {
      return Promise.all([
        json("https://api.github.com/users/" + encodeURIComponent(user)),
        json("https://api.github.com/users/" + encodeURIComponent(user) + "/events/public?per_page=100")
          .catch(function () { return []; }),
        json("https://api.github.com/users/" + encodeURIComponent(user) + "/repos?per_page=100&sort=pushed")
          .catch(function () { return []; })
      ]).then(function (res) {
        var u = res[0], events = res[1] || [], repos = res[2] || [];

        /* Bucket events by local day. The public events feed covers roughly
           the last 90 days, which is exactly the window we draw.          */
        var byDay = {};
        events.forEach(function (e) {
          var d = new Date(e.created_at);
          var key = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
          var weight = e.type === "PushEvent" && e.payload && e.payload.commits
                     ? e.payload.commits.length : 1;
          byDay[key] = (byDay[key] || 0) + weight;
        });

        var days = [], today = new Date();
        today.setHours(0, 0, 0, 0);
        for (var i = 89; i >= 0; i--) {
          var d = new Date(today);
          d.setDate(d.getDate() - i);
          var key = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
          days.push({ date: d.toISOString().slice(0, 10), count: byDay[key] || 0 });
        }

        /* Current streak, counting back from today (today may be empty
           and still not break a streak that ran through yesterday). */
        var streak = 0;
        for (var j = days.length - 1; j >= 0; j--) {
          if (days[j].count > 0) streak++;
          else if (j !== days.length - 1) break;
        }

        var recent = events.slice(0, 3).map(function (e) {
          var repo = e.repo ? e.repo.name.split("/").pop() : "";
          var verb = { PushEvent: "pushed to", CreateEvent: "created",
                       WatchEvent: "starred", ForkEvent: "forked",
                       PullRequestEvent: "PR on", IssuesEvent: "issue on",
                       IssueCommentEvent: "commented on",
                       PublicEvent: "open-sourced", ReleaseEvent: "released" }[e.type] || "touched";
          return { verb: verb, repo: repo, at: e.created_at };
        });

        /* Longest run of active days within the same 90-day window — not a
           true all-time streak (GitHub's public REST API can't give that
           without GraphQL + an auth token), so label it as scoped. */
        var longest = 0, run = 0;
        days.forEach(function (d) {
          run = d.count > 0 ? run + 1 : 0;
          if (run > longest) longest = run;
        });

        /* Top language + total stars — from one page of 100 repos sorted by
           recent push activity. Covers the overwhelming majority of users. */
        var totalStars = repos.reduce(function (a, r) { return a + (r.stargazers_count || 0); }, 0);
        var langCounts = {};
        repos.forEach(function (r) { if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1; });
        var topLanguage = Object.keys(langCounts).sort(function (a, b) { return langCounts[b] - langCounts[a]; })[0] || null;

        return {
          user: u.login, name: u.name, avatar: u.avatar_url,
          repos: u.public_repos, followers: u.followers, following: u.following,
          days: days, streak: streak, longestStreak: longest,
          totalStars: totalStars, topLanguage: topLanguage,
          total90: days.reduce(function (a, d) { return a + d.count; }, 0),
          recent: recent
        };
      });
    });
  }

  /* ====================================================================
     MARKETS — CoinGecko public API. Keyless, CORS-open, generous limits.
     Falls back to Binance's ticker (also keyless/CORS-open) if CoinGecko's
     free tier rate-limits (HTTP 429), rather than the card just going
     blank — Binance only quotes in USDT, so a fallback price gets one more
     hop through the currency converter above to land in the configured
     currency.
     ==================================================================== */
  var COIN_TO_BINANCE = {
    bitcoin: "BTC", ethereum: "ETH", solana: "SOL", cardano: "ADA",
    dogecoin: "DOGE", ripple: "XRP", polkadot: "DOT", litecoin: "LTC",
    binancecoin: "BNB", tron: "TRX", chainlink: "LINK",
    "matic-network": "MATIC", "avalanche-2": "AVAX"
  };

  function marketsBinanceFallback(cfg) {
    var vs = (cfg.currency || "inr").toUpperCase();
    return Promise.all(cfg.coins.map(function (c) {
      var sym = COIN_TO_BINANCE[c.id];
      if (!sym) return null; // no known mapping — this coin just doesn't appear
      return json("https://api.binance.com/api/v3/ticker/24hr?symbol=" + sym + "USDT")
        .then(function (t) {
          var usd = parseFloat(t.lastPrice), changePct = parseFloat(t.priceChangePercent);
          if (vs === "USD" || vs === "USDT")
            return { id: c.id, label: c.label || c.id, price: usd, change: changePct, currency: "USD" };
          return rate("USD", vs).then(function (r) {
            var price = r == null ? usd : usd * r;
            return { id: c.id, label: c.label || c.id, price: price,
                     change: changePct, currency: r == null ? "USD" : vs };
          });
        })
        .catch(function () { return null; });
    })).then(function (rows) { return rows.filter(Boolean); });
  }

  function markets() {
    var cfg = C.markets;
    if (!cfg || !cfg.coins || !cfg.coins.length) return Promise.resolve(null);

    return cache("markets", 10, function () {
      var ids = cfg.coins.map(function (c) { return c.id; }).join(",");
      var vs  = (cfg.currency || "inr").toLowerCase();
      var url = "https://api.coingecko.com/api/v3/simple/price?ids="
              + encodeURIComponent(ids) + "&vs_currencies=" + vs
              + "&include_24hr_change=true";

      return json(url).then(function (j) {
        return cfg.coins.map(function (c) {
          var row = j[c.id];
          if (!row) return null;
          return { id: c.id, label: c.label || c.id,
                   price: row[vs], change: row[vs + "_24h_change"],
                   currency: vs.toUpperCase() };
        }).filter(Boolean);
      }).catch(function () {
        return marketsBinanceFallback(cfg);
      });
    });
  }

  /* ====================================================================
     CURRENCY — Frankfurter. Keyless, CORS-open, ECB-sourced daily rates.
     Used by the inline search-bar converter ("10 usd to inr").
     ==================================================================== */
  function rate(from, to) {
    if (!from || !to) return Promise.resolve(null);
    var key = "rate-" + from.toLowerCase() + "-" + to.toLowerCase();
    return cache(key, 60, function () {
      var url = "https://api.frankfurter.dev/v1/latest?base=" + encodeURIComponent(from.toUpperCase())
               + "&symbols=" + encodeURIComponent(to.toUpperCase());
      return json(url).then(function (j) {
        return (j.rates && j.rates[to.toUpperCase()]) || null;
      });
    });
  }

  /* ====================================================================
     HACKER NEWS — Algolia's front-page endpoint. One request, no key.
     ==================================================================== */
  function hackernews() {
    if (!C.feeds || C.feeds.hackernews === false) return Promise.resolve(null);

    return cache("hn", 20, function () {
      return json("https://hn.algolia.com/api/v1/search?tags=front_page")
        .then(function (j) {
          return (j.hits || []).slice(0, 6).map(function (h) {
            return {
              title: h.title,
              url: h.url || ("https://news.ycombinator.com/item?id=" + h.objectID),
              points: h.points,
              comments: h.num_comments,
              discuss: "https://news.ycombinator.com/item?id=" + h.objectID
            };
          });
        });
    });
  }

  /* ====================================================================
     DEV.TO — dev.to's official public JSON API. Keyless, CORS-open. Unlike
     almost every other RSS/Atom feed tried for this project, this one
     actually sends Access-Control-Allow-Origin — most don't, so this is
     deliberately dev.to specifically, not a general "any feed URL" input.
     ==================================================================== */
  function devto() {
    if (!C.feeds || C.feeds.devto === false) return Promise.resolve(null);

    return cache("devto", 20, function () {
      return json("https://dev.to/api/articles?per_page=6")
        .then(function (arts) {
          return (arts || []).map(function (a) {
            return {
              title: a.title,
              url: a.url,
              points: a.public_reactions_count,
              comments: a.comments_count
            };
          });
        });
    });
  }

  /* ====================================================================
     SEARCH SUGGESTIONS — proxied server-side by /api/suggest (this project's
     one and only backend piece — see api/suggest.js). Every other feed on
     this page calls a CORS-open public API directly; this is the exception,
     because Google/Bing/DuckDuckGo's own suggest endpoints all block direct
     browser fetches (confirmed by hand: no Access-Control-Allow-Origin on
     any of them).

     On the real deployed site (http/https) this always calls a RELATIVE
     /api/suggest — same-origin, so it needs no CSP connect-src entry and
     works on every Vercel preview URL automatically without config. The
     Chrome extension (chrome-extension://) and file:// testing have no
     /api/ route at all, so they fall back to the absolute
     CONFIG.search.suggestEndpoint instead (api/suggest.js also sets
     Access-Control-Allow-Origin: * for exactly this cross-origin case).
     ==================================================================== */
  function suggest(query) {
    if (!query) return Promise.resolve([]);
    var cfg = C.search && "suggestEndpoint" in C.search ? C.search.suggestEndpoint : undefined;
    if (cfg === null) return Promise.resolve([]);   // explicit kill switch, honored everywhere
    var web = location.protocol === "http:" || location.protocol === "https:";
    var ep = web ? "/api/suggest" : cfg;
    if (!ep) return Promise.resolve([]);
    return fetch(ep + "?q=" + encodeURIComponent(query))
      .then(function (r) { return r.json(); })
      .then(function (d) { return (d && d.suggestions) || []; })
      .catch(function () { return []; });
  }

  /* ====================================================================
     ON THIS DAY — Wikipedia's REST API. Keyless, CORS-open. One fact,
     picked deterministically from today's date so it's stable within the
     day and doesn't flicker between re-renders.
     ==================================================================== */
  function onThisDay() {
    if (!C.feeds || C.feeds.onThisDay === false) return Promise.resolve(null);

    var now = new Date();
    var mm = String(now.getMonth() + 1).padStart(2, "0");
    var dd = String(now.getDate()).padStart(2, "0");

    /* Cache key includes the date, not just a fixed "otd" — otherwise a
       12-hour TTL means opening the page at 11pm shows yesterday's fact
       until 11am the next morning. A per-day key makes it self-expiring
       at midnight instead. */
    return cache("otd-" + mm + dd, 1440, function () {
      return json("https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/" + mm + "/" + dd)
        .then(function (j) {
          var items = j.selected || [];
          if (!items.length) return null;
          // Stable within the day, no flicker — a plain function of the
          // calendar date is all "deterministic per day" needs here.
          var pick = items[(now.getMonth() * 31 + now.getDate()) % items.length];
          return { text: pick.text, year: pick.year };
        });
    });
  }

  /* ====================================================================
     What is genuinely NOT possible from a static page, so we don't fake it:

     · Gmail unread count  — needs OAuth and a server to hold the token.
     · Google Calendar     — the ICS feed blocks cross-origin browser reads.
     · Spotify now-playing — needs OAuth.

     Each would need a backend holding your credentials. If you want them,
     Vercel serverless functions in an /api folder are the small next step;
     README has a note on it.
     ==================================================================== */

  return {
    weather: weather,
    github: github,
    markets: markets,
    hackernews: hackernews,
    devto: devto,
    rate: rate,
    suggest: suggest,
    onThisDay: onThisDay,
    WMO: WMO
  };
})();
