import React from "react";
import classnames from "classnames";
import { HeaderGroup } from "react-table";

import { getAligmentClass } from "./helpers";
import { RowData, TableColumn } from "./types";

import Styles from "./Table.module.css";

interface HeaderRowProps<R extends RowData> {
  row: HeaderGroup<R>;
}

export default function HeaderRow<R extends RowData>({
  row,
}: HeaderRowProps<R>) {
  let grouppedColumnsNumber = 0;
  let grouppedColumnsId: string;
  return (
    <tr {...row.getHeaderGroupProps()}>
      {row.headers.map((column, i) => {
        // Work around to fix type issues with React Table and plugins
        const extendedColumn = column as unknown as TableColumn<R>;
        const hasChildren = Boolean(column.columns?.length);
        const parent = column.parent;
        let isLastChild = false;
        if (parent) {
          const siblingColumns = parent.columns?.length ?? 0;
          isLastChild = grouppedColumnsNumber === i + 1;
          if (grouppedColumnsId !== parent.id) {
            grouppedColumnsNumber += siblingColumns;
            grouppedColumnsId = parent.id;
          }
        }

        const IconsNumberClass =
          column.width === undefined ? null : Styles[`Width${column.width}`];

        return (
          // disable react/jsx-key because key property is coming from getSortByToggleProps
          // eslint-disable-next-line react/jsx-key
          <th
            className={classnames(
              Styles.HeadCell,
              IconsNumberClass,
              getAligmentClass(extendedColumn.align),
              {
                [Styles.HeadCellHasChildren]: hasChildren,
                [Styles.HeadCellRightDelimeter]: hasChildren || isLastChild,
              }
            )}
            {...column.getHeaderProps()}
          >
            {column.render("Header")}
          </th>
        );
      })}
    </tr>
  );
}
