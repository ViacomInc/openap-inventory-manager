import React from "react";
import { useRouter } from "next/router";

import { BoxLoader } from "./ui";

import { useSelector } from "../store";
import { selectUser } from "../store/user";

export interface AuthenticatedProps {
  login?: () => void;
  exclude?: string[];
}

const Authenticated: React.FC<AuthenticatedProps> = ({
  children,
  exclude,
  login,
}) => {
  const user = useSelector(selectUser);
  const router = useRouter();

  if (exclude && exclude.includes(router.route)) {
    return <>{children}</>;
  }

  if (!user || user.id === undefined) {
    return <BoxLoader />;
  }

  if (user.id === null) {
    login && login();
    // void router.push(redirectTo);
    return null;
  }

  return <>{children}</>;
};

export default Authenticated;
