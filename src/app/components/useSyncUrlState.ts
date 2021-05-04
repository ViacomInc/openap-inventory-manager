import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";

import { match as getMatch, compile as getToPath } from "path-to-regexp";

import {
  State,
  useDispatch,
  useSelector,
  ActionCreatorWithPayload,
} from "../store";

import useDidMountEffect from "./ui/useDidMountEffect";

//eslint-disable-next-line
interface Parameter<V = any> {
  toValue?: (str: string) => V;
  toUrl?: (value: V) => string;
  action: ActionCreatorWithPayload<V>;
}

export interface UseSyncUrlState<S> {
  url: string;
  selector: (state: State) => S;
  queryString?: string;
  parameters: Record<keyof S, Parameter>;
}

export default function useSyncUrlState<S extends Record<string, unknown>>({
  url,
  selector,
  parameters,
  queryString,
}: UseSyncUrlState<S>): void {
  const skipStateUpdate = useRef(false);
  const skipLocationUpdate = useRef(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const state = useSelector(selector);

  const route = useMemo(
    () => ({
      match: getMatch<Record<keyof S, string>>(url, {
        decode: decodeURIComponent,
        end: !queryString,
      }),
      toPath: getToPath<Record<string, string>>(url, {
        encode: encodeURIComponent,
      }),
    }),
    [url]
  );

  useEffect(() => {
    function handleRouteChange(url: string) {
      if (skipStateUpdate.current) {
        return;
      }
      const [path, query] = url.split("?");
      const m = route.match(path);
      if (!(m && m.params)) {
        return;
      }

      skipLocationUpdate.current = true;
      const urlParams = m.params;
      Object.entries(parameters).forEach(([name, { toValue, action }]) => {
        if (urlParams[name] === undefined) {
          return;
        }

        //eslint-disable-next-line
        const value = toValue ? toValue(urlParams[name]) : urlParams[name];
        if (value === undefined) {
          return;
        }

        dispatch(action(value));
      });

      if (queryString) {
        const { toValue, action } = parameters[queryString];
        //eslint-disable-next-line
        const value = toValue ? toValue(query) : query;
        dispatch(action(value));
      }
      setTimeout(() => {
        skipLocationUpdate.current = false;
      }, 0);
    }

    handleRouteChange(router.asPath);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [route, parameters, queryString]);

  useDidMountEffect(() => {
    if (skipLocationUpdate.current) {
      return;
    }

    const urlParams = Object.entries(parameters).reduce(
      (p, [name, options]) => {
        if (state[name] === undefined) {
          return p;
        }

        p[name] = options.toUrl
          ? options.toUrl(state[name])
          : String(state[name]);
        return p;
      },
      {} as Record<string, string>
    );

    const queryParam = queryString ? parameters[queryString] : undefined;
    const query: string =
      queryString && state[queryString] !== undefined && queryParam
        ? queryParam.toUrl
          ? queryParam.toUrl(state[queryString])
          : encodeURIComponent(String(state[queryString]))
        : "";

    const url = route.toPath(urlParams) + (query ? `?${query}` : "");
    if (!url || url === router.asPath) {
      return;
    }
    skipStateUpdate.current = true;
    void router.push(url).then(() => {
      skipStateUpdate.current = false;
    });
  }, [route, state, parameters, queryString]);
}
