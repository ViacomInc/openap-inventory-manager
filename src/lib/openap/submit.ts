import {
  InventoryItem,
  InventoryItemStatus,
} from "../../graphql/__generated__/types";
import { getAll, getAllForPublisherByStatuses } from "../InventoryItem";
import logger from "../logger";
import { collectRatesDates, collectBroadcastDates } from "./helpers";

import { addJobs, runJobs, TaskName } from "../worker";
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
      ratesDates: ratesDates.values(),
      broadcatsDates: broadcatsDates.values(),
    },
    "Submitting to OpenAP..."
  );

  const jobs = await addJobs({
    [TaskName.SyncRatesForDate]: syncRatesJobs,
    [TaskName.SyncInventoryForDate]: syncInventoryForDateJobs,
  });
  await runJobs(jobs);

  return getAll({ ids: items.map((item) => item.id) });
}
