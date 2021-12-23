import React, { useCallback } from "react";
import { UsePaginationInstanceProps, UsePaginationState } from "react-table";
import { RowData } from "./types";
import { Icons, Button, Input, InputType, Select, isMultiOptions } from "../ui";

import { clamp } from "../../../lib/helpers";

import Styles from "./Paginator.module.css";

type PaginationOption = { label: string; value: number };

const paginationOptions: Array<PaginationOption> = [
  { value: 10, label: "10 rows" },
  { value: 20, label: "20 rows" },
  { value: 30, label: "30 rows" },
  { value: 40, label: "40 rows" },
  { value: 50, label: "50 rows" },
  { value: 100, label: "100 rows" },
];

type PaginatorProps<R extends RowData> = Omit<
  UsePaginationInstanceProps<R>,
  "page"
> &
  UsePaginationState<R> & {
    disabled?: boolean;
  };

export default function Paginator<R extends RowData>({
  disabled,
  pageIndex,
  pageSize,
  canPreviousPage,
  canNextPage,
  pageCount,
  gotoPage,
  nextPage,
  previousPage,
  setPageSize,
}: PaginatorProps<R>): JSX.Element {
  const handleInputChange = useCallback(
    (value: string | number) => {
      const page = (value as number) - 1;
      gotoPage(clamp(0, pageCount - 1, page));
    },
    [pageCount]
  );

  return (
    <div className={Styles.Container}>
      <Button
        secondary
        glyphed
        disabled={disabled || !canPreviousPage}
        onClick={previousPage}
        icon={Icons.Previous}
        title="Previous Page"
      />
      <div className={Styles.Selector}>
        <span>Page</span>
        <Input
          type={InputType.Int}
          disabled={disabled}
          value={pageIndex + 1}
          onChange={handleInputChange}
        />
        <span>of {pageCount}</span>
        <span />
        <span>Display</span>
        <Select
          className={Styles.Select}
          isDisabled={disabled}
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
        glyphed
        disabled={disabled || !canNextPage}
        onClick={nextPage}
        icon={Icons.Next}
        title="Next Page"
      />
    </div>
  );
}
