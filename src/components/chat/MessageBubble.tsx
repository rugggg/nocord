import { MatrixEvent, MatrixClient } from "matrix-js-sdk";
import { motion } from "framer-motion";
import { useStore } from "../../store";
import { Avatar } from "../ui/Avatar";
import { ReactionBar } from "./ReactionBar";
import { JSX } from "react";

interface MessageBubbleProps {
  event: MatrixEvent;
  roomId: string;
  onReply?: (event: MatrixEvent) => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderBody(event: MatrixEvent, client: MatrixClient | null): JSX.Element {
  if (event.getType() === "m.room.encrypted") {
    return (
      <span className="italic text-pm-gray text-sm">
        🔒 Encrypted message (E2EE not yet supported)
      </span>
    );
  }

  const content = event.getContent();
  const msgtype = content?.msgtype as string | undefined;
  const formattedBody = content?.formatted_body as string | undefined;

  if (msgtype === "m.image") {
    const url = content?.url as string;
    const httpUrl = url && client ? (client.mxcUrlToHttp(url) ?? url) : url;
    return (
      <img
        src={httpUrl}
        alt={content?.body ?? "image"}
        className="max-w-sm max-h-64 rounded-lg border-2 border-paper-border mt-1"
        loading="lazy"
      />
    );
  }

  if (formattedBody) {
    return (
      <span
        className="message-content"
        dangerouslySetInnerHTML={{ __html: formattedBody }}
      />
    );
  }

  return <span>{content?.body ?? ""}</span>;
}

export function MessageBubble({ event, roomId, onReply }: MessageBubbleProps) {
  const matrixClient = useStore((s) => s.matrixClient);
  const userId = useStore((s) => s.userId);

  const senderId = event.getSender() ?? "";
  const room = matrixClient?.getRoom(roomId);
  const member = room?.getMember(senderId);
  const displayName = member?.name ?? senderId;
  const avatarUrl = member?.getMxcAvatarUrl?.() ?? null;
  const ts = event.getTs();
  const eventId = event.getId() ?? "";
  const isMine = senderId === userId;

  const replyToId = (event.getContent()?.["m.relates_to"] as Record<string, Record<string, string>> | undefined)
    ?.["m.in_reply_to"]?.event_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`flex gap-3 px-4 py-1.5 group hover:bg-parchment/50 ${isMine ? "flex-row-reverse" : ""}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Avatar
          userId={senderId}
          displayName={displayName}
          avatarUrl={avatarUrl}
          client={matrixClient}
          size={36}
        />
      </div>

      <div className={`flex flex-col max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
        <div className={`flex items-baseline gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
          <span className="text-sm font-bold text-pm-dark">{displayName}</span>
          <span className="text-xs text-pm-gray">{formatTime(ts)}</span>
        </div>

        {replyToId && (
          <div className="text-xs text-pm-gray bg-parchment border-l-4 border-paper-border px-2 py-0.5 rounded mb-1 max-w-full truncate">
            Replying to a message
          </div>
        )}

        <div
          className={`text-sm text-pm-dark break-words rounded-2xl px-3 py-2 border-2
            ${isMine
              ? "bg-sky-blue/10 border-sky-blue/30 rounded-tr-sm"
              : "bg-paper border-paper-border rounded-tl-sm"
            }`}
        >
          {renderBody(event, matrixClient)}
        </div>

        <ReactionBar eventId={eventId} roomId={roomId} />

        {/* Reply button (appears on hover) */}
        <button
          onClick={() => onReply?.(event)}
          className="opacity-0 group-hover:opacity-100 text-xs text-pm-gray hover:text-sky-blue mt-1 transition-opacity"
        >
          Reply
        </button>
      </div>
    </motion.div>
  );
}
