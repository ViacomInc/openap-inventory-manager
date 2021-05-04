import { useCallback } from "react";

import {
  ToggleRowState,
  ToggleRowsState,
  RowClickHandler,
  InventoryTableRow,
} from "./types";

import { ActionsCellElementSelector } from "./useActions";

import { isEditable } from "./";

interface UseRowClickHandler {
  rows: InventoryTableRow[];
  hasSelectedRows: boolean;
  toggleRowSelected: ToggleRowState;
  toggleRowExpanded?: ToggleRowsState;
}

export default function useRowClickHandler({
  rows,
  hasSelectedRows,
  toggleRowSelected,
  toggleRowExpanded,
}: UseRowClickHandler): RowClickHandler {
  return useCallback(
    ({ target }: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
      // ignore clicks when there is a selected row
      // or click on the action buttons cell
      if (
        hasSelectedRows ||
        !(target instanceof Element) ||
        target.closest(ActionsCellElementSelector)
      ) {
        return;
      }

      const rowEl = target.closest("tr");
      if (!rowEl) {
        return;
      }

      const rowId = rowEl.id;
      const row = rows.find((row) => row.id === rowId);
      if (!row) {
        return;
      }

      if (row.canExpand && toggleRowExpanded) {
        toggleRowExpanded([rowId]);
        return;
      }

      if (!isEditable(row.original)) {
        return;
      }

      toggleRowSelected(rowId, true);
    },
    [rows, hasSelectedRows, toggleRowSelected, toggleRowExpanded]
  );
}
