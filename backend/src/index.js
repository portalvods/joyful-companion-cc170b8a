import express from "express";
import cors from "cors";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { WebSocketServer } from "ws";
import cron from "node-cron";

import { config } from "./config.js";
import { db, log, getAllSettings, getSetting, setSetting } from "./db.js";
import { fetchAndParseM3U } from "./m3u.js";
import { enqueue, cancelDownload, resumeOnBoot, downloadEvents } from "./downloader.js";
import { getMetrics } from "./metrics.js";
import { authMiddleware, signToken } from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---- Auth ----
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === config.adminUser && password === config.adminPassword) {
    return res.json({ token: signToken(), user: { username } });
  }
  res.status(401).json({ error: "invalid_credentials" });
});

// ---- Settings ----
app.get("/api/settings", authMiddleware, (_req, res) => {
  const s = getAllSettings();
  res.json({
    m3u_url: s.m3u_url,
    rental_enabled: s.rental_enabled === "1",
    rental_domain: s.rental_domain,
    rental_http_port: s.rental_http_port,
    rental_https_port: s.rental_https_port,
    cron_schedule: s.cron_schedule,
    cron_enabled: s.cron_enabled === "1",
    auto_download: s.auto_download === "1",
    max_concurrent: config.maxConcurrentDownloads,
    stream_public_url: config.streamPublicUrl,
  });
});

app.put("/api/settings", authMiddleware, (req, res) => {
  const allowed = ["m3u_url","rental_enabled","rental_domain","rental_http_port","rental_https_port","cron_schedule","cron_enabled","auto_download"];
  for (const k of allowed) {
    if (k in req.body) {
      const v = typeof req.body[k] === "boolean" ? (req.body[k] ? "1" : "0") : String(req.body[k]);
      setSetting(k, v);
    }
  }
  scheduleCron();
  res.json({ ok: true });
});

// ---- M3U ----
app.post("/api/m3u/test", authMiddleware, async (req, res) => {
  const url = (req.body?.url) || getSetting("m3u_url");
  if (!url) return res.status(400).json({ error: "no_url" });
  try {
    const items = await fetchAndParseM3U(url);
    const categories = [...new Set(items.map((i) => i.category))].sort();
    res.json({ ok: true, total: items.length, categories });
  } catch (e) {
    log("error", `Teste M3U falhou: ${e.message}`);
    res.status(502).json({ error: e.message });
  }
});

app.post("/api/m3u/sync", authMiddleware, async (_req, res) => {
  try { const r = await runSync(); res.json(r); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

async function runSync() {
  const url = getSetting("m3u_url");
  if (!url) throw new Error("M3U URL não configurada");
  const runId = db.prepare("INSERT INTO sync_runs(started_at,status) VALUES(?,'running')").run(Date.now()).lastInsertRowid;
  log("info", "Sincronização iniciada");
  try {
    const items = await fetchAndParseM3U(url);
    let added = 0, updated = 0;
    const now = Date.now();
    const insert = db.prepare(`INSERT INTO content(external_id,title,kind,category,url,poster_url,status,discovered_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?)`);
    const existing = db.prepare("SELECT id, kind FROM content WHERE external_id=?");
    const upd = db.prepare("UPDATE content SET title=?,kind=?,category=?,url=?,poster_url=?,updated_at=? WHERE external_id=?");
    const autoDl = getSetting("auto_download") === "1";
    const status = autoDl ? "queued" : "pending";
    const newIds = [];
    let removed = 0;
    const tx = db.transaction(() => {
      const seen = new Set();
      for (const it of items) {
        seen.add(it.external_id);
        const ex = existing.get(it.external_id);
        if (ex) { upd.run(it.title, it.kind, it.category, it.url, it.poster_url ?? null, now, it.external_id); updated++; }
        else {
          const info = insert.run(it.external_id, it.title, it.kind, it.category, it.url, it.poster_url ?? null, status, now, now);
          added++;
          if (autoDl) newIds.push(info.lastInsertRowid);
        }
      }
      // Remove itens que não estão mais na fonte VOD e ainda NÃO foram baixados.
      // Mantém sempre 'completed' e 'downloading' pra não sumir com arquivos do usuário.
      const stale = db.prepare(
        "SELECT id, external_id FROM content WHERE status IN ('queued','pending','failed')"
      ).all();
      const del = db.prepare("DELETE FROM content WHERE id=?");
      for (const row of stale) {
        if (!seen.has(row.external_id)) { del.run(row.id); removed++; }
      }
    });
    tx();
    if (autoDl && newIds.length) enqueue(newIds);

    db.prepare("UPDATE sync_runs SET finished_at=?, added=?, updated=?, status='ok' WHERE id=?").run(Date.now(), added, updated, runId);
    log("success", `Sincronização OK: +${added} novos, ${updated} atualizados, -${removed} removidos`);
    return { added, updated, removed, total: items.length };

  } catch (e) {
    db.prepare("UPDATE sync_runs SET finished_at=?, status='error', error=? WHERE id=?").run(Date.now(), String(e), runId);
    log("error", `Sync falhou: ${e.message}`);
    throw e;
  }
}

// ---- Content ----
app.get("/api/content", authMiddleware, (req, res) => {
  const { kind, category, status, q, limit = 500 } = req.query;
  const where = [], params = [];
  if (kind) { where.push("kind=?"); params.push(kind); }
  if (category && category !== "Todas") { where.push("category=?"); params.push(category); }
  if (status && status !== "all") { where.push("status=?"); params.push(status); }
  if (q) { where.push("title LIKE ?"); params.push(`%${q}%`); }
  const sql = `SELECT * FROM content ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC LIMIT ?`;
  params.push(Number(limit));
  res.json(db.prepare(sql).all(...params));
});

app.get("/api/content/categories", authMiddleware, (req, res) => {
  const { kind } = req.query;
  const rows = kind
    ? db.prepare("SELECT DISTINCT category FROM content WHERE kind=? ORDER BY category").all(kind)
    : db.prepare("SELECT DISTINCT category FROM content ORDER BY category").all();
  res.json(rows.map((r) => r.category));
});

app.post("/api/content/download", authMiddleware, (req, res) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: "no_ids" });
  enqueue(ids.map(Number));
  res.json({ ok: true, queued: ids.length });
});

