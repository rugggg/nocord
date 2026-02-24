import { useEffect } from "react";
import { MatrixClient } from "matrix-js-sdk";
import { useStore } from "../store";

export function useRoomTimeline(client: MatrixClient | null, roomId: string | null) {
  const prependMessages = useStore((s) => s.prependMessages);
  const messagesByRoom = useStore((s) => s.messagesByRoom);

  useEffect(() => {
    if (!client || !roomId) return;

    const room = client.getRoom(roomId);
    if (!room) return;

    // Only load if we haven't loaded this room yet
    if (messagesByRoom[roomId]?.length) return;

    client.scrollback(room, 50).then(() => {
      const timeline = room.getLiveTimeline().getEvents();
      const msgEvents = timeline.filter(
        (e) => e.getType() === "m.room.message"
      );
      if (msgEvents.length > 0) {
        prependMessages(roomId, msgEvents);
      }
    });
  }, [client, roomId]);
}
