import React from "react";
import classnames from "classnames";

import { Button, Icons } from "../ui";

import { TableCell, RowData } from "./types";

import Styles from "./Cell.module.css";

const Wrapper: React.FC<{ center?: boolean }> = ({ center, children }) => {
  return (
    <div
      className={classnames(Styles.Actions, Styles.DuplicateRowActions, {
        [Styles.ActionsCenter]: center,
      })}
    >
      {children}
    </div>
  );
};

export default function DuplicateRowActionsCell<R extends RowData>({
  row,
  isDuplicateRowEnabled,
}: TableCell<R>) {
  if (!isDuplicateRowEnabled || row.isEditing) {
    return <Wrapper />;
  }

  return (
    <Wrapper>
      <Button
        className={Styles.Copy}
        icon={Icons.Copy}
        onClick={row.duplicateRow}
        title="Copy Item"
      />
    </Wrapper>
  );
}
