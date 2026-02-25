import { useState, FormEvent } from "react";
import { MatrixClient } from "matrix-js-sdk";
import { restoreWithRecoveryKey, restoreWithPassphrase, RestoreProgress } from "../../lib/matrix/keyBackup";
import { Button } from "../ui/Button";

interface KeyBackupRestoreProps {
  client: MatrixClient;
}

type Tab = "key" | "phrase";
type Status = "idle" | "loading" | "success" | "error";

export function KeyBackupRestore({ client }: KeyBackupRestoreProps) {
  const [tab, setTab] = useState<Tab>("key");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState<RestoreProgress | null>(null);
  const [message, setMessage] = useState("");

  const handleRestore = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setStatus("loading");
    setProgress(null);
    setMessage("");

    try {
      const onProgress = (p: RestoreProgress) => setProgress(p);
      const imported =
        tab === "key"
          ? await restoreWithRecoveryKey(client, value.trim(), onProgress)
          : await restoreWithPassphrase(client, value.trim(), onProgress);

      setStatus("success");
      setMessage(
        imported > 0
          ? `Imported ${imported} session key${imported === 1 ? "" : "s"}. Encrypted messages should now appear.`
          : "Restore complete — no new keys were found (they may already be loaded)."
      );
      setValue("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const tabClass = (t: Tab) =>
    `px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${
      tab === t
        ? "bg-mario-red text-white"
        : "text-pm-gray hover:text-pm-dark hover:bg-parchment"
    }`;

  return (
    <div className="paper-card p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-extrabold text-pm-dark">🔑 Key Backup</h2>
        <p className="text-sm text-pm-gray mt-1">
          Restore your session keys to decrypt historical messages. Use the Security Key
          or Security Phrase from your Element / other Matrix client.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-parchment rounded-xl p-1 self-start">
        <button className={tabClass("key")} onClick={() => { setTab("key"); setValue(""); }}>
          Recovery Key
        </button>
        <button className={tabClass("phrase")} onClick={() => { setTab("phrase"); setValue(""); }}>
          Security Phrase
        </button>
      </div>

      <form onSubmit={handleRestore} className="flex flex-col gap-3">
        {tab === "key" ? (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-pm-gray uppercase tracking-wide">
              Security / Recovery Key
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="EsTs oPTh bpZo MXfL DLrc …"
              className="paper-input font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-pm-gray">
              The key shown when you set up security in Element (groups of 4 characters).
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-pm-gray uppercase tracking-wide">
              Security Phrase
            </label>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Your security passphrase"
              className="paper-input text-sm"
              autoComplete="current-password"
            />
            <p className="text-xs text-pm-gray">
              The passphrase you chose when enabling key backup in Element.
            </p>
          </div>
        )}

        {/* Progress bar */}
        {status === "loading" && progress && progress.total > 0 && (
          <div className="flex flex-col gap-1">
            <div className="h-2 bg-parchment rounded-full overflow-hidden border border-paper-border">
              <div
                className="h-full bg-mario-red transition-all duration-200"
                style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-pm-gray">
              {progress.done} / {progress.total} keys…
            </p>
          </div>
        )}

        {status === "success" && (
          <p className="text-sm text-leaf-green font-medium">✓ {message}</p>
        )}
        {status === "error" && (
          <p className="text-sm text-mario-red font-medium">✗ {message}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={status === "loading" || !value.trim()}
          className="self-start"
        >
          {status === "loading" ? "Restoring…" : "Restore Keys"}
        </Button>
      </form>
    </div>
  );
}
