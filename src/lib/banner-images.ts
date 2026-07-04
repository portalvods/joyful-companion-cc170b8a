// Banco de imagens mockado (simula Unsplash) — usa picsum.photos com seed
// pra ter imagens estáveis por termo de busca.

export type StockImage = { id: string; url: string; thumb: string; alt: string };

const THEMES: Record<string, string[]> = {
  moda: ["fashion", "runway", "clothes", "style", "boutique"],
  tech: ["laptop", "device", "circuit", "abstract-tech", "screen"],
  comida: ["food", "restaurant", "coffee", "dessert", "pizza"],
  viagem: ["travel", "beach", "mountain", "city", "sunset"],
  fitness: ["gym", "workout", "run", "yoga", "sport"],
  festa: ["party", "concert", "lights", "night", "celebration"],
  natureza: ["forest", "ocean", "flowers", "green", "landscape"],
  business: ["office", "meeting", "team", "chart", "handshake"],
};

export function searchStock(query: string, count = 12): StockImage[] {
  const q = query.trim().toLowerCase();
  let seeds: string[] = [];
  for (const [key, arr] of Object.entries(THEMES)) {
    if (q.includes(key)) seeds = arr;
  }
  if (!seeds.length) seeds = [q || "banner", "abstract", "gradient", "color", "modern", "design", "creative", "bright", "minimal", "bokeh", "vibrant", "studio"];
  return Array.from({ length: count }).map((_, i) => {
    const seed = `${seeds[i % seeds.length]}-${i}-${q}`;
    return {
      id: seed,
      url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/1200`,
      thumb: `https://picsum.photos/seed/${encodeURIComponent(seed)}/240/240`,
      alt: `${q || "banner"} ${i + 1}`,
    };
  });
}

export function suggestFromContent(content: string): StockImage[] {
  return searchStock(content, 8);
}
