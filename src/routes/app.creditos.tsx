import { createFileRoute } from "@tanstack/react-router";
import { Coins, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/creditos")({
  component: CreditosPage,
});

const plans = [
  { name: "Mensal", price: "R$ 35", period: "/mês", features: ["Banners ilimitados", "Todos os modelos", "Sem fidelidade", "Suporte incluso"], popular: false },
  { name: "Trimestral", price: "R$ 89", period: "/3 meses", features: ["Tudo do Mensal", "Economia de 15%", "Modelos exclusivos", "Prioridade no suporte"], popular: true },
  { name: "Anual", price: "R$ 299", period: "/ano", features: ["Tudo do Trimestral", "Economia de 30%", "Modelos VIP", "Acesso antecipado a novidades"], popular: false },
];

function CreditosPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <Coins className="h-12 w-12 mx-auto text-yellow-400" />
        <h1 className="text-4xl font-black mt-3">Planos & Créditos</h1>
        <p className="text-slate-400 mt-2">Escolha o plano ideal. Cancele quando quiser.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((p) => (
          <div key={p.name} className={`relative rounded-2xl border p-6 ${p.popular ? "border-yellow-400 bg-gradient-to-b from-yellow-500/10 to-transparent" : "border-white/5 bg-[#111b32]"}`}>
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> MAIS ESCOLHIDO
              </div>
            )}
            <h3 className="text-xl font-bold">{p.name}</h3>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-black">{p.price}</span>
              <span className="text-slate-400 text-sm mb-1">{p.period}</span>
            </div>
            <ul className="mt-6 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400" /> {f}
                </li>
              ))}
            </ul>
            <button className={`mt-6 w-full py-3 rounded-lg font-bold transition ${p.popular ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
              Assinar (em breve)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
