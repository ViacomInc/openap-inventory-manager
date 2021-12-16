import { useCallback } from "react";
import {
  TableState,
  TableInstance,
  Hooks,
  ActionType,
  Row,
  MetaBase,
} from "react-table";

import { AtLeastOneProperty } from "./types";

import { RowData } from "./types";

import EditRowActionsCell from "./EditRowActionsCell";

export const DRAFT_ID = -1;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HanlderFunction<R extends RowData> = (row: R) => Promise<any>;

// we literally do not care about results
export interface UseEditRowTableOptions<R extends RowData> {
  isEditRowEnabled?: boolean;
  isEditRowLoading?: boolean;
  onEditRowConfirmed?: HanlderFunction<R>;
  onEditRowCanceled?: HanlderFunction<R>;
  onEditRowDeleted?: HanlderFunction<R>;
  canEditRow?: (data: R) => boolean;
  editRowValidate?: (data: R) => null | EditRowValidationError<R>[];
}

export default function useEditRow<R extends RowData>(hooks: Hooks<R>) {
  hooks.stateReducers.push(reducer);
  hooks.useInstance.push(useInstance);
  hooks.prepareRow.push(prepareRow);
  hooks.allColumns.push((columns) => [
    ...columns,
    {
      id: "editRowActions",
      width: 2,
      Cell: EditRowActionsCell,
    },
  ]);
}

useEditRow.pluginName = "useEditRow";

const EditRowAction = "editRow";
const ResetEditRowAction = "resetEditRowAction";
const UpdateTransactionAction = "updateEditRowTransaction";

export type EditRowValidationError<R extends RowData> = {
  column: keyof R;
  code?: string;
  message?: string;
};

type EditRowActionPayload<R extends RowData> = {
  editRowId: string;
  editRowTransaction: R;
};

type UpdateTransactionActionPayload<R extends RowData> = {
  update: AtLeastOneProperty<R>;
};

export interface UseEditRowTableState<R extends RowData> {
  editRowId?: string;
  editRowTransaction?: R;
  editRowValidationErrors?: null | EditRowValidationError<R>[];
}

function reducer<R extends RowData>(
  state: TableState<R> & UseEditRowTableState<R>,
  action: ActionType,
  _previousState?: TableState<R>,
  instance?: TableInstance<R>
): TableState<R> & UseEditRowTableState<R> {
  const extendedInstance = instance
    ? (instance as UseEditRowTableOptions<R>)
    : undefined;
  const validate = extendedInstance?.editRowValidate;

  switch (action.type) {
    case EditRowAction:
      return {
        ...state,
        ...(action as unknown as EditRowActionPayload<R>),
        editRowValidationErrors: null,
      };

    case ResetEditRowAction:
      return {
        ...state,
        editRowId: undefined,
        editRowTransaction: undefined,
        editRowValidationErrors: null,
      };

    case UpdateTransactionAction:
      // eslint-disable-next-line no-case-declarations
      const editRowTransaction = {
        ...state.editRowTransaction,
        ...(action as unknown as UpdateTransactionActionPayload<R>).update,
      };

      return {
        ...state,
        editRowTransaction,
        editRowValidationErrors: validate ? validate(editRowTransaction) : null,
      };
  }

  return state;
}

export interface UseEditRowInstanceProps<R extends RowData> {
  setEditRow: (rowId: string) => void;
  resetEditRow: () => void;
  updateEditRow: (update: AtLeastOneProperty<R>) => void;
}

function useInstance<R extends RowData>(instance: TableInstance<R>) {
  const { dispatch, rowsById } = instance;

  const setEditRow = useCallback(
    (rowId: string) => {
      const action: ActionType & EditRowActionPayload<R> = {
        type: EditRowAction,
        editRowId: rowId,
        editRowTransaction: rowsById[rowId].original,
      };
      dispatch(action);
    },
    [dispatch, rowsById]
  );

  const resetEditRow = useCallback(
    () => dispatch({ type: ResetEditRowAction }),
    [dispatch]
  );

  const updateEditRow = useCallback(
    (update: AtLeastOneProperty<R>) => {
      const action: ActionType & UpdateTransactionActionPayload<R> = {
        type: UpdateTransactionAction,
        update,
      };
      dispatch(action);
    },
    [dispatch, rowsById]
  );

  Object.assign(instance, {
    setEditRow,
    resetEditRow,
    updateEditRow,
  });
}

export interface UseEditRowRowProps<R extends RowData> {
  isEditing: boolean;
  editValidationErrors: null | EditRowValidationError<R>[];
  canEdit: () => boolean;
  edit: () => void;
  resetEdit: () => void;
  updateEdit: (update: AtLeastOneProperty<R>) => void;
}

function prepareRow<R extends RowData>(row: Row<R>, meta: MetaBase<R>): void {
  const rowExtended = row as unknown as Row<R> & UseEditRowRowProps<R>;
  const instanceExtended = meta.instance as unknown as TableInstance<R> &
    UseEditRowInstanceProps<R> & {
      state: UseEditRowTableState<R>;
      canEditRow?: (data: R) => boolean;
    };

  const canEditRow = instanceExtended.canEditRow;
  if (canEditRow) {
    rowExtended.canEdit = () => canEditRow(row.original);
  } else {
    rowExtended.canEdit = () => true;
  }

  rowExtended.edit = () => instanceExtended.setEditRow(row.id);
  rowExtended.resetEdit = () => instanceExtended.resetEditRow();
  rowExtended.updateEdit = (update: AtLeastOneProperty<R>) =>
    instanceExtended.updateEditRow(update);

  if (row.id === instanceExtended.state.editRowId) {
    rowExtended.editValidationErrors =
      instanceExtended.state.editRowValidationErrors ?? null;
    rowExtended.isEditing = true;
  } else {
    rowExtended.editValidationErrors = null;
    rowExtended.isEditing = false;
  }

  if (!rowExtended.isEditing && rowExtended.original?.id === DRAFT_ID) {
    instanceExtended.setEditRow(row.id);
  }
}