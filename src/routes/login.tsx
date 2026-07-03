import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Database, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api, setApiUrl, setToken, getApiUrl } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — M3U Sync" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [apiUrl, setUrl] = useState(getApiUrl() ?? "http://SEU_IP:3001");
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiUrl || !user || !pass) return;
    setBusy(true);
    try {
      const { token } = await api.login(apiUrl, user, pass);
      setApiUrl(apiUrl);
      setToken(token);
      toast.success("Conectado");
      nav({ to: "/" });
    } catch (err: any) {
      toast.error("Falha ao entrar", { description: err.message });
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-2">
            <Database className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>M3U Sync</CardTitle>
          <p className="text-xs text-muted-foreground">Painel de controle</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL da API</Label>
              <Input id="url" value={apiUrl} onChange={(e) => setUrl(e.target.value)} placeholder="http://SEU_IP:3001" className="font-mono text-xs" />
              <p className="text-[11px] text-muted-foreground">O endereço da sua VPS (porta 3001 por padrão).</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="u">Usuário</Label>
              <Input id="u" value={user} onChange={(e) => setUser(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Senha</Label>
              <Input id="p" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              <LogIn className="h-4 w-4 mr-2" /> {busy ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Sem backend? <a href="/" className="underline">Explorar em modo demo</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
