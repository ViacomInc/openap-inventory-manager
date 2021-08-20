import { sql } from "slonik";
import { BroadcastTimeZone } from "@viacomcbs/broadcast-calendar";

import {
  InventoryItem,
  InventoryItemUpdateInput,
  InventoryItemStatus,
} from "../../graphql/__generated__/types";
import getPool from "../../db/client";
import { sqlSet, table } from "../../db/helpers";
import { isEmpty } from "../helpers";

import { inventoryItemQuery, inventoryItemRateQuery } from "./queries";

function updateRateQuery(userId: string, id: number, rate: number) {
  return sql`
    WITH item AS (
      SELECT name, rate, start_datetime FROM ${table(
        "inventory_items"
      )} WHERE ID = ${id}
    )
    UPDATE ${table("inventory_items")} AS items
    SET
      rate = ${rate},
      updated_by = ${userId},
      status = CASE WHEN items.status != ${InventoryItemStatus.New}
        THEN ${InventoryItemStatus.Updated}
        ELSE
          ${InventoryItemStatus.New}
        END
    FROM ${table("inventory_items")}, item
    WHERE
      items.name = item.name AND
      items.rate = item.rate AND
      (
        (items.start_datetime AT TIME ZONE ${BroadcastTimeZone}) - '6 hours'::interval
      )::date >=
      date_trunc('week', (
        (item.start_datetime AT TIME ZONE ${BroadcastTimeZone}) - '6 hours'::interval
      ))::date
      AND
      (
        (items.start_datetime AT TIME ZONE ${BroadcastTimeZone}) - '6 hours'::interval
      )::date <
      date_trunc('week', (
        ((item.start_datetime AT TIME ZONE ${BroadcastTimeZone}) - '6 hours'::interval) + '1 week'::interval
      ))
    RETURNING
      ${inventoryItemRateQuery}
  `;
}

function updateQuery(
  userId: string,
  ids: number[],
  update: InventoryItemUpdateInput
) {
  const updateMap = {
    name: update.name,
    projections_demographics: update.projectionsDemographics,
    projected_impressions: update.projectedImpressions,
    start_datetime: update.startDatetime
      ? new Date(update.startDatetime).toISOString()
      : undefined,
    end_datetime: update.endDatetime
      ? new Date(update.endDatetime).toISOString()
      : undefined,
    valid_until: update.validUntil
      ? new Date(update.validUntil).toISOString()
      : undefined,
    network_id: update.networkId,
    units: update.units,
    rate: update.rate,
    rate_type: update.rateType,
    updated_by: userId,
  };

  return sql`
    UPDATE ${table("inventory_items")}
    SET ${sqlSet(updateMap)},
      status = CASE WHEN status != ${InventoryItemStatus.New}
        THEN ${InventoryItemStatus.Updated}
        ELSE
          ${InventoryItemStatus.New}
        END
    WHERE id = ANY(${sql.array(ids, sql`int4[]`)})
    RETURNING ${inventoryItemQuery}
  `;
}

export async function update(
  userId: string,
  {
    id,
    update,
  }: {
    id: number;
    update: InventoryItemUpdateInput;
  }
): Promise<InventoryItem[]> {
  const pool = getPool();
  const { rate: rateUpdate, ...inventoryUpdate } = update;

  if (!isEmpty(inventoryUpdate)) {
    const items = await pool.many<InventoryItem>(
      updateQuery(userId, [id], inventoryUpdate)
    );

    if (rateUpdate === undefined || rateUpdate === null) {
      return [...items];
    }
  }

  if (rateUpdate === undefined || rateUpdate === null) {
    return [];
  }

  const itemsWithUpdatedRates = await pool.many<InventoryItem>(
    updateRateQuery(userId, id, rateUpdate)
  );

  return [...itemsWithUpdatedRates];
}

function updateStatusQuery(
  userId: string,
  ids: number[],
  status: InventoryItemStatus,
  returnValues: boolean
) {
  const query = sql`
    UPDATE ${table("inventory_items")}
    SET ${sqlSet({
      status,
      updated_by: userId,
    })}
    WHERE id = ANY(${sql.array(ids, sql`int4[]`)})
  `;

  if (!returnValues) {
    return query;
  }

  return sql`${query}
    RETURNING ${inventoryItemQuery}
  `;
}

export async function updateStatus(
  userId: string,
  ids: number[],
  status: InventoryItemStatus,
  returnValues = true
): Promise<InventoryItem[]> {
  const pool = getPool();
  const items = await pool.any<InventoryItem>(
    updateStatusQuery(userId, ids, status, returnValues)
  );
  return [...items];
}

function updateStatusForDateQuery(
  userId: string,
  date: string,
  status: InventoryItemStatus
) {
  return sql`
    UPDATE ${table("inventory_items")}
    SET ${sqlSet({
      status,
      updated_by: userId,
    })}
    WHERE (start_datetime AT TIME ZONE ${BroadcastTimeZone})::date = ${date}
  `;
}

export async function updateStatusForDate(
  userId: string,
  date: string,
  status: InventoryItemStatus
): Promise<void> {
  const pool = getPool();
  await pool.many<InventoryItem>(
    updateStatusForDateQuery(userId, date, status)
  );
}
