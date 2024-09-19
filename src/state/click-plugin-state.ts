import { create } from "zustand";

type FilterStoreType = {
  selectedDarts: string[];
  actions: { toggleSelectedDarts: (val: string) => void };
};

export const useClickPluginStore = create<FilterStoreType>((set, get) => ({
  selectedDarts: [],

  actions: {
    toggleSelectedDarts: (val: string) => {
      if (get().selectedDarts.includes(val)) {
        const filtered = get().selectedDarts.filter((item) => item !== val);
        set({ selectedDarts: filtered });
      } else {
        const newArr = [...get().selectedDarts];
        newArr.push(val);
        set({ selectedDarts: newArr });
      }
    },
  },
}));

export const useClickPluginState = () => useClickPluginStore((state) => state);
export const useClickPluginActions = () =>
  useClickPluginStore((state) => state.actions);
