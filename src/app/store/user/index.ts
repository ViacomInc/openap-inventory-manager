import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "../";
import { User } from "../types";

const initialState: User = {};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    set: (state, action: PayloadAction<User>) => action.payload,
  },
});

export const selectUser = (state: State): User => state.user;

export const actions = userSlice.actions;
export default userSlice.reducer;
