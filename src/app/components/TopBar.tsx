import React from "react";
import classnames from "classnames";

import { Icon, Icons, Button } from "./ui";
import { User } from "../store/types";
import OpenAPLogo from "./OpenAPLogo";

import Styles from "./TopBar.module.css";

export interface TopBarProps {
  auth?: {
    user?: User | null;
    logout?: () => void;
  };
  logo?: React.FC<{ className: string }>;
  title?: string;
  children?: React.ReactNode;
}

export default function TopBar({
  auth: { user, logout } = {},
  logo,
  title,
  children,
}: TopBarProps): JSX.Element {
  const Logo = logo || OpenAPLogo;

  return (
    <div className={Styles.Container}>
      <div className={Styles.Bar}>
        <div className={Styles.BarItem}>
          <Logo className={Styles.Logo} />
        </div>
        <div className={classnames(Styles.BarItem, Styles.BarItemStretch)}>
          <h1 className={Styles.Header}>
            {title || "Open AP Inventory Manager"}
          </h1>
        </div>
        {user?.id && children && (
          <div className={classnames(Styles.BarItem, Styles.BarItemLinks)}>
            {children}
          </div>
        )}
        {user?.id && (
          <div className={classnames(Styles.BarItem, Styles.BarItemAccount)}>
            <Icon className={Styles.AccountIcon} icon={Icons.Account} />{" "}
            <span className={Styles.User}>
              {user.firstName} {user.lastName}
            </span>
            <Button borderless onClick={logout}>
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
