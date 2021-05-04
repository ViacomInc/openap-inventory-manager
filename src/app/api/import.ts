import { ImportItems } from "../../graphql/operations/import.graphql";
import type {
  ImportItemsInput,
  ImportItemsMutationResult,
  ImportItemsMutationVariables,
  ImportItemsResult,
} from "../graphql";

import type { State, Dispatch } from "../store/";
import {
  setInventoryItemsWithNotification,
  setImportConflicts,
  resetImportConflicts,
  graphqlRequest,
  clearRequest,
} from "../store/actions";
import { Request, RequestAction } from "../store/requests";
import { ImportItemsRequestKey } from "../store/constants";

import {
  isInventoryItems,
  isImportItemsConflicts,
} from "../../lib/import/helpers";

export const importItemsRequest = (input: ImportItemsInput) => (
  dispatch: Dispatch
): void => {
  graphqlRequest<
    ImportItemsMutationResult,
    ImportItemsMutationVariables,
    "importItems"
  >({
    key: ImportItemsRequestKey,
    result: "importItems",
    document: ImportItems,
    variables: { input },
    dispatchTo: setImportResult,
  })(dispatch);
};

export const setImportResult = (result: ImportItemsResult) => (
  dispatch: Dispatch
): void => {
  if (isInventoryItems(result)) {
    dispatch(resetImportConflicts());
    dispatch(
      setInventoryItemsWithNotification("items were created")(result.items)
    );
    return;
  }

  if (isImportItemsConflicts(result)) {
    dispatch(setImportConflicts(result));
    return;
  }
};

export const clearImportItemsRequest = (): RequestAction =>
  clearRequest(ImportItemsRequestKey);

export const selectIsLoadingImportItemsRequest = (state: State): boolean =>
  (state.requests[ImportItemsRequestKey] || {}).loading;

export const selectImportItemsRequest = () => (state: State): Request =>
  state.requests[ImportItemsRequestKey] || {};
