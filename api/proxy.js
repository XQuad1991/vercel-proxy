module.exports = async (req, res) => {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-MAL-CLIENT-ID");

  // ✅ Preflight
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const target = req.query && req.query.url;
    if (!target) {
      res.statusCode = 400;
      return res.json({ error: "Missing ?url=" });
    }
    if (!/^https?:\/\//i.test(target)) {
      res.statusCode = 400;
      return res.json({ error: "Invalid url" });
    }

    // ✅ Forward MAL auth headers (if provided by client)
    const headers = { "user-agent": "Mozilla/5.0" };
    if (req.headers["x-mal-client-id"]) headers["X-MAL-CLIENT-ID"] = req.headers["x-mal-client-id"];
    if (req.headers["authorization"]) headers["Authorization"] = req.headers["authorization"];

    const upstream = await fetch(target, { headers });

    res.statusCode = upstream.status;
    res.setHeader("content-type", upstream.headers.get("content-type") || "application/json");

    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.end(buf);
  } catch (e) {
    res.statusCode = 500;
    return res.json({ error: "Proxy failed", details: String(e?.message || e) });
  }
};
