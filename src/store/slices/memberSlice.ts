import { RoomMember } from "matrix-js-sdk";
import { StateCreator } from "zustand";
import { PresenceStatus } from "../../lib/matrix/presence";

export interface MemberSlice {
  membersByRoom: Record<string, RoomMember[]>;
  presenceByUser: Record<string, PresenceStatus>;
  setMembers: (roomId: string, members: RoomMember[]) => void;
  setPresence: (userId: string, presence: PresenceStatus) => void;
}

export const createMemberSlice: StateCreator<MemberSlice> = (set) => ({
  membersByRoom: {},
  presenceByUser: {},

  setMembers: (roomId, members) =>
    set((state) => ({
      membersByRoom: { ...state.membersByRoom, [roomId]: members },
    })),

  setPresence: (userId, presence) =>
    set((state) => ({
      presenceByUser: { ...state.presenceByUser, [userId]: presence },
    })),
});