app.post("/api/content/download-all", authMiddleware, (req, res) => {
  const { kind, category, status } = req.body || {};
  const where = ["status IN ('pending','queued','failed')"], params = [];
  if (kind) { where.push("kind=?"); params.push(kind); }
  if (category && category !== "Todas") { where.push("category=?"); params.push(category); }
  if (status && status !== "all") { where[0] = "status=?"; params.unshift(status); }
  const ids = db.prepare(`SELECT id FROM content WHERE ${where.join(" AND ")}`).all(...params).map((r) => r.id);
  enqueue(ids);
  res.json({ ok: true, queued: ids.length });
});

app.post("/api/content/:id/cancel", authMiddleware, (req, res) => {
  cancelDownload(Number(req.params.id));
  res.json({ ok: true });
});

app.delete("/api/content/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const item = db.prepare("SELECT file_path FROM content WHERE id=?").get(id);
  if (item?.file_path) { try { fs.unlinkSync(item.file_path); } catch {} }
  db.prepare("DELETE FROM content WHERE id=?").run(id);
  res.json({ ok: true });
});

// ---- Stats / Metrics ----
app.get("/api/stats", authMiddleware, async (_req, res) => {
  const m = await getMetrics();
  const counts = db.prepare(`SELECT status, COUNT(*) as n FROM content GROUP BY status`).all()
    .reduce((a, r) => (a[r.status] = r.n, a), {});
  res.json({ metrics: m, counts });
});

app.get("/api/logs", authMiddleware, (_req, res) => {
  res.json(db.prepare("SELECT * FROM logs ORDER BY id DESC LIMIT 100").all());
});

app.get("/api/sync/history", authMiddleware, (_req, res) => {
  res.json(db.prepare("SELECT * FROM sync_runs ORDER BY id DESC LIMIT 30").all());
});

// ---- Streaming (modo aluguel) ----
// Serve arquivos baixados com Range requests. Coloque um Caddy/Nginx na frente para HTTPS.
app.get("/media/*", (req, res) => {
  const rel = decodeURIComponent(req.params[0] || "");
  const full = path.join(config.mediaDir, rel);
  if (!full.startsWith(config.mediaDir)) return res.status(400).end();
  fs.stat(full, (err, stat) => {
    if (err) return res.status(404).end();
    const range = req.headers.range;
    if (!range) {
      res.writeHead(200, { "Content-Length": stat.size, "Content-Type": "video/mp4" });
      return fs.createReadStream(full).pipe(res);
    }
    const [s, e] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(s, 10);
    const end = e ? parseInt(e, 10) : stat.size - 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(full, { start, end }).pipe(res);
  });
});

// ---- Frontend estático (SPA) ----
// Serve o build do Vite em ../dist se existir, com fallback pro index.html.
const FRONTEND_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../dist");
if (fs.existsSync(FRONTEND_DIR)) {
  app.use(express.static(FRONTEND_DIR));
  app.get(/^\/(?!api|media|ws).*/, (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "index.html"));
  });
  log("info", `Frontend estático: ${FRONTEND_DIR}`);
}



// ---- HTTP + WS ----
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", async (ws, req) => {
  // Auth simples via token na query
  const url = new URL(req.url, "http://x");
  const token = url.searchParams.get("token");
  const { verifyToken } = await import("./auth.js");
  if (!token || !verifyToken(token)) { ws.close(1008, "unauthorized"); return; }

  const send = (t, p) => { if (ws.readyState === 1) ws.send(JSON.stringify({ type: t, payload: p })); };
  send("hello", { ok: true });

  // Métricas periódicas
  const metricsTimer = setInterval(async () => {
    try { send("metrics", await getMetrics()); } catch {}
  }, 2000);

  // Progresso de downloads
  const onUpdate = (data) => send("content", data);
  downloadEvents.on("update", onUpdate);

  ws.on("close", () => { clearInterval(metricsTimer); downloadEvents.off("update", onUpdate); });
});

// ---- Cron ----
let cronTask = null;
function scheduleCron() {
  if (cronTask) { cronTask.stop(); cronTask = null; }
  const enabled = getSetting("cron_enabled") === "1";
  const expr = getSetting("cron_schedule") || "0 * * * *";
  if (!enabled || !cron.validate(expr)) return;
  cronTask = cron.schedule(expr, async () => {
    try { await runSync(); } catch (e) { log("error", `Cron sync falhou: ${e.message}`); }
  });
  log("info", `Cron agendado: ${expr}`);
}

// ---- Boot ----
resumeOnBoot();
scheduleCron();
server.listen(config.port, config.host, () => {
  log("info", `API pronta em http://${config.host}:${config.port}`);
});
