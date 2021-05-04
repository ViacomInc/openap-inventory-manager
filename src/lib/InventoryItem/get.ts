import { sql } from "slonik";
import { StringInterval } from "broadcast-calendar";

import getPool from "../../db/client";
import { table } from "../../db/helpers";

import {
  InventoryItemStatus,
  InventoryItem,
} from "../../graphql/__generated__/types";

import { inventoryItemQuery } from "./";

function getQuery(id: number) {
  return sql`
      SELECT ${inventoryItemQuery}
      FROM
        ${table("inventory_items")}
      WHERE id = ${id}
    `;
}

interface Get {
  id: number;
}

export function get({ id }: Get): Promise<InventoryItem> {
  const pool = getPool();
  return pool.one<InventoryItem>(getQuery(id));
}

interface GetAll {
  ids: number[];
}

function getAllQuery(ids: number[]) {
  return sql`
      SELECT ${inventoryItemQuery}
      FROM
        ${table("inventory_items")}
      WHERE id = ANY(${sql.array(ids, sql`int4[]`)})
    `;
}

export async function getAll({ ids }: GetAll): Promise<InventoryItem[]> {
  const pool = getPool();
  const items = await pool.many<InventoryItem>(getAllQuery(ids));
  return [...items];
}

interface GetAllForPubisherQuery {
  publisherId: number;
  statuses?: InventoryItemStatus[];
  noPastItems?: boolean;
}

function getAllForPubisherQuery({
  publisherId,
  statuses,
  noPastItems,
}: GetAllForPubisherQuery) {
  let query = sql`
    SELECT ${inventoryItemQuery}
    FROM
      ${table("inventory_items")}
    WHERE publisher_id = ${publisherId}
    AND status != ${InventoryItemStatus.Deleted}
  `;

  if (noPastItems) {
    query = sql`${query} AND start_datetime::date >= NOW()`;
  }

  if (!(statuses && statuses.length)) {
    return query;
  }

  return sql`
    ${query} AND status = ANY(${sql.array(statuses, sql`varchar[]`)})
  `;
}

export async function getAllForPublisher(
  query: Pick<GetAllForPubisherQuery, "publisherId" | "noPastItems">
): Promise<InventoryItem[]> {
  const pool = getPool();
  const items = await pool.any<InventoryItem>(getAllForPubisherQuery(query));
  return [...items];
}

export async function getAllForPublisherByStatuses(
  query: Required<GetAllForPubisherQuery> &
    Pick<GetAllForPubisherQuery, "noPastItems">
): Promise<InventoryItem[]> {
  const pool = getPool();
  const items = await pool.any<InventoryItem>(getAllForPubisherQuery(query));

  return [...items];
}

interface GetAllForDateRangeQuery {
  dateRange: StringInterval;
  publisherId?: number;
  statuses: InventoryItemStatus[];
}

function getAllForDateRangeQuery({
  publisherId,
  dateRange,
  statuses,
}: GetAllForDateRangeQuery) {
  const query = sql`
    SELECT
      ${inventoryItemQuery}
    FROM
      ${table("inventory_items")}
    WHERE start_datetime::date >= ${dateRange[0]}
      AND end_datetime::date <= ${dateRange[1]}
      AND status = ANY(${sql.array(statuses, sql`varchar[]`)})
  `;

  if (publisherId === undefined) {
    return query;
  }

  return sql`
    ${query} AND publisher_id = ${publisherId}
  `;
}

export async function getAllForDateRange(
  options: GetAllForDateRangeQuery
): Promise<InventoryItem[]> {
  const pool = getPool();
  const items = await pool.any<InventoryItem>(getAllForDateRangeQuery(options));
  return [...items];
}

interface GetAllForDateQuery {
  publisherId: number;
  date: string;
  statuses: InventoryItemStatus[];
}

function getAllForDateQuery({
  publisherId,
  date,
  statuses,
}: GetAllForDateQuery) {
  return sql`
    SELECT ${inventoryItemQuery}
    FROM
      ${table("inventory_items")}
    WHERE publisher_id = ${publisherId}
    AND start_datetime::date = ${date}
    AND status = ANY(${sql.array(statuses, sql`varchar[]`)})
  `;
}

export async function getAllForDate(
  options: GetAllForDateQuery
): Promise<InventoryItem[]> {
  const pool = getPool();
  const items = await pool.any<InventoryItem>(getAllForDateQuery(options));

  return [...items];
}
