import type { TemplateDef, BannerContent, BannerElement, BannerBackground } from "./banner-types";

const genId = (() => { let i = 0; return (p = "el") => `${p}-${++i}`; })();

function makeTitle(text: string, opts: Partial<BannerElement> = {}): BannerElement {
  return {
    id: genId("t"), kind: "text", x: 8, y: 20, w: 84, h: 20,
    text, role: "title",
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 96, fontWeight: 700, color: "#ffffff", align: "left",
    ...opts,
  };
}
function makeSubtitle(text: string, opts: Partial<BannerElement> = {}): BannerElement {
  return {
    id: genId("s"), kind: "text", x: 8, y: 46, w: 84, h: 10,
    text, role: "subtitle",
    fontFamily: "'Inter', sans-serif",
    fontSize: 28, fontWeight: 500, color: "#ffffff", align: "left",
    ...opts,
  };
}
function makeCta(text: string, opts: Partial<BannerElement> = {}): BannerElement {
  return {
    id: genId("c"), kind: "text", x: 8, y: 82, w: 36, h: 10,
    text, role: "cta",
    fontFamily: "'Inter', sans-serif",
    fontSize: 24, fontWeight: 700, color: "#0f172a", align: "center",
    ...opts,
  };
}
function makeCtaBg(opts: Partial<BannerElement> = {}): BannerElement {
  return {
    id: genId("cbg"), kind: "shape", shape: "pill",
    x: 8, y: 82, w: 36, h: 10, bg: "#ffffff", radius: 999,
    ...opts,
  };
}
function makeCoupon(text: string, opts: Partial<BannerElement> = {}): BannerElement {
  return {
    id: genId("cp"), kind: "text", x: 50, y: 82, w: 42, h: 8,
    text: `CUPOM: ${text}`, role: "coupon",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 22, fontWeight: 700, color: "#ffffff", align: "left",
    ...opts,
  };
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "gradient-bold",
    name: "Gradiente Bold",
    category: "ecommerce",
    format: "square",
    thumbColors: ["#7c3aed", "#3b82f6"],
    build: (c: BannerContent) => ({
      background: { type: "gradient", from: "#7c3aed", to: "#2563eb", angle: 135 },
      elements: [
        makeTitle(c.title ?? "SEU TÍTULO", { y: 18, fontSize: 120 }),
        makeSubtitle(c.subtitle ?? "Subtítulo aqui", { y: 52 }),
        ...(c.cta ? [makeCtaBg(), makeCta(c.cta)] : []),
        ...(c.coupon ? [makeCoupon(c.coupon)] : []),
      ],
    }),
  },
  {
    id: "sunset-promo",
    name: "Sunset Promo",
    category: "ecommerce",
    format: "square",
    thumbColors: ["#f43f5e", "#f59e0b"],
    build: (c: BannerContent) => ({
      background: { type: "gradient", from: "#f43f5e", to: "#f59e0b", angle: 160 },
      elements: [
        makeTitle(c.title ?? "MEGA OFERTA", { y: 22, fontSize: 130, color: "#fff8f0" }),
        makeSubtitle(c.subtitle ?? "Desconto especial", { y: 58, color: "#fff8f0" }),
        ...(c.cta ? [makeCtaBg({ bg: "#0f172a" }), makeCta(c.cta, { color: "#fff8f0" })] : []),
        ...(c.coupon ? [makeCoupon(c.coupon, { color: "#fff8f0" })] : []),
      ],
    }),
  },
  {
    id: "dark-luxury",
    name: "Dark Luxury",
    category: "corporativo",
    format: "square",
    thumbColors: ["#0f172a", "#c9a84c"],
    build: (c: BannerContent) => ({
      background: { type: "gradient", from: "#0b0f1a", to: "#1e293b", angle: 180 },
      elements: [
        makeTitle(c.title ?? "APRESENTAMOS", {
          y: 30, fontSize: 110, color: "#c9a84c",
          fontFamily: "'Playfair Display', serif", fontWeight: 900, align: "center",
        }),
        makeSubtitle(c.subtitle ?? "Experiência premium", {
          y: 56, align: "center", color: "#e5e7eb",
        }),
        ...(c.cta ? [
          makeCtaBg({ x: 32, w: 36, bg: "#c9a84c" }),
          makeCta(c.cta, { x: 32, color: "#0b0f1a" }),
        ] : []),
      ],
    }),
  },
  {
    id: "story-vertical",
    name: "Story Vertical",
    category: "social",
    format: "story",
    thumbColors: ["#10b981", "#06b6d4"],
    build: (c: BannerContent) => ({
      background: { type: "gradient", from: "#0f766e", to: "#0ea5e9", angle: 200 },
      elements: [
        makeTitle(c.title ?? "NOVIDADE", { y: 30, fontSize: 140, align: "center", x: 6, w: 88 }),
        makeSubtitle(c.subtitle ?? "Confira agora", { y: 46, align: "center", x: 6, w: 88 }),
        ...(c.cta ? [
          makeCtaBg({ x: 20, y: 82, w: 60, h: 6 }),
          makeCta(c.cta, { x: 20, y: 82, w: 60, h: 6, fontSize: 32 }),
        ] : []),
        ...(c.coupon ? [makeCoupon(c.coupon, { x: 6, y: 90, w: 88, align: "center", fontSize: 28 })] : []),
      ],
    }),
  },
  {
    id: "web-banner",
    name: "Banner Web",
    category: "ecommerce",
    format: "web",
    thumbColors: ["#1e40af", "#8b5cf6"],
    build: (c: BannerContent) => ({
      background: { type: "gradient", from: "#1e293b", to: "#7c3aed", angle: 90 },
      elements: [
        makeTitle(c.title ?? "OFERTA RELÂMPAGO", { x: 5, y: 20, w: 60, fontSize: 90 }),
        makeSubtitle(c.subtitle ?? "Aproveite hoje", { x: 5, y: 55, w: 60, fontSize: 26 }),
        ...(c.cta ? [
          makeCtaBg({ x: 5, y: 72, w: 22, h: 18 }),
          makeCta(c.cta, { x: 5, y: 72, w: 22, h: 18, fontSize: 22 }),
        ] : []),
        ...(c.coupon ? [makeCoupon(c.coupon, { x: 32, y: 74, w: 30, h: 14, fontSize: 22 })] : []),
      ],
    }),
  },
  {
    id: "event-poster",
    name: "Evento Neon",
    category: "eventos",
    format: "portrait",
    thumbColors: ["#ec4899", "#8b5cf6"],
    build: (c: BannerContent) => ({
      background: { type: "gradient", from: "#4c1d95", to: "#db2777", angle: 220 },
      elements: [
        makeTitle(c.title ?? "GRANDE EVENTO", {
          y: 20, fontSize: 130, align: "center", x: 6, w: 88, color: "#fdf4ff",
        }),
        makeSubtitle(c.subtitle ?? "Não perca", {
          y: 40, align: "center", x: 6, w: 88, color: "#fdf4ff",
        }),
        ...(c.cta ? [
          makeCtaBg({ x: 25, y: 78, w: 50, h: 8, bg: "#fdf4ff" }),
          makeCta(c.cta, { x: 25, y: 78, w: 50, h: 8, color: "#4c1d95", fontSize: 26 }),
        ] : []),
      ],
    }),
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    category: "corporativo",
    format: "square",
    thumbColors: ["#ffffff", "#0f172a"],
    build: (c: BannerContent) => ({
      background: { type: "solid", color: "#f8fafc" },
      elements: [
        makeTitle(c.title ?? "SIMPLES ASSIM", {
          y: 30, fontSize: 110, color: "#0f172a",
          fontFamily: "'Playfair Display', serif", fontWeight: 900,
        }),
        makeSubtitle(c.subtitle ?? "Menos é mais", { y: 60, color: "#475569" }),
        ...(c.cta ? [
          makeCtaBg({ bg: "#0f172a" }),
          makeCta(c.cta, { color: "#f8fafc" }),
        ] : []),
        ...(c.coupon ? [makeCoupon(c.coupon, { color: "#0f172a" })] : []),
      ],
    }),
  },
  {
    id: "corporate-split",
    name: "Corporate Split",
    category: "corporativo",
    format: "web",
    thumbColors: ["#0891b2", "#0f172a"],
    build: (c: BannerContent) => ({
      background: { type: "gradient", from: "#0f172a", to: "#0891b2", angle: 120 },
      elements: [
        makeTitle(c.title ?? "SOLUÇÃO INTELIGENTE", { x: 5, y: 25, w: 55, fontSize: 78 }),
        makeSubtitle(c.subtitle ?? "Para sua empresa", { x: 5, y: 55, w: 55, fontSize: 22 }),
        ...(c.cta ? [
          makeCtaBg({ x: 5, y: 72, w: 20, h: 18, bg: "#22d3ee" }),
          makeCta(c.cta, { x: 5, y: 72, w: 20, h: 18, color: "#0f172a" }),
        ] : []),
      ],
    }),
  },
];

export function applyTemplate(t: TemplateDef, content: BannerContent) {
  return t.build(content);
}
