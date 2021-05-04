import React from "react";
import classnames from "classnames";

import { Icon, Icons, Button } from "./ui";
import { useSelector } from "../store";
import { selectUser } from "../store/user";

import OpenAPLogo from "./OpenAPLogo";

import Styles from "./NavBar.module.css";

export interface NavBarProps {
  logout?: () => void;
  logo?: React.FC<{ className: string }>;
}

export default function NavBar({ logout, logo }: NavBarProps): JSX.Element {
  const Logo = logo || OpenAPLogo;
  const user = useSelector(selectUser);

  return (
    <div className={Styles.Container}>
      <div className={Styles.Bar}>
        <div className={Styles.BarItem}>
          <Logo className={Styles.Logo} />
        </div>
        <div className={classnames(Styles.BarItem, Styles.BarItemStretch)}>
          <h1 className={Styles.Header}>Open AP Marketplace Inventory</h1>
        </div>
        {user && user.id && (
          <div className={classnames(Styles.BarItem, Styles.Account)}>
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
