import { sql } from "slonik";

import getPool from "../../db/client";
import { table, sqlSet } from "../../db/helpers";

import {
  ImportFilterInput,
  ImportFilterUpdateInput,
  ImportFilter,
  ImportFilterType,
  InventoryItemInput,
} from "../../graphql/__generated__/types";

import { clamp } from "../helpers";

import { filterQuery } from "./";

type FilterFunction = (
  item: InventoryItemInput & { [index: string]: unknown },
  field: string,
  values: string[]
) => InventoryItemInput | null;

// return null if you want ot remove item from collection
export const Filters: Record<ImportFilterType, FilterFunction> = {
  [ImportFilterType.Clamp]: (item, field, values) => ({
    ...item,
    [field]: clamp(0, parseFloat(values[0]), parseFloat(item[field] as string)),
  }),
  [ImportFilterType.Include]: (item, field, values) => {
    if (values.includes(String(item[field]))) {
      return item;
    }

    return null;
  },
  [ImportFilterType.Exclude]: (item, field, values) => {
    if (values.includes(String(item[field]))) {
      return null;
    }

    return item;
  },
};

function getQuery() {
  return sql`
      SELECT ${filterQuery}
      FROM
        ${table("import_filters")}
      WHERE is_active = true
    `;
}

export async function getImportFilters(): Promise<ImportFilter[]> {
  const pool = getPool();
  const filters = await pool.any<ImportFilter>(getQuery());
  return [...filters];
}

function createQuery(userId: string, filters: ImportFilterInput[]) {
  return sql`
    INSERT INTO ${table("import_filters")} (
      type,
      field,
      values,
      created_by,
      updated_by,
      is_active
    )
    VALUES ${sql.join(makeValues(userId, filters), sql`, `)}
    RETURNING ${filterQuery}
  `;
}

export async function createImportFilters(
  userId: string,
  filters: ImportFilterInput[]
): Promise<ImportFilter[]> {
  const pool = getPool();
  const res = await pool.many<ImportFilter>(createQuery(userId, filters));
  return [...res];
}

function updateQuery(
  userId: string,
  id: number,
  update: ImportFilterUpdateInput
) {
  return sql`
    UPDATE ${table("import_filters")}
    SET ${sqlSet({
      ...update,
      updated_by: userId,
    })},
    WHERE id = ${id}
    RETURNING ${filterQuery}
  `;
}

export async function updateImportFilter(
  userId: string,
  id: number,
  update: ImportFilterUpdateInput
): Promise<ImportFilter> {
  const pool = getPool();
  return await pool.one<ImportFilter>(updateQuery(userId, id, update));
}

function removeQuery(userId: string, id: number) {
  return sql`
    UPDATE ${table("import_filters")}
    SET
      is_active = false,
      updated_by = ${userId}
    WHERE id = ${id}
    RETURNING ${filterQuery}
  `;
}

interface RemoveRequest {
  id: number;
}

export function removeImportFilter(
  userId: string,
  { id }: RemoveRequest
): Promise<ImportFilter> {
  const pool = getPool();
  return pool.one<ImportFilter>(removeQuery(userId, id));
}

function clearImportFilterQuery(userId: string) {
  return sql`
    UPDATE ${table("import_filters")}
    SET
      is_active = false,
      updated_by = ${userId}
  `;
}
export async function clearImportFilter(userId: string): Promise<void> {
  const pool = getPool();
  await pool.query(clearImportFilterQuery(userId));
}

export async function setImportFilters(
  userId: string,
  filters: ImportFilterInput[]
): Promise<ImportFilter[]> {
  const pool = getPool();
  await clearImportFilter(userId);
  const res = await pool.many<ImportFilter>(createQuery(userId, filters));
  return [...res];
}

function makeValues(userId: string, filters: ImportFilterInput[]) {
  return filters.map(
    (filter) => sql`(
      ${filter.type},
      ${filter.field},
      ${sql`ARRAY[${sql.join(filter.values, sql`,`)}]`},
      ${userId},
      ${userId},
      true
    )`
  );
}
