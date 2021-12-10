import React from "react";
import classnames from "classnames";

import Styles from "./Icons.module.css";
import { Icons } from "./Icons";

interface IconProps {
  icon: Icons;
  className?: string;
  title?: string;
}

export default function Icon({
  icon,
  className,
  title,
}: IconProps): JSX.Element {
  return (
    <svg className={classnames(Styles.Icon, Styles[icon], className)}>
      {title && <title>{title}</title>}
      <use xlinkHref={`#icon-${icon}`}></use>
    </svg>
  );
}
