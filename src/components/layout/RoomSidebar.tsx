import { useStore } from "../../store";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";

function RoomIcon() {
  return (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
      <path d="M1 3a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H5l-3 3V3z" />
    </svg>
  );
}

function DmIcon() {
  return (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12a5 5 0 110-10A5 5 0 018 13z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

export function RoomSidebar() {
  const rooms = useStore((s) => s.rooms);
  const dms = useStore((s) => s.dms);
  const activeRoomId = useStore((s) => s.activeRoomId);
  const setActiveRoom = useStore((s) => s.setActiveRoom);
  const clearUnread = useStore((s) => s.clearUnread);
  const unreadByRoom = useStore((s) => s.unreadByRoom);
  const matrixClient = useStore((s) => s.matrixClient);
  const spaces = useStore((s) => s.spaces);
  const activeSpaceId = useStore((s) => s.activeSpaceId);

  const handleRoomClick = (roomId: string) => {
    setActiveRoom(roomId);
    clearUnread(roomId);
  };

  const activeSpaceName = activeSpaceId
    ? (spaces.find((s) => s.roomId === activeSpaceId)?.name ?? "Space")
    : "Home";

  return (
    <div className="flex flex-col w-[232px] bg-parchment border-r-3 border-paper-border h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b-3 border-paper-border bg-paper shadow-paper-sm">
        <h2 className="font-extrabold text-pm-dark text-sm uppercase tracking-wide truncate">
          {activeSpaceName}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2">
        {/* Channels */}
        {rooms.length > 0 && (
          <div className="mb-2">
            <div className="px-2 py-1 text-xs font-extrabold text-pm-gray uppercase tracking-wider">
              Channels
            </div>
            {rooms.map((room) => {
              const isActive = activeRoomId === room.roomId;
              const unread = unreadByRoom[room.roomId] ?? 0;
              return (
                <button
                  key={room.roomId}
                  onClick={() => handleRoomClick(room.roomId)}
                  className={`channel-item w-full text-left ${isActive ? "active" : ""}`}
                >
                  <span className="opacity-60">
                    <RoomIcon />
                  </span>
                  <span className="flex-1 truncate">{room.name || room.roomId}</span>
                  {unread > 0 && <Badge count={unread} />}
                </button>
              );
            })}
          </div>
        )}

        {/* DMs */}
        {dms.length > 0 && (
          <div className="mt-3">
            <div className="px-2 py-1 text-xs font-extrabold text-pm-gray uppercase tracking-wider">
              Direct Messages
            </div>
            {dms.map(({ userId, roomId }) => {
              const room = matrixClient?.getRoom(roomId);
              const member = room?.getMember(userId);
              const displayName = member?.name ?? userId;
              const avatarUrl = member?.getMxcAvatarUrl?.() ?? null;
              const isActive = activeRoomId === roomId;
              const unread = unreadByRoom[roomId] ?? 0;

              return (
                <button
                  key={roomId}
                  onClick={() => handleRoomClick(roomId)}
                  className={`channel-item w-full text-left ${isActive ? "active" : ""}`}
                >
                  <Avatar
                    userId={userId}
                    displayName={displayName}
                    avatarUrl={avatarUrl}
                    client={matrixClient}
                    size={20}
                  />
                  <span className="flex-1 truncate">{displayName}</span>
                  {unread > 0 && <Badge count={unread} />}
                </button>
              );
            })}
          </div>
        )}

        {rooms.length === 0 && dms.length === 0 && (
          <p className="text-pm-gray text-xs text-center mt-8 px-4">
            No channels here yet.
          </p>
        )}
      </div>
    </div>
  );
}
