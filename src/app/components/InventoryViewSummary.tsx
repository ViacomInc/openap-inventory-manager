import React, { useCallback } from "react";

import { InventoryItem } from "../graphql";
import { InventoryViewTabProps } from "./InventoryViewTabs";
import Table, { EditRowValidationError, DRAFT_ID } from "./Table";

import useColumns from "./useColumns";
// import useInventoryTablePage from "./useInventoryTablePage";

import {
  isFutureItem,
  isLessThan,
  isValidUntilBeforeStart,
} from "../../lib/InventoryItem/helpers";
import { MAX_ITEM_DURATION_HOURS } from "../../lib/constants";

import { useDispatch } from "../store";
import { deleteInventoryItem } from "../store/actions";

import {
  createInventoryItemRequest,
  updateInventoryItemRequest,
  removeInventoryItemRequest,
  // restoreInventoryItemRequest,
} from "../api/inventoryItems";

function validateRowEdits(
  item: InventoryItem
): null | EditRowValidationError<InventoryItem>[] {
  console.log("validate");
  const errors: EditRowValidationError<InventoryItem>[] = [];

  if (!isFutureItem(item)) {
    errors.push({
      column: "startDatetime",
      message:
        "Start Date has be today or later and later than Valid Until date",
    });
  }

  if (!isLessThan(item, MAX_ITEM_DURATION_HOURS)) {
    errors.push({
      column: "endDatetime",
      message: `Item duration has be less than ${MAX_ITEM_DURATION_HOURS} hours`,
    });
  }

  if (!isValidUntilBeforeStart(item)) {
    errors.push({
      column: "validUntil",
      message: "Valid until date has to be earlier or the same as start date",
    });
  }

  if (errors.length === 0) {
    return null;
  }

  return errors;
}

export default function InventoryViewSummary({
  items,
  networks,
}: InventoryViewTabProps): JSX.Element {
  const dispatch = useDispatch();
  const columns = useColumns(networks);
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
      isEditRowEnabled={true}
      isEditRowLoading={false}
      onEditRowCanceled={handleEditRowCanceled}
      onEditRowConfirmed={handleEditRowConfirmed}
      onEditRowDeleted={handleEditRowDeleted}
      editRowValidate={validateRowEdits}
      columns={columns}
      data={items}
    />
  );
}
