import type { TemplateDef, BannerContent, BannerElement, BannerBackground } from "./banner-types";
import { logoFor } from "./banner-images";

const genId = (() => { let i = 0; return (p = "el") => `${p}-${++i}`; })();

// ---------- helpers de elementos ----------

function txt(text: string, opts: Partial<BannerElement> = {}): BannerElement {
  return {
    id: genId("t"), kind: "text", x: 8, y: 20, w: 84, h: 12,
    text, color: "#ffffff", align: "left",
    fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 600,
    ...opts,
  };
}
function img(src: string, opts: Partial<BannerElement> = {}): BannerElement {
  return { id: genId("i"), kind: "image", x: 10, y: 30, w: 25, h: 40, src, ...opts };
}
function shape(opts: Partial<BannerElement> = {}): BannerElement {
  return {
    id: genId("s"), kind: "shape", shape: "rect",
    x: 0, y: 0, w: 100, h: 100, bg: "#000", ...opts,
  };
}

// ============================================================
// FUTEBOL / BASQUETE — matchup Team A vs Team B
// ============================================================

function matchupBuild(c: BannerContent, opts: {
  bg: BannerBackground;
  accent: string;
  vsColor?: string;
  titleColor?: string;
}) {
  const t1 = c.team1 ?? "Time A";
  const t2 = c.team2 ?? "Time B";
  const l1 = c.logo1 ?? logoFor(t1);
  const l2 = c.logo2 ?? logoFor(t2);
  const els: BannerElement[] = [
    // faixa superior — campeonato
    txt((c.championship ?? "CAMPEONATO").toUpperCase(), {
      x: 8, y: 6, w: 84, h: 6, align: "center", fontSize: 22,
      fontFamily: "'Bebas Neue', sans-serif", color: opts.accent, fontWeight: 700,
    }),
    ...(c.round ? [txt(c.round.toUpperCase(), {
      x: 8, y: 12, w: 84, h: 5, align: "center", fontSize: 16,
      color: "#e5e7eb", fontWeight: 500,
    })] : []),
    // logos
    img(l1, { x: 8, y: 30, w: 32, h: 32 }),
    img(l2, { x: 60, y: 30, w: 32, h: 32 }),
    // nomes
    txt(t1.toUpperCase(), {
      x: 4, y: 64, w: 40, h: 9, align: "center", fontSize: 44,
      fontFamily: "'Bebas Neue', sans-serif", color: opts.titleColor ?? "#ffffff", fontWeight: 900,
    }),
    txt(t2.toUpperCase(), {
      x: 56, y: 64, w: 40, h: 9, align: "center", fontSize: 44,
      fontFamily: "'Bebas Neue', sans-serif", color: opts.titleColor ?? "#ffffff", fontWeight: 900,
    }),
    // VS
    txt("VS", {
      x: 42, y: 40, w: 16, h: 14, align: "center", fontSize: 78,
      fontFamily: "'Bebas Neue', sans-serif", color: opts.vsColor ?? opts.accent, fontWeight: 900,
    }),
    // faixa inferior — data / hora / local
    shape({ x: 0, y: 82, w: 100, h: 18, bg: "rgba(0,0,0,0.55)", radius: 0 }),
    txt(`${c.date ?? "SÁBADO"} • ${c.time ?? "20H30"}`, {
      x: 4, y: 85, w: 92, h: 7, align: "center", fontSize: 30,
      fontFamily: "'Bebas Neue', sans-serif", color: "#ffffff", fontWeight: 700,
    }),
    ...(c.venue ? [txt(c.venue, {
      x: 4, y: 92, w: 92, h: 5, align: "center", fontSize: 18,
      color: "#e5e7eb", fontWeight: 500,
    })] : []),
  ];
  return { background: opts.bg, elements: els };
}

// ============================================================
// LUTA — fighter A vs fighter B
// ============================================================

