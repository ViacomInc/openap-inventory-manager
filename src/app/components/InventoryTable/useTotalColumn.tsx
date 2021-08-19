import React from "react";
import { PluginHook } from "react-table";

import { InventoryItem } from "../../graphql";
import { InventoryTableCell, Alignment } from "./types";

const TOTAL_SKIP_COLUMNS = ["total", "actions", "name", "networkId"];

function makeTotal(a: number, [key, value]: [string, number | null]): number {
  if (TOTAL_SKIP_COLUMNS.includes(key) || !value) {
    return a;
  }

  if (typeof value === "string") {
    return a;
  }

  return a + value;
}

function TotalColumnCell(cell: InventoryTableCell): JSX.Element {
  const { row, column } = cell;
  const total = Object.entries(row.values).reduce(makeTotal, 0);
  if (column.format) {
    return <strong>{column.format(total)}</strong>;
  }
  return <strong>{total}</strong>;
}

type FormatFn = (v: string | number) => string;
export const useTotalColumn: (
  fn: FormatFn | undefined
) => PluginHook<InventoryItem> =
  (format = (v: string | number) => String(v)) =>
  (hooks) => {
    hooks.allColumns.push((columns) => [
      ...columns,
      {
        id: "total",
        Header: "Total",
        Cell: TotalColumnCell,
        align: Alignment.Trailing,
        format,
      },
    ]);
  };

export default useTotalColumn;
