export enum RateType {
  Scatter = "SCATTER",
  Upfront = "UPFRONT",
}

export enum InventoryItemStatus {
  Draft = "Draft",
  New = "New",
  Updated = "Updated",
  Removed = "Removed",
  Deleted = "Deleted",
  Committed = "Committed",
}

export enum Demographics {
  P2PLUS = "P2+",
  P18PLUS = "P18+",
  P21PLUS = "P21+",
  P12_24 = "P12-24",
  P12_34 = "P12-34",
  P18_34 = "P18-34",
  P18_49 = "P18-49",
  P25_49 = "P25-49",
  P25_54 = "P25-54",
  P35_64 = "P35-64",
  F12_24 = "F12-24",
  F12_34 = "F12-34",
  F18_34 = "F18-34",
  F18_49 = "F18-49",
  F25_49 = "F25-49",
  F25_54 = "F25-54",
  F35_64 = "F35-64",
  M12_24 = "M12-24",
  M12_34 = "M12-34",
  M18_34 = "M18-34",
  M18_49 = "M18-49",
  M25_49 = "M25-49",
  M25_54 = "M25-54",
  M35_64 = "M35-64",
}

export enum ImportMode {
  Ignore = "Ignore",
  ImportAll = "ImportAll",
}

export enum ImportFilterType {
  Clamp = "clamp",
  Include = "include",
  Exclude = "exclude",
}