function fightBuild(c: BannerContent, opts: {
  bg: BannerBackground; accent: string; titleColor?: string;
}) {
  const f1 = c.team1 ?? "Lutador A";
  const f2 = c.team2 ?? "Lutador B";
  const l1 = c.logo1 ?? logoFor(f1);
  const l2 = c.logo2 ?? logoFor(f2);
  const els: BannerElement[] = [
    // organização
    txt((c.championship ?? "UFC").toUpperCase(), {
      x: 8, y: 5, w: 84, h: 7, align: "center", fontSize: 40,
      fontFamily: "'Bebas Neue', sans-serif", color: opts.accent, fontWeight: 900,
    }),
    ...(c.round ? [txt(c.round.toUpperCase(), {
      x: 8, y: 13, w: 84, h: 4, align: "center", fontSize: 16, color: "#d1d5db",
    })] : []),
    // "half & half" — dois retratos
    img(l1, { x: 2, y: 22, w: 44, h: 50 }),
    img(l2, { x: 54, y: 22, w: 44, h: 50 }),
    // nomes gigantes
    txt(f1.toUpperCase(), {
      x: 2, y: 72, w: 44, h: 10, align: "center", fontSize: 46,
      fontFamily: "'Bebas Neue', sans-serif", color: opts.titleColor ?? "#ffffff", fontWeight: 900,
    }),
    txt(f2.toUpperCase(), {
      x: 54, y: 72, w: 44, h: 10, align: "center", fontSize: 46,
      fontFamily: "'Bebas Neue', sans-serif", color: opts.titleColor ?? "#ffffff", fontWeight: 900,
    }),
    // VS central grande
    txt("VS", {
      x: 42, y: 40, w: 16, h: 20, align: "center", fontSize: 130,
      fontFamily: "'Bebas Neue', sans-serif", color: opts.accent, fontWeight: 900,
    }),
    // data & local
    shape({ x: 0, y: 84, w: 100, h: 16, bg: "rgba(0,0,0,0.65)", radius: 0 }),
    txt(`${c.date ?? "SÁBADO"} • ${c.time ?? "23H"}`, {
      x: 4, y: 86, w: 92, h: 7, align: "center", fontSize: 32,
      fontFamily: "'Bebas Neue', sans-serif", color: "#ffffff", fontWeight: 700,
    }),
    ...(c.venue ? [txt(c.venue, {
      x: 4, y: 93, w: 92, h: 5, align: "center", fontSize: 18,
      color: "#d1d5db", fontWeight: 500,
    })] : []),
  ];
  return { background: opts.bg, elements: els };
}

// ============================================================
// FILME — poster
// ============================================================

function movieBuild(c: BannerContent, opts: {
  bg: BannerBackground; accent: string;
}) {
  const t = (c.title ?? "TÍTULO DO FILME").toUpperCase();
  const els: BannerElement[] = [
    // tag genero topo
    txt((c.genre ?? "Drama").toUpperCase(), {
      x: 8, y: 8, w: 84, h: 5, align: "center", fontSize: 18, color: opts.accent,
      fontWeight: 700,
    }),
    // título gigante
    txt(t, {
      x: 6, y: 42, w: 88, h: 22, align: "center", fontSize: 130,
      fontFamily: "'Bebas Neue', sans-serif", color: "#ffffff", fontWeight: 900,
    }),
    // tagline
    txt(c.tagline ?? "Uma nova era começa", {
      x: 8, y: 66, w: 84, h: 6, align: "center", fontSize: 24,
      fontFamily: "'Playfair Display', serif", color: "#e5e7eb", fontWeight: 500,
    }),
    // meta
    txt(
      [c.rating ? `★ ${c.rating}` : null, c.duration].filter(Boolean).join("  •  "),
      { x: 8, y: 78, w: 84, h: 5, align: "center", fontSize: 20, color: opts.accent, fontWeight: 700 }
    ),
    // cta
    shape({ x: 30, y: 88, w: 40, h: 7, bg: opts.accent, radius: 999 }),
    txt(c.cta ?? "ASSISTA AGORA", {
      x: 30, y: 88, w: 40, h: 7, align: "center", fontSize: 22,
      color: "#0f172a", fontWeight: 800,
    }),
  ];
  return { background: opts.bg, elements: els };
}

// ============================================================
// SÉRIE — cartaz com S01E01
// ============================================================

