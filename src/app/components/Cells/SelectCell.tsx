import React from "react";
import { useDispatch } from "../../store";
import { actions } from "../../store/transaction";
import {
  InventoryTableCell,
  EditableCellOptions,
} from "../InventoryTable/types";
import useCellData from "../InventoryTable/useCellData";
import { Select, Option, getOption, isMultiOptions } from "../ui";

import Styles from "./Cell.module.css";

interface Options extends EditableCellOptions {
  placeholder?: string;
  options: Option[];
}

export default function createSelectCell({
  name,
  placeholder,
  options,
  disabled = false,
  isEditable,
}: Options) {
  return function SelectCell(
    cell: InventoryTableCell
  ): string | JSX.Element | null {
    const dispatch = useDispatch();
    const { isSelected, value, isUpdating } = useCellData<number>(cell, name);
    const selectedOption = getOption(options, value);

    if (!isSelected || (isEditable && !isEditable(cell.row.original))) {
      return selectedOption ? selectedOption.label : null;
    }

    return (
      <Select
        className={Styles.Container}
        isDisabled={disabled || isUpdating}
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

          dispatch(actions.update({ [name]: selected.value }));
        }}
      />
    );
  };
}
