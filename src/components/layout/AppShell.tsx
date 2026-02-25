import { useStore } from "../../store";
import { SpaceSidebar } from "./SpaceSidebar";
import { RoomSidebar } from "./RoomSidebar";
import { ChatArea } from "../chat/ChatArea";
import { MemberList } from "../members/MemberList";
import { SettingsScreen } from "../settings/SettingsScreen";
import { useMatrixSync } from "../../hooks/useMatrixSync";
import { useNotifications } from "../../hooks/useNotifications";
import { ErrorBoundary } from "../ui/ErrorBoundary";

export function AppShell() {
  const matrixClient = useStore((s) => s.matrixClient);
  const showMemberSidebar = useStore((s) => s.showMemberSidebar);
  const activePanel = useStore((s) => s.activePanel);

  useMatrixSync(matrixClient);
  useNotifications(matrixClient);

  return (
    <div className="flex h-screen overflow-hidden bg-parchment">
      {/* Far-left space sidebar */}
      <SpaceSidebar />

      {/* Channel list */}
      <RoomSidebar />

      {/* Main content */}
      {activePanel === "settings" ? (
        <SettingsScreen />
      ) : (
        <ErrorBoundary>
          <ChatArea />
          {showMemberSidebar && <MemberList />}
        </ErrorBoundary>
      )}
    </div>
  );
}
