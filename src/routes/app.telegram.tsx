import { createFileRoute } from "@tanstack/react-router";
import { Send, Check } from "lucide-react";
import { useProStore } from "@/lib/pro-store";
import { useState } from "react";

export const Route = createFileRoute("/app/telegram")({
  component: TelegramPage,
});

function TelegramPage() {
  const { telegram, setTelegram } = useProStore();
  const [saved, setSaved] = useState(false);
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <header className="text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-sky-500/10 items-center justify-center border border-sky-500/20">
          <Send className="h-8 w-8 text-sky-400" />
        </div>
        <h1 className="text-3xl font-black mt-4">Meu Telegram</h1>
        <p className="text-slate-400 mt-2">Link do seu canal para divulgação.</p>
      </header>
      <div className="rounded-2xl border border-white/5 bg-[#111b32] p-6 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Link ou @usuário</span>
          <input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@meucanal" className="mt-1 w-full bg-[#0a0f1e] border border-white/5 rounded-lg px-4 py-3 text-white text-lg focus:border-sky-500 outline-none" />
        </label>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-3 rounded-lg">
          {saved ? <><Check className="h-5 w-5" /> Salvo!</> : "Salvar"}
        </button>
      </div>
    </div>
  );
}
