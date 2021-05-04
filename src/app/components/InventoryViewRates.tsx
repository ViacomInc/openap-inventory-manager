import React, { useMemo } from "react";

import { isNotRemoved } from "../../lib/InventoryItem/helpers";

import { InventoryViewTabProps } from "./InventoryViewTabs";
import useGetWeeklyColumns from "./InventoryTable/useGetWeeklyColumns";
import InventoryTable, { onlyNewEditable } from "./InventoryTable";
import createInputCell from "./Cells/InputCell";
import { InputType } from "./ui";

export default function InventoryViewRates({
  items,
  networks,
}: InventoryViewTabProps): JSX.Element {
  const itemsWithNoRemoved = useMemo(() => items.filter(isNotRemoved), [items]);
  const format = (v: number | string) =>
    typeof v === "number" ? v.toFixed(2) : v;
  const columns = useGetWeeklyColumns({
    items: itemsWithNoRemoved,
    networks,
    column: "rate",
    Cell: createInputCell({
      name: "rate",
      type: InputType.Float,
      isEditable: onlyNewEditable,
    }),
    format,
  });

  return (
    <InventoryTable
      columns={columns}
      data={itemsWithNoRemoved}
      groupBy={["networkId", "name"]}
      formatTotalColumn={format}
      showTotalColumn
    />
  );
}
