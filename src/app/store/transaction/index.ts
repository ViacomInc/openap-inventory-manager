import { createSlice } from "@reduxjs/toolkit";
import { InventoryItem } from "../../graphql";
import { differenceInWeeks } from "../../../lib/dateHelpers";
import { State } from "../";
import { Error } from "../types";
import {
  startReducer,
  clearReducer,
  updateReducer,
  errorsReducer,
  repeatUntilReducer,
} from "./reducers";

export enum TransactionStatus {
  Empty,
  New,
  Updated,
}

export type TransactionSliceState = {
  status: TransactionStatus;
  data: InventoryItem | null;
  repeatUntil?: string;
  errors?: Error[];
};

const initialState: TransactionSliceState = {
  status: TransactionStatus.Empty,
  data: null,
};

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    start: startReducer,
    clear: clearReducer,
    update: updateReducer,
    errors: errorsReducer,
    repeatUntil: repeatUntilReducer,
  },
});

export const actions = transactionSlice.actions;
export default transactionSlice.reducer;

export const selectTransaction = (state: State): TransactionSliceState =>
  state.transaction;

export const selectRepeatUntilNumber = (state: State): number => {
  const { repeatUntil, data } = state.transaction;

  if (!repeatUntil || !data) {
    return 0;
  }

  return differenceInWeeks(repeatUntil, data.startDatetime);
};
