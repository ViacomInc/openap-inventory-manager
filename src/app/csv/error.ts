import { Errors, Context } from "io-ts";
import { MAX_ITEM_DURATION_HOURS } from "../../lib/constants";

export enum CSVError {
  InvalidRowColumns,
  InvalidNumber,
  InvalidString,
  InvalidDate,
  InvalidDateTime,
  InvalidRateType,
  InvalidDemographics,
  InvalidNetwork,
  InvalidStartDate,
  InvalidDuration,
  InvalidValidUntil,
  InvalidWeeklyRate,
}

type Columns = Record<string, number[]>;
export type Cell = [string, number?];
export type RowErrors = Map<CSVError, Cell[]>;
type RowErrorFormatter = (cells?: Cell[]) => string[];

function formatCellsList(cells?: Cell[]): string[] {
  if (!cells || !cells.length) {
    return [""];
  }

  if (cells.length === 1) {
    return [cells.map((c) => c.join(":")).join(", ")];
  }

  const columns = cells.reduce<Columns>((columns, [column, row]) => {
    if (!columns[column]) {
      columns[column] = [];
    }

    if (row !== undefined) {
      columns[column].push(row);
    }

    return columns;
  }, {});

  if (Object.keys(columns).length >= cells.length) {
    return [cells.map((c) => c.join(":")).join(", ")];
  }

  return Object.entries(columns).map(([c, r]) =>
    r.length <= 1 ? `${c}:${r[0]}` : `Column "${c}" Rows: ${r.join(", ")}`
  );
}

export const ErrorMessages: Record<CSVError, RowErrorFormatter> = {
  [CSVError.InvalidRowColumns]: () => [
    `Invalid row columns. Please use the provided template`,
  ],
  [CSVError.InvalidNumber]: (cells) =>
    formatCellsList(cells).map((s) => `Invalid number in ${s}`),
  [CSVError.InvalidString]: (cells) =>
    formatCellsList(cells).map((s) => `Invalid string in ${s}`),
  [CSVError.InvalidDate]: (cells) =>
    formatCellsList(cells).map((s) => `Invalid date in ${s}`),
  [CSVError.InvalidDateTime]: (cells) =>
    formatCellsList(cells).map((s) => `Invalid datetime in ${s}`),
  [CSVError.InvalidRateType]: (cells) =>
    formatCellsList(cells).map(
      (s) =>
        `Invalid RateType in ${s}. The allowed values are 'SCATTER' or 'UPFRONT'.`
    ),
  [CSVError.InvalidDemographics]: (cells) =>
    formatCellsList(cells).map(
      (s) => `Invalid Demographics in ${s}. Allowed value example 'P2+'`
    ),
  [CSVError.InvalidNetwork]: (cells) =>
    formatCellsList(cells).map((s) => `Invalid Network in ${s}`),
  [CSVError.InvalidStartDate]: (cells) =>
    formatCellsList(cells).map(
      (s) =>
        `Start date has to be today or later and later than Valid Until date in ${s}`
    ),
  [CSVError.InvalidDuration]: (cells) =>
    formatCellsList(cells).map(
      (s) =>
        `Item duration has to be less than ${MAX_ITEM_DURATION_HOURS} hours in ${s}`
    ),
  [CSVError.InvalidValidUntil]: (cells) =>
    formatCellsList(cells).map(
      (s) =>
        `Valid until date has to be earlier or the same as start date in ${s}`
    ),
  [CSVError.InvalidWeeklyRate]: (cells) =>
    formatCellsList(cells).map(
      (s) => `Weekly rate has to be the same for Selling title in ${s}`
    ),
};

function getCellRow(c: Context): number | null {
  if (typeof c[0].actual === "object" && c[0].actual !== null) {
    const actual = c[0].actual as { index: number };
    return actual.index;
  }
  return null;
}

function getCell(c: Context): Cell {
  const row = getCellRow(c);
  if (row) {
    return [c[1].key.toUpperCase(), row];
  }

  return [c[1].key.toUpperCase()];
}

export function errorReporter(errors: Errors): RowErrors {
  return errors.reduce<RowErrors>((grouppedErrors, { value, context }) => {
    const errorCode = value as CSVError;
    if (!grouppedErrors.has(errorCode)) {
      grouppedErrors.set(errorCode, []);
    }

    grouppedErrors.get(errorCode)?.push(getCell(context));
    return grouppedErrors;
  }, new Map());
}

export function addErrors(e1: RowErrors, e2: RowErrors): RowErrors {
  e2.forEach((cells, error) => {
    if (e1.has(error)) {
      e1.get(error)?.push(...cells);
      return;
    }

    e1.set(error, cells);
  });

  return e1;
}

export function getErrorMessages(errors: RowErrors): string[] {
  return Array.from(errors.entries()).flatMap<string>(([error, cells]) => {
    const code = (error as unknown) as CSVError;
    return ErrorMessages[code](cells);
  });
}
