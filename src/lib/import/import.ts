import { ApolloError, ValidationError } from "apollo-server-micro";
import {
  InventoryItemInput,
  ImportItemsResult,
  ImportItemsConflict,
  ImportMode,
} from "../../graphql/__generated__/types";

import { OAPPublisher } from "../openap/types";
import { getPublishers } from "../openap/api";
import { separateWithNoRate } from "./helpers";

import { createNewOnly } from "../InventoryItem";
import logger from "../logger";

import { applyImportFilters } from "./helpers";

export type ImportItemsFunction = (
  publisher: OAPPublisher
) => Promise<InventoryItemInput[]>;

export function createImportResolver(importFunction?: ImportItemsFunction) {
  return async function importItems(
    userId: string,
    publisherId: number,
    mode?: ImportMode | null
  ): Promise<ImportItemsResult> {
    if (!importFunction) {
      throw new ApolloError(
        "Importing items from external source is not implemented",
        "NOT_IMPLEMENTED"
      );
    }

    const publishers = await getPublishers();
    const publisher = publishers.find((p) => p.id === publisherId);

    if (!publisher) {
      throw new ValidationError(`Publisher with id "${publisherId}" not found`);
    }

    const allNewItems = await importFunction(publisher);
    const newItems = await applyImportFilters(allNewItems);

    if (!newItems.length) {
      return { items: [] };
    }

    const { left: itemsWithRate, right: itemsWithoutRate } = separateWithNoRate(
      newItems
    );

    if (itemsWithoutRate.length) {
      if (mode === undefined || mode === null) {
        return {
          total: newItems.length,
          conflicts: itemsWithoutRate.length,
          titles: itemsWithoutRate.reduce<ImportItemsConflict[]>(
            collectConflicts,
            []
          ),
        };
      }

      logger.info(
        `No rates found for the ${itemsWithoutRate.length} of ${newItems.length} CBS items`
      );

      if (mode === ImportMode.Ignore) {
        const items = await createNewOnly(userId, itemsWithRate);
        return { items };
      }
    }

    const items = await createNewOnly(userId, newItems);
    return { items };
  };
}

function collectConflicts(
  conflicts: ImportItemsConflict[],
  { name }: InventoryItemInput
): ImportItemsConflict[] {
  const conflict = conflicts.find((c) => c.name === name);
  if (conflict) {
    conflict.itemsCount += 1;
  } else {
    conflicts.push({ name, itemsCount: 1 });
  }

  return conflicts;
}
