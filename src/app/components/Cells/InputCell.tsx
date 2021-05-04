import React, { useCallback } from "react";
import { useDispatch } from "../../store";
import { actions } from "../../store/transaction";
import {
  InventoryTableCell,
  EditableCellOptions,
} from "../InventoryTable/types";
import useCellData from "../InventoryTable/useCellData";
import { Input, InputType } from "../ui";

import Styles from "./Cell.module.css";

interface Options extends EditableCellOptions {
  type: InputType;
}

export default function createInputCell({
  name,
  type,
  disabled = false,
  isEditable,
}: Options) {
  return function InputCell(
    cell: InventoryTableCell
  ): string | number | JSX.Element | null {
    const dispatch = useDispatch();
    const handleOnChange = useCallback(
      (newValue: string | number) =>
        dispatch(actions.update({ [name]: newValue })),
      [name]
    );
    const { value, isSelected, isUpdating } = useCellData<
      number | string | undefined
    >(cell, name);

    if (!isSelected || (isEditable && !isEditable(cell.row.original))) {
      return value === undefined ? null : value;
    }

    // don't try to edit null values
    if (value === null) {
      return null;
    }

    return (
      <Input
        className={Styles.Container}
        type={type}
        disabled={disabled || isUpdating}
        defaultValue={value}
        onChange={handleOnChange}
      />
    );
  };
}
