import {
  DISPLAY_DATE_FORMAT,
  DISPLAY_DATETIME_FORMAT,
  DISPLAY_DAY_FORMAT,
  DISPLAY_WEEK_HEADER_FORMAT,
  DISPLAY_TIME_FORMAT,
} from "./constants";

import { DateOrString } from "./types";
import { DateTime, BroadcastTimeZone } from "@viacomcbs/broadcast-calendar";
export { DateTime } from "luxon";

const datePattern = /^(20\d{2})-([0]\d|1[0-2])-([0-2]\d|3[01])$/;
const dateTimePattern =
  /^(20\d{2})-([0]\d|1[0-2])-([0-2]\d|3[01]).(\d{1,2}):(\d{2}):(\d{2})(\.\d{3})?(Z)?$/;

export function getNow(): DateTime {
  return DateTime.local().setZone(BroadcastTimeZone);
}

export function getNowString(): string {
  return DateTime.local().setZone(BroadcastTimeZone).toSQLDate();
}

export function fileTimestamp(): string {
  return getNow().toFormat("yyyy-MM-dd-HH-mm-ss");
}

function parseUTCDate(dateStr: string): number | null {
  const matchedDate = datePattern.exec(dateStr);

  if (!matchedDate) {
    return null;
  }

  const aDateTime = DateTime.fromObject(
    {
      year: parseInt(matchedDate[1], 10),
      month: parseInt(matchedDate[2], 10),
      day: parseInt(matchedDate[3], 10),
    },
    { zone: "utc" }
  );

  return aDateTime.toMillis();
}

function parseUTCDateTime(dateTimeStr: string): number | null {
  const matchedDateTime = dateTimePattern.exec(dateTimeStr);

  if (!matchedDateTime) {
    return null;
  }

  return DateTime.fromObject(
    {
      year: parseInt(matchedDateTime[1], 10),
      month: parseInt(matchedDateTime[2], 10),
      day: parseInt(matchedDateTime[3], 10),
      hour: parseInt(matchedDateTime[4], 10),
      minute: parseInt(matchedDateTime[5], 10),
      second: parseInt(matchedDateTime[6], 10),
    },
    { zone: "utc" }
  ).toMillis();
}

export function createTZDateFromUTC(
  dateStr: string,
  timezone = BroadcastTimeZone
): DateTime | null {
  const ts = parseUTCDate(dateStr);
  if (!ts) {
    return null;
  }

  return DateTime.fromMillis(ts, { zone: timezone });
}

export function createTZDateTimeFromUTC(
  dateTimeStr: string,
  timezone = BroadcastTimeZone
): DateTime | null {
  const ts = parseUTCDateTime(dateTimeStr);
  if (!ts) {
    return null;
  }

  return DateTime.fromMillis(ts).setZone(timezone);
}

export const openAPDate = (date: DateTime): string =>
  date.toFormat("yyyy-MM-dd");
export const openAPDateTime = (date: DateTime): string =>
  date.toFormat("yyyy-MM-dd'T'HH:mm:ss");

export function getOpenAPDateFromDatabase(date: string): string {
  return openAPDate(DateTime.fromSQL(date, { zone: BroadcastTimeZone }));
}

export function getOpenAPDateTimeFromDatabase(date: string): string {
  return openAPDateTime(DateTime.fromSQL(date, { zone: BroadcastTimeZone }));
}

export const makeFormatter =
  (format: string) =>
  (dateConfig: DateOrString): string =>
    typeof dateConfig === "string"
      ? DateTime.fromSQL(dateConfig).setZone(BroadcastTimeZone).toFormat(format)
      : dateConfig.setZone(BroadcastTimeZone).toFormat(format);

// UI Date Helpers
export const formatDate = makeFormatter(DISPLAY_DATE_FORMAT);
export const formatDateTime = makeFormatter(DISPLAY_DATETIME_FORMAT);

export const formatDay = makeFormatter(DISPLAY_DAY_FORMAT);
export const formatTime = makeFormatter(DISPLAY_TIME_FORMAT);

export function formatWeekHeader(date: DateTime): string {
  return date.toFormat(DISPLAY_WEEK_HEADER_FORMAT);
}

export function parseNYDate(date?: string): DateTime | null {
  if (!date) {
    return null;
  }

  const d = datePattern.exec(date);
  if (!d) {
    return null;
  }

  return DateTime.fromISO(`${d[1]}-${d[2]}-${d[3]}`, {
    zone: BroadcastTimeZone,
  });
}

export function parseNYDateTime(date?: string): DateTime | null {
  if (!date) {
    return null;
  }

  const dt = dateTimePattern.exec(date);
  if (!dt) {
    return null;
  }

  return DateTime.fromISO(
    `${dt[1]}-${dt[2]}-${dt[3]}T${dt[4].padStart(2, "0")}:${dt[5]}:${dt[6]}`,
    { zone: BroadcastTimeZone }
  );
}

export function getIsoDateFromInput(date: DateOrString): string {
  return typeof date === "string"
    ? DateTime.fromISO(date, { zone: BroadcastTimeZone }).toISODate()
    : date.toISODate();
}

export function getIsoDateFromSql(date: DateOrString): string {
  return typeof date === "string"
    ? DateTime.fromSQL(date, { zone: BroadcastTimeZone }).toISODate()
    : date.toISODate();
}

export function getIsoDateTimeFromInput(date: DateOrString): string {
  return typeof date === "string"
    ? DateTime.fromISO(date, { zone: BroadcastTimeZone }).toISO()
    : date.toISO();
}

export function getSqlDateTimeFromIsoInput(date: DateOrString): string {
  return typeof date === "string"
    ? DateTime.fromISO(date, { zone: BroadcastTimeZone }).toSQL()
    : date.toSQL();
}

export function getSqlDateTimeFromSql(date: DateOrString): string {
  return typeof date === "string"
    ? DateTime.fromSQL(date, { zone: BroadcastTimeZone }).toSQL()
    : date.toSQL();
}

export function parseDateTime(value: DateOrString): DateTime {
  return typeof value === "string" ? DateTime.fromSQL(value) : value;
}

export function differenceInHours(
  leftDate: DateOrString,
  rightDate: DateOrString
): number {
  return parseDateTime(leftDate).diff(parseDateTime(rightDate), "hour").hours;
}

export function isDateTimeEqual(a: string, b: string): boolean {
  return DateTime.fromSQL(a).equals(DateTime.fromSQL(b));
}

export function isMonday(value: DateOrString): boolean {
  const date = parseDateTime(value);
  return date.weekday === 1;
}

export function getMondayIsoDate(from: DateOrString): string {
  const date = parseDateTime(from);
  return date.startOf("week").toISODate();
}

export function copyDate(from: DateOrString, to: string): string {
  const date = getIsoDateFromInput(from);
  return `${date}${to.slice(0, 10)}`;
}

export function differenceInWeeks(
  leftDate: DateOrString,
  rightDate: DateOrString
): number {
  return Math.floor(
    parseDateTime(leftDate).diff(parseDateTime(rightDate), "week").weeks
  );
}

export function addWeeks(date: DateOrString, weeks: number): DateTime {
  return parseDateTime(date).plus({ weeks });
}
