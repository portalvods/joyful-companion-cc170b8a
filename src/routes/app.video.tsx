import { createFileRoute } from "@tanstack/react-router";
import { Video } from "lucide-react";

export const Route = createFileRoute("/app/video")({
  component: () => <SoonPage icon={Video} title="Gerar Vídeo" desc="Vídeos animados a partir da sua rodada de jogos. Módulo em produção." />,
});

export function SoonPage({ icon: Icon, title, desc }: { icon: typeof Video; title: string; desc: string }) {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="inline-flex h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center shadow-xl shadow-blue-500/30">
        <Icon className="h-10 w-10 text-white" />
      </div>
      <h1 className="text-3xl font-black mt-6">{title}</h1>
      <p className="text-slate-400 mt-3">{desc}</p>
      <div className="mt-8 inline-block px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-bold">EM BREVE</div>
    </div>
  );
}
