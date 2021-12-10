import React from "react";
import classnames from "classnames";

import Icon, { Icons } from "../Icons";
import { Alignment } from "./types";

import Styles from "./Cell.module.css";

interface SortButtonProps {
  isActive: boolean;
  isDesc?: boolean;
  align?: Alignment;
  children?: React.ReactNode;
}

export default function SortButton({
  isActive,
  isDesc,
  children,
}: SortButtonProps) {
  return (
    <button className={classnames(Styles.Sort)}>
      {children}
      <Icon
        className={classnames(Styles.SortIcon, {
          [Styles.SortNotActive]: !isActive,
        })}
        icon={isActive ? (isDesc ? Icons.SortDown : Icons.SortUp) : Icons.Sort}
      />
    </button>
  );
}
