import { DateTime, DateObjectUnits, DateTimeJSOptions } from "luxon";
import { getBroadcastWeekKeyRange } from "@viacomcbs/broadcast-calendar";

// pure magic, matches ISO and SQL date time strings with and without time zone
const dateTimePattern =
  /^(\d{4})-([01]\d)-([0-3]\d).([0-2]?\d):([0-5]\d):([0-5]\d)(\.(\d+))?\s?([+-][0-2]\d:[0-5]\d|[+-][0-2]\d|Z)?$/;

export function parseDateTimeString(
  date?: string,
  timezone?: string
): DateTime | null {
  if (!date) {
    return null;
  }

  const dt = dateTimePattern.exec(date);
  if (!dt) {
    return null;
  }

  const dateObj: DateObjectUnits = {
    year: parseInt(dt[1], 10),
    month: parseInt(dt[2], 10),
    day: parseInt(dt[3], 10),
    hour: parseInt(dt[4], 10),
    minute: parseInt(dt[5], 10),
    second: parseInt(dt[6], 10),
  };

  if (dt[8]) {
    dateObj.millisecond = parseInt(dt[8], 10);
  }

  const opts: DateTimeJSOptions = {};
  if (timezone) {
    opts.zone = timezone;
  } else if (dt[9]) {
    opts.zone = `utc${dt[9]}`;
  }

  return DateTime.fromObject(dateObj, opts);
}

const datePattern = /^(20\d{2})-([0]\d|1[0-2])-([0-2]\d|3[01])$/;
export function parseDateString(
  date?: string,
  timezone?: string
): DateTime | null {
  if (!date) {
    return null;
  }

  const d = datePattern.exec(date);
  if (!d) {
    return null;
  }

  const opts: DateTimeJSOptions = {};
  if (timezone) {
    opts.zone = timezone;
  }
  return DateTime.fromISO(`${d[1]}-${d[2]}-${d[3]}`, opts);
}

const weekKeyPattern = /^Y(\d{4}) Q([1-4]) W(\d{1,2})$/;
export function parseWeekKeyString(date?: string): DateTime | null {
  if (!date) {
    return null;
  }

  const d = weekKeyPattern.exec(date);
  if (!d) {
    return null;
  }
  const weekKey = parseInt(d[1], 10) * 100 + parseInt(d[3], 10);
  const { start } = getBroadcastWeekKeyRange(weekKey);
  return start;
}
