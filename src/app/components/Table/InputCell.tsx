import React from "react";
import { Input, InputType } from "../ui";
import {
  RowData,
  CellRendererProps,
  EditableCellOptions,
  AtLeastOneProperty,
} from "./types";
import { shouldEditCell } from "./helpers";

import Styles from "./Cell.module.css";

interface Options<R extends RowData, N extends keyof R>
  extends EditableCellOptions<R, N> {
  type: InputType;
}

export default function createInputCell<R extends RowData, N extends keyof R>({
  name,
  type,
  disabled = false,
  canEdit,
}: Options<R, N>) {
  return function InputCell({
    row,
    cell,
    isEditRowLoading,
  }: CellRendererProps<R, R[N]>): R[N] | JSX.Element | null {
    const value = cell.value;
    if (!shouldEditCell(cell, canEdit)) {
      return value === undefined ? null : value;
    }

    return (
      <Input
        className={Styles.Container}
        type={type}
        disabled={disabled || isEditRowLoading}
        defaultValue={
          value === undefined || value === null ? "" : String(value)
        }
        onChange={(newValue) =>
          row.updateEdit({
            [name]: newValue,
          } as unknown as AtLeastOneProperty<R>)
        }
      />
    );
  };
}
