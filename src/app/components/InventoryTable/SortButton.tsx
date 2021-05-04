import React from "react";
import classnames from "classnames";

import { Icon, Icons } from "../ui";
import { Alignment } from "./types";
import { getAligmentClass } from "./";

import Styles from "./InventoryTable.module.css";

interface SortButtonProps {
  isActive: boolean;
  isDesc?: boolean;
  align?: Alignment;
}

const SortButton: React.SFC<SortButtonProps> = ({
  isActive,
  isDesc,
  align,
  children,
}) => (
  <button className={classnames(Styles.Sort, getAligmentClass(align))}>
    {children}
    <Icon
      className={classnames(Styles.SortIcon, {
        [Styles.SortNotActive]: !isActive,
      })}
      icon={isActive ? (isDesc ? Icons.SortDown : Icons.SortUp) : Icons.Sort}
    />
  </button>
);

export default SortButton;
