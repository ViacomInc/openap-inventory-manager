import { DateTime } from "broadcast-calendar";

export type DateOrString = DateTime | string;

export interface ItemDateTimeRange {
  startDatetime: string;
  endDatetime: string;
  validUntil: string;
}
