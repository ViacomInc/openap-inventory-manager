import { RateType } from "../graphql/__generated__/types";

export type Rate = {
  id: number;
  rate: number;
  rateKey: string;
  rateType: RateType;
  validFrom: string;
  validUntil: string;
  publisherId: number;
  isArchived?: boolean | null;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
};

export type NewRate = Pick<
  Rate,
  "validFrom" | "validUntil" | "rate" | "rateKey" | "rateType" | "publisherId"
>;
