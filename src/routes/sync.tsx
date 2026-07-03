import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, Sparkles, Waypoints, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { TopBar } from "@/components/top-bar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sync")({
  head: () => ({
    meta: [
      { title: "Sincronização — M3U Sync" },
      { name: "description", content: "Agendamento de cron e auto-download de novos conteúdos." },
    ],
  }),
  component: SyncPage,
});

const schedules = [
  { id: "1h", label: "A cada 1 hora", cron: "0 * * * *" },
  { id: "12h", label: "A cada 12 horas", cron: "0 */12 * * *" },
  { id: "daily", label: "Diariamente às 03:00", cron: "0 3 * * *" },
  { id: "weekly", label: "Semanalmente (Dom 04:00)", cron: "0 4 * * 0" },
];

const history = [
  { t: "Hoje 12:03", added: 4, updated: 12, status: "ok" as const },
  { t: "Hoje 11:03", added: 0, updated: 8, status: "ok" as const },
  { t: "Hoje 10:03", added: 2, updated: 7, status: "ok" as const },
  { t: "Hoje 09:03", added: 0, updated: 0, status: "err" as const },
  { t: "Ontem 23:03", added: 11, updated: 24, status: "ok" as const },
];

function SyncPage() {
  const [schedule, setSchedule] = useState("1h");
  const [autoDownload, setAutoDownload] = useState(true);
  const [enabled, setEnabled] = useState(true);

  return (
    <>
      <TopBar title="Sincronização Automática" subtitle="Programe verificações periódicas e automatize downloads" />
      <div className="p-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Agendamento (Cron)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
              <div>
                <div className="text-sm font-medium">Sincronização automática</div>
                <div className="text-xs text-muted-foreground">Ativa/desativa a rotina agendada</div>
              </div>
              <Switch checked={enabled} onCheckedChange={(v) => { setEnabled(v); toast(v ? "Cron ativo" : "Cron desativado"); }} />
            </div>

            <RadioGroup value={schedule} onValueChange={setSchedule} className="grid gap-3 md:grid-cols-2">
              {schedules.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors",
                    schedule === s.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40",
                    !enabled && "opacity-50 pointer-events-none",
                  )}
                >
                  <RadioGroupItem value={s.id} id={s.id} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-xs text-muted-foreground font-mono">{s.cron}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>

            <div className="flex gap-2">
              <Button onClick={() => toast.success("Sincronização iniciada manualmente")}>
                <Waypoints className="h-4 w-4 mr-2" /> Sincronizar agora
              </Button>
              <Button variant="secondary" onClick={() => toast("Configuração salva")}>Salvar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Auto-download</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label className="text-sm font-medium">Baixar novos conteúdos</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Filmes e séries novos detectados na M3U são adicionados à fila automaticamente.
                </p>
              </div>
              <Switch checked={autoDownload} onCheckedChange={(v) => { setAutoDownload(v); toast(v ? "Auto-download ativado" : "Auto-download desativado"); }} />
            </div>

            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Próxima execução</span><span>em 42 min</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Última sincronização</span><span>12:03:11</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Itens adicionados hoje</span><span>17</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Histórico de sincronização</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {history.map((h, i) => (
                <div key={i} className="grid grid-cols-4 items-center px-6 py-3 text-sm">
                  <span className="text-muted-foreground">{h.t}</span>
                  <span>{h.added} adicionados</span>
                  <span>{h.updated} atualizados</span>
                  <span className="justify-self-end">
                    <Badge className={h.status === "ok" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"} variant="secondary">
                      {h.status === "ok" ? "Sucesso" : "Falha"}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
