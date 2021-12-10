import React, { useState, useEffect, useCallback, useMemo } from "react";
import classnames from "classnames";
import { DateTime, Info } from "luxon";

import Styles from "./Calendar.module.css";
import { getBroadcastQuarterWeek } from "@viacomcbs/broadcast-calendar";

const DISPLAY_CALENDAR_DAY_TITLE = "MMMM yyyy";
const DISPLAY_CALENDAR_MONTH_TITLE = "yyyy";

export enum CalendarView {
  Day,
  Month,
  Year,
}

export enum CalendarWeeks {
  ISO,
  Broadcast,
}

export enum CalendarSelect {
  Day,
  Week,
}

function NextCalendarView(view: CalendarView): CalendarView {
  switch (view) {
    case CalendarView.Day:
      return CalendarView.Month;

    case CalendarView.Month:
      return CalendarView.Year;

    case CalendarView.Year:
      return CalendarView.Day;

    default:
      return CalendarView.Day;
  }
}

const CalendarViews = {
  [CalendarView.Day]: CalendarDays,
  [CalendarView.Month]: CalendarMonths,
  [CalendarView.Year]: CalendarYears,
};

interface CalendarProps {
  value?: DateTime;
  calendarClassName?: string;
  showWeeks?: CalendarWeeks;
  onChange: (date: DateTime, view: CalendarView) => void;
  select: CalendarSelect;
}

export default function Calendar({
  value,
  calendarClassName,
  showWeeks,
  onChange,
  select,
}: CalendarProps): JSX.Element {
  const [view, setView] = useState<CalendarView>(CalendarView.Day);
  const [internalValue, setInternalValue] = useState<DateTime>(
    value || DateTime.utc()
  );
  const [displayValue, setDisplayValue] = useState<DateTime>(
    value || DateTime.utc()
  );
  const title = useTitle({ view, displayValue });

  useEffect(() => {
    if (!value) {
      return;
    }

    setInternalValue(value);
    setDisplayValue(value);
  }, [value && value.toMillis()]);

  const selectValue = useCallback(
    (year?: number, month?: number, day?: number) => {
      let newValue = displayValue;
      if (year !== undefined) {
        newValue = displayValue.set({ year });
      }

      if (month !== undefined) {
        newValue = displayValue.set({ month });
      }

      if (day !== undefined) {
        newValue = displayValue.set({ day });
      }

      setDisplayValue(newValue);
      setInternalValue(newValue);

      if (view === CalendarView.Year) {
        setView(CalendarView.Month);
      } else {
        setView(CalendarView.Day);
        if (internalValue !== newValue) {
          onChange(newValue, view);
        }
      }
    },
    [displayValue.toMillis(), view, onChange]
  );

  const clickHandler = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!(e.target instanceof Element)) {
        return;
      }
      e.stopPropagation();
      if (e.target.tagName !== "A") {
        return;
      }

      e.preventDefault();
      const parts = (e.target as HTMLAnchorElement).hash.split("/");
      switch (parts[1]) {
        case "next-view":
          setView(NextCalendarView(view));
          break;

        case "back":
          setDisplayValue(getBack(displayValue, view));
          break;

        case "forward":
          setDisplayValue(getForward(displayValue, view));
          break;

        case "select":
          selectValue(...parts.slice(2).map(parseDecimal));
          break;
      }
    },
    [displayValue.valueOf(), view, selectValue]
  );

  return (
    <div
      className={classnames(Styles.Calendar, calendarClassName)}
      onClick={clickHandler}
    >
      <div className={Styles.CalendarHeader}>
        <a className={Styles.CalendarBack} href="#/back" title="Back">
          {"<"}
        </a>
        <a className={Styles.CalendarMode} href="#/next-view">
          {title}
        </a>
        <a className={Styles.CalendarForward} href="#/forward" title="Forward">
          {">"}
        </a>
      </div>
      <div className={Styles.CalendarDisplay}>
        {showWeeks !== undefined && view === CalendarView.Day && (
          <CalendarQuarterWeeks weeks={showWeeks} displayValue={displayValue} />
        )}
        {CalendarViews[view]({
          value: internalValue,
          displayValue,
          select,
        })}
      </div>
    </div>
  );
}

