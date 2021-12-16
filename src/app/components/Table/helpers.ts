import { Alignment, RowData, TableCell, CanEditCell } from "./types";
import TableStyles from "./Table.module.css";
import CellStyles from "./Cell.module.css";

export function getAligmentClass(align?: Alignment): string | undefined {
  switch (align) {
    case Alignment.Leading:
      return TableStyles.CellLeading;

    case Alignment.Trailing:
      return TableStyles.CellTrailing;

    default:
      return undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shouldEditCell<R extends RowData, V = any>(
  cell: TableCell<R, V>,
  canEdit?: CanEditCell<R, V>
): boolean {
  const { row, isAggregated, value } = cell;
  if (!row.isEditing) {
    return false;
  }

  if (isAggregated && value === null) {
    return false;
  }

  if (typeof canEdit === "function") {
    return canEdit(row.original, cell);
  }

  if (typeof canEdit === "boolean") {
    return canEdit;
  }

  return true;
}

export function rowIdFromRowElement(target: Element): string | undefined {
  if (!(target instanceof Element) || isInActionsCell(target)) {
    return undefined;
  }

  const rowEl = target.closest("tr");
  if (!rowEl) {
    return undefined;
  }

  return rowEl.id;
}

const ActionsCellElementSelector = `.${CellStyles.Actions}`;

export function isInActionsCell(el: Element): boolean {
  if (el.closest(ActionsCellElementSelector)) {
    return true;
  }

  if (
    el.firstElementChild &&
    el.firstElementChild.classList.contains(CellStyles.Actions)
  ) {
    return true;
  }

  return false;
}
