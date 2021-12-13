import { InventoryItem, InventoryItemStatus } from "../../graphql";

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
