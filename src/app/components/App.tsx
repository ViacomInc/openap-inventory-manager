import React from "react";
import { APP_ID, LOGIN_PAGE } from "../config";

import Authenticated, { AuthenticatedProps } from "./Authenticated";
import NavBar, { NavBarProps } from "./NavBar";
import Notifications from "./Notifications";

import Styles from "./App.module.css";

export interface AppProps extends AuthenticatedProps, NavBarProps {
  className?: string;
  children: React.ReactNode;
}

export default function App({
  logo,
  login,
  logout,
  children,
  className,
}: AppProps): JSX.Element {
  return (
    <div id={APP_ID} className={className || Styles.App}>
      <Authenticated login={login} exclude={[LOGIN_PAGE]}>
        <NavBar logo={logo} logout={logout} />
        <Notifications />
        {children}
      </Authenticated>
    </div>
  );
}
