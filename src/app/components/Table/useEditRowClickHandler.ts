import { useCallback } from "react";

import { RowClickHandler, RowData, TableRow, ToggleRowsState } from "./types";

import { rowIdFromRowElement, isInActionsCell } from "./helpers";

interface UseEditRowClickHandler<R extends RowData> {
  rows: TableRow<R>[];
  editRowId?: string;
  setEditRow: (rowId: string) => void;
  isEditRowEnabled?: boolean;
  toggleRowExpanded?: ToggleRowsState;
}

export default function useEditRowClickHandler<R extends RowData>({
  rows,
  editRowId,
  setEditRow,
  isEditRowEnabled,
  toggleRowExpanded,
}: UseEditRowClickHandler<R>): RowClickHandler {
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
      const row = rows.find((row) => row.id === rowId);
      if (!row) {
        return;
      }

      if (row.canExpand && toggleRowExpanded) {
        toggleRowExpanded([rowId]);
        return;
      }

      row.canEdit() && row.edit();
    },
    [rows, editRowId, setEditRow, isEditRowEnabled]
  );
}
