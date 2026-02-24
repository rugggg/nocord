import { RoomMember } from "matrix-js-sdk";
import { useStore } from "../../store";
import { Avatar } from "../ui/Avatar";

interface MemberItemProps {
  member: RoomMember;
}

export function MemberItem({ member }: MemberItemProps) {
  const matrixClient = useStore((s) => s.matrixClient);
  const presence = useStore((s) => s.presenceByUser[member.userId] ?? "offline");

  const presenceColors = {
    online: "bg-leaf-green",
    offline: "bg-pm-gray",
    unavailable: "bg-pm-yellow",
  };

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-parchment cursor-default group">
      <div className="relative flex-shrink-0">
        <Avatar
          userId={member.userId}
          displayName={member.name}
          avatarUrl={member.getMxcAvatarUrl?.() ?? null}
          client={matrixClient}
          size={32}
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-paper ${presenceColors[presence]}`}
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-pm-dark truncate">
          {member.name}
        </span>
        {presence !== "offline" && (
          <span className="text-xs text-pm-gray capitalize">{presence}</span>
        )}
      </div>
    </div>
  );
}
