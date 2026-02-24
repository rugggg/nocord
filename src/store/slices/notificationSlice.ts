import { StateCreator } from "zustand";

export interface NotificationSlice {
  unreadByRoom: Record<string, number>;
  incrementUnread: (roomId: string) => void;
  clearUnread: (roomId: string) => void;
}

export const createNotificationSlice: StateCreator<NotificationSlice> = (set) => ({
  unreadByRoom: {},

  incrementUnread: (roomId) =>
    set((state) => ({
      unreadByRoom: {
        ...state.unreadByRoom,
        [roomId]: (state.unreadByRoom[roomId] ?? 0) + 1,
      },
    })),

  clearUnread: (roomId) =>
    set((state) => {
      const { [roomId]: _, ...rest } = state.unreadByRoom;
      return { unreadByRoom: rest };
    }),
});
