import { sql } from "slonik";

export const filterQuery = sql`
  id,
  type,
  field,
  values,
  created_at as "createdAt",
  created_by as "createdBy",
  updated_at as "updatedAt",
  updated_by as "updatedBy"
`;

export type { ImportItemsFunction } from "./import";
export { createImportResolver } from "./import";
export * from "./filters";
export * from "./helpers";
