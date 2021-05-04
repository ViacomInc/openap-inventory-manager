import cleanDate from "./cleanDate";
import syncRatesForDate from "./syncRatesForDate";
import syncInventoryForDate from "./syncInventoryForDate";

export enum TaskName {
  CleanDate = "cleanDate",
  SyncInventoryForDate = "syncInventoryForDate",
  SyncRatesForDate = "syncRatesForDate",
}

export const Tasks = {
  [TaskName.CleanDate]: cleanDate,
  [TaskName.SyncRatesForDate]: syncRatesForDate,
  [TaskName.SyncInventoryForDate]: syncInventoryForDate,
};
