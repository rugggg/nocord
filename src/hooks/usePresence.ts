import { useEffect } from "react";
import { MatrixClient } from "matrix-js-sdk";
import { useStore } from "../store";
import { listenPresence } from "../lib/matrix/presence";

export function usePresence(client: MatrixClient | null) {
  const setPresence = useStore((s) => s.setPresence);

  useEffect(() => {
    if (!client) return;
    const remove = listenPresence(client, (userId, presence) => {
      setPresence(userId, presence);
    });
    return remove;
  }, [client]);
}
