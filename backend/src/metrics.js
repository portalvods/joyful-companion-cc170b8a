import si from "systeminformation";
import { config } from "./config.js";
import fs from "node:fs";
import { getActiveCount } from "./downloader.js";

let lastNet = { rx: 0, tx: 0, ts: Date.now() };

export async function getMetrics() {
  const [cpu, mem, fs_, net] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
  ]);

  // Disco: prioriza o filesystem que contém o MEDIA_DIR
  let disk = fs_.find((d) => config.mediaDir.startsWith(d.mount)) || fs_[0];
  if (!disk) disk = { size: 0, used: 0, available: 0 };

  // Rede: MB/s desde a última chamada
  const now = Date.now();
  const total = net.reduce((a, n) => ({ rx: a.rx + n.rx_bytes, tx: a.tx + n.tx_bytes }), { rx: 0, tx: 0 });
  const dt = Math.max(1, (now - lastNet.ts) / 1000);
  const rxMBs = ((total.rx - lastNet.rx) / dt) / (1024 * 1024);
  lastNet = { ...total, ts: now };

  return {
    ts: now,
    cpu: {
      pct: Math.round(cpu.currentLoad * 10) / 10,
      cores: cpu.cpus?.length ?? 0,
    },
    ram: {
      pct: Math.round((mem.active / mem.total) * 1000) / 10,
      used_gb: +(mem.active / 1e9).toFixed(2),
      total_gb: +(mem.total / 1e9).toFixed(2),
    },
    disk: {
      pct: disk.size ? Math.round((disk.used / disk.size) * 1000) / 10 : 0,
      used_tb: +(disk.used / 1e12).toFixed(2),
      total_tb: +(disk.size / 1e12).toFixed(2),
      free_tb: +(disk.available / 1e12).toFixed(2),
      mount: disk.mount,
    },
    net_mbs: Math.max(0, +rxMBs.toFixed(2)),
    active_downloads: getActiveCount(),
  };
}
