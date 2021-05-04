import React from "react";

import { InventoryItemStatus } from "../graphql";

import { Icon, Icons } from "./ui";
import { Status } from "./useInventoryStatus";

import Styles from "./InventoryView.module.css";

interface InventoryStatusPanelProps extends Status {
  onClick: (status: string) => void;
}

export default function InventoryStatusPanel({
  inserted,
  updated,
  conflicted,
  removed,
  onClick,
}: InventoryStatusPanelProps): JSX.Element {
  return (
    <div className={Styles.StatusPanel}>
      {inserted > 0 && (
        <button
          className={Styles.StatusNew}
          onClick={() => onClick(InventoryItemStatus.New)}
        >
          <Icon icon={Icons.New} />
          {inserted} new
        </button>
      )}
      {updated > 0 && (
        <button
          className={Styles.StatusUpdated}
          onClick={() => onClick(InventoryItemStatus.Updated)}
        >
          <Icon icon={Icons.Updated} />
          {updated} updates
        </button>
      )}
      {conflicted > 0 && (
        <button
          className={Styles.StatusConflict}
          onClick={() => onClick("Conflict")}
        >
          <Icon icon={Icons.Conflicted} />
          {conflicted} conflicts
        </button>
      )}
      {removed > 0 && (
        <button
          className={Styles.StatusRemoved}
          onClick={() => onClick(InventoryItemStatus.Removed)}
        >
          <Icon icon={Icons.Removed} /> {removed} removals
        </button>
      )}
    </div>
  );
}
