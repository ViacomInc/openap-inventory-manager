import { DateTime, StringInterval } from "broadcast-calendar";
import {
  InventoryItem,
  InventoryItemStatus,
} from "../../graphql/__generated__/types";
import { openAPDate } from "../dateHelpers";

import { addJobs, runJobs, TaskName } from "../worker";
import { CleanDatePayload } from "../worker/cleanDate";
import { getAllForDateRange } from "../InventoryItem";

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

  const jobs = await addJobs({
    [TaskName.CleanDate]: cleanDateJobs,
  });
  await runJobs(jobs);

  return getAllForDateRange({
    dateRange,
    statuses: [InventoryItemStatus.New],
  });
}
