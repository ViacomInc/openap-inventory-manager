import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Error } from "../types";
import { State } from "../";

export interface CsvErrorSliceState {
  errors: Error[];
  processing: boolean;
}

export const initialState: CsvErrorSliceState = {
  errors: [],
  processing: false,
};

export interface SetPayload {
  errors?: Error[] | null;
  processing?: boolean;
}

export const csvImportSlice = createSlice({
  name: "csv",
  initialState,
  reducers: {
    set: (state, { payload }: PayloadAction<SetPayload>) => {
      if (payload.processing !== undefined) {
        state.processing = payload.processing;
      }

      if (payload.errors === null) {
        state.errors = [];
      }

      if (payload.errors !== undefined && payload.errors !== null) {
        state.errors = state.errors.concat(payload.errors);
      }
    },
  },
});

export const actions = csvImportSlice.actions;
export default csvImportSlice.reducer;

export const selectCSV = (state: State): CsvErrorSliceState => state.csv;
export const selectCSVIsLoading = (state: State): boolean =>
  state.csv.processing;