function seriesBuild(c: BannerContent, opts: {
  bg: BannerBackground; accent: string;
}) {
  const t = (c.title ?? "SÉRIE").toUpperCase();
  const s = c.season ?? "1";
  const e = c.episode ?? "01";
  const els: BannerElement[] = [
    // tag "SÉRIE ORIGINAL"
    shape({ x: 8, y: 8, w: 30, h: 5, bg: opts.accent, radius: 4 }),
    txt("SÉRIE ORIGINAL", {
      x: 8, y: 8, w: 30, h: 5, align: "center", fontSize: 16, color: "#0f172a", fontWeight: 800,
    }),
    // título
    txt(t, {
      x: 6, y: 30, w: 88, h: 18, align: "center", fontSize: 110,
      fontFamily: "'Bebas Neue', sans-serif", color: "#ffffff", fontWeight: 900,
    }),
    // S01E01
    txt(`T${String(s).padStart(2, "0")}  •  E${String(e).padStart(2, "0")}`, {
      x: 8, y: 52, w: 84, h: 6, align: "center", fontSize: 30,
      fontFamily: "'Space Grotesk', sans-serif", color: opts.accent, fontWeight: 800,
    }),
    // tagline
    txt(c.tagline ?? "Novos episódios", {
      x: 8, y: 62, w: 84, h: 6, align: "center", fontSize: 22, color: "#e5e7eb",
    }),
    // meta
    txt((c.genre ?? "Drama").toUpperCase(), {
      x: 8, y: 76, w: 84, h: 5, align: "center", fontSize: 18, color: "#cbd5e1", fontWeight: 600,
    }),
    // cta
    shape({ x: 25, y: 86, w: 50, h: 8, bg: opts.accent, radius: 999 }),
    txt(c.cta ?? "MARATONA JÁ", {
      x: 25, y: 86, w: 50, h: 8, align: "center", fontSize: 24,
      color: "#0f172a", fontWeight: 800,
    }),
  ];
  return { background: opts.bg, elements: els };
}

// ============================================================
// VÍDEO — thumb YouTube style
// ============================================================

function videoBuild(c: BannerContent, opts: {
  bg: BannerBackground; accent: string;
}) {
  const els: BannerElement[] = [
    // faixa lateral com canal
    ...(c.channel ? [
      shape({ x: 3, y: 4, w: 28, h: 8, bg: opts.accent, radius: 6 }),
      txt(c.channel, {
        x: 3, y: 4, w: 28, h: 8, align: "center", fontSize: 20, color: "#0f172a", fontWeight: 800,
      }),
    ] : []),
    // título ENORME
    txt((c.title ?? "TÍTULO DO VÍDEO").toUpperCase(), {
      x: 4, y: 20, w: 92, h: 45, align: "left", fontSize: 90,
      fontFamily: "'Bebas Neue', sans-serif", color: "#ffffff", fontWeight: 900,
    }),
    // subtítulo em destaque colorido
    ...(c.subtitle ? [txt(c.subtitle.toUpperCase(), {
      x: 4, y: 68, w: 92, h: 12, align: "left", fontSize: 44,
      fontFamily: "'Bebas Neue', sans-serif", color: opts.accent, fontWeight: 900,
    })] : []),
    // duração canto inferior direito
    ...(c.duration ? [
      shape({ x: 82, y: 88, w: 14, h: 8, bg: "rgba(0,0,0,0.85)", radius: 6 }),
      txt(c.duration, {
        x: 82, y: 88, w: 14, h: 8, align: "center", fontSize: 24,
        color: "#ffffff", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif",
      }),
    ] : []),
  ];
  return { background: opts.bg, elements: els };
}

// ============================================================
// TEMPLATES
// ============================================================

