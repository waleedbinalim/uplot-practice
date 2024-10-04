import { create } from "zustand";

type StoreType = {
  graphControl: string;

  actions: {
    setGraphControl: (val: string) => void;
  };
};

export const useDeviceDataControlsStore = create<StoreType>((set) => ({
  graphControl: "",

  actions: {
    setGraphControl: (val) => set({ graphControl: val }),
  },
}));

export const useDeviceDataControlState = () =>
  useDeviceDataControlsStore((state) => state);

export const useDeviceDataControlActions = () =>
  useDeviceDataControlsStore((state) => state.actions);
