import { MatrixClient } from "matrix-js-sdk";

interface AvatarProps {
  userId?: string;
  displayName?: string;
  avatarUrl?: string | null;
  client?: MatrixClient | null;
  size?: number;
  className?: string;
}

function getInitials(name: string): string {
  return name.slice(0, 1).toUpperCase();
}

function hashColor(str: string): string {
  const colors = [
    "#e8635a", "#4a90d9", "#5cb85c", "#f5d76e",
    "#9b59b6", "#e67e22", "#1abc9c", "#e91e63",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ userId, displayName, avatarUrl, client, size = 36, className = "" }: AvatarProps) {
  const name = displayName ?? userId ?? "?";

  let httpUrl: string | null = null;
  if (avatarUrl && client) {
    httpUrl = client.mxcUrlToHttp(avatarUrl, size * 2, size * 2, "crop") ?? null;
  } else if (avatarUrl?.startsWith("http")) {
    httpUrl = avatarUrl;
  }

  const style = { width: size, height: size, minWidth: size };
  const bg = hashColor(userId ?? displayName ?? "?");

  if (httpUrl) {
    return (
      <img
        src={httpUrl}
        alt={name}
        style={style}
        className={`rounded-full object-cover border-2 border-paper-border ${className}`}
      />
    );
  }

  return (
    <div
      style={{ ...style, backgroundColor: bg }}
      className={`rounded-full flex items-center justify-center text-white font-bold border-2 border-paper-border ${className}`}
    >
      <span style={{ fontSize: size * 0.4 }}>{getInitials(name)}</span>
    </div>
  );
}
