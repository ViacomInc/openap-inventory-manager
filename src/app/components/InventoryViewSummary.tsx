import React, { useCallback } from "react";

import { InventoryItem } from "../graphql";
import { InventoryViewTabProps } from "./InventoryViewTabs";
import Table, { DRAFT_ID } from "./Table";

import useSummaryColumns from "./Inventory/useSummaryColumns";
// import useInventoryTablePage from "./useInventoryTablePage";

import { useDispatch } from "../store";
import { deleteInventoryItem } from "../store/actions";

import {
  createInventoryItemRequest,
  updateInventoryItemRequest,
  removeInventoryItemRequest,
  // restoreInventoryItemRequest,
} from "../api/inventoryItems";

import validateInvetoryItemRow from "./Inventory/validateInvetoryItemRow";
import { inventoryItemRowClasses } from "./Inventory/helpers";

export default function InventoryViewSummary({
  items,
  networks,
}: InventoryViewTabProps): JSX.Element {
  const dispatch = useDispatch();
  const columns = useSummaryColumns(networks);
  // const pagination = useInventoryTablePage();

  const handleEditRowCanceled = useCallback(async ({ id }: InventoryItem) => {
    id === DRAFT_ID && dispatch(deleteInventoryItem(id));
  }, []);

  const handleEditRowConfirmed = useCallback(async (item: InventoryItem) => {
    if (item.id === DRAFT_ID) {
      dispatch(createInventoryItemRequest(item));
    } else {
      dispatch(updateInventoryItemRequest(item));
    }
  }, []);

  const handleEditRowDeleted = useCallback(async (item: InventoryItem) => {
    dispatch(removeInventoryItemRequest(item.id));
  }, []);

  // const handleRowRestore = useCallback(async (item: InventoryItem) => {
  //   dispatch(restoreInventoryItemRequest(item.id));
  // }, []);

  return (
    <Table
      rowClass={inventoryItemRowClasses}
      isEditRowEnabled={true}
      isEditRowLoading={false}
      onEditRowCanceled={handleEditRowCanceled}
      onEditRowConfirmed={handleEditRowConfirmed}
      onEditRowDeleted={handleEditRowDeleted}
      editRowValidate={validateInvetoryItemRow}
      columns={columns}
      data={items}
    />
  );
}
