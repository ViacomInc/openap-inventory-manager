import React, { useMemo } from "react";
import { Select, Option, isOption, getOption, isMultiOptions } from "../ui";
import {
  RowData,
  CellRendererProps,
  EditableCellOptions,
  AtLeastOneProperty,
} from "./types";
import { shouldEditCell } from "./helpers";

import Styles from "./Cell.module.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SelecetCellProps<R extends RowData, N extends keyof R, V = any>
  extends EditableCellOptions<R, N> {
  placeholder?: string;
  options: V[] | Option[];
  toOption?: (value?: V) => Option | undefined;
  toValue?: (option: Option) => V | undefined;
}

export default function createSelectCell<
  R extends RowData,
  N extends keyof R,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V = any
>({
  name,
  placeholder,
  options,
  toOption,
  toValue,
  disabled = false,
  canEdit,
}: SelecetCellProps<R, N, V>) {
  return function SelectCell({
    row,
    cell,
    isEditRowLoading,
    value,
  }: CellRendererProps<R, V>): string | JSX.Element | null {
    const selectOptions = useMemo(
      () => makeOptions(options, toOption),
      [options, toOption]
    );

    const selectValue = useMemo(
      () => getOption(selectOptions, makeOption(value, toOption)),
      [selectOptions, value]
    );

    if (!shouldEditCell(cell, canEdit)) {
      return selectValue ? selectValue.label : null;
    }

    return (
      <Select
        className={Styles.Container}
        isDisabled={disabled || isEditRowLoading}
        placeholder={placeholder}
        defaultValue={selectValue}
        options={selectOptions}
        onChange={(selected) => {
          if (
            !selected ||
            isMultiOptions(selected) ||
            selected.value === selectValue?.value
          ) {
            return;
          }

          row.updateEdit({
            [name]: toValue ? toValue(selected) : selected.value,
          } as unknown as AtLeastOneProperty<R>);
        }}
      />
    );
  };
}

function makeOption<V>(
  value?: V,
  toOption?: (value?: V) => Option | undefined
): Pick<Option, "value"> | undefined {
  switch (typeof value) {
    case "string":
    case "number":
      return { value };
  }

  if (toOption) {
    return toOption(value);
  }

  return {
    value: value as unknown as number,
  };
}

function makeOptions<V>(
  options: V[] | Option[],
  toOption?: (value?: V) => Option | undefined
): Option[] {
  if (toOption) {
    return (options as V[]).map(toOption).filter(isOption);
  }

  return options as Option[];
}
