import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Check } from "lucide-react";
import { useProStore } from "@/lib/pro-store";
import { useState } from "react";

export const Route = createFileRoute("/app/whatsapp")({
  component: WhatsappPage,
});

function WhatsappPage() {
  const { whatsapp, setWhatsapp } = useProStore();
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <header className="text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-emerald-500/10 items-center justify-center border border-emerald-500/20">
          <MessageCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-black mt-4">Configurar WhatsApp</h1>
        <p className="text-slate-400 mt-2">O número aparece automaticamente no rodapé dos banners.</p>
      </header>
      <div className="rounded-2xl border border-white/5 bg-[#111b32] p-6 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Número (com DDD)</span>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" className="mt-1 w-full bg-[#0a0f1e] border border-white/5 rounded-lg px-4 py-3 text-white text-lg focus:border-emerald-500 outline-none" />
        </label>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-lg transition">
          {saved ? <><Check className="h-5 w-5" /> Salvo!</> : "Salvar"}
        </button>
      </div>
    </div>
  );
}
