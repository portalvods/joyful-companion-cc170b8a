import { useState } from "react";
import { Sparkles, LayoutGrid, Type, Image as ImageIcon, Palette, Loader2, Search, Trophy, Swords, Film, Tv, Play } from "lucide-react";
import { toast } from "sonner";
import { useEditor } from "@/lib/editor-store";
import { TEMPLATES } from "@/lib/banner-templates";
import { extractContent, AI_MODELS, KINDS } from "@/lib/banner-ai";
import { searchStock, logoFor } from "@/lib/banner-images";
import { FORMATS, type BannerKind } from "@/lib/banner-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const CATS = [
  { id: "all", label: "Todos" },
  { id: "futebol", label: "⚽ Futebol" },
  { id: "basquete", label: "🏀 Basquete" },
  { id: "luta", label: "🥊 Luta" },
  { id: "filme", label: "🎬 Filme" },
  { id: "serie", label: "📺 Série" },
  { id: "video", label: "▶️ Vídeo" },
] as const;

const KIND_ICON: Record<BannerKind, React.ComponentType<{ className?: string }>> = {
  match: Trophy, fight: Swords, movie: Film, series: Tv, video: Play,
};

export function LeftSidebar() {
  return (
    <aside className="w-[360px] border-r border-sidebar-border bg-sidebar flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neon-gradient shadow-neon flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">BannerForge Pro</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Esportes • Filmes • Séries</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="ai" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-5 mx-3 mt-3 bg-sidebar-accent">
          <TabsTrigger value="ai" title="IA"><Sparkles className="w-4 h-4" /></TabsTrigger>
          <TabsTrigger value="templates" title="Templates"><LayoutGrid className="w-4 h-4" /></TabsTrigger>
          <TabsTrigger value="text" title="Texto"><Type className="w-4 h-4" /></TabsTrigger>
          <TabsTrigger value="images" title="Imagens"><ImageIcon className="w-4 h-4" /></TabsTrigger>
          <TabsTrigger value="bg" title="Fundo"><Palette className="w-4 h-4" /></TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-y-auto p-3">
          <TabsContent value="ai" className="mt-0"><AiPanel /></TabsContent>
          <TabsContent value="templates" className="mt-0"><TemplatesPanel /></TabsContent>
          <TabsContent value="text" className="mt-0"><TextPanel /></TabsContent>
          <TabsContent value="images" className="mt-0"><ImagesPanel /></TabsContent>
          <TabsContent value="bg" className="mt-0"><BgPanel /></TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}

function AiPanel() {
  const [kind, setKind] = useState<BannerKind>("match");
  const [text, setText] = useState(KINDS[0].hint);
  const [model, setModel] = useState(AI_MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const setContentAndReapply = useEditor((s) => s.setContentAndReapply);

  function pickKind(k: BannerKind) {
    setKind(k);
    setText(KINDS.find((x) => x.id === k)?.hint ?? "");
  }

  async function generate() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const content = await extractContent(kind, text);
      setContentAndReapply(content);
      toast.success("Banner gerado", {
        description: `${AI_MODELS.find((m) => m.id === model)?.name} preencheu o template automaticamente.`,
      });
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          O QUE VOCÊ QUER ANUNCIAR?
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {KINDS.map((k) => {
            const Icon = KIND_ICON[k.id];
            return (
              <button
                key={k.id}
                onClick={() => pickKind(k.id)}
                className={`p-2 rounded-md border transition ${
                  kind === k.id
                    ? "border-primary bg-primary/10 shadow-neon"
                    : "border-sidebar-border bg-sidebar-accent/40 hover:bg-sidebar-accent"
                }`}
                title={k.label}
              >
                <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                <div className="text-[9px] font-semibold text-center">{k.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">
          Cole o conteúdo — a IA extrai tudo
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={KINDS.find((k) => k.id === kind)?.hint}
          className="text-xs bg-sidebar-accent/50 border-sidebar-border resize-none"
        />
        <div className="text-[10px] text-muted-foreground mt-1.5">
          {kind === "match" && "Formato aceito: “Time A x Time B, sábado 21h, Maracanã, Brasileirão rodada 15”"}
          {kind === "fight" && "Formato aceito: “Poatan vs Alex, UFC 305, 23h, T-Mobile Arena”"}
          {kind === "movie" && "Linha 1: título • Linha 2: tagline • inclua gênero e duração"}
          {kind === "series" && "Linha 1: nome da série • inclua T3E05 ou temporada/episódio"}
          {kind === "video" && "Linha 1: título CHAMATIVO • Linha 2: gancho • inclua duração 12:45"}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">Modelo de IA</div>
        <div className="grid grid-cols-2 gap-1.5">
          {AI_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={`text-left p-2 rounded-md border transition-all ${
                model === m.id
                  ? "border-primary bg-primary/10 shadow-neon"
                  : "border-sidebar-border bg-sidebar-accent/30 hover:bg-sidebar-accent"
              }`}
            >
              <div className="text-[11px] font-semibold">{m.name}</div>
              <div className="text-[9px] text-muted-foreground">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={generate}
        disabled={loading || !text.trim()}
        className="w-full bg-neon-gradient hover:opacity-90 text-white font-semibold shadow-neon"
      >
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando…</> : <><Sparkles className="w-4 h-4 mr-2" /> Gerar Banner com IA</>}
      </Button>

      {loading && (
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-24" />
        </div>
      )}
    </div>
  );
}

function TemplatesPanel() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<typeof CATS[number]["id"]>("all");
  const [fmt, setFmt] = useState<string>("all");
  const applyTemplateById = useEditor((s) => s.applyTemplateById);
  const activeId = useEditor((s) => s.activeTemplateId);

  const filtered = TEMPLATES.filter((t) => {
    if (cat !== "all" && t.category !== cat) return false;
    if (fmt !== "all" && t.format !== fmt) return false;
    if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar template..."
          className="pl-8 h-9 text-xs bg-sidebar-accent/50 border-sidebar-border"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`text-[10px] px-2 py-1 rounded-full border transition ${
              cat === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-sidebar-accent border-sidebar-border hover:bg-accent"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setFmt("all")}
          className={`text-[10px] px-2 py-1 rounded-full border ${fmt === "all" ? "bg-accent border-primary/50" : "bg-sidebar-accent/50 border-sidebar-border"}`}
        >Todos formatos</button>
        {FORMATS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFmt(f.id)}
            className={`text-[10px] px-2 py-1 rounded-full border ${fmt === f.id ? "bg-accent border-primary/50" : "bg-sidebar-accent/50 border-sidebar-border"}`}
          >{f.label.split(" ")[0]}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => { applyTemplateById(t.id); toast.success(`Template "${t.name}" aplicado`); }}
            className={`group relative aspect-square rounded-md overflow-hidden border-2 transition ${
              activeId === t.id ? "border-primary shadow-neon" : "border-sidebar-border hover:border-accent"
            }`}
            style={{ background: `linear-gradient(135deg, ${t.thumbColors[0]}, ${t.thumbColors[1]})` }}
          >
            <div className="absolute inset-0 p-2 flex flex-col justify-between text-left">
              <div className="text-[9px] text-white/80 uppercase tracking-wider">{t.category}</div>
              <div className="text-[11px] font-bold text-white leading-tight">{t.name}</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center text-xs text-muted-foreground py-6">Nenhum template.</div>
        )}
      </div>
    </div>
  );
}

function TextPanel() {
  const addElement = useEditor((s) => s.addElement);

  const presets = [
    { label: "Título gigante", fontSize: 96, fontWeight: 900, text: "TÍTULO", family: "'Bebas Neue', sans-serif" },
    { label: "Subtítulo", fontSize: 32, fontWeight: 600, text: "Subtítulo", family: "'Inter', sans-serif" },
    { label: "VS grande", fontSize: 120, fontWeight: 900, text: "VS", family: "'Bebas Neue', sans-serif" },
    { label: "Placar", fontSize: 90, fontWeight: 900, text: "0", family: "'Space Grotesk', sans-serif" },
    { label: "Meta / Data", fontSize: 22, fontWeight: 700, text: "SÁB • 20H30", family: "'Space Grotesk', sans-serif" },
  ];

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground mb-2">Clique pra adicionar ao banner.</p>
      {presets.map((p) => (
        <button
          key={p.label}
          onClick={() => addElement({
            id: `text-${Date.now()}`, kind: "text",
            x: 20, y: 40, w: 60, h: 12,
            text: p.text,
            fontFamily: p.family,
            fontSize: p.fontSize, fontWeight: p.fontWeight,
            color: "#ffffff", align: "center",
          })}
          className="w-full p-3 bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-md text-left border border-sidebar-border hover:border-accent transition"
        >
          <div style={{ fontFamily: p.family, fontSize: `${Math.min(p.fontSize / 4, 22)}px`, fontWeight: p.fontWeight }}>
            {p.label}
          </div>
        </button>
      ))}
    </div>
  );
}

function ImagesPanel() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(() => searchStock("stadium"));
  const [logoName, setLogoName] = useState("");
  const setBackground = useEditor((s) => s.setBackground);
  const addElement = useEditor((s) => s.addElement);

  const quickies = ["futebol", "basquete", "luta", "filme", "serie", "video"];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setResults(searchStock(q))}
          placeholder="Ex: futebol, luta, cinema…"
          className="pl-8 h-9 text-xs bg-sidebar-accent/50 border-sidebar-border"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {quickies.map((k) => (
          <button
            key={k}
            onClick={() => { setQ(k); setResults(searchStock(k)); }}
            className="text-[10px] px-2 py-1 rounded-full bg-sidebar-accent border border-sidebar-border hover:border-primary"
          >{k}</button>
        ))}
      </div>
      <div className="text-[10px] text-muted-foreground">Clique = fundo. Duplo clique = adiciona ao canvas.</div>
      <div className="grid grid-cols-3 gap-1.5">
        {results.map((img) => (
          <button
            key={img.id}
            onClick={() => { setBackground({ type: "image", src: img.url, overlay: "rgba(0,0,0,0.45)" }); toast.success("Fundo atualizado"); }}
            onDoubleClick={() => addElement({
              id: `img-${Date.now()}`, kind: "image",
              x: 30, y: 30, w: 40, h: 40, src: img.url,
            })}
            className="aspect-square rounded overflow-hidden border border-sidebar-border hover:border-primary transition"
          >
            <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div className="pt-3 border-t border-sidebar-border">
        <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">Emblema / Logo</div>
        <div className="flex gap-1.5">
          <Input
            value={logoName}
            onChange={(e) => setLogoName(e.target.value)}
            placeholder="Nome do time / lutador"
            className="h-8 text-xs bg-sidebar-accent/50 border-sidebar-border"
          />
          <Button
            size="sm"
            onClick={() => {
              const name = logoName.trim();
              if (!name) return;
              addElement({
                id: `logo-${Date.now()}`, kind: "image",
                x: 35, y: 30, w: 30, h: 30, src: logoFor(name),
              });
              toast.success(`Emblema "${name}" adicionado`);
            }}
          >Add</Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Gera um emblema procedural único por nome.</p>
      </div>
    </div>
  );
}

const GRADIENTS = [
  ["#052e16", "#166534"], // grama
  ["#7f1d1d", "#0f172a"], // torcida
  ["#7c2d12", "#f97316"], // basquete
  ["#0f172a", "#dc2626"], // fight red
  ["#0b0800", "#3b2f0a"], // gold
  ["#1e1b4b", "#22d3ee"], // sci-fi
  ["#1e1b4b", "#a855f7"], // série neon
  ["#000000", "#dc2626"], // cinema noir
];
const SOLIDS = ["#0f172a", "#111827", "#7f1d1d", "#dc2626", "#f97316", "#facc15", "#166534", "#000000"];

function BgPanel() {
  const setBackground = useEditor((s) => s.setBackground);
  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">Gradientes</div>
        <div className="grid grid-cols-4 gap-2">
          {GRADIENTS.map(([a, b], i) => (
            <button
              key={i}
              onClick={() => setBackground({ type: "gradient", from: a, to: b, angle: 135 })}
              className="aspect-square rounded-md border border-sidebar-border hover:border-primary transition"
              style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">Cores sólidas</div>
        <div className="grid grid-cols-4 gap-2">
          {SOLIDS.map((c) => (
            <button
              key={c}
              onClick={() => setBackground({ type: "solid", color: c })}
              className="aspect-square rounded-md border border-sidebar-border hover:border-primary transition"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
