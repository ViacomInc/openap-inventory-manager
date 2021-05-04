import React, { useMemo } from "react";

import { isNotRemoved } from "../../lib/InventoryItem/helpers";

import { InventoryViewTabProps } from "./InventoryViewTabs";
import useGetWeeklyColumns from "./InventoryTable/useGetWeeklyColumns";
import InventoryTable from "./InventoryTable";
import createInputCell from "./Cells/InputCell";
import { InputType } from "./ui";

export default function InventoryViewUnits({
  items,
  networks,
}: InventoryViewTabProps): JSX.Element {
  const itemsWithNoRemoved = useMemo(() => items.filter(isNotRemoved), [items]);

  const columns = useGetWeeklyColumns({
    items: itemsWithNoRemoved,
    networks,
    column: "units",
    Cell: createInputCell({
      name: "units",
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