export const TEMPLATES: TemplateDef[] = [
  // ---------- FUTEBOL ----------
  {
    id: "futebol-classic",
    name: "Clássico Verde",
    category: "futebol", kind: "match", format: "square",
    thumbColors: ["#052e16", "#16a34a"],
    build: (c) => matchupBuild(c, {
      bg: { type: "gradient", from: "#052e16", to: "#166534", angle: 160 },
      accent: "#facc15",
    }),
  },
  {
    id: "futebol-night",
    name: "Noite de Jogo",
    category: "futebol", kind: "match", format: "portrait",
    thumbColors: ["#020617", "#0369a1"],
    build: (c) => matchupBuild(c, {
      bg: { type: "gradient", from: "#020617", to: "#0c4a6e", angle: 180 },
      accent: "#22d3ee",
    }),
  },
  {
    id: "futebol-story",
    name: "Story Torcida",
    category: "futebol", kind: "match", format: "story",
    thumbColors: ["#7f1d1d", "#0f172a"],
    build: (c) => matchupBuild(c, {
      bg: { type: "gradient", from: "#7f1d1d", to: "#0f172a", angle: 200 },
      accent: "#fbbf24",
    }),
  },
  // ---------- BASQUETE ----------
  {
    id: "basquete-court",
    name: "Court Orange",
    category: "basquete", kind: "match", format: "square",
    thumbColors: ["#7c2d12", "#f97316"],
    build: (c) => matchupBuild(c, {
      bg: { type: "gradient", from: "#7c2d12", to: "#f97316", angle: 150 },
      accent: "#0f172a", titleColor: "#fff7ed",
    }),
  },
  {
    id: "basquete-nba",
    name: "NBA Night",
    category: "basquete", kind: "match", format: "portrait",
    thumbColors: ["#1e3a8a", "#0f172a"],
    build: (c) => matchupBuild(c, {
      bg: { type: "gradient", from: "#1e3a8a", to: "#0f172a", angle: 180 },
      accent: "#f97316",
    }),
  },
  // ---------- LUTA ----------
  {
    id: "fight-blood",
    name: "Fight Night",
    category: "luta", kind: "fight", format: "portrait",
    thumbColors: ["#450a0a", "#dc2626"],
    build: (c) => fightBuild(c, {
      bg: { type: "gradient", from: "#450a0a", to: "#111827", angle: 180 },
      accent: "#ef4444",
    }),
  },
  {
    id: "fight-champion",
    name: "Champion Gold",
    category: "luta", kind: "fight", format: "square",
    thumbColors: ["#0f172a", "#c9a84c"],
    build: (c) => fightBuild(c, {
      bg: { type: "gradient", from: "#0b0f1a", to: "#3b2f0a", angle: 165 },
      accent: "#c9a84c",
    }),
  },
  {
    id: "fight-story",
    name: "Cage Story",
    category: "luta", kind: "fight", format: "story",
    thumbColors: ["#111827", "#7c2d12"],
    build: (c) => fightBuild(c, {
      bg: { type: "gradient", from: "#111827", to: "#7c2d12", angle: 200 },
      accent: "#f59e0b",
    }),
  },
  // ---------- FILMES ----------
  {
    id: "movie-noir",
    name: "Cinema Noir",
    category: "filme", kind: "movie", format: "portrait",
    thumbColors: ["#000000", "#dc2626"],
    build: (c) => movieBuild(c, {
      bg: { type: "gradient", from: "#000000", to: "#450a0a", angle: 180 },
      accent: "#ef4444",
    }),
  },
  {
    id: "movie-scifi",
    name: "Sci-Fi Neon",
    category: "filme", kind: "movie", format: "portrait",
    thumbColors: ["#1e1b4b", "#22d3ee"],
    build: (c) => movieBuild(c, {
      bg: { type: "gradient", from: "#1e1b4b", to: "#0e7490", angle: 200 },
      accent: "#22d3ee",
    }),
  },
  {
    id: "movie-gold",
    name: "Oscar Gold",
    category: "filme", kind: "movie", format: "square",
    thumbColors: ["#0f0a02", "#c9a84c"],
    build: (c) => movieBuild(c, {
      bg: { type: "gradient", from: "#0b0800", to: "#3b2f0a", angle: 180 },
      accent: "#eab308",
    }),
  },
  // ---------- SÉRIES ----------
  {
    id: "series-stream",
    name: "Streaming Dark",
    category: "serie", kind: "series", format: "portrait",
    thumbColors: ["#0f172a", "#ef4444"],
    build: (c) => seriesBuild(c, {
      bg: { type: "gradient", from: "#0f172a", to: "#450a0a", angle: 190 },
      accent: "#ef4444",
    }),
  },
  {
    id: "series-neon",
    name: "Série Neon",
    category: "serie", kind: "series", format: "square",
    thumbColors: ["#1e1b4b", "#a855f7"],
    build: (c) => seriesBuild(c, {
      bg: { type: "gradient", from: "#1e1b4b", to: "#701a75", angle: 180 },
      accent: "#c084fc",
    }),
  },
  // ---------- VÍDEOS (thumb) ----------
  {
    id: "video-red",
    name: "Thumb Red Alert",
    category: "video", kind: "video", format: "thumb",
    thumbColors: ["#dc2626", "#0f172a"],
    build: (c) => videoBuild(c, {
      bg: { type: "gradient", from: "#7f1d1d", to: "#0f172a", angle: 90 },
      accent: "#facc15",
    }),
  },
  {
    id: "video-yellow",
    name: "Thumb Amarelo",
    category: "video", kind: "video", format: "thumb",
    thumbColors: ["#facc15", "#0f172a"],
    build: (c) => videoBuild(c, {
      bg: { type: "gradient", from: "#0f172a", to: "#1e293b", angle: 135 },
      accent: "#facc15",
    }),
  },
  {
    id: "video-purple",
    name: "Thumb Twitch",
    category: "video", kind: "video", format: "thumb",
    thumbColors: ["#7c3aed", "#0f172a"],
    build: (c) => videoBuild(c, {
      bg: { type: "gradient", from: "#4c1d95", to: "#0f172a", angle: 135 },
      accent: "#a78bfa",
    }),
  },
];

export function applyTemplate(t: TemplateDef, content: BannerContent) {
  return t.build(content);
}
