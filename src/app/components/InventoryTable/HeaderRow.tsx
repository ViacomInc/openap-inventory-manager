import React from "react";
import classnames from "classnames";
import { HeaderGroup } from "react-table";

import { InventoryItem } from "../../graphql";
import { InventoryTableColumn } from "./types";

import SortButton from "./SortButton";

import { getAligmentClass } from "./";

import Styles from "./InventoryTable.module.css";

const DO_NOT_SHOW_HEADER = ["status", "actions"];
const DO_NOT_SORT_BY = ["total"].concat(DO_NOT_SHOW_HEADER);

interface HeaderRowProps {
  row: HeaderGroup<InventoryItem>;
}

export default function HeaderRow({ row }: HeaderRowProps): JSX.Element {
  return (
    <tr {...row.getHeaderGroupProps()}>
      {row.headers.map((column: HeaderGroup<InventoryItem>) => {
        // Work around to fix type issues with React Table and plugins
        const typedColumn = (column as unknown) as InventoryTableColumn;
        const noSortBy = DO_NOT_SORT_BY.includes(column.id);

        return (
          // disable plugin because key property is coming from getSortByToggleProps
          // eslint-disable-next-line react/jsx-key
          <th
            className={classnames(
              Styles.HeadCell,
              getAligmentClass(typedColumn.align)
            )}
            {...column.getHeaderProps(
              noSortBy ? undefined : typedColumn.getSortByToggleProps()
            )}
          >
            {DO_NOT_SHOW_HEADER.includes(column.id) ? null : noSortBy ? (
              column.render("Header")
            ) : (
              <SortButton
                align={typedColumn.align}
                isActive={typedColumn.isSorted}
                isDesc={typedColumn.isSortedDesc}
              >
                {column.render("Header")}
              </SortButton>
            )}
          </th>
        );
      })}
    </tr>
  );
}
