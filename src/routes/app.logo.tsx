import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import { useProStore } from "@/lib/pro-store";

export const Route = createFileRoute("/app/logo")({
  component: LogoPage,
});

function LogoPage() {
  const { logoDataUrl, setLogo } = useProStore();
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | null) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(f);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="text-center">
        <ImageIcon className="h-12 w-12 mx-auto text-blue-400" />
        <h1 className="text-3xl font-black mt-3">Sua Logo</h1>
        <p className="text-slate-400 mt-2">Aplicada automaticamente em todos os banners gerados.</p>
      </header>

      <div className="rounded-2xl border border-white/5 bg-[#111b32] p-6">
        <div className="aspect-square max-w-sm mx-auto rounded-xl bg-[#0a0f1e] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
          {logoDataUrl ? (
            <img src={logoDataUrl} alt="Logo" className="w-full h-full object-contain p-4" />
          ) : (
            <div className="text-center text-slate-500">
              <Upload className="h-10 w-10 mx-auto" />
              <div className="mt-2 text-sm">Nenhuma logo carregada</div>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6 justify-center">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg">
            <Upload className="h-4 w-4" /> Escolher imagem
          </button>
          {logoDataUrl && (
            <button onClick={() => setLogo(null)} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold px-5 py-2.5 rounded-lg">
              <Trash2 className="h-4 w-4" /> Remover
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
