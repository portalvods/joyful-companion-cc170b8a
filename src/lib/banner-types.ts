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
  role?: "title" | "subtitle" | "cta" | "coupon" | "body" | "vs" | "team" | "meta" | "tag";
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
  category: "social" | "web" | "story" | "thumb";
};

export type BannerBackground =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number }
  | { type: "image"; src: string; overlay?: string };

export type BannerKind = "match" | "fight" | "movie" | "series" | "video";

// Conteúdo unificado. Campos opcionais são usados dependendo do "kind".
export type BannerContent = {
  kind?: BannerKind;
  // esportes (match / fight)
  team1?: string;
  team2?: string;
  logo1?: string;
  logo2?: string;
  score1?: string;
  score2?: string;
  date?: string;
  time?: string;
  venue?: string;
  championship?: string;
  round?: string;
  // filme / série / vídeo
  title?: string;
  subtitle?: string;
  tagline?: string;
  rating?: string;
  genre?: string;
  duration?: string;
  season?: string;
  episode?: string;
  channel?: string;
  poster?: string;
  cta?: string;
};

export type TemplateCategory = "futebol" | "luta" | "basquete" | "filme" | "serie" | "video";

export type TemplateDef = {
  id: string;
  name: string;
  category: TemplateCategory;
  kind: BannerKind;
  format: string; // format id
  thumbColors: [string, string];
  build: (c: BannerContent) => { elements: BannerElement[]; background: BannerBackground };
};

export const FORMATS: BannerFormat[] = [
  { id: "square", label: "Quadrado 1080×1080", w: 1080, h: 1080, category: "social" },
  { id: "story", label: "Story 1080×1920", w: 1080, h: 1920, category: "story" },
  { id: "thumb", label: "Thumb YouTube 1280×720", w: 1280, h: 720, category: "thumb" },
  { id: "web", label: "Banner Web 1200×628", w: 1200, h: 628, category: "web" },
  { id: "landscape", label: "Paisagem 1920×1080", w: 1920, h: 1080, category: "web" },
  { id: "portrait", label: "Poster 1080×1350", w: 1080, h: 1350, category: "social" },
];
