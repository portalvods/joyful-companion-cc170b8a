// Configuração via variáveis de ambiente (com defaults sensatos)
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

const DATA_DIR = process.env.DATA_DIR || "/var/lib/m3u-sync";
const MEDIA_DIR = process.env.MEDIA_DIR || "/mnt/media";
const MOVIES_DIR = path.join(MEDIA_DIR, "movies");
const SERIES_DIR = path.join(MEDIA_DIR, "series");

for (const d of [DATA_DIR, MEDIA_DIR, MOVIES_DIR, SERIES_DIR]) {
  fs.mkdirSync(d, { recursive: true });
}

export const config = {
  port: Number(process.env.PORT || 3001),
  host: process.env.HOST || "0.0.0.0",
  dataDir: DATA_DIR,
  dbFile: path.join(DATA_DIR, "m3u-sync.db"),
  mediaDir: MEDIA_DIR,
  moviesDir: MOVIES_DIR,
  seriesDir: SERIES_DIR,
  // Autenticação de usuário único
  adminUser: process.env.ADMIN_USER || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "changeme",
  jwtSecret: process.env.JWT_SECRET || "please-change-in-production-" + os.hostname(),
  // Downloads
  maxConcurrentDownloads: Number(process.env.MAX_CONCURRENT || 2),
  ffmpegPath: process.env.FFMPEG_PATH || "ffmpeg",
  // Streaming (modo aluguel)
  streamPublicUrl: process.env.STREAM_PUBLIC_URL || "", // ex: https://stream.meudominio.com
};
