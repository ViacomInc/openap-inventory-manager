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
type HandlerFunction<R extends RowData> = (row: R) => Promise<any>;
type PermissionsHandler<R extends RowData> = (row: R) => boolean;

export interface UseEditRowTableOptions<R extends RowData> {
  isEditRowEnabled?: boolean;
  isEditRowLoading?: boolean;
  onEditRowConfirmed?: HandlerFunction<R>;
  onEditRowCanceled?: HandlerFunction<R>;
  onEditRowDeleted?: HandlerFunction<R>;
  onEditRowRestored?: HandlerFunction<R>;
  canEditRow?: boolean | PermissionsHandler<R>;
  canDeleteRow?: boolean | PermissionsHandler<R>;
  canRestoreRow?: boolean | PermissionsHandler<R>;
  editRowValidate?: (row: R) => null | EditRowValidationError<R>[];
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
  canEditRow: PermissionsHandler<R>;
  canDeleteRow: PermissionsHandler<R>;
  canRestoreRow: PermissionsHandler<R>;
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
  isEditLoading: boolean;
  isEditDraft: boolean;
  editValidationErrors: null | EditRowValidationError<R>[];
  canEdit: () => boolean;
  canRestore: () => boolean;
  canDelete: () => boolean;
  edit: () => void;
  resetEdit: () => void;
  updateEdit: (update: AtLeastOneProperty<R>) => void;
}

export function getPermissionsHandler<R extends RowData>(
  options: UseEditRowTableOptions<R>,
  name: "canEdit" | "canDelete" | "canRestore"
): PermissionsHandler<R> {
  const permission = options[`${name}Row`];
  switch (typeof permission) {
    case "boolean":
      return () => permission;

    case "function":
      return permission;

    default:
      return name === "canEdit" ? () => true : () => false;
  }
}

function prepareRow<R extends RowData>(row: Row<R>, meta: MetaBase<R>): void {
  const rowExtended = row as unknown as Row<R> & UseEditRowRowProps<R>;
  const instanceExtended = meta.instance as unknown as TableInstance<R> &
    UseEditRowInstanceProps<R> &
    UseEditRowTableOptions<R> & {
      state: UseEditRowTableState<R>;
    };

  rowExtended.isEditDraft = row.original?.id === DRAFT_ID;

  rowExtended.canEdit = () => instanceExtended.canEditRow(row.original);
  rowExtended.canDelete = () => instanceExtended.canDeleteRow(row.original);
  rowExtended.canRestore = () => instanceExtended.canRestoreRow(row.original);

  rowExtended.edit = () => instanceExtended.setEditRow(row.id);
  rowExtended.resetEdit = () => instanceExtended.resetEditRow();
  rowExtended.updateEdit = (update: AtLeastOneProperty<R>) =>
    instanceExtended.updateEditRow(update);

  if (row.id === instanceExtended.state.editRowId) {
    rowExtended.editValidationErrors =
      instanceExtended.state.editRowValidationErrors ?? null;
    rowExtended.isEditing = true;
    rowExtended.isEditLoading = Boolean(instanceExtended.isEditRowLoading);
  } else {
    rowExtended.editValidationErrors = null;
    rowExtended.isEditing = false;
    rowExtended.isEditLoading = false;
  }

  if (!rowExtended.isEditing && rowExtended.isEditDraft) {
    instanceExtended.setEditRow(row.id);
  }
}
