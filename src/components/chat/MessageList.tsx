import { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MatrixEvent } from "matrix-js-sdk";
import { useStore } from "../../store";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  roomId: string;
  onReply: (event: MatrixEvent) => void;
}

export function MessageList({ roomId, onReply }: MessageListProps) {
  const messages = useStore((s) => s.messagesByRoom[roomId] ?? []);
  const parentRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLengthRef.current = messages.length;
  }, [messages.length]);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-pm-gray text-sm">
        No messages yet. Say hello!
      </div>
    );
  }

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto py-2">
      <div
        style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const event = messages[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualItem.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <MessageBubble event={event} roomId={roomId} onReply={onReply} />
            </div>
          );
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
