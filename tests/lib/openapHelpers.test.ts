import { InventoryItem } from "../../src/graphql/__generated__/types";
import {
  collectRatesDates,
  collectBroadcastDates,
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
});
