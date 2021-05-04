import { useRouter } from "next/router";

import { Error } from "../store/types";
import { LOGIN_PAGE } from "../config";

export default function useRedirectToLogin(errors?: Error[]): boolean {
  const router = useRouter();

  if (errors && errors.some((e) => e.code === 403)) {
    void router.push(`${LOGIN_PAGE}?msg=expired`);
    return true;
  }

  return false;
}
