import React from "react";
import {
  RowData,
  TableCell,
  EditableCellOptions,
  AtLeastOneProperty,
} from "./types";
import { Input, InputType } from "../ui";

import Styles from "./Cell.module.css";

interface Options<R extends RowData, N extends keyof R>
  extends EditableCellOptions<R, N> {
  type: InputType;
}

export default function createInputCell<R extends RowData, N extends keyof R>({
  name,
  type,
  disabled = false,
  isEditable,
}: Options<R, N>) {
  return function InputCell(
    cell: TableCell<R, Pick<R, keyof R>>
  ): Pick<R, N> | JSX.Element | null {
    const { row, value, isEditRowLoading } = cell;

    if (row.isEditing) {
      console.log(">>", cell);
    }

    if (
      !row.isEditing ||
      row.canExpand ||
      (typeof isEditable === "function" && !isEditable(row.original)) ||
      (typeof isEditable === "boolean" && !isEditable)
    ) {
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
