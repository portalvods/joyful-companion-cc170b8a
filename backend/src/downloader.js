// Fila de downloads usando ffmpeg
// Mantém N downloads simultâneos, emite progresso via EventEmitter

import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { EventEmitter } from "node:events";
import { db, log } from "./db.js";
import { config } from "./config.js";

export const downloadEvents = new EventEmitter();

const active = new Map(); // id -> { proc, sizeBytes }

function safeName(s) {
  return s.replace(/[^\w.\- ]+/g, "_").slice(0, 180);
}

function targetPath(item) {
  const dir = item.kind === "series" ? config.seriesDir : config.moviesDir;
  const catDir = path.join(dir, safeName(item.category || "Sem categoria"));
  fs.mkdirSync(catDir, { recursive: true });
  const ext = guessExt(item.url);
  return path.join(catDir, safeName(item.title) + ext);
}

function guessExt(url) {
  const clean = url.split("?")[0].toLowerCase();
  for (const e of [".mp4", ".mkv", ".ts", ".avi", ".m3u8"]) if (clean.endsWith(e)) return e === ".m3u8" ? ".mp4" : e;
  return ".mp4";
}

export function startDownload(id) {
  const item = db.prepare("SELECT * FROM content WHERE id=?").get(id);
  if (!item) return;
  if (active.has(id)) return;
  if (item.status === "completed" || item.status === "downloading") return;

  const out = targetPath(item);
  db.prepare("UPDATE content SET status='downloading', file_path=?, error=NULL, updated_at=? WHERE id=?")
    .run(out, Date.now(), id);
  log("info", `Iniciando download: ${item.title}`);
  downloadEvents.emit("update", { id, status: "downloading", progress: 0 });

  // ffmpeg copia stream — funciona para HLS, .ts, .mp4 direto
  const args = [
    "-hide_banner", "-loglevel", "error", "-stats",
    "-y",
    "-user_agent", "Mozilla/5.0",
    "-i", item.url,
    "-c", "copy",
    "-bsf:a", "aac_adtstoasc",
    out,
  ];
  const proc = spawn(config.ffmpegPath, args);
  active.set(id, { proc });

  let lastEmit = 0;
  proc.stderr.on("data", (buf) => {
    const s = buf.toString();
    // ffmpeg -stats emite "size= 12345kB time=00:01:23.45 bitrate=..."
    const m = s.match(/size=\s*(\d+)kB/);
    if (m) {
      const bytes = Number(m[1]) * 1024;
      db.prepare("UPDATE content SET downloaded_bytes=?, updated_at=? WHERE id=?")
        .run(bytes, Date.now(), id);
      const now = Date.now();
      if (now - lastEmit > 800) {
        lastEmit = now;
        downloadEvents.emit("update", { id, downloaded_bytes: bytes });
      }
    }
  });

  proc.on("close", (code) => {
    active.delete(id);
    if (code === 0) {
      try {
        const size = fs.statSync(out).size;
        db.prepare("UPDATE content SET status='completed', size_bytes=?, downloaded_bytes=?, updated_at=? WHERE id=?")
          .run(size, size, Date.now(), id);
        log("success", `Concluído: ${item.title}`);
        downloadEvents.emit("update", { id, status: "completed", size_bytes: size, downloaded_bytes: size });
      } catch (e) {
        db.prepare("UPDATE content SET status='failed', error=?, updated_at=? WHERE id=?")
          .run(String(e), Date.now(), id);
        log("error", `Falha ao ler tamanho de ${item.title}: ${e.message}`);
      }
    } else {
      db.prepare("UPDATE content SET status='failed', error=?, updated_at=? WHERE id=?")
        .run(`ffmpeg exit ${code}`, Date.now(), id);
      log("error", `Falhou: ${item.title} (ffmpeg ${code})`);
      downloadEvents.emit("update", { id, status: "failed" });
    }
    pump();
  });

  proc.on("error", (err) => {
    active.delete(id);
    db.prepare("UPDATE content SET status='failed', error=?, updated_at=? WHERE id=?")
      .run(String(err), Date.now(), id);
    log("error", `ffmpeg erro: ${err.message}`);
    downloadEvents.emit("update", { id, status: "failed" });
    pump();
  });
}

export function cancelDownload(id) {
  const a = active.get(id);
  if (a) {
    a.proc.kill("SIGTERM");
    active.delete(id);
  }
  db.prepare("UPDATE content SET status='queued', updated_at=? WHERE id=?").run(Date.now(), id);
}

// Enfileira e chama pump
export function enqueue(ids) {
  const stmt = db.prepare("UPDATE content SET status='queued', updated_at=? WHERE id=? AND status NOT IN ('completed','downloading')");
  const now = Date.now();
  const tx = db.transaction((list) => list.forEach((id) => stmt.run(now, id)));
  tx(ids);
  pump();
}

function pump() {
  const slots = config.maxConcurrentDownloads - active.size;
  if (slots <= 0) return;
  const next = db.prepare("SELECT id FROM content WHERE status='queued' ORDER BY id ASC LIMIT ?").all(slots);
  for (const row of next) startDownload(row.id);
}

// Retoma downloads pendentes ao subir
export function resumeOnBoot() {
  db.prepare("UPDATE content SET status='queued' WHERE status='downloading'").run();
  pump();
}

export function getActiveCount() {
  return active.size;
}
