import React from "react";

import { Icon, Icons } from "../ui";
import { RowData, TableCell } from "./types";
import { EditRowValidationError } from "./useEditRow";

import Styles from "./Cell.module.css";

interface BodyCellProps<R extends RowData> {
  errors?: null | EditRowValidationError<R>[];
  cell: TableCell<R>;
}

export default function BodyCell<R extends RowData>({
  cell,
}: BodyCellProps<R>): JSX.Element | null {
  if (cell.isGrouped) {
    return (
      <>
        <Icon
          className={Styles.ExpandIcon}
          icon={cell.row.isExpanded ? Icons.Collapse : Icons.Expand}
        />
        {cell.render("Cell")}
      </>
    );
  }

  if (cell.isAggregated) {
    return <>{cell.render("Aggregated")}</>;
  }

  if (cell.isPlaceholder) {
    // issue  https://github.com/tannerlinsley/react-table/issues/2829
    const hasPlaceholderRenderer = !!cell.column.Placeholder;
    return <>{hasPlaceholderRenderer ? cell.render("Placeholder") : null}</>;
  }

  return <>{cell.render("Cell")}</>;
}
