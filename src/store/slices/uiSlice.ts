import { MatrixEvent } from "matrix-js-sdk";
import { StateCreator } from "zustand";

export type ActivePanel = "chat" | "settings";

export interface UiSlice {
  activePanel: ActivePanel;
  replyToEvent: MatrixEvent | null;
  showMemberSidebar: boolean;
  setActivePanel: (panel: ActivePanel) => void;
  setReplyTo: (event: MatrixEvent | null) => void;
  toggleMemberSidebar: () => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  activePanel: "chat",
  replyToEvent: null,
  showMemberSidebar: true,

  setActivePanel: (activePanel) => set({ activePanel }),
  setReplyTo: (replyToEvent) => set({ replyToEvent }),
  toggleMemberSidebar: () => set((s) => ({ showMemberSidebar: !s.showMemberSidebar })),
});
