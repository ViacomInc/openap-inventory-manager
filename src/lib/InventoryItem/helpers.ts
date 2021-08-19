import {
  DateTime,
  Interval,
  StringInterval,
  parseDateFromSQL,
  BroadcastTimeZone,
} from "@viacomcbs/broadcast-calendar";
import { partition } from "fp-ts/lib/Array";
import {
  InventoryItem,
  InventoryItemInput,
  InventoryItemStatus,
} from "../../graphql/__generated__/types";
import type { ItemDateTimeRange } from "../types";
import {
  getIsoDateFromInput,
  getIsoDateTimeFromInput,
  differenceInHours,
  addWeeks,
  getIsoDateFromSql,
  getNowString,
} from "../dateHelpers";

function getDateRangeReducer(
  range: StringInterval,
  item: ItemDateTimeRange
): StringInterval {
  const start = getIsoDateFromSql(item.startDatetime);
  const end = getIsoDateFromSql(item.endDatetime);

  if (!range[0] || range[0] > start) {
    range[0] = start;
  }

  if (!range[1] || range[1] < end) {
    range[1] = end;
  }

  return range;
}

export function getDateRange(items: ItemDateTimeRange[]): StringInterval {
  return items.reduce(getDateRangeReducer, ["", ""]);
}

export function isItemInDateRange(
  item: ItemDateTimeRange,
  range: Interval
): boolean {
  const startDate = parseDateFromSQL(item.startDatetime);
  const endDate = parseDateFromSQL(item.endDatetime);

  return startDate >= range.start && endDate <= range.end;
}

export function isFutureItem(item: ItemDateTimeRange): boolean {
  const startDate = DateTime.fromSQL(item.startDatetime).startOf("day");
  const validUntilDate = DateTime.fromSQL(item.validUntil).startOf("day");

  return (
    startDate >= DateTime.utc().setZone(BroadcastTimeZone).startOf("day") &&
    startDate >= validUntilDate
  );
}

export function isLessThan(item: ItemDateTimeRange, maxHours: number): boolean {
  const hours = differenceInHours(item.endDatetime, item.startDatetime);
  return Math.abs(hours) <= maxHours;
}

export function isValidUntilBeforeStart(item: ItemDateTimeRange): boolean {
  return (
    DateTime.fromSQL(item.validUntil).startOf("day") <=
    DateTime.fromSQL(item.startDatetime).startOf("day")
  );
}

export function moveWeeks(
  item: InventoryItemInput,
  weeks: number
): InventoryItemInput {
  return {
    ...item,
    startDatetime: getIsoDateTimeFromInput(addWeeks(item.startDatetime, weeks)),
    endDatetime: getIsoDateTimeFromInput(addWeeks(item.endDatetime, weeks)),
    validUntil: getIsoDateFromInput(addWeeks(item.validUntil, weeks)),
  };
}

export function isNotRemoved(item: InventoryItem): boolean {
  return item.status !== InventoryItemStatus.Removed;
}

export const separateRemoved = partition<InventoryItem>(
  (item) => item.status === InventoryItemStatus.Removed
);

export function getId(item: InventoryItem): number {
  return item.id;
}

export function hasConflicts(item: InventoryItem): boolean {
  return (
    item.status !== InventoryItemStatus.Removed &&
    (item.rate <= 0 || item.projectedImpressions <= 0 || item.units <= 0)
  );
}

export function isExpired(item: Pick<InventoryItem, "validUntil">): boolean {
  const today = getNowString();
  return item.validUntil < today;
}
