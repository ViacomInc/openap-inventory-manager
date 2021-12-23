import React, { useState, useCallback } from "react";

import { InventoryItem, InventoryItemStatus } from "../graphql";
import { InventoryViewTabProps } from "./InventoryViewTabs";
import { Table, DRAFT_ID } from "./Table";

import useSummaryColumns from "./Inventory/useSummaryColumns";
// import useInventoryTablePage from "./useInventoryTablePage";

import { useDispatch, useSelector } from "../store";
import { deleteInventoryItem } from "../store/actions";

import {
  createInventoryItemRequest,
  updateInventoryItemRequest,
  removeInventoryItemRequest,
  restoreInventoryItemRequest,
  selectInventoryItemRequestsStatus,
} from "../api/inventoryItems";

import validateInvetoryItemRow from "./Inventory/validateInvetoryItemRow";
import {
  inventoryItemRowClasses,
  canEditInventoryItem,
  canRestoreInventoryItem,
} from "./Inventory/helpers";

export default function InventoryViewSummary({
  items,
  networks,
}: InventoryViewTabProps): JSX.Element {
  const dispatch = useDispatch();
  const [editRowId, setEditRowId] = useState<number>();
  const isTransactionLoading = useSelector(
    selectInventoryItemRequestsStatus(editRowId)
  );

  const handleEditRowCanceled = useCallback(async ({ id }: InventoryItem) => {
    id === DRAFT_ID && dispatch(deleteInventoryItem(id));
  }, []);

  const handleEditRowConfirmed = useCallback(async (item: InventoryItem) => {
    setEditRowId(item.id);
    return item.id === DRAFT_ID
      ? dispatch(createInventoryItemRequest(item))
      : dispatch(updateInventoryItemRequest(item));
  }, []);

  const handleEditRowDeletedRestored = useCallback(
    async (item: InventoryItem) => {
      setEditRowId(item.id);
      return item.status === InventoryItemStatus.Removed
        ? dispatch(restoreInventoryItemRequest(item.id))
        : dispatch(removeInventoryItemRequest(item.id));
    },
    []
  );

  const columns = useSummaryColumns(networks);
  // const pagination = useInventoryTablePage();

  return (
    <Table
      rowClass={inventoryItemRowClasses}
      isEditRowEnabled={true}
      isEditRowLoading={isTransactionLoading}
      onEditRowCanceled={handleEditRowCanceled}
      onEditRowConfirmed={handleEditRowConfirmed}
      onEditRowDeleted={handleEditRowDeletedRestored}
      onEditRowRestored={handleEditRowDeletedRestored}
      canEditRow={canEditInventoryItem}
      canDeleteRow={true}
      canRestoreRow={canRestoreInventoryItem}
      editRowValidate={validateInvetoryItemRow}
      columns={columns}
      data={items}
    />
  );
}
