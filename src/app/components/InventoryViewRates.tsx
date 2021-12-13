import React from "react";

import InventoryViewAggregate from "./InventoryViewAggregate";
import { InventoryViewTabProps } from "./InventoryViewTabs";

export default function InventoryViewRates({
  items,
  networks,
}: InventoryViewTabProps): JSX.Element {
  return (
    <InventoryViewAggregate
      items={items}
      networks={networks}
      aggregateByColumn="rate"
    />
  );
}
