import { create } from "zustand";
import { AuthSlice, createAuthSlice } from "./slices/authSlice";
import { SpaceSlice, createSpaceSlice } from "./slices/spaceSlice";
import { RoomSlice, createRoomSlice } from "./slices/roomSlice";
import { MessageSlice, createMessageSlice } from "./slices/messageSlice";
import { MemberSlice, createMemberSlice } from "./slices/memberSlice";
import { DmSlice, createDmSlice } from "./slices/dmSlice";
import { UiSlice, createUiSlice } from "./slices/uiSlice";
import { NotificationSlice, createNotificationSlice } from "./slices/notificationSlice";

type StoreState = AuthSlice &
  SpaceSlice &
  RoomSlice &
  MessageSlice &
  MemberSlice &
  DmSlice &
  UiSlice &
  NotificationSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createSpaceSlice(...a),
  ...createRoomSlice(...a),
  ...createMessageSlice(...a),
  ...createMemberSlice(...a),
  ...createDmSlice(...a),
  ...createUiSlice(...a),
  ...createNotificationSlice(...a),
}));
