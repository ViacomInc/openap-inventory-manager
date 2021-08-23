import { Alignment } from "./types";
import { InventoryItem, InventoryItemStatus } from "../../graphql";

import Styles from "./InventoryTable.module.css";

export { default } from "./InventoryTable";

export function getRowId(row: InventoryItem): string {
  return `ii-${row.id}`;
}

export function getAligmentClass(align?: Alignment): string | undefined {
  if (align === undefined) {
    return undefined;
  }

  switch (align) {
    case Alignment.Leading:
      return Styles.CellLeading;

    case Alignment.Trailing:
      return Styles.CellTrailing;

    default:
      return undefined;
  }
}

export function onlyNewEditable(item?: InventoryItem): boolean {
  if (
    !item ||
    !(
      item.status === InventoryItemStatus.New ||
      item.status === InventoryItemStatus.Draft
    )
  ) {
    return false;
  }

  return true;
}

export function hasActions(item?: InventoryItem): boolean {
  if (!item) {
    return false;
  }

  if (item.status === InventoryItemStatus.Deleted) {
    return false;
  }

  return true;
}

export function biggerThanZero(value: string | number): boolean {
  return Number(value) > 0;
}

export function isEditable(item?: InventoryItem): boolean {
  return Boolean(
    item &&
      !(
        item.status === InventoryItemStatus.Removed ||
        item.status === InventoryItemStatus.Deleted
      )
  );
}
