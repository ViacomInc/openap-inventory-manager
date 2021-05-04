import { sql } from "slonik";

export const inventoryItemQuery = sql`
  id,
  name,
  projections_demographics as "projectionsDemographics",
  projected_impressions as "projectedImpressions",
  start_datetime as "startDatetime",
  end_datetime as "endDatetime",
  valid_until as "validUntil",
  status,
  network_id as "networkId",
  units,
  rate,
  publisher_id as "publisherId",
  rate_key as "rateKey",
  rate_type as "rateType",
  created_at as "createdAt",
  created_by as "createdBy",
  updated_at as "updatedAt",
  updated_by as "updatedBy"
`;

export const inventoryItemRateQuery = sql`
  items.id,
  items.name,
  items.projections_demographics as "projectionsDemographics",
  items.projected_impressions as "projectedImpressions",
  items.start_datetime as "startDatetime",
  items.end_datetime as "endDatetime",
  items.valid_until as "validUntil",
  items.status,
  items.network_id as "networkId",
  items.units,
  items.rate,
  items.publisher_id as "publisherId",
  items.rate_key as "rateKey",
  items.rate_type as "rateType",
  items.created_at as "createdAt",
  items.created_by as "createdBy",
  items.updated_at as "updatedAt",
  items.updated_by as "updatedBy"
`;

export {
  get,
  getAll,
  getAllForPublisher,
  getAllForPublisherByStatuses,
  getAllForDateRange,
  getAllForDate,
} from "./get";
export { create, createNewOnly } from "./create";
export { update, updateStatus, updateStatusForDate } from "./update";
export { remove, restore } from "./remove";
export { createNewInventoryItem } from "./new";
