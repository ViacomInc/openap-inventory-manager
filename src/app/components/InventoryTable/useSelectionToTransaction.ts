import { useEffect } from "react";

import { useDispatch, useSelector } from "../../store";

import { InventoryItem, InventoryItemStatus } from "../../graphql";

import { ToggleRowState, InventoryTableRow } from "./types";

import { startTransaction } from "../../store/actions";
import { selectTransaction, TransactionStatus } from "../../store/transaction";
import { getRowId } from "./";

interface UseTransactionSelection {
  data: InventoryItem[];
  selectedRows: InventoryTableRow[];
  toggleRowSelected: ToggleRowState;
}

export default function useSelectionToTransaction({
  data,
  selectedRows,
  toggleRowSelected,
}: UseTransactionSelection): void {
  const dispatch = useDispatch();
  const transaction = useSelector(selectTransaction);

  // remove selection when transaction status is empty
  useEffect(() => {
    if (!selectedRows.length) {
      return;
    }

    if (transaction.status === TransactionStatus.Empty) {
      selectedRows.forEach(({ id }) => toggleRowSelected(id, false));
    }
  }, [transaction.status]);

  // start transaction for selected item
  useEffect(() => {
    if (!selectedRows.length) {
      return;
    }
    if (transaction.status === TransactionStatus.Empty) {
      dispatch(
        startTransaction(selectedRows[selectedRows.length - 1].original)
      );
    }
  }, [selectedRows.length]);

  // select draft item
  useEffect(() => {
    const draftItem = data.find(
      (item) => item.status === InventoryItemStatus.Draft
    );

    if (!draftItem) {
      return;
    }

    toggleRowSelected(getRowId(draftItem), true);
  }, [data.length]);
}
