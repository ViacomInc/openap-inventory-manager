import React from "react";
import { CellProps } from "react-table";
import { InventoryItem, InventoryItemStatus } from "../../graphql";

import { Icon, Icons } from "../ui";
import Styles from "./Cell.module.css";

const StatusCell = ({
  value,
}: CellProps<InventoryItem, InventoryItemStatus>): React.ReactNode => {
  switch (value) {
    case InventoryItemStatus.New:
      return <Icon icon={Icons.New} className={Styles.New} />;

    case InventoryItemStatus.Updated:
      return <Icon icon={Icons.Updated} className={Styles.Updated} />;

    case InventoryItemStatus.Removed:
      return <Icon icon={Icons.Removed} className={Styles.Removed} />;

    default:
      return "";
  }
};

export default StatusCell;
