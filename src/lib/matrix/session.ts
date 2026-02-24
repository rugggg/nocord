const SESSION_KEY = "nocord_session";

export interface MatrixSession {
  userId: string;
  accessToken: string;
  homeserver: string;
  deviceId: string;
}

export function saveSession(session: MatrixSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): MatrixSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MatrixSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
