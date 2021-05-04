import { sql } from "slonik";

import getPool from "../../db/client";
import { table } from "../../db/helpers";

import {
  InventoryItem,
  InventoryItemInput,
  InventoryItemStatus,
} from "../../graphql/__generated__/types";

import { getAllForDateRange } from "./get";
import { getDateRange } from "./helpers";
import { inventoryItemQuery } from "./";
import { isDateTimeEqual } from "../dateHelpers";

function createQuery(userId: string, items: InventoryItemInput[]) {
  return sql`
    INSERT INTO ${table("inventory_items")} (
      name,
      projections_demographics,
      projected_impressions,
      start_datetime,
      end_datetime,
      valid_until,
      status,
      network_id,
      units,
      rate,
      rate_type,
      publisher_id,
      created_by,
      updated_by
    )
    VALUES ${sql.join(makeValues(userId, items), sql`, `)}
    RETURNING ${inventoryItemQuery}
  `;
}

export async function create(
  userId: string,
  data: InventoryItemInput[]
): Promise<InventoryItem[]> {
  const pool = getPool();
  const items = await pool.many<InventoryItem>(createQuery(userId, data));
  return [...items];
}

function makeValues(userId: string, data: InventoryItemInput[]) {
  return data.map(
    (item) => sql`(
      ${item.name},
      ${item.projectionsDemographics},
      ${item.projectedImpressions},
      ${item.startDatetime},
      ${item.endDatetime},
      ${item.validUntil},
      ${InventoryItemStatus.New},
      ${item.networkId},
      ${item.units},
      ${item.rate},
      ${item.rateType},
      ${item.publisherId},
      ${userId},
      ${userId}
    )`
  );
}

export async function createNewOnly(
  userId: string,
  data: InventoryItemInput[]
): Promise<InventoryItem[]> {
  const dateRange = getDateRange(data);
  const items = await getAllForDateRange({
    dateRange,
    statuses: [
      InventoryItemStatus.New,
      InventoryItemStatus.Updated,
      InventoryItemStatus.Removed,
      InventoryItemStatus.Committed,
    ],
  });
  const newData = items.length ? data.filter(filterItems(items)) : data;

  if (!newData.length) {
    return [];
  }

  return create(userId, newData);
}

function filterItems(existingItems: InventoryItem[]) {
  return (item: InventoryItemInput): boolean =>
    !existingItems.some((existingItem) => isEqual(existingItem, item));
}

function isEqual(a: InventoryItemInput, b: InventoryItemInput): boolean {
  return (
    a.publisherId === b.publisherId &&
    isDateTimeEqual(a.startDatetime, b.startDatetime) &&
    isDateTimeEqual(a.endDatetime, b.endDatetime) &&
    a.networkId === b.networkId &&
    a.projectionsDemographics === b.projectionsDemographics &&
    a.name === b.name
  );
}
