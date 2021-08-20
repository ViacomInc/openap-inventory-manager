import { sql } from "slonik";

import getPool from "../../db/client";
import { sqlSet, table } from "../../db/helpers";
import {
  InventoryItem,
  InventoryItemStatus,
} from "../../graphql/__generated__/types";
import { inventoryItemQuery } from "./queries";

function removeQuery(userId: string, id: number) {
  return sql`
    UPDATE ${table("inventory_items")}
    SET ${sqlSet({
      updated_by: userId,
      status: InventoryItemStatus.Removed,
    })}
    WHERE id = ${id}
    RETURNING ${inventoryItemQuery}
  `;
}

type RemoveRequest = {
  id: number;
};

export function remove(
  userId: string,
  { id }: RemoveRequest
): Promise<InventoryItem> {
  const pool = getPool();
  return pool.one<InventoryItem>(removeQuery(userId, id));
}

function restoreQuery(userId: string, id: number) {
  return sql`
    UPDATE ${table("inventory_items")}
    SET
      updated_by = ${userId},
      status = ${InventoryItemStatus.Updated}
    WHERE id = ${id}
    RETURNING ${inventoryItemQuery}
  `;
}

type RestoreRequest = {
  id: number;
};

export function restore(
  userId: string,
  { id }: RestoreRequest
): Promise<InventoryItem> {
  const pool = getPool();
  return pool.one<InventoryItem>(restoreQuery(userId, id));
}
