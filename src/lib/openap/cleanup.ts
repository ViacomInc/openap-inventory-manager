import { DateTime, StringInterval } from "@viacomcbs/broadcast-calendar";
import {
  InventoryItem,
  InventoryItemStatus,
} from "../../graphql/__generated__/types";
import { openAPDate } from "../dateHelpers";

import { runJobs, TaskName } from "../worker";
import { CleanDatePayload } from "../worker/cleanDate";
import { getAllForDateRange } from "../InventoryItem";

import logger from "../logger";

export async function cleanup(
  userId: string,
  dateRange: StringInterval
): Promise<InventoryItem[]> {
  const startDate = DateTime.fromISO(dateRange[0]);
  const endDate = DateTime.fromISO(dateRange[1]);

  const cleanDateJobs: CleanDatePayload[] = [];

  let day = startDate;
  while (day < endDate) {
    day = day.plus({ days: 1 });
    cleanDateJobs.push({
      userId,
      date: openAPDate(day),
    });
  }

  logger.info(
    { dates: cleanDateJobs.map(({ date }) => date) },
    "Cleaning dates"
  );

  const failedJobs = await runJobs({
    [TaskName.CleanDate]: cleanDateJobs,
  });

  if (failedJobs) {
    logger.error({ failedJobs }, "Failed Jobs");
  }

  return getAllForDateRange({
    dateRange,
    statuses: [InventoryItemStatus.New],
  });
}
