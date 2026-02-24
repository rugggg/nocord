import { MatrixClient } from "matrix-js-sdk";
import { StateCreator } from "zustand";
import { loginWithPassword, createClientFromSession, logout as doLogout, restoreSession } from "../../lib/matrix/client";

export type AuthStatus = "loading" | "unauthenticated" | "authenticated";

export interface AuthSlice {
  authStatus: AuthStatus;
  matrixClient: MatrixClient | null;
  userId: string | null;
  homeserver: string | null;
  login: (homeserver: string, username: string, password: string) => Promise<void>;
  restoreSession: () => Promise<MatrixClient | null>;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  authStatus: "loading",
  matrixClient: null,
  userId: null,
  homeserver: null,

  login: async (homeserver, username, password) => {
    const { client, session } = await loginWithPassword(homeserver, username, password);
    set({
      authStatus: "authenticated",
      matrixClient: client,
      userId: session.userId,
      homeserver: session.homeserver,
    });
  },

  restoreSession: async () => {
    const session = restoreSession();
    if (!session) {
      set({ authStatus: "unauthenticated" });
      return null;
    }
    const client = createClientFromSession(session);
    set({
      authStatus: "authenticated",
      matrixClient: client,
      userId: session.userId,
      homeserver: session.homeserver,
    });
    return client;
  },

  logout: () => {
    const { matrixClient } = get();
    if (matrixClient) doLogout(matrixClient);
    set({ authStatus: "unauthenticated", matrixClient: null, userId: null, homeserver: null });
  },
});
