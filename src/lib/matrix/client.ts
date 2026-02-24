import { createClient, MatrixClient } from "matrix-js-sdk";
import { saveSession, loadSession, clearSession, MatrixSession } from "./session";

export async function loginWithPassword(
  homeserver: string,
  username: string,
  password: string
): Promise<{ client: MatrixClient; session: MatrixSession }> {
  // Step 1: temp client just for login
  const tempClient = createClient({ baseUrl: homeserver });

  const loginResponse = await tempClient.login("m.login.password", {
    user: username,
    password,
    initial_device_display_name: "nocord",
  });

  const session: MatrixSession = {
    userId: loginResponse.user_id,
    accessToken: loginResponse.access_token,
    homeserver,
    deviceId: loginResponse.device_id,
  };

  saveSession(session);

  // Step 2: fresh client with tokens
  const client = createClient({
    baseUrl: homeserver,
    userId: session.userId,
    accessToken: session.accessToken,
    deviceId: session.deviceId,
  });

  return { client, session };
}

export function createClientFromSession(session: MatrixSession): MatrixClient {
  return createClient({
    baseUrl: session.homeserver,
    userId: session.userId,
    accessToken: session.accessToken,
    deviceId: session.deviceId,
  });
}

export function logout(client: MatrixClient): void {
  try {
    client.stopClient();
    client.logout(true).catch(() => {});
  } catch {
    // ignore
  }
  clearSession();
}

export function restoreSession(): MatrixSession | null {
  return loadSession();
}
