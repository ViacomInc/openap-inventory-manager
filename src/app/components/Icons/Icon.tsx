import React from "react";
import classnames from "classnames";
import { Icons } from "./Icons";

import Styles from "./Icons.module.css";

interface IconProps {
  icon: Icons;
  className?: string;
}

export default function Icon({ icon, className }: IconProps): JSX.Element {
  return (
    <svg className={classnames(Styles.Icon, Styles[icon], className)}>
      <use xlinkHref={`#icon-${icon}`}></use>
    </svg>
  );
}
