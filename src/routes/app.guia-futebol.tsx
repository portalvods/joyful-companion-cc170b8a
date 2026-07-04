import { createFileRoute } from "@tanstack/react-router";
import { Hand } from "lucide-react";

export const Route = createFileRoute("/app/guia-futebol")({
  component: () => (
    <div className="max-w-2xl mx-auto text-center py-16">
      <Hand className="h-16 w-16 text-blue-500 mx-auto" />
      <h1 className="text-3xl font-black mt-6">Guia do Futebol</h1>
      <p className="text-slate-400 mt-3">
        Consulta rápida de campeonatos, tabelas e horários. Este módulo está em construção — em breve,
        integração com a agenda oficial para preencher os banners com um clique.
      </p>
      <div className="mt-8 rounded-xl border border-white/5 bg-[#111b32] p-6 text-left space-y-2 text-sm text-slate-300">
        <div><span className="text-blue-400 font-bold">•</span> Brasileirão Série A/B</div>
        <div><span className="text-blue-400 font-bold">•</span> Copa do Brasil</div>
        <div><span className="text-blue-400 font-bold">•</span> Libertadores / Sul-Americana</div>
        <div><span className="text-blue-400 font-bold">•</span> Champions League / Premier League</div>
        <div><span className="text-blue-400 font-bold">•</span> La Liga / Serie A / Bundesliga</div>
      </div>
    </div>
  ),
});
