import React from "react";

import InventoryViewAggregate from "./InventoryViewAggregate";
import { InventoryViewTabProps } from "./InventoryViewTabs";

export default function InventoryViewProjections({
  items,
  networks,
}: InventoryViewTabProps): JSX.Element {
  return (
    <InventoryViewAggregate
      items={items}
      networks={networks}
      aggregateByColumn="projectedImpressions"
    />
  );
}
