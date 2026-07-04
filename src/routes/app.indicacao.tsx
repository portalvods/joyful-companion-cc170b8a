import { createFileRoute } from "@tanstack/react-router";
import { Link2, Copy, Check, Users, DollarSign } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/indicacao")({
  component: IndicacaoPage,
});

function IndicacaoPage() {
  const [copied, setCopied] = useState(false);
  const link = "https://geradorpro.app/r/SEUCODIGO";

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="text-center">
        <Link2 className="h-12 w-12 mx-auto text-blue-400" />
        <h1 className="text-3xl font-black mt-3">Link de Indicação</h1>
        <p className="text-slate-400 mt-2">Ganhe créditos indicando amigos.</p>
      </header>

      <div className="rounded-2xl bg-[#111b32] border border-white/5 p-6">
        <label className="text-sm font-semibold text-slate-300">Seu link</label>
        <div className="mt-2 flex gap-2">
          <input readOnly value={link} className="flex-1 bg-[#0a0f1e] border border-white/5 rounded-lg px-3 py-2.5 text-white text-sm" />
          <button onClick={copy} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 rounded-lg">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#111b32] border border-white/5 p-6 text-center">
          <Users className="h-8 w-8 text-blue-400 mx-auto" />
          <div className="text-3xl font-black mt-2">0</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Indicações</div>
        </div>
        <div className="rounded-2xl bg-[#111b32] border border-white/5 p-6 text-center">
          <DollarSign className="h-8 w-8 text-emerald-400 mx-auto" />
          <div className="text-3xl font-black mt-2">R$ 0</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Ganhos</div>
        </div>
      </div>
    </div>
  );
}
