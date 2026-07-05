import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Download, Loader2 } from "lucide-react";
import FileSaver from "file-saver";
const { saveAs } = FileSaver;
import { useProStore } from "@/lib/pro-store";
import { getModelsByCategory, COLOR_VARIANTS, type Category, type Game, getColor } from "@/lib/pro-models";
import { renderBanner, canvasToBlob } from "@/lib/pro-render";
import { cn } from "@/lib/utils";

const emptyGame = (): Game => ({ team1: "", team2: "", time: "", channel: "" });

export function SingleGenerator({ category, title, iconEmoji }: { category: Category; title: string; iconEmoji: string }) {
  const models = getModelsByCategory(category);
  const [modelId, setModelId] = useState(models[0]?.id ?? "");
  const [colorId, setColorId] = useState<string>("blue");
  const [games, setGames] = useState<Game[]>([emptyGame(), emptyGame()]);
  const { whatsapp, logoDataUrl } = useProStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !modelId) return;
    renderBanner(canvasRef.current, {
      modelId,
      colorId,
      games: games.filter((g) => g.team1 || g.team2),
      whatsapp,
      logoDataUrl,
      size: 600,
    });
  }, [modelId, colorId, games, whatsapp, logoDataUrl]);

  async function download() {
    if (!canvasRef.current) return;
    setBusy(true);
    const big = document.createElement("canvas");
    renderBanner(big, { modelId, colorId, games: games.filter((g) => g.team1 || g.team2), whatsapp, logoDataUrl, size: 1080 });
    const blob = await canvasToBlob(big);
    saveAs(blob, `${modelId}-${Date.now()}.png`);
    setBusy(false);
  }

  const model = models.find((m) => m.id === modelId);

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-black">
          <span>{iconEmoji}</span>{" "}
          <span className="bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        <p className="text-slate-400 mt-2">Crie banners profissionais em segundos.</p>
      </header>

      <section>
        <h2 className="text-xl font-bold mb-4">1. Escolha o Modelo</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => setModelId(m.id)}
              className={cn(
                "rounded-xl p-3 border-2 transition-all",
                modelId === m.id ? "border-blue-500 bg-blue-500/10" : "border-white/5 bg-[#111b32] hover:border-white/10",
              )}
            >
              <ModelThumb modelId={m.id} colorId={colorId} />
              <div className="mt-2 text-sm font-semibold text-center">{m.name}</div>
            </button>
          ))}
        </div>
      </section>

      {model?.hasColors && (
        <section>
          <h2 className="text-xl font-bold mb-3">2. Cor do Banner</h2>
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
      )}

      <section>
        <h2 className="text-xl font-bold mb-4">{model?.hasColors ? "3" : "2"}. Preencha os Jogos</h2>
        <div className="space-y-3">
          {games.map((g, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-[#111b32] p-3 rounded-xl border border-white/5">
              <input value={g.team1} onChange={(e) => update(i, { team1: e.target.value })} placeholder="Time A" className="md:col-span-3 input" />
              <input value={g.team2} onChange={(e) => update(i, { team2: e.target.value })} placeholder="Time B" className="md:col-span-3 input" />
              <input value={g.time} onChange={(e) => update(i, { time: e.target.value })} placeholder="20:00" className="md:col-span-2 input" />
              <input value={g.channel} onChange={(e) => update(i, { channel: e.target.value })} placeholder="Canal" className="md:col-span-3 input" />
              <button onClick={() => setGames(games.filter((_, k) => k !== i))} className="md:col-span-1 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex justify-center items-center">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button onClick={() => setGames([...games, emptyGame()])} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-white/10 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition">
            <Plus className="h-4 w-4" /> Adicionar jogo
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Preview</h2>
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black">
          <canvas ref={canvasRef} className="w-full block" />
        </div>
        <div className="mt-6 flex justify-center">
          <button onClick={download} disabled={busy} className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:scale-105 transition disabled:opacity-50">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            Baixar Banner
          </button>
        </div>
      </section>

      <style>{`.input{background:#0a0f1e;border:1px solid rgba(255,255,255,0.05);border-radius:0.5rem;padding:0.6rem 0.9rem;color:white;font-size:0.9rem;outline:none;transition:border .15s}.input:focus{border-color:#3b82f6}`}</style>
    </div>
  );

  function update(i: number, patch: Partial<Game>) {
    setGames(games.map((g, k) => (k === i ? { ...g, ...patch } : g)));
  }
}

function ModelThumb({ modelId, colorId }: { modelId: string; colorId?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    renderBanner(ref.current, {
      modelId,
      colorId,
      games: [
        { team1: "Time A", team2: "Time B", time: "20:00", channel: "TV" },
        { team1: "Time C", team2: "Time D", time: "22:00", channel: "TV" },
      ],
      size: 300,
    });
  }, [modelId, colorId]);
  const color = getColor(colorId);
  return (
    <div className="w-full aspect-square rounded overflow-hidden" style={{ background: color.primary }}>
      <canvas ref={ref} className="w-full h-full block" />
    </div>
  );
}
