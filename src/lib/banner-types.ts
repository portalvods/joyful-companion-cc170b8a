export type ElementKind = "text" | "image" | "shape";

export type BannerElement = {
  id: string;
  kind: ElementKind;
  x: number; // percentage of canvas 0..100
  y: number;
  w: number;
  h: number;
  rotation?: number;
  // text
  text?: string;
  role?: "title" | "subtitle" | "cta" | "coupon" | "body";
  fontFamily?: string;
  fontSize?: number; // px
  fontWeight?: number;
  color?: string;
  align?: "left" | "center" | "right";
  // image
  src?: string;
  // shape
  shape?: "rect" | "circle" | "pill";
  bg?: string;
  radius?: number;
};

export type BannerFormat = {
  id: string;
  label: string;
  w: number;
  h: number;
  category: "social" | "web" | "story";
};

export type BannerBackground =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number }
  | { type: "image"; src: string; overlay?: string };

export type BannerContent = {
  title?: string;
  subtitle?: string;
  cta?: string;
  coupon?: string;
  body?: string;
};

export type TemplateDef = {
  id: string;
  name: string;
  category: "ecommerce" | "social" | "eventos" | "corporativo";
  format: string; // format id
  thumbColors: [string, string];
  build: (c: BannerContent) => { elements: BannerElement[]; background: BannerBackground };
};

export const FORMATS: BannerFormat[] = [
  { id: "square", label: "Quadrado 1080×1080", w: 1080, h: 1080, category: "social" },
  { id: "story", label: "Story 1080×1920", w: 1080, h: 1920, category: "story" },
  { id: "web", label: "Banner Web 1200×628", w: 1200, h: 628, category: "web" },
  { id: "landscape", label: "Paisagem 1920×1080", w: 1920, h: 1080, category: "web" },
  { id: "portrait", label: "Retrato 1080×1350", w: 1080, h: 1350, category: "social" },
];
