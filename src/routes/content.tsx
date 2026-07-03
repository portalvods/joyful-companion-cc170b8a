import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Download, DownloadCloud, Film, Tv, RefreshCw, Trash2, X, Search,
  Play, AlertCircle, CheckCircle2, Clock, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TopBar } from "@/components/top-bar";
import { api, connectWS, isConfigured } from "@/lib/api";
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

type Kind = "movie" | "series";
type Status = "queued" | "pending" | "downloading" | "completed" | "failed";

type Item = {
  id: number;
  external_id?: string;
  title: string;
  kind: Kind;
  category: string | null;
  url: string;
  poster_url: string | null;
  size_bytes: number;
  downloaded_bytes: number;
  status: Status;
  file_path: string | null;
  error: string | null;
  discovered_at: number;
  updated_at: number;
};

const statusLabel: Record<Status, string> = {
  queued: "Na fila",
  pending: "Pendente",
  downloading: "Baixando",
  completed: "Concluído",
  failed: "Falhou",
};

const statusIcon: Record<Status, React.ComponentType<{ className?: string }>> = {
  queued: Clock,
  pending: Clock,
  downloading: Loader2,
  completed: CheckCircle2,
  failed: AlertCircle,
};

function fmtSize(bytes: number) {
  if (!bytes || bytes <= 0) return "—";
  const gb = bytes / 1e9;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / 1e6;
  return `${mb.toFixed(0)} MB`;
}

