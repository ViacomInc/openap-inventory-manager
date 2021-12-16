import React from "react";

import { RowData, CellRendererProps } from "./types";

function getTotalReducer(skipColumns: string[]) {
  return function calcTotalRow(
    a: number,
    [key, value]: [string, number | string | null]
  ): number {
    if (skipColumns.includes(key) || !value) {
      return a;
    }

    if (typeof value === "string") {
      return a;
    }

    return a + value;
  };
}

type CreateTotalRowCell = {
  skipColumns: string[];
};

export default function createTotalRowCell<R extends RowData>({
  skipColumns,
}: CreateTotalRowCell) {
  return function TotalRowCell(props: CellRendererProps<R>): JSX.Element {
    const { row, column } = props;
    const total = Object.entries(row.values).reduce(
      getTotalReducer([...skipColumns, column.id]),
      0
    );
    if (column.format) {
      return <strong>{column.format(total)}</strong>;
    }
    return <strong>{total}</strong>;
  };
}
