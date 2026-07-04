import { Copy, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, MoveUp, MoveDown } from "lucide-react";
import { useEditor } from "@/lib/editor-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const FONTS = [
  { v: "'Space Grotesk', sans-serif", l: "Space Grotesk" },
  { v: "'Inter', sans-serif", l: "Inter" },
  { v: "'Bebas Neue', sans-serif", l: "Bebas Neue" },
  { v: "'Playfair Display', serif", l: "Playfair" },
];

export function RightSidebar() {
  const { elements, selectedId, updateElement, removeElement, duplicateElement } = useEditor();
  const el = elements.find((e) => e.id === selectedId);

  if (!el) {
    return (
      <aside className="w-[300px] border-l border-sidebar-border bg-sidebar p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Propriedades</div>
        <div className="text-xs text-muted-foreground mt-8 text-center">
          Selecione um elemento no canvas pra editar suas propriedades.
        </div>
        <div className="text-[10px] text-muted-foreground mt-4 text-center opacity-70">
          Duplo-clique em texto pra editar
        </div>
      </aside>
    );
  }

  const patch = (p: Parameters<typeof updateElement>[1]) => updateElement(el.id, p);

  return (
    <aside className="w-[300px] border-l border-sidebar-border bg-sidebar p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {el.kind === "text" ? "Texto" : el.kind === "image" ? "Imagem" : "Forma"}
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => duplicateElement(el.id)} title="Duplicar">
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => removeElement(el.id)} title="Excluir">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {el.kind === "text" && (
        <div className="space-y-4">
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground">Conteúdo</Label>
            <Input value={el.text ?? ""} onChange={(e) => patch({ text: e.target.value })} className="mt-1 bg-sidebar-accent/50 border-sidebar-border" />
          </div>
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground">Fonte</Label>
            <select
              value={el.fontFamily}
              onChange={(e) => patch({ fontFamily: e.target.value })}
              className="mt-1 w-full h-9 rounded-md bg-sidebar-accent/50 border border-sidebar-border px-2 text-xs"
            >
              {FONTS.map((f) => <option key={f.v} value={f.v} style={{ fontFamily: f.v }}>{f.l}</option>)}
            </select>
          </div>
          <div>
            <div className="flex justify-between">
              <Label className="text-[10px] uppercase text-muted-foreground">Tamanho</Label>
              <span className="text-[10px] text-muted-foreground">{el.fontSize}px</span>
            </div>
            <Slider
              value={[el.fontSize ?? 24]} min={10} max={200} step={2}
              onValueChange={([v]) => patch({ fontSize: v })}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground">Cor</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color" value={el.color ?? "#ffffff"}
                onChange={(e) => patch({ color: e.target.value })}
                className="h-9 w-12 rounded bg-transparent border border-sidebar-border cursor-pointer"
              />
              <Input value={el.color ?? "#ffffff"} onChange={(e) => patch({ color: e.target.value })} className="bg-sidebar-accent/50 border-sidebar-border" />
            </div>
          </div>
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground">Alinhamento</Label>
            <div className="flex gap-1 mt-1">
              {[
                { v: "left", i: AlignLeft },
                { v: "center", i: AlignCenter },
                { v: "right", i: AlignRight },
              ].map((a) => (
                <Button
                  key={a.v}
                  size="sm"
                  variant={el.align === a.v ? "default" : "ghost"}
                  className="flex-1 h-8"
                  onClick={() => patch({ align: a.v as "left" | "center" | "right" })}
                ><a.i className="w-3.5 h-3.5" /></Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground">Peso</Label>
            <div className="flex gap-1 mt-1">
              {[400, 500, 700, 900].map((w) => (
                <Button
                  key={w}
                  size="sm"
                  variant={el.fontWeight === w ? "default" : "ghost"}
                  className="flex-1 h-8 text-xs"
                  onClick={() => patch({ fontWeight: w })}
                >{w === 700 ? <Bold className="w-3 h-3" /> : w}</Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {el.kind === "shape" && (
        <div className="space-y-4">
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground">Cor</Label>
            <div className="flex gap-2 mt-1">
              <input type="color" value={el.bg ?? "#ffffff"} onChange={(e) => patch({ bg: e.target.value })} className="h-9 w-12 rounded border border-sidebar-border cursor-pointer" />
              <Input value={el.bg ?? "#ffffff"} onChange={(e) => patch({ bg: e.target.value })} className="bg-sidebar-accent/50 border-sidebar-border" />
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <Label className="text-[10px] uppercase text-muted-foreground">Raio</Label>
              <span className="text-[10px] text-muted-foreground">{el.radius ?? 8}px</span>
            </div>
            <Slider value={[el.radius ?? 8]} min={0} max={200} step={2} onValueChange={([v]) => patch({ radius: v })} className="mt-2" />
          </div>
        </div>
      )}

      {el.kind === "image" && (
        <div>
          <Label className="text-[10px] uppercase text-muted-foreground">URL da imagem</Label>
          <Input value={el.src ?? ""} onChange={(e) => patch({ src: e.target.value })} className="mt-1 bg-sidebar-accent/50 border-sidebar-border" />
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-sidebar-border">
        <Label className="text-[10px] uppercase text-muted-foreground">Posição e tamanho</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <span className="text-[10px] text-muted-foreground">X</span>
            <Input type="number" value={Math.round(el.x)} onChange={(e) => patch({ x: Number(e.target.value) })} className="h-8 bg-sidebar-accent/50 border-sidebar-border text-xs" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Y</span>
            <Input type="number" value={Math.round(el.y)} onChange={(e) => patch({ y: Number(e.target.value) })} className="h-8 bg-sidebar-accent/50 border-sidebar-border text-xs" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">W</span>
            <Input type="number" value={Math.round(el.w)} onChange={(e) => patch({ w: Number(e.target.value) })} className="h-8 bg-sidebar-accent/50 border-sidebar-border text-xs" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">H</span>
            <Input type="number" value={Math.round(el.h)} onChange={(e) => patch({ h: Number(e.target.value) })} className="h-8 bg-sidebar-accent/50 border-sidebar-border text-xs" />
          </div>
        </div>
      </div>
    </aside>
  );
}
