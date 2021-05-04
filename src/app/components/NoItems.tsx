import React from "react";

import Styles from "./InventoryView.module.css";

export default function NoItems(): JSX.Element {
  return (
    <div className={Styles.NoItems}>
      <p className={Styles.NoItemsMessage}>There are no inventory items</p>
    </div>
  );
}