function ContentPage() {
  const connected = isConfigured();
  const [tab, setTab] = useState<Kind>("movie");

  if (!connected) {
    return (
      <>
        <TopBar title="Conteúdo" subtitle="Filmes e séries detectados na lista M3U" />
        <div className="p-6">
          <Card>
            <CardContent className="p-10 text-center space-y-2">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
              <div className="text-sm font-medium">Backend não conectado</div>
              <p className="text-xs text-muted-foreground">Configure a API URL na tela de login para ver o conteúdo real.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Conteúdo" subtitle="Filmes e séries detectados na lista M3U" />
      <div className="p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Kind)}>
          <TabsList>
            <TabsTrigger value="movie"><Film className="h-4 w-4 mr-2" /> Filmes</TabsTrigger>
            <TabsTrigger value="series"><Tv className="h-4 w-4 mr-2" /> Séries</TabsTrigger>
          </TabsList>

          <TabsContent value="movie" className="mt-4">
            <ContentList kind="movie" />
          </TabsContent>
          <TabsContent value="series" className="mt-4">
            <ContentList kind="series" />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function ContentList({ kind }: { kind: Kind }) {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState<Status | "all">("all");
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [limit, setLimit] = useState(200);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  // Debounce busca
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { kind, limit: String(limit) };
      if (category !== "Todas") params.category = category;
      if (status !== "all") params.status = status;
      if (qDebounced) params.q = qDebounced;
      const rows = await api.content(params);
      setItems(rows as Item[]);
    } catch (e: any) {
      toast.error("Falha ao carregar conteúdo", { description: e.message });
    } finally { setLoading(false); }
  }, [kind, category, status, qDebounced, limit]);

  useEffect(() => { load(); }, [load]);

  // Categorias
  useEffect(() => {
    api.categories(kind)
      .then((cs: string[]) => setCategories(["Todas", ...cs]))
      .catch(() => setCategories(["Todas"]));
  }, [kind]);

  // Progresso ao vivo via WebSocket
  useEffect(() => {
    const stop = connectWS({
      onContent: (upd: any) => {
        setItems((prev) => prev.map((it) => it.id === upd.id ? { ...it, ...upd } : it));
      },
    });
    return stop;
  }, []);

  const toggle = (id: number) => setSelected((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const allChecked = items.length > 0 && items.every((i) => selected.has(i.id));

  const doDownload = async (ids: number[]) => {
    if (!ids.length) return;
    setBusy(true);
    try {
      const r = await api.download(ids);
      toast.success(`${r.queued ?? ids.length} item(ns) na fila`);
      setSelected(new Set());
      await load();
    } catch (e: any) {
      toast.error("Falha ao enfileirar", { description: e.message });
    } finally { setBusy(false); }
  };

  const doDownloadAll = async () => {
    setBusy(true);
    try {
      const filters: Record<string, unknown> = { kind };
      if (category !== "Todas") filters.category = category;
      if (status !== "all") filters.status = status;
      const r = await api.downloadAll(filters);
      toast.success(`${r.queued ?? 0} item(ns) enfileirados (todos os filtrados)`);
      await load();
    } catch (e: any) {
      toast.error("Falha ao enfileirar em lote", { description: e.message });
    } finally { setBusy(false); }
  };

  const doCancel = async (id: number) => {
    try { await api.cancel(id); toast("Download cancelado"); await load(); }
    catch (e: any) { toast.error("Falha ao cancelar", { description: e.message }); }
  };

  const doRemove = async (id: number) => {
    if (!confirm("Remover este item e apagar o arquivo baixado (se houver)?")) return;
    try { await api.remove(id); toast("Item removido"); setItems((p) => p.filter((x) => x.id !== id)); }
    catch (e: any) { toast.error("Falha ao remover", { description: e.message }); }
  };

  const stats = useMemo(() => ({
    total: items.length,
    completed: items.filter((i) => i.status === "completed").length,
    downloading: items.filter((i) => i.status === "downloading").length,
    queued: items.filter((i) => i.status === "queued" || i.status === "pending").length,
    failed: items.filter((i) => i.status === "failed").length,
  }), [items]);

  const selectedArr = useMemo(() => [...selected], [selected]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-5">
        <StatBox label="Total" value={stats.total} />
        <StatBox label="Concluídos" value={stats.completed} tone="success" />
        <StatBox label="Baixando" value={stats.downloading} tone="chart-3" />
        <StatBox label="Na fila" value={stats.queued} tone="chart-1" />
        <StatBox label="Falhas" value={stats.failed} tone="destructive" />
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar título..."
              className="pl-8"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="queued">Na fila</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="downloading">Baixando</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>

          <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[100, 200, 500, 1000, 5000].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} itens</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" onClick={load} disabled={loading} title="Recarregar">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>

          <div className="w-full flex flex-wrap gap-2 pt-1">
            <Button
              variant="secondary"
              disabled={selected.size === 0 || busy}
              onClick={() => doDownload(selectedArr)}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar selecionados ({selected.size})
            </Button>
            <Button onClick={doDownloadAll} disabled={busy || items.length === 0}>
              <DownloadCloud className="h-4 w-4 mr-2" />
              Baixar tudo (filtrado)
            </Button>
            <div className="flex-1" />
            {selected.size > 0 && (
              <Button variant="ghost" onClick={() => setSelected(new Set())}>
                <X className="h-4 w-4 mr-2" /> Limpar seleção
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-[40px_64px_1fr_180px_110px_200px_90px] gap-3 px-4 py-2.5 border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <Checkbox
              checked={allChecked}
              onCheckedChange={(v) => {
                const s = new Set(selected);
                if (v) items.forEach((i) => s.add(i.id));
                else items.forEach((i) => s.delete(i.id));
                setSelected(s);
              }}
            />
            <span>Capa</span>
            <span>Título</span>
            <span>Categoria</span>
            <span>Tamanho</span>
            <span>Status</span>
            <span className="text-right">Ações</span>
          </div>

          <div className="divide-y divide-border max-h-[640px] overflow-auto">
            {loading && items.length === 0 && (
              <div className="p-10 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="p-10 text-center text-sm text-muted-foreground">
                Nenhum item. Rode uma sincronização em <b>Fonte M3U</b>.
              </div>
            )}
            {items.map((it) => {
              const pct = it.size_bytes > 0
                ? Math.min(100, (it.downloaded_bytes / it.size_bytes) * 100)
                : (it.status === "completed" ? 100 : 0);
              const StatusIcon = statusIcon[it.status];
              return (
                <div key={it.id} className="grid grid-cols-[40px_64px_1fr_180px_110px_200px_90px] gap-3 px-4 py-3 items-center hover:bg-muted/40">
                  <Checkbox checked={selected.has(it.id)} onCheckedChange={() => toggle(it.id)} />
                  <div className="h-16 w-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                    {it.poster_url ? (
                      <img
                        src={it.poster_url}
                        alt={it.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      (it.kind === "movie" ? <Film className="h-5 w-5 text-muted-foreground" /> : <Tv className="h-5 w-5 text-muted-foreground" />)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" title={it.title}>{it.title}</div>
                    <div className="text-xs text-muted-foreground truncate" title={it.url}>
                      {it.kind === "movie" ? "Filme" : "Série"} · #{it.id}
                      {it.error && <span className="text-destructive"> · {it.error.slice(0, 60)}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{it.category ?? "—"}</span>
                  <span className="text-xs">
                    {fmtSize(it.size_bytes)}
                    {it.status === "downloading" && it.downloaded_bytes > 0 && (
                      <div className="text-[10px] text-muted-foreground">
                        {fmtSize(it.downloaded_bytes)} baixado
                      </div>
                    )}
                  </span>
                  <div>
                    {it.status === "downloading" ? (
                      <div className="space-y-1">
                        <Progress value={pct} />
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> {pct.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "gap-1",
                          it.status === "completed" && "bg-success/20 text-success",
                          it.status === "failed" && "bg-destructive/20 text-destructive",
                          (it.status === "queued" || it.status === "pending") && "bg-muted text-muted-foreground",
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusLabel[it.status]}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-end gap-1">
                    {it.status === "downloading" && (
                      <Button variant="ghost" size="icon" title="Cancelar" onClick={() => doCancel(it.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {(it.status === "failed" || it.status === "queued" || it.status === "pending") && (
                      <Button variant="ghost" size="icon" title="Baixar" onClick={() => doDownload([it.id])}>
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {it.status === "failed" && (
                      <Button variant="ghost" size="icon" title="Retentar" onClick={() => doDownload([it.id])}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" title="Remover" onClick={() => doRemove(it.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          {items.length >= limit && (
            <div className="p-3 text-center text-xs text-muted-foreground border-t border-border">
              Exibindo {items.length} itens (limite atual). Aumente o limite acima para ver mais.
            </div>
          )}
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
