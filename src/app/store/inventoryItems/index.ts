import { createSlice } from "@reduxjs/toolkit";
import {
  InventoryItemStatus,
  InventoryItemReturnFieldsFragment,
} from "../../graphql";
import { State } from "../";
import {
  setAllReducer,
  setReducer,
  updateReducer,
  deleteReducer,
} from "./reducers";

export type InventoryItemsSliceState = {
  [index: number]: InventoryItemReturnFieldsFragment;
};
const initialState: InventoryItemsSliceState = {};

export const inventoryItemsSlice = createSlice({
  name: "inventory-item",
  initialState,
  reducers: {
    set: setReducer,
    setAll: setAllReducer,
    update: updateReducer,
    delete: deleteReducer,
  },
});

export const actions = inventoryItemsSlice.actions;

export const selectInventoryItem = (id: number) => (
  state: State
): InventoryItemReturnFieldsFragment => state.inventoryItems[id];

export const selectInventoryItems = (state: State): InventoryItemsSliceState =>
  state.inventoryItems;

export const selectIsAllInventoryItemsPublished = (state: State): boolean =>
  Object.values(state.inventoryItems).every(
    (i) => i.status === InventoryItemStatus.Committed
  );

export default inventoryItemsSlice.reducer;

export function sortInventoryItems(
  a: InventoryItemReturnFieldsFragment,
  b: InventoryItemReturnFieldsFragment
): number {
  const bTime = new Date(b.startDatetime).getTime();
  const aTime = new Date(a.startDatetime).getTime();
  if (bTime === aTime) {
    return (
      new Date(b.endDatetime).getTime() - new Date(a.endDatetime).getTime()
    );
  }

  return bTime - aTime;
}
