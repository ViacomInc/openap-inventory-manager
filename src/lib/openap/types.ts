import type { RateType } from "../../graphql/__generated__/types";

export type OAPNetwork = {
  id: number;
  name: string;
};

export type OAPPublisher = {
  id: number;
  name: string;
  networks: OAPNetwork[];
};

export type OAPInventoryItem = {
  startDatetime: string;
  endDatetime: string;
  networkIds: number[];
  units: string;
  rateKey: string;
  rateTypes: RateType[];
  validUntil: string;
  externalId: string;
  externalName?: string;
  externalProjections?: { [index: string]: number };
};

export type OAPInventory = {
  broadcastDate: string;
  items: OAPInventoryItem[];
};

export type OAPRate = {
  rateKey: string;
  rateType: RateType;
  rate: string;
  validFrom: string;
  validUntil: string;
  buyerId?: number;
  advertiserId?: number;
};

export type OAPRates = {
  validFrom: string;
  items: OAPRate[];
};

export type OAPError = {
  timestamp: string;
  status: number;
  message?: string;
  error: {
    [key: string]: unknown;
  };
};

export type OAPAuthError = {
  error_description: string; // this is actual error message
  error: string; // this is error code
};

export function isOAPAuthError(error: unknown): error is OAPAuthError {
  if (!error) {
    return false;
  }

  if (typeof error !== "object" || error === null) {
    return false;
  }

  return "error_description" in error && "error" in error;
}
