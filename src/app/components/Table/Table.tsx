import React from "react";
import {
  useTable,
  // useSortBy,
  useGroupBy,
  useExpanded,
  // usePagination,
  PluginHook,
} from "react-table";

import { TableOptions, TableInstance, TableRow, TableState } from "./types";

import BodyRow from "./BodyRow";
import HeaderRow from "./HeaderRow";
import { RowData } from "./types";

import useEditRow, { UseEditRowTableOptions } from "./useEditRow";
import useDuplicateRow, {
  UseDuplicateRowTableOptions,
} from "./useDuplicateRow";
import useRowClass, { UseRowClassTableOptions } from "./useRowClass";
import useRowClickHandler from "./useRowClickHandler";

import Styles from "./Table.module.css";

export function getRowId(row: RowData): string {
  return `row-${row.id}`;
}

export type TableProps<R extends RowData> = UseEditRowTableOptions<R> &
  UseRowClassTableOptions<R> &
  UseDuplicateRowTableOptions<R> & {
    columns: TableOptions<R>["columns"];
    data: R[];
    empty?: JSX.Element;
    groupBy?: TableState<R>["groupBy"];
  };

export default function Table<R extends RowData>({
  empty,
  isEditRowEnabled,
  isDuplicateRowEnabled,
  groupBy,
  ...options
}: TableProps<R>) {
  const tableOptions: TableOptions<R> = {
    ...options,
    isEditRowEnabled,
    isDuplicateRowEnabled,
    initialState: {},
  };

  const plugins: PluginHook<R>[] = [useRowClass];
  if (isDuplicateRowEnabled) {
    plugins.push(useDuplicateRow);
  }

  if (isEditRowEnabled) {
    plugins.push(useEditRow);
  }

  if (groupBy) {
    tableOptions.autoResetExpanded = false;
    tableOptions.initialState.groupBy = groupBy;
    plugins.push(useGroupBy, useExpanded);
  }

  const {
    rows,
    rowsById,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    setEditRow,
    toggleRowExpanded,
    state: { editRowId },
  } = useTable<R>(tableOptions, ...plugins) as TableInstance<R>;

  const rowClickHandler = useRowClickHandler<R>({
    rowsById,
    editRowId,
    setEditRow,
    isEditRowEnabled,
    toggleRowExpanded,
  });

  if (rows.length === 0) {
    return empty ? <div className={Styles.EmptyData}>{empty}</div> : null;
  }

  return (
    <>
      <table
        className={Styles.Table}
        {...getTableProps()}
        id="target-overrides-table"
      >
        <thead className={Styles.Head}>
          {headerGroups.map((headerGroup) => (
            <HeaderRow
              key={headerGroup.getHeaderGroupProps().key}
              row={headerGroup}
            />
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            // Work around to fix type issues with React Table and plugins
            const rowExtended = row as unknown as TableRow<R>;
            return (
              <BodyRow
                key={row.id}
                row={rowExtended}
                onClick={rowClickHandler}
              />
            );
          })}
        </tbody>
      </table>
    </>
  );
}
