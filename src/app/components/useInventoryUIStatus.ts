import { useMemo } from "react";
import { useSelector, State, selectState } from "../store";
import { selectIsAllInventoryItemsPublished } from "../store/inventoryItems";
import {
  GetAllInventoryItemsRequestKey,
  SubmitInventoryItemsRequestKey,
  FlushInventoryItemsRequestKey,
  ImportItemsRequestKey,
} from "../store/constants";
import { TableView } from "../store/types";

interface Status {
  canCreateNewItem: boolean;
  canAddNewItems: boolean;
  canSubmitItems: boolean;
  canUseFilters: boolean;
}

function getUIStatus(state: State): Status {
  const isAllItemsLoading =
    state.requests[GetAllInventoryItemsRequestKey]?.loading ?? false;
  const isSubmitItemsLoading =
    state.requests[SubmitInventoryItemsRequestKey]?.loading ?? false;
  const isFlushItemsLoading =
    state.requests[FlushInventoryItemsRequestKey]?.loading ?? false;
  const isImportItemsLoading =
    state.requests[ImportItemsRequestKey]?.loading ?? false;
  const isCSVProcessing = state.csv.processing;

  const isLoading =
    isAllItemsLoading ||
    isSubmitItemsLoading ||
    isCSVProcessing ||
    isFlushItemsLoading ||
    isImportItemsLoading;

  // TODO: get the actual state from Table component
  const isTransactionEmpty = true;

  const isSummaryView = state.table.view === TableView.Items;
  const hasItems = !!Object.keys(state.inventoryItems).length;

  return {
    canCreateNewItem: isSummaryView && !isLoading && isTransactionEmpty,
    canAddNewItems: !isLoading && isTransactionEmpty,
    canUseFilters: hasItems && !isLoading && isTransactionEmpty,
    canSubmitItems:
      hasItems &&
      !isLoading &&
      isTransactionEmpty &&
      !selectIsAllInventoryItemsPublished(state),
  };
}

export default function useInventoryUIStatus(): Status {
  const state = useSelector(selectState);
  return useMemo(() => getUIStatus(state), [state]);
}
