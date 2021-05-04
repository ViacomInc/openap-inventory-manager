import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PublisherReturnFieldsFragment } from "../../graphql";

export type PublishersSlice = PublisherReturnFieldsFragment[];

const initialState: PublishersSlice = [];

export const publishersSlice = createSlice({
  name: "publishers",
  initialState,
  reducers: {
    set: (state, action: PayloadAction<PublisherReturnFieldsFragment[]>) =>
      action.payload,
  },
});

export const actions = publishersSlice.actions;
export default publishersSlice.reducer;
