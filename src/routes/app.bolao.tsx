import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Clock, Users, Lock, UserPlus, Edit3 } from "lucide-react";

export const Route = createFileRoute("/app/bolao")({
  component: BolaoPage,
});

function BolaoPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <section className="rounded-2xl bg-[#111b32] border border-white/5 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">◎ Palpite Oficial</div>
            <h1 className="text-3xl md:text-5xl font-black text-blue-500 mt-1">BOLÃO DA COPA 2026</h1>
            <p className="text-slate-400 mt-3">
              Acerte todos os placares para vencer. Se ninguém acertar tudo, o prêmio acumula para o próximo bolão.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <StatBox icon={Edit3} title="Uma única chance" desc="Depois de salvar, não poderá alterar." />
          <StatBox icon={Users} title="0 participantes" desc="Mais gente entrando no bolão." />
          <StatBox icon={Clock} title="Palpites encerrados" desc="Até 25/06/2026 às 22:30" />
        </div>
      </section>

      <section className="rounded-2xl bg-[#111b32] border border-white/5 p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-400" /> Seu palpite
          </h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-400">● ENCERRADO</span>
        </div>
        <div className="rounded-xl border-l-4 border-blue-500 bg-blue-500/5 p-4 text-sm text-slate-300">
          Acerte todos os placares exatos e ganhe 6 meses grátis de Gerador Pro! Será considerado o placar final da partida,
          sem contar a disputa de pênaltis. Se ninguém acertar todos os jogos, o prêmio acumula para o próximo bolão.
        </div>
        <div className="py-12 text-center text-slate-500">
          <Lock className="h-10 w-10 mx-auto opacity-50" />
          <div className="mt-3 text-sm">Os palpites desta rodada já foram encerrados.</div>
        </div>
      </section>

      <section className="rounded-2xl bg-[#111b32] border border-white/5 p-6 md:p-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-blue-400" /> Participação no bolão
        </h2>
        <div className="text-6xl font-black text-blue-500">0</div>
        <p className="text-slate-400 text-sm mt-1">pessoas já estão participando</p>
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
          <UserPlus className="h-8 w-8 text-emerald-400 mx-auto" />
          <div className="mt-2 font-bold text-white">Participações encerradas.</div>
          <div className="text-sm text-slate-400">Acompanhe os jogos e aguarde o resultado do bolão.</div>
        </div>
      </section>
    </div>
  );
}

function StatBox({ icon: Icon, title, desc }: { icon: typeof Trophy; title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-[#0a0f1e] border border-white/5 p-4 flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-blue-400" />
      </div>
      <div>
        <div className="font-bold text-white text-sm">{title}</div>
        <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
      </div>
    </div>
  );
}
