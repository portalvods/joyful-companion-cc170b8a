import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, DownloadCloud, Film, Tv, RefreshCw, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TopBar } from "@/components/top-bar";
import { mockContent, movieCategoriesList, seriesCategoriesList, type ContentItem, type ContentStatus, type ContentKind } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Conteúdo — M3U Sync" },
      { name: "description", content: "Gerencie downloads de filmes e séries a partir da lista M3U." },
    ],
  }),
  component: ContentPage,
});

const statusLabel: Record<ContentStatus, string> = {
  queued: "Na Lista", downloading: "Baixando", completed: "Concluído", failed: "Falhou",
};

function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>(mockContent);
  const [tab, setTab] = useState<ContentKind>("movie");

  // Simulate download progress
  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) => prev.map((it) => {
        if (it.status !== "downloading") return it;
        const p = Math.min(100, it.progress + Math.random() * 6);
        if (p >= 100) return { ...it, progress: 100, status: "completed" };
        return { ...it, progress: p };
      }));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <TopBar title="Conteúdo" subtitle="Filmes e séries detectados na lista M3U" />
      <div className="p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as ContentKind)}>
          <TabsList>
            <TabsTrigger value="movie"><Film className="h-4 w-4 mr-2" /> Filmes</TabsTrigger>
            <TabsTrigger value="series"><Tv className="h-4 w-4 mr-2" /> Séries</TabsTrigger>
          </TabsList>

          <TabsContent value="movie" className="mt-4">
            <ContentList kind="movie" items={items} setItems={setItems} categories={movieCategoriesList} />
          </TabsContent>
          <TabsContent value="series" className="mt-4">
            <ContentList kind="series" items={items} setItems={setItems} categories={seriesCategoriesList} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function ContentList({
  kind, items, setItems, categories,
}: {
  kind: ContentKind;
  items: ContentItem[];
  setItems: React.Dispatch<React.SetStateAction<ContentItem[]>>;
  categories: string[];
}) {
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => items.filter((i) =>
    i.kind === kind
    && (category === "Todas" || i.category === category)
    && (status === "all" || i.status === status)
  ), [items, kind, category, status]);

  const toggle = (id: string) => setSelected((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const allChecked = filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  const startDownload = (ids: string[]) => {
    setItems((prev) => prev.map((it) => ids.includes(it.id) && it.status !== "completed" && it.status !== "downloading"
      ? { ...it, status: "downloading", progress: Math.max(1, it.progress) }
      : it));
  };

  const stats = useMemo(() => {
    const k = items.filter((i) => i.kind === kind);
    return {
      total: k.length,
      completed: k.filter((i) => i.status === "completed").length,
      downloading: k.filter((i) => i.status === "downloading").length,
      failed: k.filter((i) => i.status === "failed").length,
    };
  }, [items, kind]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <StatBox label="Total" value={stats.total} />
        <StatBox label="Concluídos" value={stats.completed} tone="success" />
        <StatBox label="Baixando" value={stats.downloading} tone="chart-3" />
        <StatBox label="Falhas" value={stats.failed} tone="destructive" />
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="queued">Na Lista</SelectItem>
              <SelectItem value="downloading">Baixando</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <Button
            variant="secondary"
            disabled={selected.size === 0}
            onClick={() => {
              startDownload([...selected]);
              toast.success(`${selected.size} item(ns) na fila de download`);
              setSelected(new Set());
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar selecionados ({selected.size})
          </Button>
          <Button onClick={() => {
            const ids = filtered.map((i) => i.id);
            startDownload(ids);
            toast.success(`${ids.length} item(ns) enviados para a fila`);
          }}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Baixar tudo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-[40px_1fr_140px_100px_100px_160px_60px] gap-3 px-4 py-2.5 border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <Checkbox
              checked={allChecked}
              onCheckedChange={(v) => {
                const s = new Set(selected);
                if (v) filtered.forEach((i) => s.add(i.id));
                else filtered.forEach((i) => s.delete(i.id));
                setSelected(s);
              }}
            />
            <span>Título</span>
            <span>Categoria</span>
            <span>Tamanho</span>
            <span>Ano</span>
            <span>Status / Progresso</span>
            <span></span>
          </div>
          <div className="divide-y divide-border max-h-[520px] overflow-auto">
            {filtered.length === 0 && (
              <div className="p-10 text-center text-sm text-muted-foreground">Nenhum item corresponde aos filtros.</div>
            )}
            {filtered.map((it) => (
              <div key={it.id} className="grid grid-cols-[40px_1fr_140px_100px_100px_160px_60px] gap-3 px-4 py-3 items-center hover:bg-muted/40">
                <Checkbox checked={selected.has(it.id)} onCheckedChange={() => toggle(it.id)} />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{it.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {it.kind === "movie" ? "Filme" : "Série"} · id {it.id}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{it.category}</span>
                <span className="text-xs">{(it.sizeMB / 1024).toFixed(2)} GB</span>
                <span className="text-xs text-muted-foreground">{it.year ?? "—"}</span>
                <div>
                  {it.status === "downloading" ? (
                    <div className="space-y-1">
                      <Progress value={it.progress} />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{it.progress.toFixed(0)}%</span>
                        <span>{((it.sizeMB * it.progress) / 100 / 1024).toFixed(2)} / {(it.sizeMB / 1024).toFixed(2)} GB</span>
                      </div>
                    </div>
                  ) : (
                    <Badge
                      variant="secondary"
                      className={cn(
                        it.status === "completed" && "bg-success/20 text-success",
                        it.status === "failed" && "bg-destructive/20 text-destructive",
                        it.status === "queued" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {statusLabel[it.status]}
                    </Badge>
                  )}
                </div>
                <div className="flex justify-end">
                  {it.status === "failed" ? (
                    <Button variant="ghost" size="icon" onClick={() => { startDownload([it.id]); toast("Retentando..."); }}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => {
                      setItems((p) => p.filter((x) => x.id !== it.id));
                      toast("Item removido");
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ label, value, tone = "chart-1" }: { label: string; value: number; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold" style={{ color: `var(--${tone})` }}>{value}</div>
      </CardContent>
    </Card>
  );
}
