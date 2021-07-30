import { InventoryItem } from "../../src/graphql/__generated__/types";
import {
  collectRatesDates,
  collectBroadcastDates,
  createOAPStartEndDatetime,
} from "../../src/lib/openap/helpers";
import { isMonday } from "../../src/lib/dateHelpers";
import items from "../fixtures/inventoryItems.json";

describe("openap helpers", () => {
  test("Gets rates dates and makes sure they are all mondays", () => {
    const ratesDates = (items as InventoryItem[]).reduce(
      collectRatesDates,
      new Set<string>()
    );
    expect(ratesDates.size).toBe(14);
    ratesDates.forEach((date) => {
      expect(isMonday(date)).toBe(true);
    });
  });

  test("Gets broadcast dates", () => {
    const ratesDates = (items as InventoryItem[]).reduce(
      collectBroadcastDates,
      new Set<string>()
    );
    expect(ratesDates.size).toBe(26);
  });

  test("Make Open AP version of broadcast dates with start and end datetimes are on the same day", () => {
    const { startDatetime, endDatetime } = createOAPStartEndDatetime({
      startDatetime: "2021-08-24 22:00:00-04",
      endDatetime: "2021-08-25 01:59:00-04",
    });

    expect(startDatetime).toBe("2021-08-24T22:00:00");
    expect(endDatetime).toBe("2021-08-24T01:59:00");
  });

  test("Make Open AP version of broadcast dates with start and end datetimes are on the same day", () => {
    const { startDatetime, endDatetime } = createOAPStartEndDatetime({
      startDatetime: "2021-08-24 20:00:00-04",
      endDatetime: "2021-08-24 23:59:00-04",
    });

    expect(startDatetime).toBe("2021-08-24T20:00:00");
    expect(endDatetime).toBe("2021-08-24T23:59:00");
  });
});
