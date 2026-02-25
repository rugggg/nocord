import { useEffect } from "react";
import { MatrixClient, ClientEvent, RoomEvent, MatrixEvent } from "matrix-js-sdk";
import { useStore } from "../store";
import { getSpaces, getChildRooms, getNonSpaceRooms } from "../lib/matrix/spaces";
import { listenPresence } from "../lib/matrix/presence";

export function useMatrixSync(client: MatrixClient | null) {
  // Only pull stable action references — NOT reactive data like activeRoomId.
  // Reading activeRoomId/activeSpaceId reactively here would cause AppShell to
  // re-render on every room click, which can cascade into the "Maximum update
  // depth exceeded" error. Use getState() inside callbacks instead.
  const setSpaces = useStore((s) => s.setSpaces);
  const setRooms = useStore((s) => s.setRooms);
  const setDms = useStore((s) => s.setDms);
  const addMessage = useStore((s) => s.addMessage);
  const addReaction = useStore((s) => s.addReaction);
  const setPresence = useStore((s) => s.setPresence);
  const incrementUnread = useStore((s) => s.incrementUnread);

  useEffect(() => {
    if (!client) return;

    const refreshRooms = () => {
      // Read current space/room selection without subscribing
      const { activeSpaceId } = useStore.getState();

      const spaces = getSpaces(client);
      setSpaces(spaces);

      if (activeSpaceId) {
        setRooms(getChildRooms(client, activeSpaceId));
      } else {
        setRooms(getNonSpaceRooms(client));
      }

      const dmEvent = client.getAccountData("m.direct");
      if (dmEvent) {
        const content = dmEvent.getContent() as Record<string, string[]>;
        const dmEntries = Object.entries(content).flatMap(([userId, roomIds]) =>
          roomIds.map((roomId) => ({ userId, roomId }))
        );
        setDms(dmEntries);
      }
    };

    const onSync = (state: string) => {
      // Only do a full refresh on PREPARED (initial sync done).
      // Subsequent SYNCINGs are handled by the timeline listener below.
      if (state === "PREPARED") {
        refreshRooms();
      }
    };

    const onTimeline = (
      event: MatrixEvent,
      room: { roomId: string } | undefined,
      toStartOfTimeline: boolean
    ) => {
      if (toStartOfTimeline) return;
      if (!room) return;

      const type = event.getType();

      if (type === "m.reaction") {
        const relatesTo = event.getContent()?.["m.relates_to"] as
          | { rel_type?: string; event_id?: string; key?: string }
          | undefined;
        if (relatesTo?.rel_type === "m.annotation" && relatesTo.event_id && relatesTo.key) {
          addReaction(relatesTo.event_id, relatesTo.key, event.getSender() ?? "");
        }
        return;
      }

      if (type === "m.room.message" || type === "m.room.encrypted") {
        addMessage(room.roomId, event);

        // Read activeRoomId without subscribing
        const { activeRoomId } = useStore.getState();
        if (room.roomId !== activeRoomId) {
          incrementUnread(room.roomId);
        }
      }
    };

    const removePresenceListener = listenPresence(client, (userId, presence) => {
      setPresence(userId, presence);
    });

    // Use string literals to avoid SDK enum type-casting issues
    client.on("sync" as Parameters<typeof client.on>[0], onSync as Parameters<typeof client.on>[1]);
    client.on(RoomEvent.Timeline as Parameters<typeof client.on>[0], onTimeline as Parameters<typeof client.on>[1]);

    client.startClient({ initialSyncLimit: 30 });

    return () => {
      removePresenceListener();
      client.removeListener("sync" as Parameters<typeof client.removeListener>[0], onSync as Parameters<typeof client.removeListener>[1]);
      client.removeListener(RoomEvent.Timeline as Parameters<typeof client.removeListener>[0], onTimeline as Parameters<typeof client.removeListener>[1]);
      client.stopClient();
    };
  }, [client]);
}
