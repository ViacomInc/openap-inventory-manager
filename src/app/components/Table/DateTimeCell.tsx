import React from "react";
import { DateTime } from "luxon";
import {
  getBroadcastYearQuarter,
  getBroadcastQuarterWeek,
  getBroadcastWeekKey,
  getBroadcastWeekKeyRange,
} from "@viacomcbs/broadcast-calendar";

import {
  parseDateString,
  parseDateTimeString,
  parseWeekKeyString,
} from "./dateTimeParsers";

import {
  InputDateTime,
  InputDateTimeProps,
  CalendarWeeks,
  CalendarSelect,
} from "../ui";
import {
  RowData,
  CellRendererProps,
  EditableCellOptions,
  AtLeastOneProperty,
} from "./types";
import { shouldEditCell } from "./helpers";

import Styles from "./Cell.module.css";

export const DISPLAY_DATE_FORMAT = "yyyy-MM-dd";
export const DISPLAY_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
export const DISPLAY_WEEK_HEADER_FORMAT = "MMM d";
export const DISPLAY_DAY_FORMAT = "EEE, MMM d";
export const DISPLAY_TIME_FORMAT = "h:mm a";

const makeFormatter =
  (format: string) =>
  (date?: DateTime | null): string => {
    if (!date) {
      return "";
    }
    return date.toFormat(format);
  };

export enum SelectDateTimeValue {
  Date,
  DateTime,
  BroadcastWeekKey,
}

type SelectOption = Pick<
  InputDateTimeProps,
  "format" | "parse" | "showWeeks" | "timezone"
> & {
  getDateFromValue: (value: unknown, timezone?: string) => DateTime | null;
  getValueFromDate: (date: DateTime) => string | number | DateTime;
  calendarSelect: CalendarSelect;
};

interface Options<R extends RowData, N extends keyof R>
  extends EditableCellOptions<R, N> {
  select?: SelectDateTimeValue | SelectOption;
  showWeeks?: CalendarWeeks;
  timezone?: string;
}

type SelectOptions = Record<SelectDateTimeValue, SelectOption>;

const selectOptions: SelectOptions = {
  [SelectDateTimeValue.Date]: {
    calendarSelect: CalendarSelect.Day,
    format: makeFormatter(DISPLAY_DATE_FORMAT),
    parse: parseDateString,
    getValueFromDate: (date) => date.toISODate(),
    getDateFromValue: (value, timezone) => {
      if (!value) {
        return null;
      }

      switch (typeof value) {
        case "string": {
          return parseDateString(value, timezone);
        }
        case "number": {
          return DateTime.fromMillis(value, { zone: timezone });
        }
        default: {
          throw new Error(
            `Unsupported input value ${typeof value} cannot be converted to DateTime`
          );
        }
      }
    },
  },
  [SelectDateTimeValue.DateTime]: {
    calendarSelect: CalendarSelect.Day,
    format: makeFormatter(DISPLAY_DATETIME_FORMAT),
    parse: parseDateTimeString,
    getValueFromDate: (date) => date.toSQL(),
    getDateFromValue: (value, timezone) => {
      if (!value) {
        return null;
      }

      switch (typeof value) {
        case "string": {
          return parseDateTimeString(value, timezone);
        }
        case "number": {
          return DateTime.fromMillis(value, { zone: timezone });
        }
        default: {
          throw new Error(
            `Unsupported input value ${typeof value} cannot be converted to DateTime`
          );
        }
      }
    },
  },
  [SelectDateTimeValue.BroadcastWeekKey]: {
    calendarSelect: CalendarSelect.Week,
    format: (date) => {
      if (!date) {
        return "";
      }

      const { year, quarter } = getBroadcastYearQuarter(date);
      const [, week] = getBroadcastQuarterWeek(date);
      return `Y${year} Q${quarter} W${week}`;
    },
    parse: parseWeekKeyString,
    getValueFromDate: getBroadcastWeekKey,
    getDateFromValue: (value) => {
      if (!value) {
        return null;
      }

      switch (typeof value) {
        case "string": {
          return null;
        }
        case "number": {
          return getBroadcastWeekKeyRange(value).start;
        }
        default: {
          throw new Error(
            `Unsupported input value ${typeof value} cannot be converted to WeekKey`
          );
        }
      }
    },
  },
};

export default function createDateTimeCell<
  R extends RowData,
  N extends keyof R
>({
  name,
  select = SelectDateTimeValue.DateTime,
  disabled = false,
  canEdit,
  showWeeks,
  timezone,
}: Options<R, N>) {
  const { format, parse, getDateFromValue, getValueFromDate, calendarSelect } =
    typeof select === "number" ? selectOptions[select] : select;

  return function DateTimeCell({
    row,
    cell,
    isEditRowLoading,
  }: CellRendererProps<R, R[N]>): R[N] | JSX.Element | null | string {
    const date = getDateFromValue(cell.value);

    if (!shouldEditCell(cell, canEdit)) {
      return date === null ? null : format(date);
    }

    const onChange = (date: DateTime | null) => {
      if (!date) {
        return;
      }

      row.updateEdit({
        [name]: getValueFromDate(date),
      } as AtLeastOneProperty<R>);
    };

    return (
      <InputDateTime
        value={date}
        onChange={onChange}
        format={format}
        parse={parse}
        containerClassName={Styles.Container}
        inputClassName={Styles.Input}
        disabled={disabled || isEditRowLoading}
        showWeeks={showWeeks}
        select={calendarSelect}
        timezone={timezone}
      />
    );
  };
}
