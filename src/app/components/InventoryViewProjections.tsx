import React, { useMemo } from "react";

import { isNotRemoved } from "../../lib/InventoryItem/helpers";

import { InventoryViewTabProps } from "./InventoryViewTabs";
import useGetWeeklyColumns from "./InventoryTable/useGetWeeklyColumns";
import InventoryTable from "./InventoryTable";
import createInputCell from "./Cells/InputCell";
import { InputType } from "./ui";

export default function InventoryViewProjections({
  items,
  networks,
}: InventoryViewTabProps): JSX.Element {
  const itemsWithNoRemoved = useMemo(() => items.filter(isNotRemoved), [items]);

  const columns = useGetWeeklyColumns({
    items: itemsWithNoRemoved,
    networks,
    column: "projectedImpressions",
    Cell: createInputCell({
      name: "projectedImpressions",
      type: InputType.Float,
    }),
  });

  return (
    <InventoryTable
      columns={columns}
      data={itemsWithNoRemoved}
      groupBy={["networkId", "name"]}
      showTotalColumn
    />
  );
}
