import { Alignment } from "./types";
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
