// Parser M3U/M3U-Plus simples e tolerante
// Retorna itens { external_id, title, kind, category, url }
// Ignora canais ao vivo — só importa VOD (filmes/séries).

const SERIES_HINTS = /S\d{1,2}\s?E\d{1,2}|Season\s?\d+|Temporada/i;

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

// Retorna "series" | "movie" | null (null = canal ao vivo / desconhecido, ignora)
function detectKind({ title, category, url }) {
  const cat = String(category || "");
  const t = `${title} ${cat}`;
  const u = String(url || "").toLowerCase();

  // Padrão Xtream: URL indica o tipo
  if (/\/series\//.test(u)) return "series";
  if (/\/movie\//.test(u)) return "movie";

  // Streams ao vivo
  const isLive = /\/live\//.test(u) || /\.(m3u8|ts)(\?|$)/i.test(u);

  if (SERIES_HINTS.test(t)) return "series";
  if (/s[eé]rie|series|tv\s?shows?|temporada|anime|novela|desenho/i.test(cat)) return "series";
  if (/film|movie|vod|cinema|lan[çc]amento|cole[çc]/i.test(cat)) return "movie";

  // Categorias típicas de canais ao vivo → ignora
  if (/canal|canais|live|ao\s?vivo|esporte|not[ií]cia|abertos?|infantil|religios|music|adult|24h|documentar|r[aá]dio/i.test(cat)) return null;

  if (isLive) return null;
  // Sem pistas: não importa (evita poluir com categorias sem sentido)
  return null;
}
