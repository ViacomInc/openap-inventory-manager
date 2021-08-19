import React from "react";
import classnames from "classnames";

import { InventoryItemStatus } from "../../graphql";

import {
  InventoryTableCell,
  InventoryTableRow,
  InventoryTableColumn,
  RowClickHandler,
} from "./types";

import { isExpired } from "../../../lib/InventoryItem/helpers";

import BodyCell from "./BodyCell";
import Styles from "./InventoryTable.module.css";

import { getAligmentClass } from "./";

const ItemStatusToCSSClassMap = {
  [InventoryItemStatus.Draft]: Styles.RowDraft,
  [InventoryItemStatus.New]: Styles.RowNew,
  [InventoryItemStatus.Updated]: Styles.RowUpdated,
  [InventoryItemStatus.Removed]: Styles.RowRemoved,
  [InventoryItemStatus.Deleted]: Styles.RowDeleted,
  [InventoryItemStatus.Committed]: Styles.RowCommitted,
};

interface BodyRowProps {
  row: InventoryTableRow;
  onClick: RowClickHandler;
}

export default function BodyRow({ row, onClick }: BodyRowProps): JSX.Element {
  // status will be undefined for the grouped rows.
  const { status, validUntil } = row.original;
  return (
    <tr
      id={row.id}
      onClick={onClick}
      className={classnames(Styles.Row, ItemStatusToCSSClassMap[status], {
        [Styles.RowEdit]: row.isSelected,
        [Styles.RowGrouped]: row.isGrouped,
        [Styles.RowExpanded]: row.isExpanded,
        [Styles.RowExpired]: isExpired({ validUntil }),
      })}
      {...row.getRowProps()}
    >
      {row.cells.map((cell) => {
        const typedCell = cell as unknown as InventoryTableCell;
        const typedColumn = cell.column as unknown as InventoryTableColumn;
        return (
          // disable plugin because key property is coming from getCellProps
          // eslint-disable-next-line react/jsx-key
          <td
            className={classnames(
              Styles.Cell,
              getAligmentClass(typedColumn.align),
              {
                [Styles.CellInvalid]:
                  typedColumn.validate &&
                  !typedColumn.validate(typedCell.value),
              }
            )}
            {...cell.getCellProps()}
          >
            <BodyCell
              isGrouped={typedCell.isGrouped}
              isExpanded={row.isExpanded}
              isPlaceholder={typedCell.isPlaceholder}
              isAggregated={typedCell.isAggregated}
              cell={typedCell}
            />
          </td>
        );
      })}
    </tr>
  );
}
