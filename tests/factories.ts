import * as factory from "factory.ts";
import * as faker from "faker";
import { DateTime } from "luxon";
import {
  RateType,
  Demographics,
  InventoryItemInput,
  InventoryItem,
} from "../src/graphql/__generated__/types";
import { create } from "../src/lib/InventoryItem";
import { FACTORY_USER_ID } from "./constants";

const NETWORK_IDS = [
  {
    id: 153,
    name: "AMTV",
  },
  {
    id: 19,
    name: "BET",
  },
  {
    id: 54,
    name: "CMDY",
  },
  {
    id: 50,
    name: "CMT",
  },
  {
    id: 44,
    name: "CNTRC",
  },
  {
    id: 11,
    name: "LOGO",
  },
  {
    id: 17,
    name: "MTV",
  },
  {
    id: 96,
    name: "MTV2",
  },
  {
    id: 97,
    name: "MTVC",
  },
  {
    id: 104,
    name: "NAN",
  },
  {
    id: 23,
    name: "NICK",
  },
  {
    id: 3,
    name: "NKJR",
  },
  {
    id: 118,
    name: "NKTNS",
  },
  {
    id: 26,
    name: "SPIKE",
  },
  {
    id: 90,
    name: "TNNK",
  },
  {
    id: 80,
    name: "TVL",
  },
  {
    id: 144,
    name: "TVLC (TV Land Classic)",
  },
  {
    id: 42,
    name: "VH1",
  },
];

export const inventoryItemFactory = factory.Sync.makeFactory<InventoryItemInput>(
  {
    name: factory.each(() => faker.commerce.productName()),
    projectionsDemographics: factory.each(() => Demographics.P2PLUS),
    projectedImpressions: factory.each(() => faker.datatype.number()),
    startDatetime: factory.each(() =>
      DateTime.fromJSDate(faker.date.soon()).toSQL()
    ),
    endDatetime: factory.each(() =>
      DateTime.fromJSDate(faker.date.future()).toSQL()
    ),
    validUntil: factory.each(() =>
      DateTime.fromJSDate(faker.date.future()).toSQL()
    ),
    networkId: factory.each(
      () => NETWORK_IDS[Math.floor(Math.random() * NETWORK_IDS.length)].id
    ),
    units: factory.each(() => faker.datatype.number()),
    rate: factory.each(() => faker.datatype.number() / 100),
    rateType: RateType.Scatter,
    publisherId: factory.each(() => faker.datatype.number()),
  }
);

export const insertInventoryItems = async (
  number: number,
  args: Partial<InventoryItemInput> = {}
): Promise<InventoryItem[]> => {
  const items = inventoryItemFactory.buildList(number, args);
  return await create(FACTORY_USER_ID, items);
};

export const insertInventoryItemsSameDay = async (
  number: number,
  args: Partial<InventoryItemInput> = {}
): Promise<InventoryItem[]> => {
  const date = DateTime.fromJSDate(faker.date.future()).startOf("week");
  const steps = Array.from({ length: number }, (x, i) => i);
  const items = steps.map((shift) =>
    inventoryItemFactory.build({
      startDatetime: date.plus({ minutes: shift * 30 }).toISO(),
      endDatetime: date.plus({ minutes: (shift + 1) * 30 }).toISO(),
      ...args,
    })
  );

  return await create(FACTORY_USER_ID, items);
};
