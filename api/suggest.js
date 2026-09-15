/* SK Home — search-suggestion proxy.
   Google's/Bing's/DuckDuckGo's own suggest endpoints don't send CORS
   headers, so the browser can't call them directly — this runs server-side
   instead, where CORS doesn't apply, and the client calls this same-origin
   route. Always responds 200 with an (possibly empty) array, matching the
   rest of the project's "every live feed fails silently" rule. */
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
  // The Chrome extension (chrome-extension://) and file:// testing call this
  // as an absolute, cross-origin URL — without this it's silently blocked
  // there even though the fetch itself succeeds.
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(200).json({ suggestions: [] });

  const q = (req.query.q || "").toString().trim().slice(0, 100);
  if (!q) return res.status(200).json({ suggestions: [] });

  try {
    const r = await fetch(
      "https://suggestqueries.google.com/complete/search?client=firefox&q=" + encodeURIComponent(q)
    );
    const data = await r.json();
    const suggestions = Array.isArray(data[1]) ? data[1].slice(0, 8) : [];
    return res.status(200).json({ suggestions });
  } catch (e) {
    return res.status(200).json({ suggestions: [] });
  }
}
