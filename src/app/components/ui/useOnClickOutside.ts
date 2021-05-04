import { useEffect } from "react";

export default function useOnClickOutside(
  ref: React.MutableRefObject<Element | null>,
  handler: (event: Event) => void
): void {
  useEffect(() => {
    const listener = (event: Event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (ref?.current?.contains(event.target)) {
        return;
      }

      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    document.addEventListener("focusin", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
      document.removeEventListener("focusin", listener);
    };
  }, [handler]);
}
