export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) return res.status(400).json({ error: "Missing ?url=" });
  if (!/^https?:\/\//i.test(target)) return res.status(400).json({ error: "Invalid url" });

  const r = await fetch(target, {
    headers: { "user-agent": "Mozilla/5.0" },
  });

  res.status(r.status);
  res.setHeader(
    "content-type",
    r.headers.get("content-type") || "application/json"
  );

  const buf = Buffer.from(await r.arrayBuffer());
  res.send(buf);
}
