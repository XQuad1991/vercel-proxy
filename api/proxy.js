module.exports = async (req, res) => {
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

    const upstream = await fetch(target, {
      headers: { "user-agent": "Mozilla/5.0" },
    });

    res.statusCode = upstream.status;
    res.setHeader(
      "content-type",
      upstream.headers.get("content-type") || "application/json"
    );

    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.end(buf);
  } catch (e) {
    res.statusCode = 500;
    return res.json({ error: "Proxy failed", details: String(e?.message || e) });
  }
};
