import { Interval } from "@viacomcbs/broadcast-calendar";
import {
  GetAllInventoryItems,
  CreateInventoryItems,
  UpdateInventoryItem,
  RemoveInventoryItem,
  RestoreInventoryItem,
  SubmitInventoryItems,
  FlushInventoryItems,
} from "../../graphql/operations/inventoryItems.graphql";
import type {
  InventoryItem,
  InventoryItemInput,
  InventoryItemUpdateInput,
  GetAllInventoryItemsQueryResult,
  GetAllInventoryItemsQueryVariables,
  CreateInventoryItemsMutationResult,
  CreateInventoryItemsMutationVariables,
  UpdateInventoryItemMutationResult,
  UpdateInventoryItemMutationVariables,
  RemoveInventoryItemMutationResult,
  RemoveInventoryItemMutationVariables,
  RestoreInventoryItemMutationResult,
  RestoreInventoryItemMutationVariables,
  SubmitInventoryItemsMutationResult,
  SubmitInventoryItemsMutationVariables,
  FlushInventoryItemsMutationResult,
  FlushInventoryItemsMutationVariables,
} from "../graphql";

import { moveWeeks } from "../../lib/InventoryItem/helpers";
import { isEmpty, getDiff } from "../../lib/helpers";

import { State, Dispatch } from "../store/";
import { Error, FilterType } from "../store/types";
import {
  selectTransaction,
  selectRepeatUntilNumber,
} from "../store/transaction";
import {
  setNewInventoryItem,
  setInventoryItemsWithNotification,
  setInventoryItem,
  setInventoryItems,
  clearTransaction,
  graphqlRequest,
  clearRequest,
  removeTableFilter,
} from "../store/actions";
import { Request, RequestWithData, RequestAction } from "../store/requests";
import {
  InventoryItemsSliceState,
  selectInventoryItem,
} from "../store/inventoryItems";
import {
  GetAllInventoryItemsRequestKey,
  SubmitInventoryItemsRequestKey,
  FlushInventoryItemsRequestKey,
  CreateInventoryItemRequestKey,
  CreateInventoryItemsRequestKey,
} from "../store/constants";

export const getAllInventoryItemsRequest = (
  publisherId: number
): ((dispatch: Dispatch) => void) =>
  graphqlRequest<
    GetAllInventoryItemsQueryResult,
    GetAllInventoryItemsQueryVariables,
    "inventoryItems"
  >({
    key: GetAllInventoryItemsRequestKey,
    result: "inventoryItems",
    document: GetAllInventoryItems,
    variables: {
      publisherId,
    },
    dispatchTo: setInventoryItems,
  });

export const selectGetAllInventoryItemsRequest = (
  state: State
): RequestWithData<InventoryItemsSliceState> => ({
  ...state.requests[GetAllInventoryItemsRequestKey],
  data: state.inventoryItems,
});

// this is for user created items
export const createInventoryItemRequest =
  () =>
  (dispatch: Dispatch, getState: () => State): void => {
    const state = getState();
    const newItem = selectTransaction(state).data;
    if (!newItem) {
      return;
    }

    const number = selectRepeatUntilNumber(state);
    const { id, status, ...newItemData } = newItem;
    const inventoryItems = [newItemData];

    if (number > 0) {
      for (let i = 1; i <= number; i++) {
        inventoryItems.push(moveWeeks(newItemData, i));
      }
    }

    graphqlRequest<
      CreateInventoryItemsMutationResult,
      CreateInventoryItemsMutationVariables,
      "createInventoryItems"
    >({
      key: CreateInventoryItemRequestKey,
      result: "createInventoryItems",
      document: CreateInventoryItems,
      variables: {
        inventoryItems,
      },
      didDispatchTo: clearTransaction,
      dispatchTo: setNewInventoryItem,
    })(dispatch);
  };

// this is for CSV
export const createInventoryItemsRequest =
  (items: InventoryItemInput[]) =>
  (dispatch: Dispatch, _getState: () => State): void => {
    graphqlRequest<
      CreateInventoryItemsMutationResult,
      CreateInventoryItemsMutationVariables,
      "createInventoryItems"
    >({
      key: CreateInventoryItemsRequestKey,
      result: "createInventoryItems",
      document: CreateInventoryItems,
      variables: {
        inventoryItems: items,
      },
      dispatchTo: setInventoryItemsWithNotification("items were created"),
    })(dispatch);
  };

export const selectCreateInventoryItemRequest = (
  state: State
): RequestWithData<InventoryItem | null> => ({
  ...state.requests[CreateInventoryItemRequestKey],
  data: state.transaction.data,
});

export const selectCreateInventoryItemsRequest = (state: State): Request => ({
  ...state.requests[CreateInventoryItemsRequestKey],
});

export const removeInventoryItemRequest = (
  id: number
): ((dispatch: Dispatch) => void) =>
  graphqlRequest<
    RemoveInventoryItemMutationResult,
    RemoveInventoryItemMutationVariables,
    "removeInventoryItem"
  >({
    key: makeRemoveKey(id),
    result: "removeInventoryItem",
    document: RemoveInventoryItem,
    variables: {
      id: id,
    },
    dispatchTo: setInventoryItem,
  });

