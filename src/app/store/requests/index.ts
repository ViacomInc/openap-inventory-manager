import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "../";
import { setReducer } from "./reducers";
import { Error } from "../types";

export type Request = {
  loading: boolean;
  errors?: Error[];
};

export type RequestWithData<T> = Request & {
  data: T;
};

export type RequestAction = PayloadAction<{ key: string; request: Request }>;

export type RequestsSliceState = { [index: string]: Request };
const initialState: RequestsSliceState = {};

export const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    set: setReducer,
  },
});

export const actions = requestSlice.actions;
export const selectRequest =
  (key: string) =>
  (state: State): Request =>
    state.requests[key];

export default requestSlice.reducer;

export function ignoreErrorCodes(
  errors: Error[] | undefined,
  ...codes: number[]
): Error[] {
  if (!errors || !errors.length) {
    return [];
  }

  const filteredErrors = errors.filter(
    (error) => !error.code || !codes.includes(error.code)
  );
  return filteredErrors;
}
