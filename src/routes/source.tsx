import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Radio, Globe, Server, PlugZap, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TopBar } from "@/components/top-bar";

export const Route = createFileRoute("/source")({
  head: () => ({
    meta: [
      { title: "Fonte M3U — M3U Sync" },
      { name: "description", content: "Configure a URL da lista M3U e o modo de aluguel de fonte." },
    ],
  }),
  component: SourcePage,
});

function SourcePage() {
  const [url, setUrl] = useState("http://provider.example.com/get.php?username=user&password=pass&type=m3u_plus");
  const [rental, setRental] = useState(false);
  const [domain, setDomain] = useState("stream.meudominio.com");
  const [httpPort, setHttpPort] = useState("8080");
  const [httpsPort, setHttpsPort] = useState("8443");
  const [testing, setTesting] = useState(false);
  const [categories, setCategories] = useState<string[] | null>(null);

  const testConnection = () => {
    setTesting(true);
    setCategories(null);
    setTimeout(() => {
      setTesting(false);
      setCategories(["Ação", "Comédia", "Drama", "Ficção Científica", "Terror", "Animação", "Documentário", "Anime", "Crime"]);
      toast.success("Conexão estabelecida", { description: "9 categorias · 2.481 itens encontrados" });
    }, 1400);
  };

  return (
    <>
      <TopBar title="Fonte M3U" subtitle="Configure a origem da lista e a distribuição do conteúdo" />
      <div className="p-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Radio className="h-4 w-4" /> Lista M3U</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="m3u">URL da lista</Label>
              <Input id="m3u" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://.../get.php?..." className="font-mono text-xs" />
              <p className="text-xs text-muted-foreground">Suporta formatos M3U e M3U Plus.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={testConnection} disabled={testing}>
                <PlugZap className="h-4 w-4 mr-2" />
                {testing ? "Testando..." : "Testar Conexão e Ler Categorias"}
              </Button>
              <Button variant="secondary" onClick={() => toast("Configuração salva")}>Salvar</Button>
            </div>

            {categories && (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium mb-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Categorias detectadas
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Badge key={c} variant="secondary">{c}</Badge>
                  ))}
                </div>
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
              <Switch checked={rental} onCheckedChange={(v) => { setRental(v); toast(v ? "Modo aluguel ativo" : "Modo aluguel desativado"); }} />
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
