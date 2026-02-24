import { useStore } from "../../store";
import { sendReaction } from "../../lib/matrix/messages";

interface ReactionBarProps {
  eventId: string;
  roomId: string;
}

export function ReactionBar({ eventId, roomId }: ReactionBarProps) {
  const matrixClient = useStore((s) => s.matrixClient);
  const userId = useStore((s) => s.userId);
  const reactionsByEvent = useStore((s) => s.reactionsByEvent);

  const reactions = reactionsByEvent[eventId] ?? {};
  const entries = Object.entries(reactions).filter(([, users]) => users.length > 0);

  if (entries.length === 0) return null;

  const handleClick = async (emoji: string) => {
    if (!matrixClient) return;
    await sendReaction(matrixClient, roomId, eventId, emoji);
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {entries.map(([emoji, users]) => {
        const reacted = userId ? users.includes(userId) : false;
        return (
          <button
            key={emoji}
            onClick={() => handleClick(emoji)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border-2 transition-colors
              ${reacted
                ? "bg-sky-blue/20 border-sky-blue text-sky-blue"
                : "bg-parchment border-paper-border text-pm-dark hover:border-sky-blue"
              }`}
          >
            <span>{emoji}</span>
            <span>{users.length}</span>
          </button>
        );
      })}
    </div>
  );
}
