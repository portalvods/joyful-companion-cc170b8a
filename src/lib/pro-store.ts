import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SelectedModel = { id: string; color?: string };

type ProState = {
  whatsapp: string;
  telegram: string;
  logoDataUrl: string | null;
  favorites: string[];
  selected: SelectedModel[];
  setWhatsapp: (v: string) => void;
  setTelegram: (v: string) => void;
  setLogo: (v: string | null) => void;
  toggleFavorite: (id: string) => void;
  toggleSelected: (id: string, color?: string) => void;
  setColor: (id: string, color: string) => void;
  clearSelected: () => void;
};

export const useProStore = create<ProState>()(
  persist(
    (set, get) => ({
      whatsapp: "",
      telegram: "",
      logoDataUrl: null,
      favorites: [],
      selected: [],
      setWhatsapp: (v) => set({ whatsapp: v }),
      setTelegram: (v) => set({ telegram: v }),
      setLogo: (v) => set({ logoDataUrl: v }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      toggleSelected: (id, color) => {
        const cur = get().selected;
        const exists = cur.find((s) => s.id === id);
        if (exists) set({ selected: cur.filter((s) => s.id !== id) });
        else set({ selected: [...cur, { id, color }] });
      },
      setColor: (id, color) =>
        set((s) => ({
          selected: s.selected.map((x) => (x.id === id ? { ...x, color } : x)),
        })),
      clearSelected: () => set({ selected: [] }),
    }),
    { name: "gerador-pro" },
  ),
);
