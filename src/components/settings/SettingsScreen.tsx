import { useState, FormEvent } from "react";
import { useStore } from "../../store";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { KeyBackupRestore } from "./KeyBackupRestore";

export function SettingsScreen() {
  const matrixClient = useStore((s) => s.matrixClient);
  const userId = useStore((s) => s.userId);
  const logout = useStore((s) => s.logout);
  const setActivePanel = useStore((s) => s.setActivePanel);

  const profileInfo = matrixClient && userId
    ? matrixClient.getUser(userId)
    : null;

  const [displayName, setDisplayName] = useState(profileInfo?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!matrixClient) return;
    setSaving(true);
    try {
      await matrixClient.setDisplayName(displayName);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-parchment p-8">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePanel("chat")}
            className="p-2 rounded-lg text-pm-gray hover:bg-paper hover:text-pm-dark transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-2xl font-extrabold text-pm-dark">Settings</h1>
        </div>

        {/* Profile */}
        <div className="paper-card p-6 flex flex-col gap-4">
          <h2 className="text-lg font-extrabold text-pm-dark">Profile</h2>

          <div className="flex items-center gap-4">
            <Avatar
              userId={userId ?? ""}
              displayName={displayName || (userId ?? undefined)}
              avatarUrl={profileInfo?.avatarUrl ?? undefined}
              client={matrixClient}
              size={64}
            />
            <div>
              <p className="text-sm font-bold text-pm-dark">{userId}</p>
              <p className="text-xs text-pm-gray mt-0.5">Your Matrix ID</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />

            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="self-start"
            >
              {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
            </Button>
          </form>
        </div>

        {/* Key Backup */}
        {matrixClient && <KeyBackupRestore client={matrixClient} />}

        {/* Danger Zone */}
        <div className="paper-card p-6 flex flex-col gap-4 border-mario-red/40">
          <h2 className="text-lg font-extrabold text-mario-red">Account</h2>
          <Button
            variant="danger"
            onClick={logout}
            className="self-start"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
