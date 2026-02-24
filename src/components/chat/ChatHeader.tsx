import { useStore } from "../../store";
import { openElementCall } from "../../lib/call/elementCall";

export function ChatHeader() {
  const activeRoomId = useStore((s) => s.activeRoomId);
  const matrixClient = useStore((s) => s.matrixClient);
  const toggleMemberSidebar = useStore((s) => s.toggleMemberSidebar);
  const userId = useStore((s) => s.userId);

  const room = activeRoomId && matrixClient ? matrixClient.getRoom(activeRoomId) : null;
  const roomName = room?.name ?? "";
  const topic = room?.currentState.getStateEvents("m.room.topic", "")?.getContent()?.topic ?? "";

  const handleCall = () => {
    if (!activeRoomId) return;
    const displayName = userId?.split(":")[0].slice(1) ?? "User";
    openElementCall(activeRoomId, displayName).catch(console.error);
  };

  if (!room) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-paper border-b-3 border-paper-border shadow-paper-sm">
      {/* Channel icon + name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <svg width="18" height="18" fill="currentColor" className="text-pm-gray flex-shrink-0" viewBox="0 0 16 16">
          <path d="M1 3a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H5l-3 3V3z" />
        </svg>
        <h2 className="font-extrabold text-pm-dark truncate">{roomName}</h2>
        {topic && (
          <>
            <div className="w-px h-5 bg-paper-border flex-shrink-0" />
            <p className="text-sm text-pm-gray truncate">{topic}</p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Voice call */}
        <button
          onClick={handleCall}
          className="p-2 rounded-lg text-pm-gray hover:text-leaf-green hover:bg-parchment transition-colors"
          title="Start voice/video call"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.01 2 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
          </svg>
        </button>

        {/* Toggle member list */}
        <button
          onClick={toggleMemberSidebar}
          className="p-2 rounded-lg text-pm-gray hover:text-sky-blue hover:bg-parchment transition-colors"
          title="Toggle member list"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      </div>
    </div>
  );
}
