import { CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import {
  InventoryItemReturnFieldsFragment,
  InventoryItemInput,
  InventoryItemStatus,
} from "../../graphql";
import { InventoryItemsSliceState } from "./";

export const setAllReducer: CaseReducer<
  InventoryItemsSliceState,
  PayloadAction<InventoryItemReturnFieldsFragment[]>
> = (state, { payload }) => {
  payload.forEach((item) => {
    if (item.status === InventoryItemStatus.Deleted) {
      delete state[item.id];
    } else {
      state[item.id] = item;
    }
  });
};

export const setReducer: CaseReducer<
  InventoryItemsSliceState,
  PayloadAction<InventoryItemReturnFieldsFragment>
> = (state, { payload }) => {
  state[payload.id] = payload;
};

export const updateReducer: CaseReducer<
  InventoryItemsSliceState,
  PayloadAction<{ id: number; update: InventoryItemInput }>
> = (state, { payload }) => {
  state[payload.id] = {
    ...state[payload.id],
    ...payload.update,
  };
};

export const deleteReducer: CaseReducer<
  InventoryItemsSliceState,
  PayloadAction<number>
> = (state, action) => {
  delete state[action.payload];
};
