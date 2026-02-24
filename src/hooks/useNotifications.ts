import { useEffect } from "react";
import { initNotifications, fireNotification } from "../lib/notifications/desktop";
import { useStore } from "../store";
import { MatrixClient, RoomEvent, MatrixEvent } from "matrix-js-sdk";

export function useNotifications(client: MatrixClient | null) {
  const activeRoomId = useStore((s) => s.activeRoomId);

  useEffect(() => {
    initNotifications().catch(console.error);
  }, []);

  useEffect(() => {
    if (!client) return;

    const onTimeline = (event: MatrixEvent, room: { roomId: string; name?: string } | undefined, toStartOfTimeline: boolean) => {
      if (toStartOfTimeline) return;
      if (!room) return;
      if (room.roomId === activeRoomId) return;
      if (event.getType() !== "m.room.message") return;

      const sender = event.getSender() ?? "Someone";
      const body = event.getContent()?.body ?? "";
      const roomName = (room as { name?: string }).name ?? room.roomId;

      fireNotification(`${sender} in ${roomName}`, body.slice(0, 100));
    };

    client.on(RoomEvent.Timeline as unknown as Parameters<typeof client.on>[0], onTimeline as Parameters<typeof client.on>[1]);
    return () => {
      client.removeListener(RoomEvent.Timeline as unknown as Parameters<typeof client.removeListener>[0], onTimeline as Parameters<typeof client.removeListener>[1]);
    };
  }, [client, activeRoomId]);
}
