import { MatrixClient } from "matrix-js-sdk";
import { IKeyBackupInfo, IKeyBackupRestoreOpts } from "matrix-js-sdk/lib/crypto/keybackup";
import { ImportRoomKeyProgressData, KeyBackupRestoreOpts } from "matrix-js-sdk/lib/crypto-api";

export interface RestoreProgress {
  done: number;
  total: number;
}

function legacyOpts(onProgress?: (p: RestoreProgress) => void): IKeyBackupRestoreOpts {
  return {
    progressCallback: (p: ImportRoomKeyProgressData) => {
      if (p.stage === "load_keys") {
        onProgress?.({ done: p.successes ?? 0, total: p.total ?? 0 });
      }
    },
  };
}

function newOpts(onProgress?: (p: RestoreProgress) => void): KeyBackupRestoreOpts {
  return {
    progressCallback: (p: ImportRoomKeyProgressData) => {
      if (p.stage === "load_keys") {
        onProgress?.({ done: p.successes ?? 0, total: p.total ?? 0 });
      }
    },
  };
}

/** Returns the number of keys imported, or throws if there is no backup. */
export async function restoreWithRecoveryKey(
  client: MatrixClient,
  recoveryKey: string,
  onProgress?: (p: RestoreProgress) => void
): Promise<number> {
  const backupInfo: IKeyBackupInfo | null = await client.getKeyBackupVersion();
  if (!backupInfo) throw new Error("No key backup found on this homeserver.");

  // Strip formatting spaces (Element shows the key in groups of 4)
  const key = recoveryKey.replace(/\s+/g, "");

  const result = await client.restoreKeyBackupWithRecoveryKey(
    key,
    undefined,
    undefined,
    backupInfo,
    legacyOpts(onProgress)
  );
  return result.imported;
}

/** Returns the number of keys imported, or throws if there is no backup. */
export async function restoreWithPassphrase(
  client: MatrixClient,
  passphrase: string,
  onProgress?: (p: RestoreProgress) => void
): Promise<number> {
  const crypto = client.getCrypto();

  if (crypto && "restoreKeyBackupWithPassphrase" in crypto) {
    // Preferred: new Rust CryptoApi
    const result = await (
      crypto as {
        restoreKeyBackupWithPassphrase(
          p: string,
          opts?: KeyBackupRestoreOpts
        ): Promise<{ imported: number; total: number }>;
      }
    ).restoreKeyBackupWithPassphrase(passphrase, newOpts(onProgress));
    return result.imported;
  }

  // Fallback: legacy Olm path
  const backupInfo: IKeyBackupInfo | null = await client.getKeyBackupVersion();
  if (!backupInfo) throw new Error("No key backup found on this homeserver.");
  const result = await client.restoreKeyBackupWithPassword(
    passphrase,
    undefined,
    undefined,
    backupInfo,
    legacyOpts(onProgress)
  );
  return result.imported;
}
