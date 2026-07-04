import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Dribbble, Award, Flag } from "lucide-react";

export const Route = createFileRoute("/app/todos-esportes")({
  component: TodosPage,
});

const sports = [
  { to: "/app/futebol", label: "Futebol", icon: Trophy, color: "from-emerald-500 to-cyan-600" },
  { to: "/app/nba", label: "NBA / Basquete", icon: Dribbble, color: "from-orange-500 to-red-600" },
  { to: "/app/ufc", label: "UFC / MMA", icon: Award, color: "from-red-600 to-rose-700" },
  { to: "/app/f1", label: "Fórmula 1", icon: Flag, color: "from-amber-500 to-orange-600" },
];

function TodosPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-black">🏆 <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Todos os Esportes</span></h1>
        <p className="text-slate-400 mt-2">Selecione a modalidade para começar.</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sports.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.to} to={s.to} className="group rounded-2xl p-8 bg-[#111b32] border border-white/5 hover:border-white/20 transition text-center">
              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color}`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className="mt-4 text-xl font-bold">{s.label}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
