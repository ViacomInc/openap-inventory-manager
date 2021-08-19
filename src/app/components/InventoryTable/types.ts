import {
  Cell,
  Column,
  HeaderGroup,
  Row,
  TableInstance,
  TableState,
  TableOptions,
  UsePaginationInstanceProps,
  UsePaginationOptions,
  UsePaginationState,
  UseRowSelectInstanceProps,
  UseRowSelectOptions,
  UseRowSelectRowProps,
  UseRowSelectState,
  UseSortByOptions,
  UseSortByInstanceProps,
  UseSortByColumnProps,
  UseSortByColumnOptions,
  UseSortByState,
  UseGroupByOptions,
  UseGroupByInstanceProps,
  UseGroupByColumnProps,
  UseGroupByRowProps,
  UseGroupByCellProps,
  UseGroupByState,
  UseGroupByColumnOptions,
  UseExpandedOptions,
  UseExpandedInstanceProps,
  UseExpandedRowProps,
  UseExpandedState,
} from "react-table";

import { InventoryItem } from "../../graphql";

export enum Alignment {
  Leading,
  Trailing,
}

export interface CellRenderer {
  cell: InventoryTableCell;
}

export type ColumnName = keyof InventoryItem;

export interface EditableCellOptions {
  name: ColumnName;
  disabled?: boolean;
  isEditable?: (item?: InventoryItem) => boolean;
}

interface WithPlaceholderRenderer {
  Placeholder?: (data: CellRenderer) => React.ReactNode;
}

export type InventoryTableSate = TableState<InventoryItem> &
  UseRowSelectState<InventoryItem> &
  UseSortByState<InventoryItem> &
  UseGroupByState<InventoryItem> &
  UseExpandedState<InventoryItem> &
  UsePaginationState<InventoryItem>;

export type InventoryTableOptions = TableOptions<InventoryItem> &
  UseSortByOptions<InventoryItem> &
  UseRowSelectOptions<InventoryItem> &
  UseGroupByOptions<InventoryItem> &
  UsePaginationOptions<InventoryItem> &
  UseExpandedOptions<InventoryItem> & {
    initialState: Partial<InventoryTableSate>;
  };

export type InventoryTableColumnOptions =
  InventoryTableOptions["columns"][number] &
    UseSortByColumnOptions<InventoryItem> &
    UseGroupByColumnOptions<InventoryItem> &
    WithPlaceholderRenderer & {
      format?: (v: string | number) => string;
    };

export type EmptyType = Record<string, unknown>;

export type InventoryTableInstance = TableInstance<InventoryItem> &
  UseRowSelectInstanceProps<InventoryItem> &
  UseSortByInstanceProps<InventoryItem> &
  UseGroupByInstanceProps<InventoryItem> &
  UseExpandedInstanceProps<InventoryItem> &
  UsePaginationInstanceProps<InventoryItem> & {
    rows: InventoryTableRow[];
    selectedFlatRows: InventoryTableRow[];
    state: InventoryTableSate;
  };

export type InventoryTableRow = Row<InventoryItem> &
  UseRowSelectRowProps<InventoryItem> &
  UseGroupByRowProps<InventoryItem> &
  UseExpandedRowProps<InventoryItem>;

export type InventoryTableColumn = Column<InventoryItem> &
  UseSortByColumnProps<InventoryItem> &
  UseGroupByColumnProps<InventoryItem> &
  WithPlaceholderRenderer & {
    align?: Alignment;
    format?: (v: string | number) => string;
    validate?: (v: string | number) => boolean;
  };

export type InventoryTableCell = Cell<InventoryItem> &
  UseGroupByCellProps<InventoryItem> & {
    row: InventoryTableRow;
    column: InventoryTableColumn;
    selectedFlatRows: Array<number>;
    original?: InventoryItem;
    values: { id: string };
    isPlaceholder: boolean;
    isAggregated: boolean;
    isGrouped: boolean;
    isExpanded: boolean;
  };

export type InventoryTableHeaderGroup = HeaderGroup<InventoryItem> &
  InventoryTableColumn;

export type RowClickHandler = (
  e: React.MouseEvent<HTMLTableRowElement, MouseEvent>
) => void;

export type ToggleRowState = (id: string, state?: boolean) => void;
export type ToggleRowsState = (id: string[], state?: boolean) => void;

export type Pagination = {
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
};
