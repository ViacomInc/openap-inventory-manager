import React from "react";
import classnames from "classnames";

import Styles from "./LoaderIcon.module.css";

export enum LoaderSize {
  S = "S",
  M = "M",
}

type Props = {
  size?: LoaderSize;
  className?: string;
  color?: string;
};

export default function Loader({
  className,
  size = LoaderSize.M,
  color = "#2E97FF",
}: Props): JSX.Element {
  return (
    <svg
      className={classnames(Styles.loaderIcon, Styles[size], className)}
      color={color}
    >
      <use xlinkHref="#icon-loader"></use>
    </svg>
  );
}
