import { useCallback } from "react";

import { RowClickHandler, RowData, TableRow, ToggleRowsState } from "./types";

import { rowIdFromRowElement, isInActionsCell } from "./helpers";

interface UseRowClickHandler<R extends RowData> {
  rowsById: Record<string, TableRow<R>>;
  editRowId?: string;
  setEditRow: (rowId: string) => void;
  isEditRowEnabled?: boolean;
  toggleRowExpanded?: ToggleRowsState;
}

export default function useRowClickHandler<R extends RowData>({
  rowsById,
  editRowId,
  setEditRow,
  isEditRowEnabled,
  toggleRowExpanded,
}: UseRowClickHandler<R>): RowClickHandler {
  return useCallback(
    ({ target }: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
      // ignore clicks when there is an editing row
      // or click on the action buttons cell
      if (
        !isEditRowEnabled ||
        editRowId ||
        !(target instanceof Element) ||
        isInActionsCell(target)
      ) {
        return;
      }

      const rowId = rowIdFromRowElement(target);
      if (!rowId) {
        return;
      }
      const row = rowsById[rowId];
      if (!row) {
        return;
      }

      if (row.canExpand && toggleRowExpanded) {
        toggleRowExpanded([rowId]);
        return;
      }

      row.canEdit() && row.edit();
    },
    [rowsById, editRowId, setEditRow, isEditRowEnabled]
  );
}
