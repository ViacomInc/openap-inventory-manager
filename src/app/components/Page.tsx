import React from "react";
import classnames from "classnames";

import Loader from "./Icons/Loader";
import Styles from "./Page.module.css";

interface Props {
  centered?: boolean;
  loading?: boolean;
  withTabs?: boolean;
  withToolbar?: boolean;
  children?: React.ReactNode;
}

export default function Page({
  centered,
  loading,
  withTabs,
  withToolbar,
  children,
}: Props): JSX.Element {
  return (
    <div
      className={classnames(Styles.Content, {
        [Styles.Centered]: centered,
        [Styles.Loading]: loading,
        [Styles.WithTabs]: withTabs,
        [Styles.WithToolbar]: withToolbar,
      })}
    >
      {loading ? <Loader /> : children}
    </div>
  );
}
