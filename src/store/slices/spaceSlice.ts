import { Room } from "matrix-js-sdk";
import { StateCreator } from "zustand";

export interface SpaceSlice {
  spaces: Room[];
  activeSpaceId: string | null;
  setSpaces: (spaces: Room[]) => void;
  setActiveSpace: (spaceId: string | null) => void;
}

export const createSpaceSlice: StateCreator<SpaceSlice> = (set) => ({
  spaces: [],
  activeSpaceId: null,
  setSpaces: (spaces) => set({ spaces }),
  setActiveSpace: (activeSpaceId) => set({ activeSpaceId }),
});
