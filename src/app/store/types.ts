import type { Option } from "../components/ui";
export type { Option } from "../components/ui";
import type { NotificationType } from "../components/ui";
export { NotificationType } from "../components/ui";

export interface Error {
  message: string;
  code?: number;
}

export type Notification = {
  message: string;
  type: NotificationType;
  timeout?: number;
  id: string;
};

export interface User {
  id?: string | null;
  firstName?: string;
  lastName?: string;
  groups?: string[];
  isAdmin?: boolean;
}

export enum ErrorCode {
  PastStartDate,
  StartEndDifferenceIsTooBig,
  ValidUntilAfterStart,
}

export enum TableView {
  Items = "items",
  Units = "units",
  Rates = "rates",
  Projections = "projections",
}

export type FilterValue = string | number;

export enum FilterType {
  Status = "status",
  Network = "network",
  YearQuarter = "yq",
  Demographics = "demographics",
  Name = "name",
}

export type Filter = Pick<Option, "value" | "type">;
