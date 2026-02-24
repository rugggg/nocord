import { StateCreator } from "zustand";

export interface DmEntry {
  userId: string;
  roomId: string;
}

export interface DmSlice {
  dms: DmEntry[];
  setDms: (dms: DmEntry[]) => void;
}

export const createDmSlice: StateCreator<DmSlice> = (set) => ({
  dms: [],
  setDms: (dms) => set({ dms }),
});
