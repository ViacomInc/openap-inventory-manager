import { useRouter } from "next/router";

import { Error } from "../store/types";
import { LOGIN_PAGE, FORBIDDEN_PAGE } from "../config";

export default function useRedirectToLogin(errors?: Error[]): boolean {
  const router = useRouter();

  if (!errors) {
    return false;
  }

  if (errors.some((e) => e.code === 401)) {
    void router.push(LOGIN_PAGE);
    return true;
  }

  if (errors.some((e) => e.code === 403)) {
    void router.push(FORBIDDEN_PAGE);
    return true;
  }

  return false;
}
