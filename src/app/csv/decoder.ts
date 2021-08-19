import { isNumber } from "util";
import { isLeft } from "fp-ts/lib/Either";
import type { Publisher, InventoryItemInput } from "../graphql";
import {
  CsvRowFromPublisher,
  CsvObject,
  validateItemsWeeklyRates,
  validateItemDates,
} from "./validator";
import { InventoryItemInputWihtIndex } from "./types";
import { Error } from "../store/types";
import { createNewInventoryItem } from "../../lib/InventoryItem/new";

import {
  RowErrors,
  addErrors,
  errorReporter,
  getErrorMessages,
  CSVError,
  Cell,
} from "./error";

export interface DecodedResult {
  errors: Error[];
  items: InventoryItemInput[];
}

interface DecodedGrouppedResult {
  errors: RowErrors;
  items: InventoryItemInputWihtIndex[];
}

export default function decodeCsv(
  data: unknown[],
  publisher: Publisher
): DecodedResult {
  const rowDecoder = CsvRowFromPublisher(publisher);

  const { errors, items } = data.reduce<DecodedGrouppedResult>(
    (acc, rowObject, index) => {
      const decodedObject = CsvObject.decode(rowObject);

      if (isLeft(decodedObject)) {
        acc.errors = addErrors(acc.errors, errorReporter(decodedObject.left));
        return acc;
      }

      const csvRowIndex = index + 2;
      const decodedRow = rowDecoder.decode({
        index: csvRowIndex,
        ...decodedObject.right,
      });

      if (isLeft(decodedRow)) {
        acc.errors = addErrors(acc.errors, errorReporter(decodedRow.left));
        return acc;
      }

      const row = decodedRow.right;

      const item = createNewInventoryItem({
        name: row.name,
        projectedImpressions: isNumber(row["projected impressions"])
          ? row["projected impressions"]
          : 0,
        startDatetime: row["start date time"],
        endDatetime: row["end date time"],
        validUntil: row["valid until"] || "",
        networkId: row["network"].id,
        units: isNumber(row.units) ? row.units : 0,
        rate: isNumber(row.rate) ? row.rate : 0,
        projectionsDemographics: row["projections demographics"],
        rateType: row["rate type"],
        publisherId: publisher.id,
      });

      const indexedItem = {
        index: csvRowIndex,
        ...item,
      };

      const datesErrors = validateItemDates(indexedItem);
      if (datesErrors) {
        acc.errors = addErrors(acc.errors, datesErrors);
        return acc;
      }

      acc.items.push(indexedItem);
      return acc;
    },
    { errors: new Map<CSVError, Cell[]>(), items: [] }
  );

  if (errors.size === 0) {
    const ratesErrors = validateItemsWeeklyRates(items);
    ratesErrors && addErrors(errors, ratesErrors);
  }

  return {
    errors: getErrorMessages(errors).map((message) => ({
      message,
    })),
    items: items.map(({ index, ...item }) => item),
  };
}
