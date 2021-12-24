import { useMemo } from "react";
import { Error } from "../store/types";

function isError(error: Error | undefined): error is Error {
  return error !== undefined;
}

export default function useFlatternErrors(
  ...args: Array<undefined | Error[]>
): Error[] {
  return useMemo(() => args.flatMap((arg) => arg).filter(isError), [args]);
}
