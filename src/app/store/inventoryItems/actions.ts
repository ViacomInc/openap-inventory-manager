import {
  InventoryItemInput,
  InventoryItemReturnFieldsFragment,
  InventoryItemStatus,
} from "../../graphql";
import { Dispatch, State } from "../";
import {
  deleteInventoryItem,
  setInventoryItems,
  setInventoryItem,
  addNotification,
  setTable,
} from "../actions";
import { DraftInventoryItemId } from "../constants";
import { getTableStateForItem } from "../table/helpers";
import { createNewInventoryItem } from "../../../lib/InventoryItem/new";
import { DEFAULT_NOTIFICATION_TIMEOUT } from "../../config";

import { NotificationType } from "../types";

export const setNewInventoryItem = (
  items: InventoryItemReturnFieldsFragment[]
) => (dispatch: Dispatch, getState: () => State): void => {
  dispatch(deleteInventoryItem(DraftInventoryItemId));
  dispatch(setInventoryItems(items));

  const tableState = getTableStateForItem(getState(), items[0].id);
  dispatch(setTable(tableState));
};

export const setInventoryItemsWithNotification = (message: string) => (
  items: InventoryItemReturnFieldsFragment[]
) => (dispatch: Dispatch): void => {
  dispatch(setInventoryItems(items));

  if (items.length !== 1) {
    dispatch(
      addNotification({
        type:
          items.length === 0
            ? NotificationType.Warning
            : NotificationType.Success,
        message: `${items.length} ${message}`,
        timeout: DEFAULT_NOTIFICATION_TIMEOUT,
      })
    );
  }
};

export const createInventoryItem = (
  item: Partial<InventoryItemInput> & Pick<InventoryItemInput, "publisherId">
) => (dispatch: Dispatch): void => {
  dispatch(
    setInventoryItem({
      ...createNewInventoryItem(item),
      id: DraftInventoryItemId,
      status: InventoryItemStatus.Draft,
    })
  );
};
