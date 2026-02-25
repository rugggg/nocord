import { useState, useRef, KeyboardEvent } from "react";
import { MatrixEvent } from "matrix-js-sdk";
import { useStore } from "../../store";
import { sendText, sendReply, sendGif } from "../../lib/matrix/messages";
import { ReplyPreview } from "./ReplyPreview";
import { EmojiPicker } from "../pickers/EmojiPicker";
import { GifPicker } from "../pickers/GifPicker";
import { FileUploadButton } from "../pickers/FileUploadButton";
import { GifResult } from "../../lib/tenor/api";

interface MessageInputProps {
  roomId: string;
}

export function MessageInput({ roomId }: MessageInputProps) {
  const matrixClient = useStore((s) => s.matrixClient);
  const replyToEvent = useStore((s) => s.replyToEvent);
  const setReplyTo = useStore((s) => s.setReplyTo);

  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const room = matrixClient?.getRoom(roomId);
  const roomName = room?.name ?? "this room";
  const isEncrypted = matrixClient?.isRoomEncrypted(roomId) ?? false;

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !matrixClient || sending) return;

    setSending(true);
    setSendError(null);
    try {
      if (replyToEvent) {
        await sendReply(matrixClient, roomId, trimmed, replyToEvent);
        setReplyTo(null);
      } else {
        await sendText(matrixClient, roomId, trimmed);
      }
      setText("");
      textareaRef.current?.focus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Send failed:", err);
      setSendError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGifSelect = async (gif: GifResult) => {
    if (!matrixClient) return;
    try {
      await sendGif(matrixClient, roomId, gif.url, gif.title || "GIF");
    } catch (err) {
      console.error("GIF send failed:", err);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  // Mark as read when focused
  const handleFocus = () => {
    if (!matrixClient || !roomId) return;
    const room = matrixClient.getRoom(roomId);
    if (!room) return;
    const lastEvent = room.getLastActiveTimestamp();
    if (lastEvent) {
      const timeline = room.getLiveTimeline().getEvents();
      const last = timeline[timeline.length - 1];
      if (last) {
        matrixClient.sendReadReceipt(last).catch(() => {});
      }
    }
  };

  if (isEncrypted) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-paper border-t-3 border-paper-border text-pm-gray text-sm italic">
        🔒 This room uses end-to-end encryption — sending not yet supported
      </div>
    );
  }

  return (
    <div className="relative">
      {sendError && (
        <div className="px-4 py-1 bg-mario-red/10 border-t border-mario-red/30 text-mario-red text-xs">
          Failed to send: {sendError}
        </div>
      )}
      <ReplyPreview event={replyToEvent} onDismiss={() => setReplyTo(null)} />

      <div className="flex items-end gap-2 px-4 py-3 bg-paper border-t-3 border-paper-border">
        {/* File upload */}
        <FileUploadButton roomId={roomId} />

        {/* GIF picker trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowGif((v) => !v); setShowEmoji(false); }}
            className="p-2 rounded-lg text-pm-gray hover:text-sky-blue hover:bg-parchment transition-colors font-bold text-sm"
            title="Send GIF"
          >
            GIF
          </button>
          <GifPicker
            open={showGif}
            onSelect={handleGifSelect}
            onClose={() => setShowGif(false)}
          />
        </div>

        {/* Text area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            // Auto-resize
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={`Message ${roomName}`}
          rows={1}
          className="flex-1 paper-input resize-none min-h-[40px] max-h-40 text-sm leading-relaxed overflow-y-auto"
        />

        {/* Emoji picker trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowEmoji((v) => !v); setShowGif(false); }}
            className="p-2 rounded-lg text-pm-gray hover:text-pm-yellow hover:bg-parchment transition-colors text-lg"
            title="Emoji"
          >
            😊
          </button>
          <EmojiPicker
            open={showEmoji}
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmoji(false)}
          />
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="p-2 rounded-lg bg-mario-red text-white border-3 border-[#c04040] shadow-paper-sm
                     hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-75"
          title="Send"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      </div>
    </div>
  );
}
