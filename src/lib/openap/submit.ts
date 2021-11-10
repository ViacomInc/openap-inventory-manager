import {
  InventoryItem,
  InventoryItemStatus,
} from "../../graphql/__generated__/types";
import { getAll, getAllForPublisherByStatuses } from "../InventoryItem";
import logger from "../logger";
import { collectRatesDates, collectBroadcastDates } from "./helpers";

import { runJobs, TaskName } from "../worker";
import { SyncRatesForDatePayload } from "../worker/syncRatesForDate";
import { SyncInventoryForDatePayload } from "../worker/syncInventoryForDate";

interface Submit {
  publisherId: number;
}

export async function submit(
  userId: string,
  { publisherId }: Submit
): Promise<InventoryItem[]> {
  //get data from db
  const items = await getAllForPublisherByStatuses({
    publisherId,
    noPastItems: true,
    statuses: [
      InventoryItemStatus.New,
      InventoryItemStatus.Updated,
      InventoryItemStatus.Removed,
    ],
  });

  if (!items.length) {
    return [];
  }

  const ratesDates = items
    .filter(
      (i) =>
        i.status === InventoryItemStatus.New ||
        i.status === InventoryItemStatus.Updated
    )
    .reduce(collectRatesDates, new Set<string>());

  const syncRatesJobs: SyncRatesForDatePayload[] = Array.from(ratesDates).map(
    (date) => ({
      userId,
      publisherId,
      date,
    })
  );

  const broadcatsDates = items.reduce(collectBroadcastDates, new Set<string>());
  const syncInventoryForDateJobs: SyncInventoryForDatePayload[] = Array.from(
    broadcatsDates
  ).map((date) => ({
    userId,
    publisherId,
    date,
  }));

  logger.info(
    {
      ratesDates: Array.from(ratesDates),
      broadcatsDates: Array.from(broadcatsDates),
    },
    "Submitting to OpenAP..."
  );

  const failedJobs = await runJobs({
    [TaskName.SyncRatesForDate]: syncRatesJobs,
    [TaskName.SyncInventoryForDate]: syncInventoryForDateJobs,
  });

  if (failedJobs) {
    logger.error({ failedJobs }, "Failed Jobs");
  }

  return getAll({ ids: items.map((item) => item.id) });
}
