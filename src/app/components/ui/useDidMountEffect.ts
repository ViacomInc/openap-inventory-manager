import { useEffect, useRef, EffectCallback, DependencyList } from "react";

export default function useDidMountEffect(
  callback: EffectCallback,
  dependencies?: DependencyList
): void {
  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) {
      callback();
    } else {
      didMount.current = true;
    }
  }, dependencies);
}
