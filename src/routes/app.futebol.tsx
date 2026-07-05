import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Download, Loader2, RefreshCw, PencilLine } from "lucide-react";
import FileSaver from "file-saver";
const { saveAs } = FileSaver;
import { getTodayFootballGames } from "@/lib/football.functions";
import { renderBanner, canvasToBlob } from "@/lib/pro-render";
import { COLOR_VARIANTS } from "@/lib/pro-models";
import { useProStore } from "@/lib/pro-store";
import { SingleGenerator } from "@/components/pro/single-generator";
import { cn } from "@/lib/utils";

const todayGamesQuery = queryOptions({
  queryKey: ["football", "today"],
  queryFn: () => getTodayFootballGames(),
  staleTime: 1000 * 60 * 30, // 30 min
  refetchOnWindowFocus: false,
});

export const Route = createFileRoute("/app/futebol")({
  component: FutebolPage,
  loader: ({ context }) => context.queryClient.ensureQueryData(todayGamesQuery),
  head: () => ({
    meta: [
      { title: "Banners de Futebol — Jogos do Dia | GeradorPro" },
      { name: "description", content: "Gere banners de futebol com a programação dos jogos de hoje atualizada automaticamente." },
    ],
  }),
});

const AUTO_MODELS = [
  { id: "fut-prog", name: "Programação de Futebol", desc: "Pôster estilo estádio, com título gigante e lista de campeonatos" },
  { id: "fut-destaques", name: "Destaques do Dia", desc: "Lista vertical detalhada dos principais jogos" },
] as const;

function FutebolPage() {
  const { data } = useSuspenseQuery(todayGamesQuery);
  const { refetch, isFetching } = useQuery(todayGamesQuery);
  const [colorId, setColorId] = useState("blue");
  const [mode, setMode] = useState<"auto" | "manual">("auto");

  return (
    <div className="space-y-10">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-black">
          <span>⚽</span>{" "}
          <span className="bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">
            Banners de Futebol
          </span>
        </h1>
        <p className="text-slate-400 mt-2">
          Jogos do dia buscados automaticamente. Basta escolher o modelo e baixar.
        </p>
      </header>

      {/* Toggle Auto / Manual */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setMode("auto")}
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-bold border-2 transition",
            mode === "auto" ? "border-blue-500 bg-blue-500/15 text-blue-300" : "border-white/10 text-slate-400",
          )}
        >
          🔄 Automático (Jogos de Hoje)
        </button>
        <button
          onClick={() => setMode("manual")}
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-bold border-2 transition",
            mode === "manual" ? "border-blue-500 bg-blue-500/15 text-blue-300" : "border-white/10 text-slate-400",
          )}
        >
          <PencilLine className="inline h-4 w-4 mr-1" /> Manual
        </button>
      </div>

      {mode === "auto" ? (
        <AutoSection data={data} isFetching={isFetching} onRefresh={() => refetch()} colorId={colorId} setColorId={setColorId} />
      ) : (
        <SingleGenerator category="futebol" title="Gerador Manual — Futebol" iconEmoji="⚽" />
      )}
    </div>
  );
}

function AutoSection({
  data, isFetching, onRefresh, colorId, setColorId,
}: {
  data: Awaited<ReturnType<typeof getTodayFootballGames>>;
  isFetching: boolean;
  onRefresh: () => void;
  colorId: string;
  setColorId: (id: string) => void;
}) {
  return (
    <>
      {/* Painel de status dos jogos */}
      <section className="bg-[#111b32] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400">
              Jogos de Hoje — {data.weekday} · {data.displayDate}
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {data.games.length}{" "}
              <span className="text-slate-400 text-base font-medium">
                {data.games.length === 1 ? "partida encontrada" : "partidas encontradas"}
              </span>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Atualizar
          </button>
        </div>

        {data.error && (
          <div className="mt-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
            Não foi possível carregar os jogos ao vivo ({data.error}). Mostrando exemplo.
          </div>
        )}

        {data.games.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-52 overflow-auto pr-2">
            {data.games.slice(0, 12).map((g, i) => (
              <div key={i} className="text-sm bg-black/30 rounded-lg px-3 py-2 flex justify-between gap-2">
                <span className="font-semibold truncate">{g.team1} × {g.team2}</span>
                <span className="text-slate-400 shrink-0">{g.time}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cor */}
      <section>
        <h2 className="text-lg font-bold mb-3">Cor do banner</h2>
        <div className="flex flex-wrap gap-2">
          {COLOR_VARIANTS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColorId(c.id)}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold text-sm border-2 transition",
                colorId === c.id ? "border-white text-white" : "border-transparent text-white/80",
              )}
              style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})` }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Modelos com dados do dia */}
      <section>
        <h2 className="text-lg font-bold mb-4">Modelos com jogos de hoje</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AUTO_MODELS.map((m) => (
            <AutoBannerCard
              key={m.id}
              modelId={m.id}
              modelName={m.name}
              modelDesc={m.desc}
              colorId={colorId}
              games={data.games.length ? data.games : sampleGamesForPreview()}
              title={`${data.weekday} - ${data.displayDate}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function AutoBannerCard({
  modelId, modelName, modelDesc, colorId, games, title,
}: {
  modelId: string;
  modelName: string;
  modelDesc: string;
  colorId: string;
  games: Awaited<ReturnType<typeof getTodayFootballGames>>["games"];
  title: string;
}) {
  const { whatsapp, logoDataUrl } = useProStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    renderBanner(canvasRef.current, { modelId, colorId, games, whatsapp, logoDataUrl, title, size: 720 });
  }, [modelId, colorId, games, whatsapp, logoDataUrl, title]);

  async function download() {
    setBusy(true);
    const big = document.createElement("canvas");
    renderBanner(big, { modelId, colorId, games, whatsapp, logoDataUrl, title, size: 1350 });
    const blob = await canvasToBlob(big);
    saveAs(blob, `${modelId}-${new Date().toISOString().slice(0, 10)}.png`);
    setBusy(false);
  }

  return (
    <div className="bg-[#111b32] border border-white/5 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <div className="font-bold text-white">{modelName}</div>
        <div className="text-xs text-slate-400 mt-0.5">{modelDesc}</div>
      </div>
      <div className="bg-black flex justify-center">
        <canvas ref={canvasRef} className="max-w-full h-auto block" style={{ maxHeight: 560 }} />
      </div>
      <div className="p-4">
        <button
          onClick={download}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:scale-[1.02] transition disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Baixar em alta resolução
        </button>
      </div>
    </div>
  );
}

function sampleGamesForPreview() {
  return [
    { team1: "FLAMENGO", team2: "PALMEIRAS", time: "16:00", channel: "GLOBO", championship: "BRASILEIRÃO" },
    { team1: "SANTOS", team2: "CORINTHIANS", time: "18:30", channel: "SPORTV", championship: "BRASILEIRÃO" },
    { team1: "SÃO PAULO", team2: "GRÊMIO", time: "20:00", channel: "PREMIERE", championship: "BRASILEIRÃO" },
    { team1: "INTER", team2: "BOTAFOGO", time: "21:30", channel: "GLOBO", championship: "BRASILEIRÃO" },
  ];
}
