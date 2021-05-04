import { sql } from "slonik";

export const rateQuery = sql`
  id,
  rate,
  rate_key as "rateKey",
  rate_type as "rateType",
  valid_from as "validFrom",
  valid_until as "validUntil",
  is_archived as "isArchived",
  created_at as "createdAt",
  created_by as "createdBy",
  updated_at as "updatedAt",
  updated_by as "updatedBy"
`;

export { get, getAllForPublisher } from "./get";
export { create, bulkCreate } from "./create";
export { archiveForDate } from "./update";
