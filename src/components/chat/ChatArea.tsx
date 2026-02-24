import { useStore } from "../../store";
import { useRoomTimeline } from "../../hooks/useRoomTimeline";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

export function ChatArea() {
  const activeRoomId = useStore((s) => s.activeRoomId);
  const matrixClient = useStore((s) => s.matrixClient);
  const setReplyTo = useStore((s) => s.setReplyTo);

  useRoomTimeline(matrixClient, activeRoomId);

  if (!activeRoomId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-parchment">
        <div className="text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-xl font-extrabold text-pm-dark">Pick a channel</h2>
          <p className="text-pm-gray text-sm mt-2">Select a channel from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-parchment overflow-hidden">
      <ChatHeader />
      <MessageList roomId={activeRoomId} onReply={setReplyTo} />
      <MessageInput roomId={activeRoomId} />
    </div>
  );
}
