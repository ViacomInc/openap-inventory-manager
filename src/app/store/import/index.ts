import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ImportItemsConflicts } from "../../graphql";
import { State } from "../";

export const initialState: ImportItemsConflicts = {
  total: 0,
  conflicts: 0,
  titles: [],
};

export const importSlice = createSlice({
  name: "import",
  initialState,
  reducers: {
    set: (state, { payload }: PayloadAction<ImportItemsConflicts>) => payload,
    reset: () => initialState,
  },
});

export const actions = importSlice.actions;
export default importSlice.reducer;

export const selectImportConflicts = (state: State): ImportItemsConflicts =>
  state.import;
