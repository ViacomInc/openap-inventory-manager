import React from "react";
import Notifications from "./Notifications";

import { APP_ID } from "../config";
import Styles from "./App.module.css";

export interface AppProps {
  className?: string;
  children: React.ReactNode;
}

export default function App({ children, className }: AppProps): JSX.Element {
  return (
    <div id={APP_ID} className={className || Styles.App}>
      <Notifications />
      {children}
    </div>
  );
}
