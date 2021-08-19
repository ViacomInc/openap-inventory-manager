import { partition } from "fp-ts/lib/Array";

import {
  InventoryItemInput,
  ImportItemsResult,
  ImportItemsConflicts,
  InventoryItems,
} from "../../graphql/__generated__/types";

export const separateWithNoRate = partition<InventoryItemInput>(
  (item) => item.rate === 0
);

export function isInventoryItems(
  result: ImportItemsResult
): result is InventoryItems {
  return "items" in result;
}

export function isImportItemsConflicts(
  result: ImportItemsResult
): result is ImportItemsConflicts {
  return "total" in result;
}

export function isInventoryItemInput(
  item: InventoryItemInput | null | undefined
): item is InventoryItemInput {
  return Boolean(item);
}
