import { UnknownRecord, TypeC, Type, type, string, number } from "io-ts";
import { getBroadcastWeekStart, parseDateFromSQL } from "broadcast-calendar";

import { Publisher, Network } from "../graphql";

import {
  isFutureItem,
  isLessThan,
  isValidUntilBeforeStart,
} from "../../lib/InventoryItem/helpers";
import { MAX_ITEM_DURATION_HOURS } from "../../lib/constants";
import { CSVError, RowErrors, Cell } from "./error";

import {
  withError,
  NumberFromString,
  NetworkFromString,
  OptionalNumberFromString,
  OptionalRateType,
  OptionalDemographics,
  OptionalDateFromISOString,
  DateTimeFromISOString,
  InventoryItemInputWihtIndex,
} from "./types";

export const CsvObject = withError(UnknownRecord, CSVError.InvalidRowColumns);

const NumberFromStringWithError = withError(
  NumberFromString,
  CSVError.InvalidNumber
);
const OptionalNumberFromStringWithError = withError(
  OptionalNumberFromString,
  CSVError.InvalidNumber
);
const StringWithError = withError(string, CSVError.InvalidString);
const OptionalRateTypeWithError = withError(
  OptionalRateType,
  CSVError.InvalidRateType
);

const OptionalDemographicsWithError = withError(
  OptionalDemographics,
  CSVError.InvalidDemographics
);

const OptionalDateFromISOStringWithError = withError(
  OptionalDateFromISOString,
  CSVError.InvalidDate
);

const DateTimeFromISOStringWithError = withError(
  DateTimeFromISOString,
  CSVError.InvalidDate
);

type CsvRowInventoryItem = TypeC<{
  index: typeof number;
  name: typeof string;
  "start date time": typeof DateTimeFromISOStringWithError;
  "end date time": typeof DateTimeFromISOStringWithError;
  network: Type<Network, string, unknown>;
  "rate type": typeof OptionalRateTypeWithError;
  rate: typeof OptionalNumberFromStringWithError;
  units: typeof OptionalNumberFromStringWithError;
  "valid until": typeof OptionalDateFromISOStringWithError;
  "projections demographics": typeof OptionalDemographicsWithError;
  "projected impressions": typeof NumberFromStringWithError;
}>;

export const CsvRowFromPublisher = (
  publisher: Publisher
): CsvRowInventoryItem => {
  const NetworkFromStringWithError = withError(
    NetworkFromString(publisher.networks),
    CSVError.InvalidNetwork
  );

  return type({
    index: number,
    name: StringWithError,
    "start date time": DateTimeFromISOStringWithError,
    "end date time": DateTimeFromISOStringWithError,
    network: NetworkFromStringWithError,
    "rate type": OptionalRateTypeWithError,
    rate: OptionalNumberFromStringWithError,
    units: OptionalNumberFromStringWithError,
    "valid until": OptionalDateFromISOStringWithError,
    "projections demographics": OptionalDemographicsWithError,
    "projected impressions": NumberFromStringWithError,
  });
};

export function validateItemDates(
  item: InventoryItemInputWihtIndex
): undefined | RowErrors {
  const errors = new Map<CSVError, Cell[]>();

  if (!isFutureItem(item)) {
    errors.set(CSVError.InvalidStartDate, [["START DATE TIME", item.index]]);
  }

  if (!isLessThan(item, MAX_ITEM_DURATION_HOURS)) {
    errors.set(CSVError.InvalidDuration, [["END DATE TIME", item.index]]);
  }

  if (!isValidUntilBeforeStart(item)) {
    errors.set(CSVError.InvalidValidUntil, [["VALID UNTIL", item.index]]);
  }

  if (!errors.size) {
    return undefined;
  }

  return errors;
}

type WeeklyRatesIndex = Record<
  string,
  {
    indexes: number[];
    rates: Set<number>;
  }
>;

export function validateItemsWeeklyRates(
  items: InventoryItemInputWihtIndex[]
): undefined | RowErrors {
  // collect
  const weeklyRates = items.reduce<WeeklyRatesIndex>(
    (weeks, { startDatetime, index, rate, name, networkId }) => {
      const weekStartDate = getBroadcastWeekStart(
        parseDateFromSQL(startDatetime)
      );
      const key = `${weekStartDate.toISODate()}:${networkId}:${name}`;

      if (!weeks[key]) {
        weeks[key] = { indexes: [], rates: new Set<number>() };
      }

      weeks[key].indexes.push(index);
      weeks[key].rates.add(rate);

      return weeks;
    },
    {}
  );

  // check
  const errors = Object.entries(weeklyRates).reduce<Cell[]>(
    (errors, [_weekStart, index]) => {
      if (index.rates.size > 1) {
        index.indexes.forEach((index) => errors.push(["RATE", index]));
      }

      return errors;
    },
    []
  );

  // return
  if (!errors.length) {
    return undefined;
  }

  return new Map<CSVError, Cell[]>([[CSVError.InvalidWeeklyRate, errors]]);
}
