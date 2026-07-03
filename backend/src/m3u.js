// Parser M3U/M3U-Plus estrito: importa APENAS VOD (filmes/séries).
// Ignora canais ao vivo e qualquer coisa que não pareça VOD.
// Retorna: { external_id, title, kind, category, url, poster_url }

const SERIES_HINTS = /S\d{1,2}\s?E\d{1,2}|Season\s?\d+|Temporada/i;
const VOD_EXT = /\.(mp4|mkv|avi|mov|wmv|flv)(\?|$)/i;

export async function fetchAndParseM3U(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar M3U`);
  const text = await res.text();
  return parseM3U(text);
}

export function parseM3U(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith("#EXTINF")) {
      const attrs = {};
      for (const m of line.matchAll(/([\w-]+)="([^"]*)"/g)) attrs[m[1]] = m[2];
      const title = line.split(",").slice(1).join(",").trim() || attrs["tvg-name"] || "sem título";
      cur = {
        title,
        category: attrs["group-title"] || "Sem categoria",
        external_id: attrs["tvg-id"] || attrs["tvg-name"] || title,
        poster_url: attrs["tvg-logo"] || null,
      };
    } else if (!line.startsWith("#") && cur) {
      cur.url = line;
      const kind = detectKind(cur);
      if (kind) {
        cur.kind = kind;
        out.push(cur);
      }
      cur = null;
    }
  }
  return out;
}

// Retorna "series" | "movie" | null
// REGRA ESTRITA: só aceita VOD real. Canais ao vivo são sempre ignorados.
function detectKind({ title, category, url }) {
  const u = String(url || "").toLowerCase();
  const cat = String(category || "");
  const t = `${title} ${cat}`;

  // 1) Convenção Xtream: URL manda
  if (/\/series\//.test(u)) return "series";
  if (/\/movie\//.test(u)) return "movie";

  // 2) Sinais de LIVE => ignora sempre
  if (/\/live\//.test(u)) return null;
  if (/\.(m3u8|ts)(\?|$)/i.test(u)) return null;

  // 3) Sem convenção Xtream: exige extensão de arquivo VOD
  //    (mp4/mkv/avi/...) para não classificar canal como filme.
  if (!VOD_EXT.test(u)) return null;

  // 4) Com extensão VOD, decide entre série x filme
  if (SERIES_HINTS.test(t)) return "series";
  if (/s[eé]rie|series|tv\s?shows?|temporada|anime|novela|desenho/i.test(cat)) return "series";
  return "movie";
}
