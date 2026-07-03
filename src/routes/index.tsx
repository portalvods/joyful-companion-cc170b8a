import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Activity, Cpu, Gauge, HardDrive, MemoryStick, Pause, Play, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TopBar } from "@/components/top-bar";
import { initialLogs } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — M3U Sync" },
      { name: "description", content: "Monitoramento em tempo real de CPU, RAM, disco e downloads." },
    ],
  }),
  component: Dashboard,
});

type Point = { t: string; cpu: number; ram: number; net: number };

function seed(): Point[] {
  const arr: Point[] = [];
  for (let i = 30; i > 0; i--) {
    arr.push({
      t: `${i}s`,
      cpu: 25 + Math.random() * 40,
      ram: 45 + Math.random() * 25,
      net: 3 + Math.random() * 15,
    });
  }
  return arr;
}

function Dashboard() {
  const [data, setData] = useState<Point[]>(seed);
  const [running, setRunning] = useState(true);
  const [logs, setLogs] = useState(initialLogs);

  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => {
        const next = [...d.slice(1), {
          t: "now",
          cpu: Math.max(5, Math.min(95, d[d.length - 1].cpu + (Math.random() - 0.5) * 12)),
          ram: Math.max(20, Math.min(95, d[d.length - 1].ram + (Math.random() - 0.5) * 8)),
          net: Math.max(0.5, Math.min(50, d[d.length - 1].net + (Math.random() - 0.5) * 6)),
        }];
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const cur = data[data.length - 1];
  const diskUsed = 4.2;
  const diskTotal = 8.0;
  const diskPct = (diskUsed / diskTotal) * 100;

  return (
    <>
      <TopBar title="Dashboard" subtitle="Monitoramento de recursos e serviços em tempo real" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Cpu} label="CPU" value={`${cur.cpu.toFixed(1)}%`} sub="8 núcleos · 3.6 GHz" tone="chart-1" />
          <StatCard icon={MemoryStick} label="Memória RAM" value={`${cur.ram.toFixed(1)}%`} sub="10.4 / 16 GB" tone="chart-3" />
          <StatCard icon={HardDrive} label="Disco" value={`${diskPct.toFixed(0)}%`} sub={`${diskUsed} TB de ${diskTotal} TB`} tone="chart-4" />
          <StatCard icon={Zap} label="Download atual" value={`${cur.net.toFixed(1)} MB/s`} sub="3 downloads ativos" tone="chart-2" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recursos do sistema</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Últimos ~45 segundos</p>
              </div>
              <div className="flex gap-3 text-xs">
                <Legend color="var(--chart-1)" label="CPU" />
                <Legend color="var(--chart-3)" label="RAM" />
                <Legend color="var(--chart-2)" label="Net MB/s" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="t" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="cpu" stroke="var(--chart-1)" fill="url(#g1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="ram" stroke="var(--chart-3)" fill="url(#g2)" strokeWidth={2} />
                    <Area type="monotone" dataKey="net" stroke="var(--chart-2)" fill="url(#g3)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Status do serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Script de Sincronização</div>
                  <div className="text-xs text-muted-foreground">Cron: a cada 1 hora</div>
                </div>
                <Badge variant={running ? "default" : "secondary"} className={running ? "bg-success text-success-foreground" : ""}>
                  {running ? "Ativo" : "Pausado"}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Espaço em disco</span>
                  <span>{diskUsed} / {diskTotal} TB</span>
                </div>
                <Progress value={diskPct} />
                <div className="text-xs text-muted-foreground mt-1">{(diskTotal - diskUsed).toFixed(1)} TB disponíveis</div>
              </div>

              <div className="rounded-md border border-border bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gauge className="h-3.5 w-3.5" /> Velocidade atual</div>
                <div className="text-2xl font-semibold mt-1">{cur.net.toFixed(1)} <span className="text-sm text-muted-foreground">MB/s</span></div>
              </div>

              <Button
                className="w-full"
                variant={running ? "secondary" : "default"}
                onClick={() => {
                  setRunning((r) => !r);
                  setLogs((l) => [{ t: new Date().toLocaleTimeString(), msg: running ? "Sincronização pausada" : "Sincronização retomada", level: running ? "warn" : "success" }, ...l]);
                }}
              >
                {running ? <><Pause className="h-4 w-4 mr-2" />Pausar</> : <><Play className="h-4 w-4 mr-2" />Retomar</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Logs recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border font-mono text-xs">
              {logs.slice(0, 8).map((l, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <span className="text-muted-foreground w-20">{l.t}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] uppercase tracking-wide",
                    l.level === "success" && "bg-success/20 text-success",
                    l.level === "info" && "bg-chart-3/20 text-chart-3",
                    l.level === "warn" && "bg-warning/20 text-warning",
                    l.level === "error" && "bg-destructive/20 text-destructive",
                  )}>{l.level}</span>
                  <span className="text-foreground/90">{l.msg}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone }: { icon: any; label: string; value: string; sub: string; tone: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ background: `color-mix(in oklab, var(--${tone}) 20%, transparent)` }}>
            <Icon className="h-4 w-4" style={{ color: `var(--${tone})` }} />
          </div>
        </div>
        <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
