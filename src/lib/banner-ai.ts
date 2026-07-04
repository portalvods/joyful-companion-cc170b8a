// "IA" mockada — preenche o BannerContent a partir de texto bruto, dependendo do tipo
// (partida de futebol/basquete, luta, filme, série, vídeo).
import type { BannerContent, BannerKind } from "./banner-types";
import { logoFor } from "./banner-images";

function firstLine(t: string): string {
  return t.split(/\n/)[0].trim();
}

function match(re: RegExp, text: string): string | undefined {
  const m = text.match(re);
  return m ? m[1].trim() : undefined;
}

function parseMatchup(text: string): { a?: string; b?: string } {
  // aceita "Flamengo x Palmeiras", "Flamengo vs Palmeiras", "Flamengo X Palmeiras"
  const m = text.match(/([\wÀ-ÿ .'-]{2,30})\s*(?:x|vs|×)\s*([\wÀ-ÿ .'-]{2,30})/i);
  if (!m) return {};
  return { a: m[1].trim(), b: m[2].trim() };
}

function parseDate(text: string): string | undefined {
  const m = text.match(/(\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?)/);
  if (m) return m[1];
  const m2 = text.match(/(hoje|amanhã|s[aá]bado|domingo|sexta|quinta|quarta|ter[çc]a|segunda)/i);
  return m2 ? m2[1] : undefined;
}
function parseTime(text: string): string | undefined {
  const m = text.match(/(\d{1,2}[h:]\d{0,2})/i);
  return m ? m[1].replace(":", "h") : undefined;
}

async function fakeLatency() {
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));
}

export async function extractContent(kind: BannerKind, rawText: string): Promise<BannerContent> {
  await fakeLatency();
  const text = rawText.trim();

  if (kind === "match" || kind === "fight") {
    const { a, b } = parseMatchup(text);
    const team1 = a ?? "Time A";
    const team2 = b ?? "Time B";
    return {
      kind,
      team1, team2,
      logo1: logoFor(team1),
      logo2: logoFor(team2),
      date: parseDate(text) ?? "Sábado",
      time: parseTime(text) ?? "20h30",
      venue: match(/(?:no|em|arena|estádio|gin[áa]sio)\s+([^\.,\n]{2,40})/i, text) ?? undefined,
      championship: match(/(?:campeonato|liga|copa|torneio|ufc|nba|libertadores|brasileir[ãa]o)[:\s]+([^\.,\n]{2,60})/i, text)
        ?? (/ufc/i.test(text) ? "UFC" : /nba/i.test(text) ? "NBA" : /libertadores/i.test(text) ? "Libertadores" : "Campeonato"),
      round: match(/(?:rodada|jornada|round|semi|final|oitavas|quartas)[:\s]*([^\.,\n]{1,30})/i, text) ?? undefined,
    };
  }

  if (kind === "movie") {
    const title = firstLine(text) || "TÍTULO DO FILME";
    return {
      kind,
      title: title.toUpperCase().slice(0, 40),
      tagline: match(/tagline[:\s]+([^\n]+)/i, text) ?? (text.split("\n")[1]?.trim() || "Uma história inesquecível"),
      rating: match(/(\d(?:[\.,]\d)?)\s?\/\s?10/i, text) ?? undefined,
      genre: match(/g[êe]nero[:\s]+([^\.,\n]+)/i, text) ?? match(/(a[çc][ãa]o|drama|com[eé]dia|terror|suspense|fic[çc][ãa]o|romance|documentário)/i, text) ?? "Drama",
      duration: match(/(\d{1,3}\s?min)/i, text) ?? undefined,
      cta: "Assista agora",
    };
  }

  if (kind === "series") {
    const title = firstLine(text) || "SÉRIE";
    return {
      kind,
      title: title.toUpperCase().slice(0, 40),
      season: match(/temporada\s*(\d+)/i, text) ?? match(/s(\d{1,2})/i, text) ?? "1",
      episode: match(/epis[óo]dio\s*(\d+)/i, text) ?? match(/e(\d{1,2})/i, text) ?? "01",
      tagline: text.split("\n")[1]?.trim() || "Novos episódios",
      genre: match(/(drama|com[eé]dia|thriller|sci-?fi|fantasia|crime|reality)/i, text) ?? "Drama",
      cta: "Maratona já",
    };
  }

  // video (thumb tipo YouTube)
  const title = firstLine(text) || "TÍTULO DO VÍDEO";
  return {
    kind: "video",
    title: title.toUpperCase().slice(0, 60),
    subtitle: text.split("\n")[1]?.trim() ?? "Assista até o final",
    channel: match(/canal[:\s]+([^\.,\n]+)/i, text) ?? undefined,
    duration: match(/(\d{1,2}:\d{2})/i, text) ?? undefined,
  };
}

// modelos "de IA" — cosméticos
export const AI_MODELS = [
  { id: "forge-fast", name: "Forge Fast", desc: "Rápido, ideal pra iterar" },
  { id: "forge-sport", name: "Forge Sport", desc: "Otimizado pra esportes ao vivo" },
  { id: "forge-cinema", name: "Forge Cinema", desc: "Filmes e séries, foco editorial" },
  { id: "forge-pro", name: "Forge Pro", desc: "Máxima qualidade" },
];

export const KINDS: { id: BannerKind; label: string; icon: string; hint: string }[] = [
  { id: "match", label: "Partida", icon: "⚽", hint: "Ex: Flamengo x Palmeiras, sábado 21h, Maracanã, Brasileirão rodada 15" },
  { id: "fight", label: "Luta", icon: "🥊", hint: "Ex: Poatan vs Alex, UFC 305, sábado 23h, T-Mobile Arena, main event" },
  { id: "movie", label: "Filme", icon: "🎬", hint: "Ex: Duna 3\nUma nova era começa\nGênero: ficção, 155 min, 9/10" },
  { id: "series", label: "Série", icon: "📺", hint: "Ex: Stranger Things\nTemporada 5, Episódio 01\nGênero: sci-fi" },
  { id: "video", label: "Vídeo", icon: "▶️", hint: "Ex: TESTEI 10 CHUTEIRAS DE R$2000\nCanal: BolaCheia, 12:45" },
];
