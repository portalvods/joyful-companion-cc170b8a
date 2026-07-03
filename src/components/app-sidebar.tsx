import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Activity, Database, Download, LogOut, Radio, Waypoints } from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAuth, isConfigured } from "@/lib/api";
import { toast } from "sonner";

const nav = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/source", label: "Fonte M3U", icon: Radio },
  { to: "/content", label: "Conteúdo", icon: Download },
  { to: "/sync", label: "Sincronização", icon: Waypoints },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const connected = isConfigured();
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
          <Database className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">M3U Sync</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Media Manager</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map((n) => {
          const active = pathname === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border text-xs text-muted-foreground space-y-2">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", connected ? "bg-success animate-pulse" : "bg-muted-foreground")} />
          {connected ? "Backend conectado" : "Modo demo (mock)"}
        </div>
        {connected ? (
          <button
            onClick={() => { clearAuth(); toast("Desconectado"); navigate({ to: "/login" }); }}
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <LogOut className="h-3 w-3" /> Sair
          </button>
        ) : (
          <Link to="/login" className="flex items-center gap-2 hover:text-foreground transition-colors">
            <LogOut className="h-3 w-3 rotate-180" /> Conectar backend
          </Link>
        )}
      </div>
    </aside>
  );
}
