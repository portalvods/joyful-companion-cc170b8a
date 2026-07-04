import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, Trophy, Dribbble, Award, Film, Video, MessageCircle, Coins } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

const shortcuts = [
  { to: "/app/express", label: "Geração Express", desc: "Múltiplos banners de uma vez", icon: Zap, color: "from-blue-500 to-purple-600" },
  { to: "/app/futebol", label: "Gerar Futebol", desc: "Banners de jogos", icon: Trophy, color: "from-emerald-500 to-cyan-600" },
  { to: "/app/nba", label: "Gerar NBA", desc: "Banners da NBA", icon: Dribbble, color: "from-orange-500 to-red-600" },
  { to: "/app/ufc", label: "Gerar UFC", desc: "Fight Night", icon: Award, color: "from-red-600 to-rose-700" },
  { to: "/app/filmes", label: "Filmes & Séries", desc: "Banners de entretenimento", icon: Film, color: "from-fuchsia-500 to-pink-600" },
  { to: "/app/video", label: "Gerar Vídeo", desc: "Vídeos animados", icon: Video, color: "from-amber-500 to-orange-600" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-black">
          Bem-vindo ao <span className="text-blue-500">GERADOR</span><span className="text-yellow-400">PRO</span>
        </h1>
        <p className="text-slate-400 mt-2">Escolha uma ferramenta abaixo para começar.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shortcuts.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.to}
              to={s.to}
              className="group relative overflow-hidden rounded-2xl bg-[#111b32] border border-white/5 p-6 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all"
            >
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{s.label}</h3>
              <p className="text-sm text-slate-400 mt-1">{s.desc}</p>
              <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-30 transition-opacity blur-2xl"
                style={{ backgroundImage: `linear-gradient(135deg, currentColor, transparent)` }} />
            </Link>
          );
        })}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={MessageCircle} label="WhatsApp" value="Configure agora" href="/app/whatsapp" tint="text-emerald-400" />
        <StatCard icon={Coins} label="Créditos" value="Ilimitado (demo)" href="/app/creditos" tint="text-yellow-400" />
        <StatCard icon={Trophy} label="Bolão Copa 2026" value="Participar" href="/app/bolao" tint="text-blue-400" />
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href, tint }: { icon: typeof Trophy; label: string; value: string; href: string; tint: string }) {
  return (
    <Link to={href} className="rounded-xl bg-[#111b32] border border-white/5 p-5 flex items-center gap-4 hover:border-white/10 transition">
      <div className={`h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center ${tint}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </Link>
  );
}
