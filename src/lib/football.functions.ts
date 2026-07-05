import { createServerFn } from "@tanstack/react-start";
import type { Game } from "./pro-models";

const WEEKDAY_PT: Record<number, string> = {
  0: "DOMINGO", 1: "SEGUNDA", 2: "TERÇA", 3: "QUARTA", 4: "QUINTA", 5: "SEXTA", 6: "SÁBADO",
};

export type TodayGamesResult = {
  date: string; // YYYY-MM-DD
  weekday: string; // DOMINGO, etc.
  displayDate: string; // 05/07
  games: Game[];
  source: "thesportsdb" | "fallback";
  error?: string;
};

type SportsDbEvent = {
  strEvent?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strLeague?: string;
  strTime?: string; // "HH:MM:SS" UTC
  strTimestamp?: string; // ISO
  strTVStation?: string;
};

/**
 * Retorna os jogos de futebol do dia (hoje, horário de Brasília).
 * Usa TheSportsDB (v1, chave gratuita "3"). Se falhar, retorna lista vazia.
 */
export const getTodayFootballGames = createServerFn({ method: "GET" }).handler(
  async (): Promise<TodayGamesResult> => {
    // "hoje" em Brasília (UTC-3, sem DST)
    const now = new Date();
    const brasilia = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const yyyy = brasilia.getUTCFullYear();
    const mm = String(brasilia.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(brasilia.getUTCDate()).padStart(2, "0");
    const date = `${yyyy}-${mm}-${dd}`;
    const weekday = WEEKDAY_PT[brasilia.getUTCDay()];
    const displayDate = `${dd}/${mm}`;

    try {
      const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}&s=Soccer`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { events?: SportsDbEvent[] | null };
      const events = json.events ?? [];

      const games: Game[] = events
        .slice(0, 30)
        .map((e) => {
          const time = e.strTimestamp
            ? new Date(e.strTimestamp).toLocaleTimeString("pt-BR", {
                hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
              })
            : (e.strTime ?? "").slice(0, 5);
          return {
            team1: (e.strHomeTeam ?? "").toUpperCase(),
            team2: (e.strAwayTeam ?? "").toUpperCase(),
            time: time || "--:--",
            channel: (e.strTVStation ?? "").split(/[,;]/)[0]?.trim().toUpperCase() || "",
            championship: e.strLeague ?? "",
          };
        })
        .filter((g) => g.team1 && g.team2);

      return { date, weekday, displayDate, games, source: "thesportsdb" };
    } catch (err) {
      return {
        date, weekday, displayDate, games: [], source: "fallback",
        error: err instanceof Error ? err.message : "Erro ao carregar jogos",
      };
    }
  },
);
