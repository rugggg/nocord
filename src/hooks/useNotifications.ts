import { useEffect } from "react";
import { initNotifications, fireNotification } from "../lib/notifications/desktop";
import { useStore } from "../store";
import { MatrixClient, RoomEvent, MatrixEvent } from "matrix-js-sdk";

export function useNotifications(client: MatrixClient | null) {
  useEffect(() => {
    initNotifications().catch(console.error);
  }, []);

  useEffect(() => {
    if (!client) return;

    const onTimeline = (
      event: MatrixEvent,
      room: { roomId: string; name?: string } | undefined,
      toStartOfTimeline: boolean
    ) => {
      if (toStartOfTimeline) return;
      if (!room) return;
      const evType = event.getType();
      if (evType !== "m.room.message" && evType !== "m.room.encrypted") return;

      // Read activeRoomId without subscribing — same pattern as useMatrixSync
      const { activeRoomId } = useStore.getState();
      if (room.roomId === activeRoomId) return;

      const sender = event.getSender() ?? "Someone";
      const body = event.getContent()?.body ?? "";
      const roomName = room.name ?? room.roomId;
      fireNotification(`${sender} in ${roomName}`, body.slice(0, 100));
    };

    client.on(RoomEvent.Timeline as unknown as Parameters<typeof client.on>[0], onTimeline as Parameters<typeof client.on>[1]);
    return () => {
      client.removeListener(RoomEvent.Timeline as unknown as Parameters<typeof client.removeListener>[0], onTimeline as Parameters<typeof client.removeListener>[1]);
    };
  }, [client]); // no activeRoomId dep — AppShell no longer re-renders on room clicks
}
