import Database from "better-sqlite3";
import { config } from "./config.js";

export const db = new Database(config.dbFile);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id TEXT UNIQUE,
  title TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('movie','series')),
  category TEXT,
  url TEXT NOT NULL,
  size_bytes INTEGER DEFAULT 0,
  downloaded_bytes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK(status IN ('queued','downloading','completed','failed','pending')),
  file_path TEXT,
  error TEXT,
  discovered_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_content_kind ON content(kind);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  level TEXT NOT NULL,
  message TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  added INTEGER DEFAULT 0,
  updated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running',
  error TEXT
);
`);

// Defaults
const setDefault = (k, v) => {
  const row = db.prepare("SELECT value FROM settings WHERE key=?").get(k);
  if (!row) db.prepare("INSERT INTO settings(key,value) VALUES(?,?)").run(k, v);
};
setDefault("m3u_url", "");
setDefault("rental_enabled", "0");
setDefault("rental_domain", "");
setDefault("rental_http_port", "8080");
setDefault("rental_https_port", "8443");
setDefault("cron_schedule", "0 * * * *"); // hora em hora
setDefault("cron_enabled", "1");
setDefault("auto_download", "0");

export function getSetting(key) {
  const r = db.prepare("SELECT value FROM settings WHERE key=?").get(key);
  return r ? r.value : null;
}
export function setSetting(key, value) {
  db.prepare(`INSERT INTO settings(key,value) VALUES(?,?)
              ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(key, String(value));
}
export function getAllSettings() {
  const rows = db.prepare("SELECT key,value FROM settings").all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function log(level, message) {
  db.prepare("INSERT INTO logs(ts,level,message) VALUES(?,?,?)").run(Date.now(), level, message);
  // trim
  db.prepare("DELETE FROM logs WHERE id IN (SELECT id FROM logs ORDER BY id DESC LIMIT -1 OFFSET 500)").run();
  console.log(`[${level}] ${message}`);
}
