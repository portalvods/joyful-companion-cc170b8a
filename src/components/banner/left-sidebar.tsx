import { useState } from "react";
import { Sparkles, LayoutGrid, Type, Image as ImageIcon, Shapes, Palette, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useEditor } from "@/lib/editor-store";
import { TEMPLATES } from "@/lib/banner-templates";
import { extractContent, AI_MODELS } from "@/lib/banner-ai";
import { searchStock } from "@/lib/banner-images";
import { FORMATS } from "@/lib/banner-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CATS = [
  { id: "all", label: "Todas" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "social", label: "Redes Sociais" },
  { id: "eventos", label: "Eventos" },
  { id: "corporativo", label: "Corporativo" },
] as const;

export function LeftSidebar() {
  return (
    <aside className="w-[340px] border-r border-sidebar-border bg-sidebar flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neon-gradient shadow-neon flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">BannerForge</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Gerador Pro com IA</div>
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
  const [text, setText] = useState("Promoção de Dia dos Namorados, 30% de desconto em joias, use o cupom AMOR30, válido até amanhã.");
  const [model, setModel] = useState(AI_MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const setContentAndReapply = useEditor((s) => s.setContentAndReapply);

  async function generate() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const content = await extractContent(text);
      setContentAndReapply(content);
      toast.success("Banner gerado", { description: `Título, subtítulo${content.coupon ? " e cupom" : ""} extraídos com ${AI_MODELS.find(m => m.id === model)?.name}.` });
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          GERAR BANNER COM IA
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Cole o texto do seu conteúdo. A IA extrai título, subtítulo, CTA e cupom automaticamente.
        </p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder="Ex: Black Friday chegando! Até 70% OFF em toda loja, cupom BLACK70..."
          className="text-xs bg-sidebar-accent/50 border-sidebar-border resize-none"
        />
      </div>

      <div>
        <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">Modelo</div>
        <div className="space-y-1.5">
          {AI_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={`w-full text-left p-2.5 rounded-md border transition-all ${
                model === m.id
                  ? "border-primary bg-primary/10 shadow-neon"
                  : "border-sidebar-border bg-sidebar-accent/30 hover:bg-sidebar-accent"
              }`}
            >
              <div className="text-xs font-medium">{m.name}</div>
              <div className="text-[10px] text-muted-foreground">{m.desc}</div>
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
    { role: "title" as const, label: "Título", fontSize: 96, fontWeight: 700, text: "Título" },
    { role: "subtitle" as const, label: "Subtítulo", fontSize: 32, fontWeight: 500, text: "Subtítulo" },
    { role: "body" as const, label: "Corpo", fontSize: 20, fontWeight: 400, text: "Texto de corpo" },
  ];

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground mb-2">Clique pra adicionar texto ao banner.</p>
      {presets.map((p) => (
        <button
          key={p.role}
          onClick={() => addElement({
            id: `text-${Date.now()}`, kind: "text",
            x: 15, y: 40, w: 70, h: 15,
            text: p.text, role: p.role,
            fontFamily: "'Inter', sans-serif",
            fontSize: p.fontSize, fontWeight: p.fontWeight,
            color: "#ffffff", align: "left",
          })}
          className="w-full p-3 bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-md text-left border border-sidebar-border hover:border-accent transition"
        >
          <div style={{ fontSize: `${Math.min(p.fontSize / 4, 22)}px`, fontWeight: p.fontWeight }}>
            {p.label}
          </div>
        </button>
      ))}
    </div>
  );
}

function ImagesPanel() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(() => searchStock("gradient"));
  const setBackground = useEditor((s) => s.setBackground);
  const addElement = useEditor((s) => s.addElement);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setResults(searchStock(q))}
          placeholder="Ex: moda, tech, comida…"
          className="pl-8 h-9 text-xs bg-sidebar-accent/50 border-sidebar-border"
        />
      </div>
      <div className="text-[10px] text-muted-foreground">Clique pra usar como fundo. Arraste pro canvas pra adicionar como imagem.</div>
      <div className="grid grid-cols-3 gap-1.5">
        {results.map((img) => (
          <button
            key={img.id}
            onClick={() => { setBackground({ type: "image", src: img.url, overlay: "rgba(0,0,0,0.35)" }); toast.success("Fundo atualizado"); }}
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
    </div>
  );
}

const GRADIENTS = [
  ["#7c3aed", "#2563eb"],
  ["#f43f5e", "#f59e0b"],
  ["#10b981", "#06b6d4"],
  ["#0f172a", "#7c3aed"],
  ["#ec4899", "#8b5cf6"],
  ["#0891b2", "#1e293b"],
  ["#f97316", "#dc2626"],
  ["#22d3ee", "#4ade80"],
];
const SOLIDS = ["#0f172a", "#1e293b", "#7c3aed", "#dc2626", "#f59e0b", "#10b981", "#f8fafc", "#000000"];

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
