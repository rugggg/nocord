import { StateCreator } from "zustand";

const NOTIF_KEY = "nocord_notifications_enabled";

export interface NotificationSlice {
  unreadByRoom: Record<string, number>;
  notificationsEnabled: boolean;
  incrementUnread: (roomId: string) => void;
  clearUnread: (roomId: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const createNotificationSlice: StateCreator<NotificationSlice> = (set) => ({
  unreadByRoom: {},
  notificationsEnabled: localStorage.getItem(NOTIF_KEY) !== "false",

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

  setNotificationsEnabled: (enabled) => {
    localStorage.setItem(NOTIF_KEY, String(enabled));
    set({ notificationsEnabled: enabled });
  },
});
