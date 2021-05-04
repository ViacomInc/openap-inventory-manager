import { CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { InventoryItem } from "../../graphql";
import { Error } from "../types";
import { TransactionSliceState, TransactionStatus } from "./";

export const startReducer: CaseReducer<
  TransactionSliceState,
  PayloadAction<InventoryItem>
> = (state, action) => ({
  status: TransactionStatus.New,
  data: action.payload,
});

export const clearReducer: CaseReducer<TransactionSliceState> = () => ({
  status: TransactionStatus.Empty,
  data: null,
});

export const updateReducer: CaseReducer<
  TransactionSliceState,
  PayloadAction<Partial<InventoryItem>>
> = (state, action) => {
  state.status = TransactionStatus.Updated;

  if (state.data === null) {
    console.error("Update transaction was called but the state is empty");
    return;
  }

  state.data = {
    ...state.data,
    ...action.payload,
  };
};

export const repeatUntilReducer: CaseReducer<
  TransactionSliceState,
  PayloadAction<string | undefined>
> = (state, { payload }) => {
  state.repeatUntil = payload;
};

export const errorsReducer: CaseReducer<
  TransactionSliceState,
  PayloadAction<Error[] | undefined>
> = (state, { payload }) => {
  state.errors = !(payload && payload.length) ? undefined : payload;
};