interface CalendarWeeksProps {
  weeks: CalendarWeeks;
  displayValue: DateTime;
}

function CalendarQuarterWeeks({
  displayValue,
  weeks,
}: CalendarWeeksProps): JSX.Element {
  const quarterWeeks = useMemo(
    () => getQuarterWeeks(displayValue, weeks),
    [displayValue, weeks]
  );

  return (
    <ul className={Styles.CalendarWeeks}>
      <li></li>
      {quarterWeeks.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>
  );
}

interface ViewProps {
  value: DateTime;
  displayValue: DateTime;
  select: CalendarSelect;
}

function CalendarDays({ value, displayValue, select }: ViewProps) {
  const firstDay = displayValue.startOf("month").weekday;
  const days = displayValue.daysInMonth;

  const elDays = [];
  for (let day = 1; day <= 7; day++) {
    elDays.push(
      <li
        key={day}
        className={classnames(Styles.CalendarWeekDays, {
          [Styles.CalendarWeekend]: isWeekend(day),
        })}
      >
        {Info.weekdays("short")[day - 1]}
      </li>
    );
  }

  const { year, month } = displayValue;
  const valueStartOfWeek = value.startOf("week");
  let day = 1;
  for (let i = 0; i < 9; i++) {
    for (let weekday = 1; weekday <= 7; weekday++) {
      if (day <= days && ((weekday >= firstDay && i === 0) || i > 0)) {
        const weekend = isWeekend(weekday);
        elDays.push(
          <li
            key={`${year}${month}${day}`}
            className={classnames({
              [Styles.CalendarWeekend]: weekend,
              [Styles.CalendarSelected]:
                select === CalendarSelect.Day
                  ? isDayActive(value, displayValue, day)
                  : isWeekActive(valueStartOfWeek, displayValue, day),
            })}
          >
            <a href={`#/select/${year}/${month}/${day}`}>{day}</a>
          </li>
        );
        day++;
      } else if (day > days) {
        break;
      } else {
        elDays.push(<li key={`${i}${weekday}`}></li>);
      }
    }

    if (day > days) {
      break;
    }
  }

  return <ul className={Styles.CalendarViewDays}>{elDays}</ul>;
}

function CalendarMonths({ value, displayValue }: ViewProps) {
  const year = displayValue.year;
  const elMonths = [];

  for (let month = 1; month <= 12; month++) {
    elMonths.push([
      <li
        key={month}
        className={classnames({
          [Styles.CalendarSelected]: isMonthActive(value, displayValue, month),
        })}
      >
        <a href={`#/select/${year}/${month}`}>
          {displayValue.set({ month }).toFormat("MMM")}
        </a>
      </li>,
    ]);
  }

  return <ul className={Styles.CalendarViewMonths}>{elMonths}</ul>;
}

function CalendarYears({ value, displayValue }: ViewProps) {
  let year = getStartYear(displayValue.year);
  const maxYear = year + SHOW_YEARS;
  const elYears = [];

  for (; year < maxYear; year++) {
    elYears.push(
      <li
        key={year}
        className={classnames({
          [Styles.CalendarSelected]: isYearActive(value, year),
        })}
      >
        <a href={`#/select/${year}`}>{year}</a>
      </li>
    );
  }

  return <ul className={Styles.CalendarViewYears}>{elYears}</ul>;
}

interface UseTitle {
  view: CalendarView;
  displayValue: DateTime;
}

function useTitle({ view, displayValue }: UseTitle) {
  const [title, setTitle] = useState<string>("");
  useEffect(() => {
    switch (view) {
      case CalendarView.Day: {
        setTitle(displayValue.toFormat(DISPLAY_CALENDAR_DAY_TITLE));
        break;
      }
      case CalendarView.Month: {
        setTitle(displayValue.toFormat(DISPLAY_CALENDAR_MONTH_TITLE));
        break;
      }
      case CalendarView.Year: {
        const year = getStartYear(displayValue.year);
        setTitle(`${year} – ${year + SHOW_YEARS - 1}`);
        break;
      }
    }
  }, [view, displayValue]);
  return title;
}

function isDayActive(
  valueDate: DateTime,
  viewDate: DateTime,
  day: number
): boolean {
  return (
    viewDate.year === valueDate.year &&
    viewDate.month === valueDate.month &&
    day === valueDate.day
  );
}

function isWeekActive(
  valueStartOfWeek: DateTime,
  viewDate: DateTime,
  day: number
): boolean {
  const viewStartOfWeek = viewDate.set({ day }).startOf("week");

  const yearActive = viewStartOfWeek.year === valueStartOfWeek.year;
  const monthActive = viewStartOfWeek.month === valueStartOfWeek.month;
  if (!yearActive || !monthActive) {
    return false;
  }

  return viewStartOfWeek.day === valueStartOfWeek.day;
}

function isMonthActive(valueDate: DateTime, viewDate: DateTime, month: number) {
  return viewDate.year === valueDate.year && month === valueDate.month;
}

function isYearActive(valueDate: DateTime, year: number) {
  return year === valueDate.year;
}

const SHOW_YEARS = 25;
const MIN_YEAR = Math.floor(new Date().getUTCFullYear() - (SHOW_YEARS - 1) / 2);

function getStartYear(year: number) {
  if (year === MIN_YEAR) {
    return MIN_YEAR;
  }

  if (year > MIN_YEAR && year < MIN_YEAR + SHOW_YEARS) {
    return MIN_YEAR;
  }

  return MIN_YEAR + Math.floor((year - MIN_YEAR) / SHOW_YEARS) * SHOW_YEARS;
}

function parseDecimal(str: string): number {
  return parseInt(str, 10);
}

function getBack(value: DateTime, view: CalendarView): DateTime {
  if (view === CalendarView.Day) {
    return value.minus({ months: 1 });
  }

  if (view === CalendarView.Month) {
    return value.minus({ years: 1 });
  }

  if (view === CalendarView.Year) {
    return value.minus({ years: SHOW_YEARS });
  }

  return value;
}

function getForward(value: DateTime, view: CalendarView): DateTime {
  if (view === CalendarView.Day) {
    return value.plus({ months: 1 });
  }

  if (view === CalendarView.Month) {
    return value.plus({ years: 1 });
  }

  if (view === CalendarView.Year) {
    return value.plus({ years: SHOW_YEARS });
  }

  return value;
}

function isWeekend(day: number): boolean {
  return day === 6 || day === 7;
}

function getQuarterWeeks(date: DateTime, weeks: CalendarWeeks): string[] {
  let weekDate = date.startOf("month");
  const yearStart = date.startOf("year");
  const end = date.endOf("month");
  const res: string[] = [];
  const getQW = weeks === CalendarWeeks.Broadcast ? getBroadcastQW : getISOQW;

  while (
    (weekDate.year === end.year &&
      (weekDate.weekNumber <= end.weekNumber || end.weekNumber === 1)) ||
    (weekDate.year - end.year === 1 &&
      weekDate.weekNumber === 1 &&
      end.weekNumber === 1) ||
    weekDate.equals(yearStart)
  ) {
    res.push(getQW(weekDate));
    weekDate = weekDate.plus({ weeks: 1 });
  }

  return res;
}

function getISOQW(date: DateTime): string {
  return date.toFormat("'Q'q 'W'W");
}

function getBroadcastQW(date: DateTime): string {
  const [q, w] = getBroadcastQuarterWeek(date);
  return `Q${q} W${w}`;
}
