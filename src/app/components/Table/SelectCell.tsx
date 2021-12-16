import React, { useMemo } from "react";
import { Select, Option, getOption, isMultiOptions } from "../ui";
import {
  RowData,
  CellRendererProps,
  EditableCellOptions,
  AtLeastOneProperty,
} from "./types";
import { shouldEditCell } from "./helpers";

import Styles from "./Cell.module.css";

interface SelecetCellProps<R extends RowData, N extends keyof R>
  extends EditableCellOptions<R, N> {
  placeholder?: string;
  options: Option[];
}

export default function createSelectCell<R extends RowData, N extends keyof R>({
  name,
  placeholder,
  options,
  disabled = false,
  canEdit,
}: SelecetCellProps<R, N>) {
  return function SelectCell({
    row,
    cell,
    isEditRowLoading,
    value,
  }: CellRendererProps<R, string | number>): string | JSX.Element | null {
    const selectedOption = useMemo(
      () => getOption(options, value),
      [options, cell.value]
    );

    if (!shouldEditCell(cell, canEdit)) {
      return selectedOption ? selectedOption.label : null;
    }

    return (
      <Select
        className={Styles.Container}
        isDisabled={disabled || isEditRowLoading}
        placeholder={placeholder}
        defaultValue={selectedOption}
        options={options}
        onChange={(selected) => {
          if (
            !selected ||
            isMultiOptions(selected) ||
            selected.value === value
          ) {
            return;
          }

          row.updateEdit({
            [name]: selected.value,
          } as unknown as AtLeastOneProperty<R>);
        }}
      />
    );
  };
}
