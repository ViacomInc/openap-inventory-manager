import {
  RateType,
  InventoryItemInput,
} from "../../../src/graphql/__generated__/types";
import { createNewInventoryItem } from "../../../src/lib/InventoryItem/new";

import { DEFAULT_VALID_UNTIL_DAYS } from "../../../src/lib/constants";
import { DateTime } from "luxon";

const testItem: InventoryItemInput = {
  name: "test name",
  projectionsDemographics: "P2+",
  projectedImpressions: 100,
  startDatetime: "2020-10-09 17:20:32.000",
  endDatetime: "2020-10-11 17:20:32.000",
  validUntil: "2020-09-25",
  networkId: 1,
  units: 0,
  rate: 0,
  rateType: RateType.Scatter,
  publisherId: 1,
};

describe("New Inventory Item Defaults", () => {
  test("Passes full item", () => {
    const newItem = createNewInventoryItem(testItem);

    expect(newItem.name).toBe(testItem.name);
    expect(newItem.projectionsDemographics).toBe(
      testItem.projectionsDemographics
    );
    expect(newItem.projectedImpressions).toBe(testItem.projectedImpressions);
    // should have ny tz info
    expect(newItem.startDatetime).toBe(`${testItem.startDatetime} -04:00`);
    expect(newItem.endDatetime).toBe(`${testItem.endDatetime} -04:00`);
    expect(newItem.validUntil).toBe(testItem.validUntil);
    expect(newItem.networkId).toBe(testItem.networkId);
    expect(newItem.units).toBe(testItem.units);
    expect(newItem.rate).toBe(testItem.rate);
    expect(newItem.rateType).toBe(testItem.rateType);
    expect(newItem.publisherId).toBe(testItem.publisherId);
  });

  test("Creates new item with publisher id", () => {
    const newItem = createNewInventoryItem({ publisherId: 1 });

    expect(newItem.name).toBe("Title");
    expect(newItem.projectionsDemographics).toBe("P2+");
    expect(newItem.projectedImpressions).toBe(0);
    expect(typeof newItem.startDatetime).toBe("string");
    expect(typeof newItem.endDatetime).toBe("string");
    expect(typeof newItem.validUntil).toBe("string");
    expect(newItem.networkId).toBe(17);
    expect(newItem.units).toBe(0);
    expect(newItem.rate).toBe(0);
    expect(newItem.rateType).toBe(RateType.Scatter);
    expect(newItem.publisherId).toBe(1);
  });

  test("Creates default the validUntil value", () => {
    const newItem = createNewInventoryItem({
      ...testItem,
      validUntil: "",
    });

    const startDatetime = DateTime.fromSQL(newItem.startDatetime);
    const validUntil = DateTime.fromSQL(newItem.validUntil);

    expect(startDatetime.diff(validUntil, ["days", "hours"]).days).toBe(
      DEFAULT_VALID_UNTIL_DAYS
    );
  });
});
