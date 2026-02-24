import { Room } from "matrix-js-sdk";
import { StateCreator } from "zustand";

export interface RoomSlice {
  rooms: Room[];
  activeRoomId: string | null;
  setRooms: (rooms: Room[]) => void;
  setActiveRoom: (roomId: string | null) => void;
}

export const createRoomSlice: StateCreator<RoomSlice> = (set) => ({
  rooms: [],
  activeRoomId: null,
  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (activeRoomId) => set({ activeRoomId }),
});
