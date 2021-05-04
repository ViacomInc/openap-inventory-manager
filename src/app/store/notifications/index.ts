import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification, NotificationType } from "../types";
import { State } from "../";

export type NotificationsSlice = Notification[];

const initialState: NotificationsSlice = [];

type NotificationPayload = Partial<Notification> &
  Pick<Notification, "message">;

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    add: (state, action: PayloadAction<NotificationPayload>) => {
      state.push({
        id: String(state.length),
        type: NotificationType.Info,
        ...action.payload,
      });
    },

    remove: (state, action: PayloadAction<string>) => {
      return state.filter((n) => n.id !== action.payload);
    },

    clear: () => {
      return [];
    },
  },
});

export const actions = notificationsSlice.actions;
export default notificationsSlice.reducer;

export function selectNotifications(state: State): Notification[] {
  return state.notifications;
}
