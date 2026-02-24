import { useEffect } from "react";
import { useStore } from "../../store";
import { MemberItem } from "./MemberItem";

export function MemberList() {
  const activeRoomId = useStore((s) => s.activeRoomId);
  const matrixClient = useStore((s) => s.matrixClient);
  const membersByRoom = useStore((s) => s.membersByRoom);
  const setMembers = useStore((s) => s.setMembers);

  useEffect(() => {
    if (!matrixClient || !activeRoomId) return;
    const room = matrixClient.getRoom(activeRoomId);
    if (!room) return;
    const members = room.getJoinedMembers();
    setMembers(activeRoomId, members);
  }, [matrixClient, activeRoomId]);

  const members = activeRoomId ? (membersByRoom[activeRoomId] ?? []) : [];
  const online = members.filter((m) => {
    const user = matrixClient?.getUser(m.userId);
    return user?.presence === "online";
  });
  const offline = members.filter((m) => {
    const user = matrixClient?.getUser(m.userId);
    return user?.presence !== "online";
  });

  return (
    <div className="flex flex-col w-[240px] bg-paper border-l-3 border-paper-border h-full overflow-hidden">
      <div className="px-4 py-3 border-b-3 border-paper-border shadow-paper-sm">
        <h3 className="font-extrabold text-pm-dark text-sm uppercase tracking-wide">
          Members — {members.length}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {online.length > 0 && (
          <div className="mb-2">
            <div className="px-3 py-1 text-xs font-extrabold text-pm-gray uppercase tracking-wider">
              Online — {online.length}
            </div>
            {online.map((m) => (
              <MemberItem key={m.userId} member={m} />
            ))}
          </div>
        )}
        {offline.length > 0 && (
          <div>
            <div className="px-3 py-1 text-xs font-extrabold text-pm-gray uppercase tracking-wider">
              Offline — {offline.length}
            </div>
            {offline.map((m) => (
              <MemberItem key={m.userId} member={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
