import { MatrixClient, UserEvent } from "matrix-js-sdk";

export type PresenceStatus = "online" | "offline" | "unavailable";

export function listenPresence(
  client: MatrixClient,
  callback: (userId: string, presence: PresenceStatus) => void
): () => void {
  const handler = (event: { getSender: () => string | undefined; getContent: () => { presence?: string } }) => {
    const userId = event.getSender?.() ?? "";
    const presence = (event.getContent?.()?.presence ?? "offline") as PresenceStatus;
    if (userId) callback(userId, presence);
  };

  client.on(UserEvent.Presence as unknown as Parameters<typeof client.on>[0], handler as Parameters<typeof client.on>[1]);

  return () => {
    client.removeListener(UserEvent.Presence as unknown as Parameters<typeof client.removeListener>[0], handler as Parameters<typeof client.removeListener>[1]);
  };
}

export function getUserPresence(client: MatrixClient, userId: string): PresenceStatus {
  const user = client.getUser(userId);
  if (!user) return "offline";
  const p = user.presence;
  if (p === "online" || p === "unavailable") return p;
  return "offline";
}
