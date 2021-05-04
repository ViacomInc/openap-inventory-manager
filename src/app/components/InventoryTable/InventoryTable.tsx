import React, { useEffect } from "react";
import {
  useTable,
  useSortBy,
  useGroupBy,
  useExpanded,
  useRowSelect,
  usePagination,
  PluginHook,
} from "react-table";

import { InventoryItem } from "../../graphql";

import { Modal, Button } from "../ui";

import { getRowId } from "./";
import {
  InventoryTableInstance,
  InventoryTableOptions,
  InventoryTableColumnOptions,
  InventoryTableSate,
  InventoryTableRow,
  Pagination,
} from "./types";

import InventoryTablePaginator from "./InventoryTablePaginator";
import HeaderRow from "./HeaderRow";
import BodyRow from "./BodyRow";
import useActions from "./useActions";
import useTotalColumn from "./useTotalColumn";
import useRowClickHandler from "./useRowClickHandler";
import useSetPageToSelection from "./useSetPageToSelection";
import useSelectionToTransaction from "./useSelectionToTransaction";
import useModalForChanges from "./useModalForChanges";

import Styles from "./InventoryTable.module.css";

interface InventoryTableProps {
  columns: InventoryTableColumnOptions[];
  data: InventoryItem[];
  groupBy?: InventoryTableSate["groupBy"];
  showTotalColumn?: boolean;
  pagination?: Pagination;
  disabled?: boolean;
  formatTotalColumn?: (v: string | number) => string;
}

export default function InventoryTable({
  columns,
  data,
  groupBy,
  pagination,
  showTotalColumn,
  formatTotalColumn,
}: InventoryTableProps): JSX.Element {
  const tableOptions: InventoryTableOptions = {
    columns,
    data,
    autoResetSortBy: false,
    autoResetSelectedRows: false,
    getRowId,
    autoResetPage: true,
    initialState: {},
  };

  if (groupBy) {
    tableOptions.autoResetExpanded = false;
    tableOptions.initialState.groupBy = groupBy;
  }

  const tableHooks: PluginHook<InventoryItem>[] = groupBy
    ? [useGroupBy, useSortBy, useExpanded]
    : [useSortBy];

  if (pagination) {
    tableHooks.push(usePagination);
    tableOptions.initialState.pageIndex = pagination.pageIndex;
    tableOptions.initialState.pageSize = pagination.pageSize;
  }

  tableHooks.push(useRowSelect);

  if (showTotalColumn) {
    tableHooks.push(useTotalColumn(formatTotalColumn));
  }

  tableHooks.push(useActions);

  const {
    rows,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    toggleRowSelected,
    toggleRowExpanded,
    selectedFlatRows,

    pageOptions,
    page,
    gotoPage,
    setPageSize,
    canPreviousPage,
    canNextPage,
    state: { pageIndex, pageSize },
  } = useTable(tableOptions, ...tableHooks) as InventoryTableInstance;

  useSelectionToTransaction({
    data,
    selectedRows: selectedFlatRows,
    toggleRowSelected,
  });

  const visibleRows = pagination ? page : rows;

  const rowClickHandler = useRowClickHandler({
    rows,
    hasSelectedRows: !!selectedFlatRows.length,
    toggleRowSelected,
    toggleRowExpanded,
  });

  if (pagination) {
    useSetPageToSelection({
      rows,
      selectedRows: selectedFlatRows,
      setPage: pagination.setPageIndex,
      pageIndex,
      pageSize,
    });
    useEffect(() => gotoPage(pagination.pageIndex), [pagination.pageIndex]);
    useEffect(() => setPageSize(pagination.pageSize), [pagination.pageSize]);
  }

  const [isOpen, setIsOpen] = useModalForChanges(selectedFlatRows);

  return (
    <>
      <Modal
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
        title="You have unsaved inventory item changes."
      >
        <p>Cancel or save the changes before continuing.</p>
        <Button onClick={() => setIsOpen(false)}>Ok</Button>
      </Modal>
      <table className={Styles.Table} {...getTableProps()}>
        <thead className={Styles.Head}>
          {headerGroups.map((headerGroup) => (
            <HeaderRow
              key={headerGroup.getHeaderGroupProps().key}
              row={headerGroup}
            />
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {visibleRows.map((row) => {
            prepareRow(row);
            // Work around to fix type issues with React Table and plugins
            const typedRow = (row as unknown) as InventoryTableRow;
            return (
              <BodyRow
                key={typedRow.id}
                row={typedRow}
                onClick={rowClickHandler}
              />
            );
          })}
        </tbody>
      </table>
      {pagination && (
        <InventoryTablePaginator
          pageOptions={pageOptions}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          setPageIndex={pagination.setPageIndex}
          setPageSize={pagination.setPageSize}
        />
      )}
    </>
  );
}
