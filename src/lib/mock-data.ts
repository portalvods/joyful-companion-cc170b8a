export type ContentStatus = "queued" | "downloading" | "completed" | "failed";
export type ContentKind = "movie" | "series";

export interface ContentItem {
  id: string;
  title: string;
  kind: ContentKind;
  category: string;
  sizeMB: number;
  status: ContentStatus;
  progress: number; // 0-100
  year?: number;
}

const movieCategories = ["Ação", "Comédia", "Drama", "Ficção Científica", "Terror", "Animação"];
const seriesCategories = ["Drama", "Comédia", "Documentário", "Anime", "Crime", "Sci-Fi"];

const movieTitles = [
  "Neon Horizon", "Silent Echo", "Crimson Sky", "The Last Vector", "Paper Kingdoms",
  "Midnight Cartography", "Voltage", "Chrome Halo", "The Analog Room", "Bright Static",
  "Salt & Ember", "Deep Field", "Iron Prayer", "Glass Highway", "Pacific Signal",
  "Halo Drift", "Vespers", "Under the Copper Sun", "Blueprint Zero", "Northbound",
];

const seriesTitles = [
  "Signal Rooms", "Grid & Grain", "The Cartographers", "Nocturne Division", "Nightshift",
  "Blackline", "The Foreman", "Tidepool", "Meridian", "Broadcast",
  "Cold Aperture", "The Delta House", "Rivergate", "Pilot Light", "Sunset Protocol",
];

let uid = 0;
const rid = () => `c${++uid}`;

export const mockContent: ContentItem[] = [
  ...movieTitles.map((t, i) => ({
    id: rid(),
    title: t,
    kind: "movie" as const,
    category: movieCategories[i % movieCategories.length],
    sizeMB: 800 + Math.floor(Math.random() * 3200),
    status: (["queued", "downloading", "completed", "failed", "queued", "completed"] as ContentStatus[])[i % 6],
    progress: [0, 42, 100, 0, 0, 100][i % 6],
    year: 2018 + (i % 8),
  })),
  ...seriesTitles.map((t, i) => ({
    id: rid(),
    title: t,
    kind: "series" as const,
    category: seriesCategories[i % seriesCategories.length],
    sizeMB: 2000 + Math.floor(Math.random() * 8000),
    status: (["queued", "downloading", "completed", "queued", "completed", "failed"] as ContentStatus[])[i % 6],
    progress: [0, 71, 100, 0, 100, 0][i % 6],
    year: 2019 + (i % 6),
  })),
];

export const movieCategoriesList = ["Todas", ...movieCategories];
export const seriesCategoriesList = ["Todas", ...seriesCategories];

export const initialLogs = [
  { t: "12:04:22", msg: "Filme 'Neon Horizon' baixado com sucesso", level: "success" as const },
  { t: "12:03:11", msg: "Sincronização iniciada (cron: hourly)", level: "info" as const },
  { t: "12:01:45", msg: "Nova série detectada: 'Signal Rooms'", level: "info" as const },
  { t: "11:58:02", msg: "Falha ao baixar 'Iron Prayer' — timeout", level: "error" as const },
  { t: "11:55:19", msg: "Lista M3U recarregada (2.481 itens)", level: "info" as const },
  { t: "11:50:00", msg: "Auto-download habilitado", level: "warn" as const },
];
