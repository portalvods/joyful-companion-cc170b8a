import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Star, Zap, Loader2, Download, X } from "lucide-react";
import JSZip from "jszip";
import FileSaver from "file-saver";
const { saveAs } = FileSaver;
import { useProStore } from "@/lib/pro-store";
import { MODELS, COLOR_VARIANTS, type Category, getColor } from "@/lib/pro-models";
import { renderBanner, sampleGames, canvasToBlob } from "@/lib/pro-render";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/express")({
  component: ExpressPage,
});

const TABS: { id: "favoritos" | Category; label: string }[] = [
  { id: "favoritos", label: "★ Favoritos" },
  { id: "futebol", label: "⚽ Futebol" },
  { id: "nba", label: "🏀 NBA" },
  { id: "esportes", label: "🏆 Esportes" },
];

function ExpressPage() {
  const [tab, setTab] = useState<"favoritos" | Category>("futebol");
  const { whatsapp, setWhatsapp, favorites, toggleFavorite, selected, toggleSelected, setColor, clearSelected, logoDataUrl } = useProStore();
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);

  const shownModels = MODELS.filter((m) => {
    if (tab === "favoritos") return favorites.includes(m.id);
    if (tab === "esportes") return m.category === "ufc" || m.category === "f1";
    return m.category === tab;
  });

  async function generateAll() {
    if (!selected.length) return;
    setGenerating(true);
    const canvas = document.createElement("canvas");
    const urls: string[] = [];
    const zip = new JSZip();
    for (const s of selected) {
      renderBanner(canvas, {
        modelId: s.id,
        colorId: s.color,
        games: sampleGames(),
        whatsapp,
        logoDataUrl,
      });
      const blob = await canvasToBlob(canvas);
      urls.push(URL.createObjectURL(blob));
      zip.file(`${s.id}${s.color ? "-" + s.color : ""}.png`, blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    (window as unknown as { __proLastZip?: Blob }).__proLastZip = zipBlob;
    setResults(urls);
    setGenerating(false);
  }

  function downloadZip() {
    const blob = (window as unknown as { __proLastZip?: Blob }).__proLastZip;
    if (blob) saveAs(blob, "banners.zip");
  }

  return (
    <div className="space-y-6 pb-32">
      <header className="text-center py-6">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          GERAÇÃO EXPRESS
        </h1>
        <p className="text-slate-400 mt-3 uppercase text-sm tracking-widest">
          Selecione e gere múltiplos banners num só clique
        </p>
        <div className="mt-6 inline-flex gap-2 rounded-full bg-[#111b32] p-1.5 border border-white/5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all",
                tab === t.id
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                  : "text-slate-400 hover:text-white",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <section className="rounded-2xl bg-[#111b32] border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1 w-6 bg-blue-500 rounded" />
          <h2 className="font-bold text-white">DADOS GLOBAIS</h2>
        </div>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="WhatsApp Opcional: (XX) XXXXX-XXXX"
          className="w-full bg-[#0a0f1e] border border-white/5 rounded-xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </section>

      {!shownModels.length ? (
        <div className="text-center py-16 text-slate-500">
          {tab === "favoritos" ? "Nenhum favorito ainda. Clique na ★ dos modelos." : "Nenhum modelo nesta categoria."}
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shownModels.map((m) => {
            const sel = selected.find((s) => s.id === m.id);
            const isSelected = !!sel;
            return (
              <div
                key={m.id}
                className={cn(
                  "relative rounded-2xl bg-[#111b32] border-2 transition-all overflow-hidden",
                  isSelected ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-white/5 hover:border-white/10",
                )}
              >
                <button
                  onClick={() => toggleFavorite(m.id)}
                  className="absolute top-3 left-3 z-10 h-8 w-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:scale-110 transition"
                >
                  <Star className={cn("h-4 w-4", favorites.includes(m.id) ? "fill-yellow-400 text-yellow-400" : "text-white")} />
                </button>
                {m.hasColors && (
                  <span className="absolute top-3 right-3 z-10 text-[10px] font-black px-2 py-1 rounded bg-rose-500 text-white shadow">
                    CORES
                  </span>
                )}
                <button onClick={() => toggleSelected(m.id, sel?.color)} className="block w-full aspect-square p-4">
                  <ModelPreview modelId={m.id} colorId={sel?.color} />
                </button>
                <div className="px-4 pb-4">
                  <div className="font-bold text-white text-center py-2">{m.name}</div>
                  {m.hasColors && (
                    <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                      {COLOR_VARIANTS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            if (!isSelected) toggleSelected(m.id, c.id);
                            else setColor(m.id, c.id);
                          }}
                          title={c.name}
                          className={cn(
                            "h-6 w-6 rounded-md border-2 transition",
                            sel?.color === c.id ? "border-white scale-110" : "border-transparent",
                          )}
                          style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {selected.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 pl-6 pr-2 py-2 shadow-2xl shadow-blue-600/40">
          <span className="text-white font-semibold text-sm">
            {selected.length} banner{selected.length > 1 ? "s" : ""} selecionado{selected.length > 1 ? "s" : ""}
          </span>
          <button onClick={clearSelected} className="p-1.5 rounded-full hover:bg-white/10 text-white/80">
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={generateAll}
            disabled={generating}
            className="flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-full hover:scale-105 transition disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Gerar agora
          </button>
        </div>
      )}

      {results && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={() => setResults(null)}>
          <div className="bg-[#111b32] max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{results.length} banners gerados</h3>
              <div className="flex gap-2">
                <button onClick={downloadZip} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold">
                  <Download className="h-4 w-4" /> Baixar tudo (.zip)
                </button>
                <button onClick={() => setResults(null)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((url, i) => (
                <a key={i} href={url} download={`banner-${i + 1}.png`} className="block rounded-lg overflow-hidden border border-white/10 hover:border-blue-500 transition">
                  <img src={url} alt={`Banner ${i + 1}`} className="w-full" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModelPreview({ modelId, colorId }: { modelId: string; colorId?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    renderBanner(ref.current, { modelId, colorId, games: sampleGames(), size: 400 });
  }, [modelId, colorId]);
  const color = getColor(colorId);
  return (
    <div className="w-full h-full rounded-lg overflow-hidden" style={{ background: color.primary }}>
      <canvas ref={ref} className="w-full h-full block" />
    </div>
  );
}
