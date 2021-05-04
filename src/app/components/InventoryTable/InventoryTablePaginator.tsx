import React, { useCallback } from "react";

import { Button, Input, InputType, Select, isMultiOptions } from "../ui";

import { clamp } from "../../../lib/helpers";
import useInventoryUIStatus from "../useInventoryUIStatus";

import Styles from "./InventoryTable.module.css";

type PaginationOption = { label: string; value: number };

const paginationOptions: Array<PaginationOption> = [
  { value: 10, label: "10 rows" },
  { value: 20, label: "20 rows" },
  { value: 30, label: "30 rows" },
  { value: 40, label: "40 rows" },
  { value: 50, label: "50 rows" },
  { value: 100, label: "100 rows" },
];

interface InventoryTablePaginatorProps {
  disabled?: boolean;
  canPreviousPage: boolean;
  canNextPage: boolean;
  setPageIndex: (n: number) => void;
  setPageSize: (size: number) => void;

  pageOptions: number[];
  pageIndex: number;
  pageSize: number;
}

export default function InventoryTablePaginator({
  disabled,
  canPreviousPage,
  canNextPage,
  setPageIndex,
  setPageSize,
  pageOptions,
  pageIndex,
  pageSize,
}: InventoryTablePaginatorProps): JSX.Element {
  const { canAddNewItems } = useInventoryUIStatus();
  const maxPageIndex = pageOptions.length - 1;
  const handleInputChange = useCallback(
    (value: string | number) => {
      const page = (value as number) - 1;
      setPageIndex(clamp(0, maxPageIndex, page));
    },
    [maxPageIndex]
  );

  return (
    <div className={Styles.Paginator}>
      <Button
        secondary
        disabled={disabled || !canPreviousPage || !canAddNewItems}
        onClick={() => setPageIndex(pageIndex - 1)}
      >
        Previous
      </Button>

      <div className={Styles.PaginatorSelector}>
        <span>Page</span>
        <Input
          type={InputType.Int}
          disabled={disabled || !canAddNewItems}
          value={pageIndex + 1}
          onChange={handleInputChange}
        />
        <span>of {maxPageIndex + 1}</span>
        <span />
        <span>Display</span>
        <Select
          className={Styles.Select}
          isDisabled={disabled || !canAddNewItems}
          value={paginationOptions.find((o) => o.value === pageSize)}
          options={paginationOptions}
          onChange={(selected) => {
            if (
              !selected ||
              isMultiOptions(selected) ||
              selected.value === pageSize
            ) {
              return;
            }

            setPageSize(selected.value as number);
          }}
        />
      </div>

      <Button
        secondary
        disabled={disabled || !canNextPage || !canAddNewItems}
        onClick={() => setPageIndex(pageIndex + 1)}
      >
        Next page
      </Button>
    </div>
  );
}
