import { create } from "zustand";
import type { BannerBackground, BannerContent, BannerElement, BannerFormat } from "./banner-types";
import { FORMATS } from "./banner-types";
import { TEMPLATES, applyTemplate } from "./banner-templates";

type State = {
  format: BannerFormat;
  background: BannerBackground;
  elements: BannerElement[];
  selectedId: string | null;
  content: BannerContent;
  activeTemplateId: string | null;

  setFormat: (f: BannerFormat) => void;
  setBackground: (bg: BannerBackground) => void;
  select: (id: string | null) => void;
  updateElement: (id: string, patch: Partial<BannerElement>) => void;
  addElement: (el: BannerElement) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  applyTemplateById: (id: string) => void;
  setContent: (c: BannerContent) => void;
  setContentAndReapply: (c: BannerContent) => void;
};

const initialTemplate = TEMPLATES[0];
const initialContent: BannerContent = {
  kind: "match",
  team1: "Flamengo",
  team2: "Palmeiras",
  championship: "Brasileirão Série A",
  round: "Rodada 15",
  date: "Sábado",
  time: "21h30",
  venue: "Maracanã",
};
const initialBuild = applyTemplate(initialTemplate, initialContent);

export const useEditor = create<State>((set, get) => ({
  format: FORMATS[0],
  background: initialBuild.background,
  elements: initialBuild.elements,
  selectedId: null,
  content: initialContent,
  activeTemplateId: initialTemplate.id,

  setFormat: (f) => set({ format: f }),
  setBackground: (bg) => set({ background: bg }),
  select: (id) => set({ selectedId: id }),
  updateElement: (id, patch) => set((s) => ({
    elements: s.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  })),
  addElement: (el) => set((s) => ({ elements: [...s.elements, el], selectedId: el.id })),
  removeElement: (id) => set((s) => ({
    elements: s.elements.filter((e) => e.id !== id),
    selectedId: s.selectedId === id ? null : s.selectedId,
  })),
  duplicateElement: (id) => set((s) => {
    const el = s.elements.find((e) => e.id === id);
    if (!el) return s;
    const copy = { ...el, id: `${el.id}-${Date.now()}`, x: Math.min(el.x + 3, 90), y: Math.min(el.y + 3, 90) };
    return { elements: [...s.elements, copy], selectedId: copy.id };
  }),

  applyTemplateById: (id) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    const built = applyTemplate(t, get().content);
    const format = FORMATS.find((f) => f.id === t.format) ?? get().format;
    set({
      elements: built.elements,
      background: built.background,
      activeTemplateId: t.id,
      format,
      selectedId: null,
    });
  },

  setContent: (c) => set({ content: c }),
  setContentAndReapply: (c) => {
    const state = get();
    set({ content: c });
    const t = TEMPLATES.find((x) => x.id === state.activeTemplateId) ?? TEMPLATES[0];
    const built = applyTemplate(t, c);
    const format = FORMATS.find((f) => f.id === t.format) ?? state.format;
    set({
      elements: built.elements,
      background: built.background,
      activeTemplateId: t.id,
      format,
      selectedId: null,
    });
  },
}));
