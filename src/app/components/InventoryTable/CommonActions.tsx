import React from "react";

import { Icons, Button } from "../ui";

import { InventoryItem, InventoryItemStatus } from "../../graphql";

import Styles from "./InventoryTable.module.css";

interface CommonActionsProps {
  item: InventoryItem;
  onDelete: () => void;
  onUndo: () => void;
}

export default function CommonActions({
  item,
  onDelete,
  onUndo,
}: CommonActionsProps): JSX.Element | null {
  switch (item.status) {
    case InventoryItemStatus.Removed:
    case InventoryItemStatus.Deleted:
      return (
        <Button
          icon={Icons.Undo}
          className={Styles.Undo}
          onClick={onUndo}
          title="Restore Item"
        />
      );

    default:
      return (
        <Button
          className={Styles.Delete}
          icon={Icons.Delete}
          onClick={onDelete}
          title="Delete Item"
        />
      );
  }
}
