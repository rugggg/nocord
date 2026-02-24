import { useStore } from "../../store";
import { Tooltip } from "../ui/Tooltip";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { getChildRooms, getNonSpaceRooms } from "../../lib/matrix/spaces";

export function SpaceSidebar() {
  const spaces = useStore((s) => s.spaces);
  const activeSpaceId = useStore((s) => s.activeSpaceId);
  const setActiveSpace = useStore((s) => s.setActiveSpace);
  const setRooms = useStore((s) => s.setRooms);
  const matrixClient = useStore((s) => s.matrixClient);
  const unreadByRoom = useStore((s) => s.unreadByRoom);
  const setActivePanel = useStore((s) => s.setActivePanel);

  const handleSpaceClick = (spaceId: string | null) => {
    setActiveSpace(spaceId);
    if (!matrixClient) return;
    if (spaceId === null) {
      setRooms(getNonSpaceRooms(matrixClient));
    } else {
      setRooms(getChildRooms(matrixClient, spaceId));
    }
  };

  const spaceUnread = (spaceId: string): number => {
    if (!matrixClient) return 0;
    const rooms = getChildRooms(matrixClient, spaceId);
    return rooms.reduce((sum, r) => sum + (unreadByRoom[r.roomId] ?? 0), 0);
  };

  return (
    <div className="flex flex-col items-center gap-2 py-3 w-[68px] bg-paper border-r-3 border-paper-border h-full overflow-y-auto">
      {/* Home */}
      <Tooltip content="Home" position="right">
        <button
          onClick={() => handleSpaceClick(null)}
          className={`space-icon-btn ${activeSpaceId === null ? "active" : ""}`}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2L2 8v10h5v-6h6v6h5V8L10 2z" />
          </svg>
        </button>
      </Tooltip>

      {spaces.length > 0 && (
        <div className="w-8 h-0.5 bg-paper-border rounded-full my-1" />
      )}

      {spaces.map((space) => {
        const name = space.name || space.roomId;
        const avatarUrl = space.getMxcAvatarUrl?.() ?? null;
        const unread = spaceUnread(space.roomId);
        const isActive = activeSpaceId === space.roomId;

        return (
          <Tooltip key={space.roomId} content={name} position="right">
            <div className="relative">
              <button
                onClick={() => handleSpaceClick(space.roomId)}
                className={`space-icon-btn overflow-hidden p-0 ${isActive ? "active" : ""}`}
              >
                <Avatar
                  userId={space.roomId}
                  displayName={name}
                  avatarUrl={avatarUrl}
                  client={matrixClient}
                  size={48}
                  className="rounded-none border-0"
                />
              </button>
              {unread > 0 && (
                <Badge count={unread} className="absolute -top-1 -right-1" />
              )}
            </div>
          </Tooltip>
        );
      })}

      <div className="flex-1" />

      {/* Settings */}
      <Tooltip content="Settings" position="right">
        <button
          onClick={() => setActivePanel("settings")}
          className="space-icon-btn"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </Tooltip>
    </div>
  );
}
