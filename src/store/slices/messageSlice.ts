import { MatrixEvent } from "matrix-js-sdk";
import { StateCreator } from "zustand";

export interface ReactionData {
  emoji: string;
  userIds: string[];
}

export interface MessageSlice {
  messagesByRoom: Record<string, MatrixEvent[]>;
  reactionsByEvent: Record<string, Record<string, string[]>>; // eventId -> emoji -> userIds
  // Allows looking up the reaction event to redact when the user toggles off a reaction.
  // reactionEventId -> { targetEventId, emoji, userId }
  reactionEventLookup: Record<string, { targetEventId: string; emoji: string; userId: string }>;
  addMessage: (roomId: string, event: MatrixEvent) => void;
  prependMessages: (roomId: string, events: MatrixEvent[]) => void;
  addReaction: (targetEventId: string, emoji: string, userId: string, reactionEventId: string) => void;
  removeReaction: (targetEventId: string, emoji: string, userId: string) => void;
  redactReaction: (reactionEventId: string) => void;
  clearRoom: (roomId: string) => void;
}

export const createMessageSlice: StateCreator<MessageSlice> = (set) => ({
  messagesByRoom: {},
  reactionsByEvent: {},
  reactionEventLookup: {},

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

  addReaction: (targetEventId, emoji, userId, reactionEventId) =>
    set((state) => {
      const byEvent = state.reactionsByEvent[targetEventId] ?? {};
      const users = byEvent[emoji] ?? [];
      if (users.includes(userId)) return state;
      return {
        reactionsByEvent: {
          ...state.reactionsByEvent,
          [targetEventId]: { ...byEvent, [emoji]: [...users, userId] },
        },
        reactionEventLookup: {
          ...state.reactionEventLookup,
          [reactionEventId]: { targetEventId, emoji, userId },
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

  redactReaction: (reactionEventId) =>
    set((state) => {
      const entry = state.reactionEventLookup[reactionEventId];
      if (!entry) return state;
      const { targetEventId, emoji, userId } = entry;
      const byEvent = state.reactionsByEvent[targetEventId] ?? {};
      const users = (byEvent[emoji] ?? []).filter((u) => u !== userId);
      const { [reactionEventId]: _removed, ...restLookup } = state.reactionEventLookup;
      return {
        reactionsByEvent: {
          ...state.reactionsByEvent,
          [targetEventId]: { ...byEvent, [emoji]: users },
        },
        reactionEventLookup: restLookup,
      };
    }),

  clearRoom: (roomId) =>
    set((state) => {
      const { [roomId]: _, ...rest } = state.messagesByRoom;
      return { messagesByRoom: rest };
    }),
});
