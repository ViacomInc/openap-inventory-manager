import { RateType, Demographics, InventoryItemStatus } from "./graphql";
import { Option } from "./components/ui";

export const DemographicsOptions: Option[] = Object.values(Demographics).map(
  (v) => ({
    value: v,
    label: v,
  })
);

export const InventoryItemStatusOptions: Option[] = Object.values(
  InventoryItemStatus
)
  .filter((v) => v !== "Draft")
  .map((v) => ({
    value: v,
    label: v,
  }));

const RateTypeLabels = {
  [RateType.Scatter]: "Scatter",
  [RateType.Upfront]: "Upfront",
};

export const RateTypeOptions: Option[] = Object.values(RateType).map((v) => ({
  value: v,
  label: RateTypeLabels[v] ?? v,
}));
