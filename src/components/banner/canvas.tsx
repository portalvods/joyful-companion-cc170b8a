import { useRef, useState, type MouseEvent as RME } from "react";
import { useEditor } from "@/lib/editor-store";
import type { BannerElement } from "@/lib/banner-types";

type DragState = {
  mode: "move" | "resize";
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
} | null;

function bgStyle(bg: ReturnType<typeof useEditor.getState>["background"]): React.CSSProperties {
  if (bg.type === "solid") return { background: bg.color };
  if (bg.type === "gradient") return { background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` };
  return {
    backgroundImage: bg.overlay
      ? `linear-gradient(${bg.overlay}, ${bg.overlay}), url(${bg.src})`
      : `url(${bg.src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

export function Canvas({ canvasId = "banner-canvas" }: { canvasId?: string }) {
  const { format, background, elements, selectedId, select, updateElement } = useEditor();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const aspect = format.w / format.h;

  const onDown = (e: RME, el: BannerElement, mode: "move" | "resize") => {
    e.stopPropagation();
    e.preventDefault();
    if (editingId) return;
    select(el.id);
    setDrag({
      mode, id: el.id,
      startX: e.clientX, startY: e.clientY,
      origX: el.x, origY: el.y, origW: el.w, origH: el.h,
    });
  };

  const onMove = (e: RME) => {
    if (!drag || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - drag.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.startY) / rect.height) * 100;
    if (drag.mode === "move") {
      updateElement(drag.id, {
        x: Math.max(0, Math.min(100 - drag.origW, drag.origX + dxPct)),
        y: Math.max(0, Math.min(100 - drag.origH, drag.origY + dyPct)),
      });
    } else {
      updateElement(drag.id, {
        w: Math.max(5, Math.min(100 - drag.origX, drag.origW + dxPct)),
        h: Math.max(3, Math.min(100 - drag.origY, drag.origH + dyPct)),
      });
    }
  };

  const onUp = () => setDrag(null);

  return (
    <div
      className="flex-1 flex items-center justify-center p-8 overflow-auto bg-[radial-gradient(ellipse_at_center,oklch(0.20_0.03_275)_0%,oklch(0.12_0.02_275)_70%)]"
      onClick={() => select(null)}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
    >
      <div
        ref={wrapRef}
        id={canvasId}
        className="relative shadow-2xl shadow-black/50 ring-1 ring-white/5 rounded-lg overflow-hidden select-none"
        style={{
          ...bgStyle(background),
          width: "min(70vh * " + aspect + ", 85%)",
          aspectRatio: `${format.w} / ${format.h}`,
          maxWidth: format.w > format.h ? "min(90%, 1100px)" : "min(70vh, 550px)",
        }}
        onClick={(e) => { e.stopPropagation(); select(null); }}
      >
        {elements.map((el) => (
          <ElementView
            key={el.id}
            el={el}
            selected={el.id === selectedId}
            editing={el.id === editingId}
            onDown={onDown}
            onDoubleClick={() => el.kind === "text" && setEditingId(el.id)}
            onEditEnd={() => setEditingId(null)}
          />
        ))}
      </div>
    </div>
  );
}

function ElementView({
  el, selected, editing, onDown, onDoubleClick, onEditEnd,
}: {
  el: BannerElement;
  selected: boolean;
  editing: boolean;
  onDown: (e: RME, el: BannerElement, mode: "move" | "resize") => void;
  onDoubleClick: () => void;
  onEditEnd: () => void;
}) {
  const { updateElement } = useEditor();

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${el.x}%`, top: `${el.y}%`,
    width: `${el.w}%`, height: `${el.h}%`,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
  };

  const inner = () => {
    if (el.kind === "text") {
      const textStyle: React.CSSProperties = {
        fontFamily: el.fontFamily,
        fontSize: `${(el.fontSize ?? 24) / 10}cqw`,
        fontWeight: el.fontWeight,
        color: el.color,
        textAlign: el.align,
        lineHeight: 1.1,
        width: "100%", height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start",
        containerType: "inline-size",
      };
      if (editing) {
        return (
          <textarea
            autoFocus
            defaultValue={el.text}
            onBlur={(e) => { updateElement(el.id, { text: e.target.value }); onEditEnd(); }}
            className="w-full h-full bg-transparent border-none outline-none resize-none"
            style={{ ...textStyle, padding: 0 }}
          />
        );
      }
      return <div style={textStyle}>{el.text}</div>;
    }
    if (el.kind === "image") {
      return <img src={el.src} alt="" className="w-full h-full object-cover" draggable={false} />;
    }
    // shape
    const shapeStyle: React.CSSProperties = {
      width: "100%", height: "100%",
      background: el.bg,
      borderRadius: el.shape === "circle" ? "50%" : el.shape === "pill" ? "999px" : `${el.radius ?? 8}px`,
    };
    return <div style={shapeStyle} />;
  };

  return (
    <div
      style={style}
      className={`group cursor-move ${selected ? "outline-2 outline-primary outline-dashed outline-offset-2" : ""}`}
      onMouseDown={(e) => onDown(e, el, "move")}
      onDoubleClick={onDoubleClick}
    >
      {inner()}
      {selected && !editing && (
        <div
          onMouseDown={(e) => onDown(e, el, "resize")}
          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-se-resize z-10"
        />
      )}
    </div>
  );
}
