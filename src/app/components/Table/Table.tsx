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
import useEditRowClickHandler from "./useEditRowClickHandler";

import Styles from "./Table.module.css";

export function getRowId(row: RowData): string {
  return `row-${row.id}`;
}

export type TableProps<R extends RowData> = UseEditRowTableOptions<R> &
  UseDuplicateRowTableOptions<R> & {
    columns: TableOptions<R>["columns"];
    data: R[];
    empty?: JSX.Element;
    groupBy?: TableState<R>["groupBy"];
  };

export default function Table<R extends RowData>({
  columns,
  data,
  empty,
  isEditRowEnabled,
  isEditRowLoading,
  editRowValidate,
  onEditRowConfirmed,
  onEditRowCanceled,
  onEditRowDeleted,
  isDuplicateRowEnabled,
  onDuplicateRow,
  groupBy,
}: TableProps<R>) {
  const tableOptions: TableOptions<R> = {
    columns,
    data,
    getRowId,
    initialState: {},
    isEditRowEnabled,
    isEditRowLoading,
    editRowValidate,
    onEditRowConfirmed,
    onEditRowCanceled,
    onEditRowDeleted,
    isDuplicateRowEnabled,
    onDuplicateRow,
  };

  const plugins: PluginHook<R>[] = [];
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
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    setEditRow,
    toggleRowExpanded,
    state: { editRowId },
  } = useTable<R>(tableOptions, ...plugins) as TableInstance<R>;

  const rowClickHandler = useEditRowClickHandler<R>({
    rows,
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
