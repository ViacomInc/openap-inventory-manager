import classnames, { Argument } from "classnames";
import { TableInstance, Hooks, Row, MetaBase } from "react-table";

import { RowData } from "./types";

export type ClassNames = Argument[];

export interface UseRowClassTableOptions<R extends RowData> {
  rowClass?: (row: R) => ClassNames;
}

export default function useRowClass<R extends RowData>(hooks: Hooks<R>) {
  hooks.prepareRow.push(prepareRow);
}

useRowClass.pluginName = "useRowClass";

export type UseRowClassInstanceProps<R extends RowData> =
  UseRowClassTableOptions<R>;

export interface UseRowClassRowProps {
  classNames: (...args: ClassNames) => string;
}

function prepareRow<R extends RowData>(row: Row<R>, meta: MetaBase<R>): void {
  const rowExtended = row as unknown as Row<R> & UseRowClassRowProps;
  const { rowClass } = meta.instance as unknown as TableInstance<R> &
    UseRowClassInstanceProps<R>;

  rowExtended.classNames = (...args) => {
    const classNames = rowClass ? rowClass(rowExtended.original) : [];
    return classnames(...args, ...classNames);
  };
}
