import React, { useMemo } from "react";
import {
  RowData,
  TableCell,
  EditableCellOptions,
  AtLeastOneProperty,
} from "./types";
import { Select, Option, getOption, isMultiOptions } from "../ui";

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
  isEditable,
}: SelecetCellProps<R, N>) {
  return function SelectCell({
    row,
    value,
    isEditRowLoading,
  }: TableCell<R>): string | JSX.Element | null {
    const selectedOption = useMemo(
      () => getOption(options, value),
      [options, value]
    );

    if (
      !row.isEditing ||
      row.canExpand ||
      (typeof isEditable === "function" && !isEditable(row.original)) ||
      (typeof isEditable === "boolean" && !isEditable)
    ) {
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
