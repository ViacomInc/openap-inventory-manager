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

type ToOptionFn<V = any> = (value?: V) => Option | undefined;
type FilterOptionFn<R, V = any> = (option: V | undefined, row: R) => boolean;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SelecetCellProps<R extends RowData, N extends keyof R, V = any>
  extends EditableCellOptions<R, N> {
  placeholder?: string;
  options: V[] | Option[];
  toOption?: ToOptionFn<V>;
  toValue?: (option: Option) => V | undefined;
  filterOption?: FilterOptionFn<R, V>;
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
  filterOption,
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
      () => makeOptions(options, toOption, filterOption, row.original),
      [options, toOption, filterOption, row.original]
    );

    const selectedValue = useMemo(
      () => getOption(selectOptions, makeOption(value, toOption)),
      [selectOptions, value]
    );

    if (!shouldEditCell(cell, canEdit)) {
      return selectedValue ? selectedValue.label : null;
    }

    return (
      <Select
        className={Styles.Container}
        isDisabled={disabled || isEditRowLoading}
        placeholder={placeholder}
        defaultValue={selectedValue}
        options={selectOptions}
        onChange={(selected) => {
          if (
            !selected ||
            isMultiOptions(selected) ||
            selected.value === selectedValue?.value
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
  toOption?: ToOptionFn<V>
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

function makeOptions<R, V>(
  options: V[] | Option[],
  toOption: ToOptionFn<V> | undefined,
  filterOption: FilterOptionFn<R, V> = () => true,
  row: R
): Option[] {
  if (toOption) {
    // we assume that this is values
    return (options as V[])
      .filter((v) => filterOption(v, row))
      .map(toOption)
      .filter(isOption);
  }

  return options as Option[];
}
