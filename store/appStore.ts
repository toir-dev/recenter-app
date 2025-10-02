import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type AppState = {
  ready: boolean;
  toggleReady: () => void;
  setReady: (value: boolean) => void;
};

export const useAppStore = create<AppState>()(
  immer((set) => ({
    ready: false,
    toggleReady: () =>
      set((state) => {
        state.ready = !state.ready;
      }),
    setReady: (value: boolean) =>
      set((state) => {
        state.ready = value;
      }),
  }))
);
