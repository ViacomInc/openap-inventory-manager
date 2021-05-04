import { DateTime } from "luxon";
import { isRight, isLeft } from "fp-ts/lib/Either";
import {
  CsvRowFromPublisher,
  validateItemsWeeklyRates,
} from "../../src/app/csv/validator";
import { NetworkFromString } from "../../src/app/csv/types";
import { errorReporter, getErrorMessages } from "../../src/app/csv/error";
import { OAPPublisher } from "../../src/lib/openap/types";
import { newYorkTimeZone } from "../../src/lib/dateHelpers";
import { inventoryItemFactory } from "../factories";

const notAString = 1;
const notANumber = "not a number";
const notARateType = "something";
const notAIsoDate = "not a iso date";
const notANetwork = "AAA";

const publisher: OAPPublisher = {
  id: 1,
  name: "Viacom",
  networks: [
    {
      id: 1,
      name: "BET",
    },
    {
      id: 2,
      name: "CMDY",
    },
    {
      id: 3,
      name: "MTV",
    },
  ],
};

const defaultCsvRow = {
  index: 1,
  name: "Row name",
  "start date time": "2020-01-01 14:00:00",
  "end date time": "2020-02-01 14:00:00",
  network: "MTV",
  "rate type": "SCATTER",
  rate: "1",
  units: "1",
  "valid until": "2021-01-01",
  "projected impressions": "100",
};

const noValidUntilCsvRow = {
  ...defaultCsvRow,
  "valid until": "",
};

const incompleteCsvRow = {
  ...defaultCsvRow,
  "rate type": "",
  rate: "",
  units: "",
};

const invalidCsvRow = {
  ...defaultCsvRow,
  name: notAString,
  "start date time": notAIsoDate,
  "end date time": notAIsoDate,
  network: notANetwork,
  "rate type": notARateType,
  rate: notANumber,
  units: notANumber,
  "valid until": notAIsoDate,
  "projected impressions": notAString,
};

const emptyCsvRow = {
  index: 1,
};

describe("Csv Row", () => {
  test("It decodes a complete row correctly", () => {
    const decoded = CsvRowFromPublisher(publisher).decode(defaultCsvRow);
    expect(isRight(decoded)).toEqual(true);
  });
  test("It decodes a row without validUntil correctly", () => {
    const decoded = CsvRowFromPublisher(publisher).decode(noValidUntilCsvRow);
    expect(isRight(decoded)).toEqual(true);
  });
  test("It decodes an incomplete row correctly", () => {
    const decoded = CsvRowFromPublisher(publisher).decode(incompleteCsvRow);
    expect(isRight(decoded)).toEqual(true);
    if (isRight(decoded)) {
      const { index, name, network, rate, units } = decoded.right;

      expect(index).toEqual(1);
      expect(name).toEqual("Row name");
      expect(network).toMatchObject({ id: 3, name: "MTV" });
      expect(rate).toEqual("");
      expect(units).toEqual("");
      expect(decoded.right["projections demographics"]).toBeUndefined();
      expect(decoded.right["projected impressions"]).toEqual(100);
      expect(
        decoded.right["start date time"].equals(
          DateTime.fromISO("2020-01-01T19:00:00.000Z", {
            zone: newYorkTimeZone,
          })
        )
      ).toBeTruthy();
      expect(
        decoded.right["end date time"].equals(
          DateTime.fromISO("2020-02-01T19:00:00.000Z", {
            zone: newYorkTimeZone,
          })
        )
      ).toBeTruthy();

      if (decoded.right["valid until"]) {
        expect(
          decoded.right["valid until"].equals(
            DateTime.fromISO("2021-01-01", {
              zone: newYorkTimeZone,
            })
          )
        );
      }
    }
  });
  test("It fails on invalid values", () => {
    const decoded = CsvRowFromPublisher(publisher).decode(invalidCsvRow);
    if (isLeft(decoded)) {
      const errors = getErrorMessages(errorReporter(decoded.left));
      expect(errors.length).toEqual(5);
    } else {
      fail("Should return validation errors");
    }
  });
  test("Error messages for invalid values", () => {
    const decoded = CsvRowFromPublisher(publisher).decode(invalidCsvRow);

    if (isRight(decoded)) {
      fail("Should return validation errors");
    }

    const errors = getErrorMessages(errorReporter(decoded.left));
    expect(errors).toEqual([
      "Invalid string in NAME:1",
      "Invalid date in START DATE TIME:1, END DATE TIME:1, VALID UNTIL:1",
      "Invalid Network in NETWORK:1",
      "Invalid RateType in RATE TYPE:1. The allowed values are 'SCATTER' or 'UPFRONT'.",
      "Invalid number in RATE:1, UNITS:1, PROJECTED IMPRESSIONS:1",
    ]);
  });
  test("Error messages for undefined values", () => {
    const decoded = CsvRowFromPublisher(publisher).decode(emptyCsvRow);
    if (isRight(decoded)) {
      fail("Should return validation errors");
    }
    const errors = getErrorMessages(errorReporter(decoded.left));
    expect(errors).toEqual([
      "Invalid string in NAME:1",
      "Invalid date in START DATE TIME:1, END DATE TIME:1",
      "Invalid Network in NETWORK:1",
      "Invalid number in PROJECTED IMPRESSIONS:1",
    ]);
  });
});

describe("NetworkFromString", () => {
  test("Can get network from string from publisher with networks", () => {
    const networkFromString = NetworkFromString(publisher.networks);
    const decoded = networkFromString.decode("CMDY");
    expect(isRight(decoded)).toBe(true);
    if (isRight(decoded)) {
      expect(decoded.right).toMatchObject({ id: 2, name: "CMDY" });
    }
  });
  test("Can get network from string from publisher with networks", () => {
    const networkFromString = NetworkFromString(publisher.networks);
    const decoded = networkFromString.decode("AAA");
    expect(isLeft(decoded)).toBe(true);
  });
  test("Can't get network from string from publisher with 0 networks", () => {
    const networkFromString = NetworkFromString([]);
    const decoded = networkFromString.decode("BET");
    expect(isLeft(decoded)).toBe(true);
  });
});

describe("Weekly Rates Validation", () => {
  test("Weekly rates error messages", () => {
    const items = inventoryItemFactory.buildList(2, {
      name: "TEST",
      networkId: 1,
    });

    const errors = validateItemsWeeklyRates(
      items.map((i, index) => ({
        ...i,
        index,
        rate: index,
      }))
    );

    if (!errors) {
      fail("Where are the errors?");
      return;
    }
    expect(getErrorMessages(errors)).toEqual([
      'Weekly rate has to be the same for Selling title in Column "RATE" Rows: 0, 1',
    ]);
  });
});
