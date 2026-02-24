import { MatrixEvent } from "matrix-js-sdk";
import { StateCreator } from "zustand";

export interface ReactionData {
  emoji: string;
  userIds: string[];
}

export interface MessageSlice {
  messagesByRoom: Record<string, MatrixEvent[]>;
  reactionsByEvent: Record<string, Record<string, string[]>>; // eventId -> emoji -> userIds
  addMessage: (roomId: string, event: MatrixEvent) => void;
  prependMessages: (roomId: string, events: MatrixEvent[]) => void;
  addReaction: (targetEventId: string, emoji: string, userId: string) => void;
  removeReaction: (targetEventId: string, emoji: string, userId: string) => void;
  clearRoom: (roomId: string) => void;
}

export const createMessageSlice: StateCreator<MessageSlice> = (set) => ({
  messagesByRoom: {},
  reactionsByEvent: {},

  addMessage: (roomId, event) =>
    set((state) => {
      const existing = state.messagesByRoom[roomId] ?? [];
      // Deduplicate by event id
      const id = event.getId();
      if (id && existing.some((e) => e.getId() === id)) return state;
      return { messagesByRoom: { ...state.messagesByRoom, [roomId]: [...existing, event] } };
    }),

  prependMessages: (roomId, events) =>
    set((state) => {
      const existing = state.messagesByRoom[roomId] ?? [];
      const existingIds = new Set(existing.map((e) => e.getId()));
      const newEvents = events.filter((e) => !existingIds.has(e.getId()));
      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: [...newEvents, ...existing],
        },
      };
    }),

  addReaction: (targetEventId, emoji, userId) =>
    set((state) => {
      const byEvent = state.reactionsByEvent[targetEventId] ?? {};
      const users = byEvent[emoji] ?? [];
      if (users.includes(userId)) return state;
      return {
        reactionsByEvent: {
          ...state.reactionsByEvent,
          [targetEventId]: { ...byEvent, [emoji]: [...users, userId] },
        },
      };
    }),

  removeReaction: (targetEventId, emoji, userId) =>
    set((state) => {
      const byEvent = state.reactionsByEvent[targetEventId] ?? {};
      const users = (byEvent[emoji] ?? []).filter((u) => u !== userId);
      return {
        reactionsByEvent: {
          ...state.reactionsByEvent,
          [targetEventId]: { ...byEvent, [emoji]: users },
        },
      };
    }),

  clearRoom: (roomId) =>
    set((state) => {
      const { [roomId]: _, ...rest } = state.messagesByRoom;
      return { messagesByRoom: rest };
    }),
});
