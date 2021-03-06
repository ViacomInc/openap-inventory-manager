import { omit } from "ramda";
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

// import { moveWeeks } from "../../lib/InventoryItem/helpers";
import { isEmpty, getDiff } from "../../lib/helpers";

import { State, Dispatch } from "../store/";
import { FilterType, NotificationType } from "../store/types";
import {
  setNewInventoryItem,
  setInventoryItemsWithNotification,
  setInventoryItem,
  setInventoryItems,
  graphqlRequest,
  clearRequest,
  removeTableFilter,
  addNotification,
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

import { selectStatus } from "../components/useInventoryStatus";

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
  (item?: InventoryItem) =>
  async (dispatch: Dispatch, _getState: () => State): Promise<void> => {
    // const state = getState();
    if (!item) {
      return undefined;
    }

    const newItem = omit(["id", "status"], item);

    // const number = selectRepeatUntilNumber(state);
    const inventoryItems = [newItem];

    // if (number > 0) {
    //   for (let i = 1; i <= number; i++) {
    //     inventoryItems.push(moveWeeks(newItem, i));
    //   }
    // }

    return graphqlRequest<
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
      dispatchTo: setNewInventoryItem,
    })(dispatch);
  };

// this is for CSV
export const createInventoryItemsRequest =
  (items: InventoryItemInput[]) =>
  (dispatch: Dispatch, _getState: () => State) =>
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
  (updatedItem: InventoryItemUpdate) =>
  async (dispatch: Dispatch, getState: () => State): Promise<void> => {
    const state = getState();
    if (!updatedItem) {
      return undefined;
    }

    const id = updatedItem.id;
    const originalItem = selectInventoryItem(id)(state);
    const inventoryItemUpdate = getDiff(originalItem, updatedItem);
    if (isEmpty(inventoryItemUpdate)) {
      return undefined;
    }

    return graphqlRequest<
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
    })(dispatch);
  };

export const selectUpdateInventoryItemRequest =
  (id: number) =>
  (state: State): RequestWithData<InventoryItem> => ({
    ...state.requests[makeUpdateKey(id)],
    data: state.inventoryItems[id],
  });

export const submitInventoryItemsRequest =
  (publisherId: number) => (dispatch: Dispatch) =>
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
      didDispatchTo: checkInventoryItemsStatus,
    })(dispatch);

const checkInventoryItemsStatus =
  () => (dispatch: Dispatch, getState: () => State) => {
    dispatch(removeTableFilter({ type: FilterType.Status }));

    const state = getState();
    const { inserted, updated, conflicted, removed } = selectStatus(
      state.inventoryItems
    );
    if (inserted || updated || conflicted || removed) {
      dispatch(
        addNotification({
          type: NotificationType.Warning,
          message: `Not all items were published due to mistakes. Please check all unsubmitted inventory items.`,
        })
      );
    }
  };

export const clearSubmitInventoryItemsRequest = (): RequestAction =>
  clearRequest(SubmitInventoryItemsRequestKey);

export const selectSubmitInventoryItemsRequest =
  () =>
  (state: State): Request =>
    state.requests[SubmitInventoryItemsRequestKey] || {};

export const flushInventoryItemsRequest =
  ({ start, end }: Interval) =>
  (dispatch: Dispatch) =>
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

export const selectFlushInventoryItemsRequest =
  () =>
  (state: State): Request =>
    state.requests[FlushInventoryItemsRequestKey] || {};

export const selectInventoryItemRequestsStatus =
  (id?: number) =>
  ({ requests }: State): boolean => {
    if (id === undefined) {
      return false;
    }

    const createRequest = requests[CreateInventoryItemRequestKey];
    const updateRequest = requests[makeUpdateKey(id)];
    const removeRequest = requests[makeRemoveKey(id)];

    return (
      createRequest?.loading || updateRequest?.loading || removeRequest?.loading
    );
  };

const makeUpdateKey = (id: number) => `updateInventoryItemRequest${id}`;
const makeRemoveKey = (id: number) => `removeInventoryItemRequest${id}`;
