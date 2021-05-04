import { CaseReducer } from "@reduxjs/toolkit";
import { RequestsSliceState, RequestAction } from "./";

export const setReducer: CaseReducer<RequestsSliceState, RequestAction> = (
  state,
  { payload }
) => {
  state[payload.key] = payload.request;
};
