import React from "react";

import { RowData, TableCell } from "./types";
import { EditRowValidationError } from "./useEditRow";

interface BodyCellProps<R extends RowData> {
  isPlaceholder: boolean;
  errors?: null | EditRowValidationError<R>[];
  cell: TableCell<R>;
}

export default function BodyCell<R extends RowData>({
  cell,
  isPlaceholder,
}: BodyCellProps<R>): JSX.Element | null {
  if (isPlaceholder) {
    // issue  https://github.com/tannerlinsley/react-table/issues/2829
    const hasPlaceholderRenderer = !!cell.column.Placeholder;
    return <>{hasPlaceholderRenderer ? cell.render("Placeholder") : null}</>;
  }

  return <>{cell.render("Cell")}</>;
}
