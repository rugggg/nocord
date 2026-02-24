import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

const ELEMENT_CALL_BASE = import.meta.env.VITE_ELEMENT_CALL_URL ?? "https://call.element.io";

export async function openElementCall(roomId: string, displayName?: string): Promise<void> {
  const params = new URLSearchParams({
    roomId,
    ...(displayName ? { displayName } : {}),
  });

  const url = `${ELEMENT_CALL_BASE}/#/?${params.toString()}`;

  const existing = await WebviewWindow.getByLabel("element-call");
  if (existing) {
    await existing.show();
    await existing.setFocus();
    return;
  }

  new WebviewWindow("element-call", {
    url,
    title: "nocord — Voice/Video Call",
    width: 1024,
    height: 768,
    minWidth: 640,
    minHeight: 480,
    resizable: true,
  });
}
