import {
  Column,
  Row,
  Cell,
  TableOptions as ReactTableOptions,
  TableState as ReactTableState,
  TableInstance as ReactTableInstance,
  UseExpandedInstanceProps,
  UseExpandedOptions,
  UseExpandedRowProps,
  UseExpandedState,
  UseGroupByCellProps,
  UseGroupByColumnOptions,
  UseGroupByColumnProps,
  UseGroupByInstanceProps,
  UseGroupByOptions,
  UseGroupByRowProps,
  UseGroupByState,
  UsePaginationInstanceProps,
  UsePaginationOptions,
  UsePaginationState,
  UseSortByColumnOptions,
  UseSortByColumnProps,
  UseSortByInstanceProps,
  UseSortByOptions,
  UseSortByState,
} from "react-table";

import {
  UseEditRowTableState,
  UseEditRowTableOptions,
  UseEditRowInstanceProps,
  UseEditRowRowProps,
} from "./useEditRow";

import {
  UseDuplicateRowTableOptions,
  UseDuplicateRowInstanceProps,
  UseDuplicateRowRowProps,
} from "./useDuplicateRow";

export enum Alignment {
  Leading,
  Trailing,
}

export interface RowData {
  id: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CanEditCell<R extends RowData, V = any> =
  | boolean
  | ((value: undefined | R, cell: TableCell<R, V>) => boolean);

export interface EditableCellOptions<
  R extends RowData,
  N extends keyof R,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V = any
> {
  name: N;
  disabled?: boolean;
  canEdit?: CanEditCell<R, V>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface WithPlaceholderRenderer<R extends RowData, V = any> {
  Placeholder?: (props: CellRendererProps<R, V>) => React.ReactNode;
}

export type TableRow<R extends RowData> = Row<R> &
  UseGroupByRowProps<R> &
  UseExpandedRowProps<R> &
  UseEditRowRowProps<R> &
  UseDuplicateRowRowProps;

export type TableColumn<R extends RowData> = Column<R> &
  UseSortByColumnProps<R> &
  UseGroupByColumnProps<R> &
  WithPlaceholderRenderer<R> & {
    align?: Alignment;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    format?: (value: any) => string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate?: (value: any) => boolean;
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TableColumnProps<R extends RowData, V = any> = TableColumn<R> & {
  accessor: (row: R) => V;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TableCell<R extends RowData, V = any> = Cell<R, V> & {
  row: TableRow<R>;
  column: TableColumnProps<R, V>;
  value: V;
} & UseGroupByCellProps<R>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CellRendererProps<R extends RowData, V = any> = TableInstance<R> &
  Pick<TableCell<R, V>, "row" | "column" | "value"> & {
    cell: TableCell<R, V>;
  };

export type TableState<R extends RowData> = ReactTableState<R> &
  UseSortByState<R> &
  UseGroupByState<R> &
  UseExpandedState<R> &
  UsePaginationState<R> &
  UseEditRowTableState<R>;

export type TableOptions<R extends RowData> = ReactTableOptions<R> &
  UseSortByOptions<R> &
  UseGroupByOptions<R> &
  UseExpandedOptions<R> &
  UsePaginationOptions<R> &
  UseEditRowTableOptions<R> &
  UseDuplicateRowTableOptions<R> & {
    initialState: Partial<TableState<R>>;
  };

export type TableInstance<R extends RowData> = ReactTableInstance<R> &
  UseSortByInstanceProps<R> &
  UseGroupByInstanceProps<R> &
  UseExpandedInstanceProps<R> &
  UsePaginationInstanceProps<R> &
  UseDuplicateRowTableOptions<R> &
  UseDuplicateRowInstanceProps<R> &
  UseEditRowTableOptions<R> &
  UseEditRowInstanceProps<R> & {
    rows: TableRow<R>[];
    state: TableState<R>;
  };

export type TableColumnOptions<R extends RowData> =
  TableOptions<R>["columns"][number] &
    UseSortByColumnOptions<R> &
    UseGroupByColumnOptions<R> &
    WithPlaceholderRenderer<R>;

export type RowClickHandler = (
  e: React.MouseEvent<HTMLTableRowElement, MouseEvent>
) => void;

export type ToggleRowState = (id: string, state?: boolean) => void;
export type ToggleRowsState = (id: string[], state?: boolean) => void;

export type AtLeastOneProperty<
  T,
  U = { [K in keyof T]: Pick<T, K> }
> = Partial<T> & U[keyof U];
