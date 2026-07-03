// Parser M3U/M3U-Plus simples e tolerante
// Retorna itens { external_id, title, kind, category, url }

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
      // parse tvg-*="..." and group-title="..."
      for (const m of line.matchAll(/([\w-]+)="([^"]*)"/g)) attrs[m[1]] = m[2];
      const title = line.split(",").slice(1).join(",").trim() || attrs["tvg-name"] || "sem título";
      cur = {
        title,
        category: attrs["group-title"] || "Sem categoria",
        external_id: attrs["tvg-id"] || attrs["tvg-name"] || title,
      };
    } else if (!line.startsWith("#") && cur) {
      cur.url = line;
      cur.kind = detectKind(cur);
      out.push(cur);
      cur = null;
    }
  }
  return out;
}

function detectKind({ title, category }) {
  const t = `${title} ${category}`;
  if (SERIES_HINTS.test(t)) return "series";
  if (/serie|series|tv\s?shows?/i.test(category)) return "series";
  if (/film|movie|vod|cinema/i.test(category)) return "movie";
  // Fallback: sem episódio → filme
  return "movie";
}
