import React from "react";
import classnames from "classnames";
import { equals } from "ramda";

import { Button, Icons } from "../ui";
import LoaderIcon, { LoaderSize } from "../Icons/Loader";

import { CellRendererProps, RowData } from "./types";

import Styles from "./Cell.module.css";

const Wrapper: React.FC<{ center?: boolean }> = ({ center, children }) => {
  return (
    <div
      className={classnames(Styles.Actions, Styles.EditRowActions, {
        [Styles.ActionsCenter]: center,
      })}
    >
      {children}
    </div>
  );
};

export default function EditRowActionsCell<R extends RowData>({
  row,
  state: { editRowTransaction, editRowValidationErrors },
  isEditRowEnabled,
  onEditRowConfirmed,
  onEditRowCanceled,
  onEditRowDeleted,
  onEditRowRestored,
}: CellRendererProps<R>) {
  if (!isEditRowEnabled || !row.original) {
    return <Wrapper />;
  }

  if (row.isEditLoading) {
    return (
      <Wrapper center>
        <LoaderIcon size={LoaderSize.S} />
      </Wrapper>
    );
  }

  if (!row.isEditing || !editRowTransaction) {
    if (row.canRestore()) {
      return (
        <Wrapper>
          <Button
            className={Styles.Restore}
            icon={Icons.Undo}
            onClick={() => {
              onEditRowRestored && onEditRowRestored(row.original);
            }}
            title="Restore Row"
          />
        </Wrapper>
      );
    }

    if (row.canDelete()) {
      return (
        <Wrapper>
          <Button
            className={Styles.Delete}
            icon={Icons.Delete}
            onClick={() => {
              onEditRowDeleted && onEditRowDeleted(row.original);
            }}
            title="Delete Row"
          />
        </Wrapper>
      );
    }

    return null;
  }

  return (
    <Wrapper>
      <Button
        className={Styles.Confirm}
        icon={Icons.Done}
        title={row.isEditDraft ? "Create Row" : "Update Row"}
        disabled={Boolean(editRowValidationErrors?.length)}
        onClick={() => {
          if (!row.isEditDraft && equals(row.original, editRowTransaction)) {
            row.resetEdit();
            return;
          }

          if (onEditRowConfirmed) {
            void onEditRowConfirmed(editRowTransaction).then(row.resetEdit);
          } else {
            row.resetEdit();
          }
        }}
      />
      <Button
        className={Styles.Cancel}
        icon={Icons.Cancel}
        title="Cancel"
        onClick={() => {
          row.isEditDraft &&
            onEditRowCanceled &&
            onEditRowCanceled(editRowTransaction);
          row.resetEdit();
        }}
      />
    </Wrapper>
  );
}
