import React from "react";

import LoaderIcon from "../Icons/Loader";
import Styles from "./BoxLoader.module.css";

interface BoxLoaderProps {
  fullscreen?: boolean;
}

export default function BoxLoader({
  fullscreen = false,
}: BoxLoaderProps): JSX.Element {
  return (
    <div className={fullscreen ? Styles.Fullscreen : Styles.Inline}>
      <LoaderIcon />
    </div>
  );
}
