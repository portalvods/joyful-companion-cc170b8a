import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Radio, Globe, Server, PlugZap, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TopBar } from "@/components/top-bar";
import { api, isConfigured } from "@/lib/api";

export const Route = createFileRoute("/source")({
  head: () => ({
    meta: [
      { title: "Fonte M3U — M3U Sync" },
      { name: "description", content: "Configure a URL da lista M3U e o modo de aluguel de fonte." },
    ],
  }),
  component: SourcePage,
});

type TestResult = {
  ok: boolean;
  total?: number;
  movies?: number;
  series?: number;
  categories?: string[];
  error?: string;
};

function SourcePage() {
  const connected = isConfigured();
  const [url, setUrl] = useState("");
  const [rental, setRental] = useState(false);
  const [domain, setDomain] = useState("stream.meudominio.com");
  const [httpPort, setHttpPort] = useState("8080");
  const [httpsPort, setHttpsPort] = useState("8443");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  // Carrega settings do backend
  useEffect(() => {
    if (!connected) return;
    setLoading(true);
    api.settings()
      .then((s: any) => {
        if (s.m3u_url) setUrl(s.m3u_url);
        if (typeof s.rental_enabled === "boolean") setRental(s.rental_enabled);
        if (s.rental_domain) setDomain(s.rental_domain);
        if (s.rental_http_port) setHttpPort(String(s.rental_http_port));
        if (s.rental_https_port) setHttpsPort(String(s.rental_https_port));
      })
      .catch((e) => toast.error("Falha ao carregar configuração", { description: e.message }))
      .finally(() => setLoading(false));
  }, [connected]);

  const save = async () => {
    if (!connected) return toast.error("Backend não conectado");
    setSaving(true);
    try {
      await api.saveSettings({
        m3u_url: url,
        rental_enabled: rental,
        rental_domain: domain,
        rental_http_port: Number(httpPort),
        rental_https_port: Number(httpsPort),
      });
      toast.success("Configuração salva");
    } catch (e: any) {
      toast.error("Falha ao salvar", { description: e.message });
    } finally { setSaving(false); }
  };

  const testConnection = async () => {
    if (!connected) return toast.error("Backend não conectado");
    setTesting(true);
    setResult(null);
    try {
      const r = await api.testM3U(url || undefined);
      setResult({ ok: true, ...r });
      toast.success("Conexão OK", {
        description: `${r.total ?? 0} itens · ${r.categories?.length ?? 0} categorias`,
      });
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
      toast.error("Falha ao testar", { description: e.message });
    } finally { setTesting(false); }
  };

  const runSync = async () => {
    if (!connected) return toast.error("Backend não conectado");
    setSyncing(true);
    try {
      const r = await api.syncNow();
      toast.success("Sincronização iniciada", {
        description: `${r.total ?? "?"} itens processados`,
      });
    } catch (e: any) {
      toast.error("Falha ao sincronizar", { description: e.message });
    } finally { setSyncing(false); }
  };

  return (
    <>
      <TopBar title="Fonte M3U" subtitle="Configure a origem da lista e a distribuição do conteúdo" />
      <div className="p-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-4 w-4" /> Lista M3U
              {!connected && <Badge variant="destructive" className="ml-auto">Sem backend</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="m3u">URL da lista</Label>
              <Input
                id="m3u"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://.../get.php?username=...&password=...&type=m3u_plus"
                className="font-mono text-xs"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Suporta formatos M3U e M3U Plus. Salve antes de testar/sincronizar.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={save} disabled={!connected || saving || loading}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="secondary" onClick={testConnection} disabled={!connected || testing || loading}>
                <PlugZap className="h-4 w-4 mr-2" />
                {testing ? "Testando..." : "Testar conexão"}
              </Button>
              <Button variant="secondary" onClick={runSync} disabled={!connected || syncing || loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Sincronizando..." : "Sincronizar agora"}
              </Button>
            </div>

            {result && result.ok && (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium mb-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Conectado — {result.total ?? 0} itens ({result.movies ?? 0} filmes · {result.series ?? 0} séries)
                </div>
                {result.categories && result.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.categories.slice(0, 40).map((c) => (
                      <Badge key={c} variant="secondary">{c}</Badge>
                    ))}
                    {result.categories.length > 40 && (
                      <Badge variant="outline">+{result.categories.length - 40}</Badge>
                    )}
                  </div>
                )}
              </div>
            )}

            {result && !result.ok && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
                <div className="font-medium mb-1">Falha na conexão</div>
                <div className="text-xs font-mono break-all">{result.error}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Server className="h-4 w-4" /> Modo Aluguel de Fonte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">Habilitar</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Permite transmitir o conteúdo baixado sob seu próprio domínio.
                </p>
              </div>
              <Switch checked={rental} onCheckedChange={setRental} disabled={!connected} />
            </div>

            <div className={rental ? "space-y-4" : "space-y-4 opacity-50 pointer-events-none"}>
              <div className="space-y-2">
                <Label htmlFor="fqdn"><Globe className="h-3.5 w-3.5 inline mr-1" /> Domínio (FQDN)</Label>
                <Input id="fqdn" value={domain} onChange={(e) => setDomain(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="http">Porta HTTP</Label>
                  <Input id="http" value={httpPort} onChange={(e) => setHttpPort(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="https">Porta HTTPS</Label>
                  <Input id="https" value={httpsPort} onChange={(e) => setHttpsPort(e.target.value)} />
                </div>
              </div>
              <div className="rounded-md bg-muted/40 border border-border p-3 text-xs font-mono break-all">
                https://{domain}:{httpsPort}/stream/&lt;id&gt;.m3u8
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
