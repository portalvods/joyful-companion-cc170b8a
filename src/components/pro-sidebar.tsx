import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, MessageCircle, CreditCard, Zap, Video, Megaphone, Trophy,
  CircleDot, Hand, Dribbble, Award, Flag, Film, Tv, Image as ImageIcon,
  Send, Coins, Link2, LogOut, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  to: string;
  label: string;
  icon: typeof Home;
  badge?: string;
  soon?: boolean;
};

const items: Item[] = [
  { to: "/app", label: "Dashboard", icon: Home },
  { to: "/app/whatsapp", label: "Configurar WhatsApp", icon: MessageCircle },
  { to: "/app/creditos", label: "Mercado Pago", icon: CreditCard, badge: "EM BREVE", soon: true },
  { to: "/app/express", label: "Gerar Express", icon: Zap },
  { to: "/app/video", label: "Gerar Vídeo", icon: Video },
  { to: "/app/video-divulgacao", label: "Vídeo divulgação", icon: Megaphone },
  { to: "/app/bolao", label: "Bolão Copa", icon: Trophy },
  { to: "/app/futebol", label: "Gerar Futebol", icon: CircleDot },
  { to: "/app/guia-futebol", label: "Guia Futebol", icon: Hand },
  { to: "/app/nba", label: "Gerar NBA", icon: Dribbble },
  { to: "/app/ufc", label: "Gerar ufc", icon: Award },
  { to: "/app/todos-esportes", label: "Todos esportes", icon: Trophy },
  { to: "/app/f1", label: "Fórmula 1", icon: Flag },
  { to: "/app/filmes", label: "Gerar Banner Filme", icon: Film },
  { to: "/app/series", label: "Gerar Banner Séries/Novelas", icon: Tv },
  { to: "/app/logo", label: "Logo", icon: ImageIcon },
  { to: "/app/telegram", label: "Meu Telegram", icon: Send },
  { to: "/app/creditos", label: "Comprar Créditos", icon: Coins, badge: "★" },
  { to: "/app/indicacao", label: "Link de Indicação", icon: Link2 },
];

export function ProSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#0d1424] border-r border-white/5 h-screen sticky top-0 overflow-y-auto">
      <div className="p-5 border-b border-white/5">
        <Link to="/" className="block text-center">
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-blue-500">GERADOR</span>
            <span className="text-yellow-400">PRO</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Painel Administrativo</p>
        </Link>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {items.map((it) => {
          const isActive = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to + it.label}
              to={it.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
                it.soon && "opacity-60",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{it.label}</span>
              {it.badge && it.badge !== "★" && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                  {it.badge}
                </span>
              )}
              {it.badge === "★" && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Link>
      </div>
    </aside>
  );
}
