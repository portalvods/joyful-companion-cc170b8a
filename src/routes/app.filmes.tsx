import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Film, Download } from "lucide-react";

export const Route = createFileRoute("/app/filmes")({
  component: FilmesPage,
});

function FilmesPage() {
  return <MediaBanner tipo="filme" />;
}

export function MediaBanner({ tipo }: { tipo: "filme" | "serie" }) {
  const [titulo, setTitulo] = useState("");
  const [genero, setGenero] = useState("");
  const [nota, setNota] = useState("");
  const [sinopse, setSinopse] = useState("");
  const [poster, setPoster] = useState("");

  const label = tipo === "filme" ? "Filme" : "Série / Novela";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="text-center">
        <Film className="h-12 w-12 mx-auto text-fuchsia-500" />
        <h1 className="text-3xl md:text-4xl font-black mt-3">
          Banner de <span className="bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent">{label}</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Field label="Título" value={titulo} onChange={setTitulo} placeholder={tipo === "filme" ? "Duna: Parte Dois" : "The Last of Us"} />
          <Field label="Gênero" value={genero} onChange={setGenero} placeholder="Ficção Científica" />
          <Field label="Nota IMDb" value={nota} onChange={setNota} placeholder="8.7" />
          <Field label="Poster (URL)" value={poster} onChange={setPoster} placeholder="https://..." />
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Sinopse</span>
            <textarea value={sinopse} onChange={(e) => setSinopse(e.target.value)} rows={4} className="mt-1 w-full bg-[#0a0f1e] border border-white/5 rounded-lg px-3 py-2 text-white focus:border-fuchsia-500 outline-none" />
          </label>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 relative bg-gradient-to-br from-fuchsia-900 via-purple-900 to-slate-900 aspect-[3/4]">
          {poster && <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" onError={(e) => (e.currentTarget.style.display = "none")} />}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            {genero && <div className="text-xs uppercase tracking-widest text-fuchsia-300">{genero}</div>}
            <h3 className="text-3xl font-black mt-1">{titulo || "Título do " + label}</h3>
            {nota && <div className="mt-2 inline-block bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">★ {nota}</div>}
            <p className="mt-3 text-sm text-slate-200 line-clamp-3">{sinopse || "Sinopse do conteúdo..."}</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold px-8 py-3 rounded-full hover:scale-105 transition">
          <Download className="h-5 w-5" /> Baixar (em breve)
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-300">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full bg-[#0a0f1e] border border-white/5 rounded-lg px-3 py-2 text-white focus:border-fuchsia-500 outline-none" />
    </label>
  );
}
