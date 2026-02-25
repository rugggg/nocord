import { useEffect } from "react";
import { MatrixClient } from "matrix-js-sdk";
import { useStore } from "../store";

export function useRoomTimeline(client: MatrixClient | null, roomId: string | null) {
  const prependMessages = useStore((s) => s.prependMessages);

  useEffect(() => {
    if (!client || !roomId) return;

    const room = client.getRoom(roomId);
    if (!room) return;

    // Use getState() to check without subscribing — subscribing here would
    // cause ChatArea to re-render on every message in any room.
    if (useStore.getState().messagesByRoom[roomId]?.length) return;

    const loadHistory = async () => {
      try {
        await client.scrollback(room, 50);
      } catch (err) {
        console.warn("[useRoomTimeline] scrollback failed:", err);
      }

      const timeline = room.getLiveTimeline().getEvents();
      const msgEvents = timeline.filter(
        (e) => e.getType() === "m.room.message" || e.getType() === "m.room.encrypted"
      );
      if (msgEvents.length > 0) {
        prependMessages(roomId, msgEvents);
      }
    };

    loadHistory();
  }, [client, roomId]);
}
