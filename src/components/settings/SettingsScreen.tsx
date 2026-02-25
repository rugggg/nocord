import { useState, useRef, FormEvent, ChangeEvent } from "react";
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
  const notificationsEnabled = useStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useStore((s) => s.setNotificationsEnabled);

  const profileInfo = matrixClient && userId
    ? matrixClient.getUser(userId)
    : null;

  const [displayName, setDisplayName] = useState(profileInfo?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profileInfo?.avatarUrl ?? undefined);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !matrixClient) return;
    setAvatarUploading(true);
    setAvatarError("");
    try {
      const { content_uri } = await matrixClient.uploadContent(file);
      await matrixClient.setAvatarUrl(content_uri);
      setAvatarUrl(content_uri);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : String(err));
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
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
            <div className="relative group">
              <Avatar
                userId={userId ?? ""}
                displayName={displayName || (userId ?? undefined)}
                avatarUrl={avatarUrl}
                client={matrixClient}
                size={64}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Change avatar"
              >
                {avatarUploading ? (
                  <span className="text-white text-xs font-bold">…</span>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-pm-dark">{userId}</p>
              <p className="text-xs text-pm-gray mt-0.5">Your Matrix ID</p>
              {avatarError && <p className="text-xs text-mario-red mt-1">{avatarError}</p>}
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

        {/* Notifications */}
        <div className="paper-card p-6 flex flex-col gap-4">
          <h2 className="text-lg font-extrabold text-pm-dark">Notifications</h2>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                notificationsEnabled ? "bg-leaf-green" : "bg-paper-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notificationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
            <span className="text-sm font-bold text-pm-dark">Desktop notifications</span>
          </label>
          <p className="text-xs text-pm-gray -mt-2">
            Show a notification when a message arrives in a room you're not viewing.
          </p>
        </div>

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
