export type Category = "futebol" | "nba" | "ufc" | "f1" | "esportes";

export type Game = {
  team1: string;
  team2: string;
  time?: string;
  channel?: string;
  championship?: string;
};

export type ColorVariant = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
};

export const COLOR_VARIANTS: ColorVariant[] = [
  { id: "blue", name: "Azul", primary: "#1e40af", secondary: "#3b82f6", accent: "#60a5fa" },
  { id: "purple", name: "Roxo", primary: "#6d28d9", secondary: "#8b5cf6", accent: "#a78bfa" },
  { id: "green", name: "Verde", primary: "#166534", secondary: "#22c55e", accent: "#4ade80" },
  { id: "red", name: "Vermelho", primary: "#991b1b", secondary: "#ef4444", accent: "#f87171" },
  { id: "yellow", name: "Amarelo", primary: "#a16207", secondary: "#eab308", accent: "#facc15" },
  { id: "gray", name: "Cinza", primary: "#1f2937", secondary: "#4b5563", accent: "#9ca3af" },
];

export type BannerModel = {
  id: string;
  name: string;
  category: Category;
  layout: "list" | "highlight" | "duel" | "grid";
  hasColors: boolean;
  aspectRatio: number; // width / height
};

export const MODELS: BannerModel[] = [
  // Futebol
  { id: "fut-01", name: "Modelo 1", category: "futebol", layout: "list", hasColors: false, aspectRatio: 1 },
  { id: "fut-02", name: "Modelo 2", category: "futebol", layout: "list", hasColors: false, aspectRatio: 1 },
  { id: "fut-04", name: "Modelo 4", category: "futebol", layout: "highlight", hasColors: false, aspectRatio: 1 },
  { id: "fut-05", name: "Modelo 5", category: "futebol", layout: "list", hasColors: true, aspectRatio: 1 },
  { id: "fut-06", name: "Modelo 6", category: "futebol", layout: "highlight", hasColors: true, aspectRatio: 1 },
  { id: "fut-07", name: "Modelo 7", category: "futebol", layout: "list", hasColors: false, aspectRatio: 1 },
  { id: "fut-08", name: "Modelo 8", category: "futebol", layout: "highlight", hasColors: true, aspectRatio: 1 },
  { id: "fut-09", name: "Modelo 9", category: "futebol", layout: "list", hasColors: true, aspectRatio: 1 },
  { id: "fut-10", name: "Modelo 10", category: "futebol", layout: "highlight", hasColors: false, aspectRatio: 1 },
  { id: "fut-14", name: "Modelo 14", category: "futebol", layout: "list", hasColors: true, aspectRatio: 1 },
  { id: "fut-15", name: "Modelo 15", category: "futebol", layout: "highlight", hasColors: true, aspectRatio: 1 },
  { id: "fut-23", name: "Modelo 23", category: "futebol", layout: "duel", hasColors: true, aspectRatio: 1 },
  { id: "fut-26", name: "Modelo 26", category: "futebol", layout: "grid", hasColors: true, aspectRatio: 1 },
  // NBA
  { id: "nba-01-yellow", name: "NBA 1 Amarelo", category: "nba", layout: "list", hasColors: false, aspectRatio: 0.8 },
  { id: "nba-01-red", name: "NBA 1 Vermelho", category: "nba", layout: "list", hasColors: false, aspectRatio: 0.8 },
  { id: "nba-01-purple", name: "NBA 1 Roxo", category: "nba", layout: "list", hasColors: false, aspectRatio: 0.8 },
  { id: "nba-01-blue", name: "NBA 1 Azul", category: "nba", layout: "list", hasColors: false, aspectRatio: 0.8 },
  { id: "nba-01-green", name: "NBA 1 Verde", category: "nba", layout: "list", hasColors: false, aspectRatio: 0.8 },
  { id: "nba-02-blue", name: "NBA 2 Azul", category: "nba", layout: "grid", hasColors: false, aspectRatio: 0.8 },
  // UFC
  { id: "ufc-01", name: "UFC Night", category: "ufc", layout: "duel", hasColors: true, aspectRatio: 1 },
  { id: "ufc-02", name: "UFC Champion", category: "ufc", layout: "duel", hasColors: true, aspectRatio: 1 },
  { id: "ufc-03", name: "UFC Fight", category: "ufc", layout: "highlight", hasColors: true, aspectRatio: 1 },
  // F1
  { id: "f1-01", name: "F1 Grand Prix", category: "f1", layout: "highlight", hasColors: true, aspectRatio: 1 },
  { id: "f1-02", name: "F1 Qualifying", category: "f1", layout: "list", hasColors: true, aspectRatio: 1 },
];

export function getModelsByCategory(cat: Category) {
  return MODELS.filter((m) => m.category === cat);
}

export function getModel(id: string) {
  return MODELS.find((m) => m.id === id);
}

export function getColor(id?: string): ColorVariant {
  return COLOR_VARIANTS.find((c) => c.id === id) ?? COLOR_VARIANTS[0];
}
