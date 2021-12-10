import React from "react";
import classnames from "classnames";

import { RowData, TableCell, TableColumn, TableRow } from "./types";
import BodyCell from "./BodyCell";
import { getAligmentClass } from "./helpers";

import Styles from "./Table.module.css";

interface BodyRowProps<R extends RowData> {
  row: TableRow<R>;
  onClick: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
}

export default function BodyRow<R extends RowData>({
  row,
  onClick,
}: BodyRowProps<R>): JSX.Element {
  return (
    <tr
      id={row.id}
      onClick={onClick}
      className={classnames(Styles.Row, {
        [Styles.EditRow]: row.isEditing,
      })}
      {...row.getRowProps()}
    >
      {row.cells.map((cell) => {
        const cellExtended = cell as unknown as TableCell<R>;
        const columnExtended = cell.column as unknown as TableColumn<R>;
        if (row.isEditing) {
          console.log(row.editValidationErrors, cell.column.id);
        }
        const errors = !row.isEditing
          ? null
          : row.editValidationErrors === null
          ? null
          : row.editValidationErrors.filter(
              (error) => error.column === cell.column.id
            );

        return (
          // disable plugin because key property is coming from getCellProps
          // eslint-disable-next-line react/jsx-key
          <td
            className={classnames(
              Styles.Cell,
              getAligmentClass(columnExtended.align),
              {
                [Styles.CellInvalid]:
                  (errors && errors.length > 0) ||
                  (columnExtended.validate &&
                    !columnExtended.validate(cellExtended.value)),
              }
            )}
            {...cell.getCellProps()}
          >
            <BodyCell
              isPlaceholder={cellExtended.isPlaceholder}
              errors={errors}
              cell={cellExtended}
            />
          </td>
        );
      })}
    </tr>
  );
}
