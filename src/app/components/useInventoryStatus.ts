import { useMemo } from "react";
import { useSelector } from "../store";
import { InventoryItemStatus } from "../graphql";
import {
  selectInventoryItems,
  InventoryItemsSliceState,
} from "../store/inventoryItems";
import { hasConflicts } from "../../lib/InventoryItem/helpers";

export interface Status {
  inserted: number;
  updated: number;
  conflicted: number;
  removed: number;
}

function selectStatus(items: InventoryItemsSliceState): Status {
  return Object.values(items).reduce(
    (res, item) => {
      switch (item.status) {
        case InventoryItemStatus.Committed:
          return res;

        case InventoryItemStatus.New:
          res.inserted++;
          break;

        case InventoryItemStatus.Updated:
          res.updated++;
          break;

        case InventoryItemStatus.Removed:
          res.removed++;
          break;
      }

      if (hasConflicts(item)) {
        res.conflicted++;
      }

      return res;
    },
    { inserted: 0, updated: 0, conflicted: 0, removed: 0 }
  );
}

export default function useInventoryStatus(): Status {
  const items = useSelector(selectInventoryItems);
  return useMemo(() => selectStatus(items), [items]);
}
