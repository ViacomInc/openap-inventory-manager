import React from "react";
import classnames from "classnames";

import Styles from "./Page.module.css";

interface Props {
  centered?: boolean;
  withTabs?: boolean;
  withToolbar?: boolean;
  children: React.ReactNode;
}

export default function Page({
  centered,
  withTabs,
  withToolbar,
  children,
}: Props): JSX.Element {
  return (
    <div
      className={classnames(Styles.Content, {
        [Styles.Centered]: centered,
        [Styles.WithTabs]: withTabs,
        [Styles.WithToolbar]: withToolbar,
      })}
    >
      {children}
    </div>
  );
}
