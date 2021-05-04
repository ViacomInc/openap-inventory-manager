import React from "react";

import { Icon, Icons } from "../ui";
import { InventoryTableCell } from "./types";

import Styles from "./InventoryTable.module.css";

interface BodyCellProps {
  isGrouped: boolean;
  isExpanded: boolean;
  isPlaceholder: boolean;
  isAggregated: boolean;
  cell: InventoryTableCell;
}

export default function BodyCell({
  isGrouped,
  isExpanded,
  isPlaceholder,
  isAggregated,
  cell,
}: BodyCellProps): JSX.Element | null {
  if (isGrouped) {
    return (
      <>
        <Icon
          className={Styles.ExpandIcon}
          icon={isExpanded ? Icons.Collapse : Icons.Expand}
        />
        {cell.render("Cell")}
      </>
    );
  }

  if (isPlaceholder) {
    // issue  https://github.com/tannerlinsley/react-table/issues/2829
    const hasPlaceholderRenderer = !!cell.column.Placeholder;
    return <>{hasPlaceholderRenderer ? cell.render("Placeholder") : null}</>;
  }

  if (isAggregated) {
    return <>{cell.render("Aggregated")}</>;
  }

  return <>{cell.render("Cell")}</>;
}
