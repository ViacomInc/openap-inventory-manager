import { StringInterval } from "@viacomcbs/broadcast-calendar";
import {
  InventoryItem,
  InventoryItemInput,
} from "../../graphql/__generated__/types";

import { OAPRate, OAPInventoryItem } from "./types";
import { NewRate } from "../../db/types";
import {
  getOpenAPDateFromDatabase,
  getOpenAPDateTimeFromDatabase,
  getIsoDateFromSql,
  getMondayIsoDate,
  openAPDate,
  parseDateTime,
} from "../dateHelpers";

// when changed, update InventoryItem/update SQL as well
export const makeRateKey = (item: InventoryItem): string =>
  `${item.networkId}~${item.name}`;

export function getWeeklyRates(
  weekRange: StringInterval,
  items: InventoryItem[]
): NewRate[] {
  const [validFrom, validUntil] = weekRange;

  const rates = items.reduce((rates, item) => {
    const rateKey = makeRateKey(item);

    if (rates.has(rateKey)) {
      const rate = rates.get(rateKey)?.rate;
      if (rate !== item.rate) {
        throw new Error(
          `Weekly rates do not match for the week of ${validFrom} (${rateKey} ${String(
            rate
          )} vs ${item.rate})`
        );
      }

      return rates;
    }

    rates.set(rateKey, {
      rateKey,
      rate: item.rate,
      rateType: item.rateType,
      publisherId: item.publisherId,
      validFrom,
      validUntil,
    });

    return rates;
  }, new Map<string, NewRate>());

  return Array.from(rates.values());
}

export function collectRatesDates(
  dates: Set<string>,
  item: InventoryItemInput
): Set<string> {
  dates.add(getMondayIsoDate(item.startDatetime));
  return dates;
}

export function collectBroadcastDates(
  dates: Set<string>,
  item: InventoryItemInput
): Set<string> {
  dates.add(getIsoDateFromSql(item.startDatetime));
  return dates;
}

export function createOAPRate(rate: NewRate): OAPRate {
  return {
    ...rate,
    rate: rate.rate.toString(),
    validUntil: openAPDate(parseDateTime(rate.validUntil).plus({ days: 1 })),
  };
}

export function createOAPInventoryItem(item: InventoryItem): OAPInventoryItem {
  return {
    startDatetime: getOpenAPDateTimeFromDatabase(item.startDatetime),
    endDatetime: getOpenAPDateTimeFromDatabase(item.endDatetime),
    validUntil: getOpenAPDateFromDatabase(item.validUntil),
    networkIds: [item.networkId],
    units: `${item.units}`,
    rateKey: makeRateKey(item),
    rateTypes: [item.rateType],
    externalId: `${item.id}`,
    externalName: item.name,
    externalProjections: {
      [item.projectionsDemographics]: item.projectedImpressions,
    },
  };
}
