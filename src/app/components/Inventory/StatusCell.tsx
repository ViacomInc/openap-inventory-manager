import React from "react";
import { InventoryItem, InventoryItemStatus } from "../../graphql";
import { TableCell } from "../Table";

import { Icon, Icons } from "../ui";
import Styles from "./Cell.module.css";

export default function StatusCell({
  value,
}: TableCell<InventoryItem, InventoryItemStatus>): React.ReactNode {
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
}
