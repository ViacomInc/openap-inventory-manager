import { TableInstance, Hooks, Row, MetaBase } from "react-table";

import { RowData } from "./types";

import DuplicateRowActionsCell from "./DuplicateRowActionsCell";

export interface UseDuplicateRowTableOptions<R extends RowData> {
  isDuplicateRowEnabled?: boolean;
  onDuplicateRow?: (row: R) => void;
}

export default function useDuplicateRow<R extends RowData>(hooks: Hooks<R>) {
  hooks.prepareRow.push(prepareRow);
  hooks.allColumns.push((columns) => [
    ...columns,
    {
      id: "rowDuplicate",
      width: 1,
      Cell: DuplicateRowActionsCell,
      disableSortBy: true,
    },
  ]);
}

useDuplicateRow.pluginName = "useDuplicateRow";

export type UseDuplicateRowInstanceProps<R extends RowData> =
  UseDuplicateRowTableOptions<R>;

export interface UseDuplicateRowRowProps {
  duplicateRow: () => void;
}

function prepareRow<R extends RowData>(row: Row<R>, meta: MetaBase<R>): void {
  const rowExtended = row as unknown as Row<R> & UseDuplicateRowRowProps;
  const { onDuplicateRow } = meta.instance as unknown as TableInstance<R> &
    UseDuplicateRowInstanceProps<R>;

  rowExtended.duplicateRow = () =>
    onDuplicateRow && onDuplicateRow(row.original);
}
