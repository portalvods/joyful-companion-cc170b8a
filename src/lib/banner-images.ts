// Banco de imagens mockado — picsum.photos com seed pra imagens estáveis por termo.

export type StockImage = { id: string; url: string; thumb: string; alt: string };

const THEMES: Record<string, string[]> = {
  futebol: ["stadium", "soccer", "football-pitch", "crowd", "goal", "grass"],
  luta: ["boxing-ring", "mma-cage", "fighter", "gym-fight", "spotlight", "arena-fight"],
  basquete: ["basketball-court", "basketball", "nba-arena", "hoop", "sneakers"],
  filme: ["cinema", "film-strip", "hollywood", "movie-poster", "spotlight-red"],
  serie: ["tv-series", "streaming", "binge", "screen-glow", "living-room"],
  video: ["youtube-studio", "camera-lens", "content-creator", "microphone", "backdrop"],
  logo: ["shield", "crest", "emblem", "badge", "monogram"],
};

export function searchStock(query: string, count = 12): StockImage[] {
  const q = query.trim().toLowerCase();
  let seeds: string[] = [];
  for (const [key, arr] of Object.entries(THEMES)) {
    if (q.includes(key)) seeds = arr;
  }
  if (!seeds.length) {
    seeds = [q || "sport", "arena", "spotlight", "smoke", "neon", "action", "crowd", "night-lights", "trophy", "champion", "cinema", "poster"];
  }
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

// Emblemas placeholder por nome de time/lutador — usa DiceBear shapes (estáveis, sem CORS)
export function logoFor(name: string): string {
  const seed = encodeURIComponent(name.trim().toLowerCase() || "team");
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundType=gradientLinear`;
}
