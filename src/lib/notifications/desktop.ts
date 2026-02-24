import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

let permissionGranted = false;

export async function initNotifications(): Promise<void> {
  permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === "granted";
  }
}

export function fireNotification(title: string, body: string): void {
  if (!permissionGranted) return;
  sendNotification({ title, body });
}
