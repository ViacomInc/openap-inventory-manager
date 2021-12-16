import { InventoryItem, InventoryItemStatus } from "../../graphql";
import { TableCell, ClassNames } from "../Table";
import { isExpired } from "../../../lib/InventoryItem/helpers";

import Styles from "./Row.module.css";

const ItemStatusToCSSClassMap = {
  [InventoryItemStatus.Draft]: Styles.RowDraft,
  [InventoryItemStatus.New]: Styles.RowNew,
  [InventoryItemStatus.Updated]: Styles.RowUpdated,
  [InventoryItemStatus.Removed]: Styles.RowRemoved,
  [InventoryItemStatus.Deleted]: Styles.RowDeleted,
  [InventoryItemStatus.Committed]: Styles.RowCommitted,
};

export function inventoryItemRowClasses(item?: InventoryItem): ClassNames {
  if (!item) {
    return [];
  }

  return [
    ItemStatusToCSSClassMap[item.status],
    {
      [Styles.RowExpired]: isExpired(item),
    },
  ];
}

export function isNewItem(item?: InventoryItem): boolean {
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

export function noEditsForNull(
  _item: InventoryItem | undefined,
  cell: TableCell<InventoryItem>
): boolean {
  return cell.value !== null;
}

export function formatFloat(v: number | string) {
  return typeof v === "number" ? v.toFixed(2) : v;
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
