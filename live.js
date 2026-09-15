/* ==========================================================================
   SK HOME — LIVE
   Real data, fetched straight from the browser. Every endpoint here is
   keyless, CORS-open and free — no signup, no server, no secrets in the page.

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

    return cache("github", 30, function () {
      return Promise.all([
        json("https://api.github.com/users/" + encodeURIComponent(user)),
        json("https://api.github.com/users/" + encodeURIComponent(user) + "/events/public?per_page=100")
          .catch(function () { return []; })
      ]).then(function (res) {
        var u = res[0], events = res[1] || [];

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

        return {
          user: u.login, name: u.name, avatar: u.avatar_url,
          repos: u.public_repos, followers: u.followers, following: u.following,
          days: days, streak: streak,
          total90: days.reduce(function (a, d) { return a + d.count; }, 0),
          recent: recent
        };
      });
    });
  }

  /* ====================================================================
     MARKETS — CoinGecko public API. Keyless, CORS-open, generous limits.
     ==================================================================== */
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
    WMO: WMO
  };
})();
