import { create } from "zustand";
type FilterStoreType = {
  t1: string;
  t2: string;
};

export const useGraphThreeStore = create<FilterStoreType>((_set, _get) => ({
  t1: "",
  t2: "",
}));

export const useGraphThreeState = () => useGraphThreeStore((state) => state);
