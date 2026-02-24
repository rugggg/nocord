import { useEffect, useRef } from "react";
import { MatrixClient, ClientEvent, RoomEvent, MatrixEvent } from "matrix-js-sdk";
import { useStore } from "../store";
import { getSpaces, getChildRooms, getNonSpaceRooms } from "../lib/matrix/spaces";
import { listenPresence } from "../lib/matrix/presence";

export function useMatrixSync(client: MatrixClient | null) {
  const setSpaces = useStore((s) => s.setSpaces);
  const setRooms = useStore((s) => s.setRooms);
  const setDms = useStore((s) => s.setDms);
  const addMessage = useStore((s) => s.addMessage);
  const addReaction = useStore((s) => s.addReaction);
  const setPresence = useStore((s) => s.setPresence);
  const activeRoomId = useStore((s) => s.activeRoomId);
  const activeSpaceId = useStore((s) => s.activeSpaceId);
  const incrementUnread = useStore((s) => s.incrementUnread);

  const activeRoomRef = useRef(activeRoomId);
  const activeSpaceRef = useRef(activeSpaceId);

  useEffect(() => {
    activeRoomRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    activeSpaceRef.current = activeSpaceId;
  }, [activeSpaceId]);

  useEffect(() => {
    if (!client) return;

    const refreshRooms = () => {
      const spaces = getSpaces(client);
      setSpaces(spaces);

      const spaceId = activeSpaceRef.current;
      if (spaceId) {
        setRooms(getChildRooms(client, spaceId));
      } else {
        setRooms(getNonSpaceRooms(client));
      }

      // Refresh DMs from account data
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
      if (state === "PREPARED" || state === "SYNCING") {
        refreshRooms();
      }
    };

    const onTimeline = (event: MatrixEvent, room: { roomId: string } | undefined, toStartOfTimeline: boolean) => {
      if (toStartOfTimeline) return;
      if (!room) return;

      const type = event.getType();

      if (type === "m.reaction") {
        const relatesTo = event.getContent()?.["m.relates_to"] as { rel_type?: string; event_id?: string; key?: string } | undefined;
        if (relatesTo?.rel_type === "m.annotation" && relatesTo.event_id && relatesTo.key) {
          addReaction(relatesTo.event_id, relatesTo.key, event.getSender() ?? "");
        }
        return;
      }

      if (type === "m.room.message") {
        addMessage(room.roomId, event);

        // Increment unread if not in this room
        if (room.roomId !== activeRoomRef.current) {
          incrementUnread(room.roomId);
        }
      }
    };

    // Attach presence listener
    const removePresenceListener = listenPresence(client, (userId, presence) => {
      setPresence(userId, presence);
    });

    client.on(ClientEvent.Sync as unknown as Parameters<typeof client.on>[0], onSync as Parameters<typeof client.on>[1]);
    client.on(RoomEvent.Timeline as unknown as Parameters<typeof client.on>[0], onTimeline as Parameters<typeof client.on>[1]);

    // Start the client
    client.startClient({ initialSyncLimit: 30 });

    return () => {
      removePresenceListener();
      client.removeListener(ClientEvent.Sync as unknown as Parameters<typeof client.removeListener>[0], onSync as Parameters<typeof client.removeListener>[1]);
      client.removeListener(RoomEvent.Timeline as unknown as Parameters<typeof client.removeListener>[0], onTimeline as Parameters<typeof client.removeListener>[1]);
    };
  }, [client]);
}
