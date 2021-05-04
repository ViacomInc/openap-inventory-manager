import { JobHelpers } from "graphile-worker";
import {
  getBroadcastWeekRange,
  formatBroadcastDateRange,
  StringInterval,
  parseDateFromSQL,
} from "broadcast-calendar";
import { isMonday } from "../dateHelpers";

import { InventoryItemStatus } from "../../graphql/__generated__/types";

import { getAllForDateRange } from "../InventoryItem";
import { archiveForDate, bulkCreate } from "../Rate";
import { getWeeklyRates, createOAPRate } from "../openap/helpers";
import { uploadRates } from "../openap/api";

export interface SyncRatesForDatePayload {
  userId: string;
  publisherId: number;
  date: string;
}

export default async function syncRatesForDate(
  payload: unknown,
  { logger }: JobHelpers
): Promise<void> {
  if (!payload) {
    throw new Error(`Wrong payload ${String(payload)}`);
  }

  const { userId, publisherId, date } = payload as SyncRatesForDatePayload;
  if (
    typeof userId !== "string" ||
    typeof publisherId !== "number" ||
    typeof date !== "string"
  ) {
    throw new Error(`Wrong payload type ${String(payload)}`);
  }

  if (!isMonday(date)) {
    throw new Error(`The date is not monday ${date}`);
  }

  const dateRange = getRatesDatesRange(date);
  const items = await getAllForDateRange({
    publisherId,
    dateRange,
    statuses: [
      InventoryItemStatus.New,
      InventoryItemStatus.Updated,
      InventoryItemStatus.Committed,
    ],
  });

  if (!items.length) {
    logger.info(`No inventory found for rates update on ${date}`);
    return;
  }

  //collect rates
  const rates = getWeeklyRates(dateRange, items);

  const cleanRates = await uploadRates(
    {
      validFrom: date,
      items: [],
    },
    true
  );
  logger.info(`Deleted rates for ${date} with: ${JSON.stringify(cleanRates)}`);

  const createRates = await uploadRates(
    {
      validFrom: date,
      items: rates.map(createOAPRate),
    },
    true
  );
  logger.info(`Created rates for ${date} with: ${JSON.stringify(createRates)}`);

  const atchivedRates = await archiveForDate({ userId, publisherId, date });
  logger.info(`Archived rates for ${date}: ${atchivedRates.length}`);

  const newRates = await bulkCreate(userId, rates);
  logger.info(`Crested ${newRates.length} new rates for ${date}`);
}

function getRatesDatesRange(date: string): StringInterval {
  return formatBroadcastDateRange(
    getBroadcastWeekRange(parseDateFromSQL(date))
  );
}
