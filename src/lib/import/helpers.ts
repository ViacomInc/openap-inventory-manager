import { partition } from "fp-ts/lib/Array";

import {
  InventoryItemInput,
  ImportItemsResult,
  ImportItemsConflicts,
  InventoryItems,
} from "../../graphql/__generated__/types";

import { getImportFilters, Filters } from "./filters";

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

export async function applyImportFilters(
  items: InventoryItemInput[]
): Promise<InventoryItemInput[]> {
  const filters = await getImportFilters();
  if (!filters.length) {
    return items;
  }

  return filters.reduce((items, { type, field, values }) => {
    const filterFunction = Filters[type];
    return items
      .map((i) => filterFunction(i, field, values))
      .filter(isInventoryItemInput);
  }, items);
}

function isInventoryItemInput(
  item: InventoryItemInput | null | undefined
): item is InventoryItemInput {
  return Boolean(item);
}
