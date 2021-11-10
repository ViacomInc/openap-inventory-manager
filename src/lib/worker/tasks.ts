import { JobHelpers } from "graphile-worker";

import cleanDate from "./cleanDate";
import syncRatesForDate from "./syncRatesForDate";
import syncInventoryForDate from "./syncInventoryForDate";

export enum TaskName {
  CleanDate = "cleanDate",
  SyncInventoryForDate = "syncInventoryForDate",
  SyncRatesForDate = "syncRatesForDate",
}

type Task = (payload: unknown, jobHelpers: JobHelpers) => Promise<void>;

export const Tasks: Record<TaskName, Task> = {
  [TaskName.CleanDate]: cleanDate,
  [TaskName.SyncRatesForDate]: syncRatesForDate,
  [TaskName.SyncInventoryForDate]: syncInventoryForDate,
};

export type TasksPayloads = Partial<Record<TaskName, unknown[]>>;