export const selectRemoveInventoryItemRequest =
  (id: number) =>
  (state: State): RequestWithData<InventoryItem> => ({
    ...state.requests[makeRemoveKey(id)],
    data: state.inventoryItems[id],
  });

export const restoreInventoryItemRequest = (
  id: number
): ((dispatch: Dispatch) => void) =>
  graphqlRequest<
    RestoreInventoryItemMutationResult,
    RestoreInventoryItemMutationVariables,
    "restoreInventoryItem"
  >({
    key: makeUpdateKey(id),
    result: "restoreInventoryItem",
    document: RestoreInventoryItem,
    variables: {
      id: id,
    },
    dispatchTo: setInventoryItem,
  });

export const selectRestoreInventoryItemRequest =
  (id: number) =>
  (state: State): RequestWithData<InventoryItem> => ({
    ...state.requests[makeUpdateKey(id)],
    data: state.inventoryItems[id],
  });

export type InventoryItemUpdate = Pick<InventoryItem, "id"> &
  InventoryItemUpdateInput;

export const updateInventoryItemRequest =
  (update?: InventoryItemUpdate) =>
  (dispatch: Dispatch, getState: () => State): void => {
    const state = getState();
    const updatedItem = update || selectTransaction(state).data;
    if (!updatedItem) {
      return;
    }

    const id = updatedItem.id;
    const originalItem = selectInventoryItem(id)(state);
    const inventoryItemUpdate = getDiff(originalItem, updatedItem);
    if (isEmpty(inventoryItemUpdate)) {
      return;
    }

    graphqlRequest<
      UpdateInventoryItemMutationResult,
      UpdateInventoryItemMutationVariables,
      "updateInventoryItem"
    >({
      key: makeUpdateKey(id),
      document: UpdateInventoryItem,
      result: "updateInventoryItem",
      variables: {
        id,
        inventoryItem: inventoryItemUpdate,
      },
      dispatchTo: setInventoryItemsWithNotification("items were updated"),
      didDispatchTo: clearTransaction,
    })(dispatch);
  };

export const selectUpdateInventoryItemRequest =
  (id: number) =>
  (state: State): RequestWithData<InventoryItem> => ({
    ...state.requests[makeUpdateKey(id)],
    data: state.inventoryItems[id],
  });

type SelectInventoryItemTransaction = {
  isUpdating: boolean;
  item?: InventoryItem;
  errors?: Error[];
};

export const selectInventoryItemTransaction =
  (id: number) =>
  ({ requests, transaction }: State): SelectInventoryItemTransaction => {
    const removeRequest = requests[makeRemoveKey(id)];
    const updateRequest = requests[makeUpdateKey(id)];
    const res: SelectInventoryItemTransaction = {
      isUpdating: removeRequest?.loading || updateRequest?.loading,
    };

    if (transaction.data && transaction.data.id === id) {
      res.item = transaction.data;
      res.errors = transaction.errors;
    }

    return res;
  };

export const submitInventoryItemsRequest =
  (publisherId: number) =>
  (dispatch: Dispatch): void => {
    graphqlRequest<
      SubmitInventoryItemsMutationResult,
      SubmitInventoryItemsMutationVariables,
      "submitInventoryItems"
    >({
      key: SubmitInventoryItemsRequestKey,
      result: "submitInventoryItems",
      document: SubmitInventoryItems,
      variables: {
        publisherId,
      },
      dispatchTo: setInventoryItems,
      didDispatchTo: removeStatusTableFilter,
    })(dispatch);
  };

const removeStatusTableFilter = () => (dispatch: Dispatch) => {
  dispatch(removeTableFilter({ type: FilterType.Status }));
};

export const clearSubmitInventoryItemsRequest = (): RequestAction =>
  clearRequest(SubmitInventoryItemsRequestKey);

export const selectIsLoadingSubmitInventoryItemsRequest = (
  state: State
): boolean => (state.requests[SubmitInventoryItemsRequestKey] || {}).loading;

export const selectSubmitInventoryItemsRequest =
  () =>
  (state: State): Request =>
    state.requests[SubmitInventoryItemsRequestKey] || {};

export const flushInventoryItemsRequest =
  ({ start, end }: Interval) =>
  (dispatch: Dispatch): void => {
    graphqlRequest<
      FlushInventoryItemsMutationResult,
      FlushInventoryItemsMutationVariables,
      "flushInventoryItems"
    >({
      key: FlushInventoryItemsRequestKey,
      result: "flushInventoryItems",
      document: FlushInventoryItems,
      variables: {
        from: start.toISODate(),
        to: end.toISODate(),
      },
      dispatchTo: setInventoryItems,
    })(dispatch);
  };

export const selectIsLoadingFlushInventoryItemsRequest = (
  state: State
): boolean => (state.requests[FlushInventoryItemsRequestKey] || {}).loading;

export const selectFlushInventoryItemsRequest =
  () =>
  (state: State): Request =>
    state.requests[FlushInventoryItemsRequestKey] || {};

const makeUpdateKey = (id: number) => `updateInventoryItemRequest${id}`;
const makeRemoveKey = (id: number) => `removeInventoryItemRequest${id}`;
