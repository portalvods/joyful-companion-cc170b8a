import { Download, FileImage, FileText } from "lucide-react";
import { toast } from "sonner";
import { toPng, toJpeg } from "html-to-image";
import { useEditor } from "@/lib/editor-store";
import { FORMATS } from "@/lib/banner-types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function TopBar({ canvasId }: { canvasId: string }) {
  const { format, setFormat } = useEditor();

  async function exportAs(type: "png" | "jpg" | "pdf") {
    const node = document.getElementById(canvasId);
    if (!node) return;
    try {
      const scale = format.w / node.clientWidth;
      const opts = {
        pixelRatio: scale,
        cacheBust: true,
        backgroundColor: "#000000",
      };
      let dataUrl: string;
      if (type === "jpg") dataUrl = await toJpeg(node, { ...opts, quality: 0.95 });
      else dataUrl = await toPng(node, opts);

      if (type === "pdf") {
        // "sugestão de PDF" — abre em nova aba pra impressão
        const w = window.open();
        if (w) {
          w.document.write(`<img src="${dataUrl}" style="max-width:100%" onload="window.print()" />`);
          w.document.close();
        }
        toast.info("Use 'Salvar como PDF' na janela de impressão");
        return;
      }
      const link = document.createElement("a");
      link.download = `banner-${Date.now()}.${type}`;
      link.href = dataUrl;
      link.click();
      toast.success(`Banner exportado (${type.toUpperCase()})`);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao exportar");
    }
  }

  return (
    <header className="h-14 border-b border-sidebar-border bg-sidebar/80 backdrop-blur px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground">Formato:</div>
        <select
          value={format.id}
          onChange={(e) => setFormat(FORMATS.find((f) => f.id === e.target.value)!)}
          className="h-8 rounded-md bg-sidebar-accent border border-sidebar-border px-2 text-xs"
        >
          {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
        <div className="text-[10px] text-muted-foreground">{format.w}×{format.h}px</div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-neon-gradient hover:opacity-90 text-white font-semibold shadow-neon">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border">
          <DropdownMenuItem onClick={() => exportAs("png")}><FileImage className="w-4 h-4 mr-2" /> PNG (alta qualidade)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportAs("jpg")}><FileImage className="w-4 h-4 mr-2" /> JPG (otimizado)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportAs("pdf")}><FileText className="w-4 h-4 mr-2" /> PDF (via impressão)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
