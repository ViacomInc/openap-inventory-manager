import React, { useState, useRef, useEffect, isValidElement } from "react";
import classnames from "classnames";

import useOnClickOutside from "./useOnClickOutside";
import Styles from "./Pop.module.css";

type Position = {
  top: number;
  left: number;
};

export enum Orientation {
  NE,
  N,
  NW,
}

const OrientationClass = {
  [Orientation.NE]: Styles.NE,
  [Orientation.N]: Styles.N,
  [Orientation.NW]: Styles.NW,
};

function getPosition(el: HTMLElement, orientation: Orientation): Position {
  const pos = el.getBoundingClientRect();

  switch (orientation) {
    case Orientation.NE:
      return {
        top: 0 + 4,
        left: 0,
      };

    case Orientation.N:
      return {
        top: 0 + 4,
        left: pos.width / 2,
      };

    case Orientation.NW:
      return {
        top: 0 + 4,
        left: pos.width,
      };
  }

  return {
    top: 0 + 4,
    left: 0,
  };
}

interface PopProps {
  active: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  className?: string;
  target: JSX.Element;
  children: React.ReactNode;
  popOnFocus?: boolean;
  orientation?: Orientation;
}

export default function Pop({
  className,
  active: [active, setActive],
  target,
  children,
  popOnFocus = true,
  orientation = Orientation.N,
}: PopProps): JSX.Element {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  const elRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(elRef, () => setActive(false));
  useEffect(() => {
    const el = elRef.current;
    if (!el) {
      return;
    }

    setPosition(getPosition(el, orientation));
  }, [elRef.current]);

  const handleFocus = popOnFocus ? () => setActive(true) : undefined;

  return (
    <div ref={elRef} onClick={handleFocus} className={className}>
      <Target original={target} onFocus={handleFocus} />
      <div
        className={classnames(Styles.Pop, OrientationClass[orientation], {
          [Styles.Active]: active,
        })}
        style={{
          marginTop: `${position.top}px`,
          marginLeft: `${position.left}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface TargetProps {
  original: JSX.Element;
  onFocus?: () => void;
}

function Target({ original, onFocus }: TargetProps): JSX.Element {
  if (!onFocus || !(isValidElement(original) && original.type === "input")) {
    return original;
  }

  const originalProps = original.props as { onFocus?: React.FocusEventHandler };
  const originalOnFocus = originalProps.onFocus
    ? originalProps.onFocus
    : undefined;

  return React.cloneElement(
    original as React.ReactElement<{ onFocus: React.FocusEventHandler }>,
    {
      onFocus: (e: React.FocusEvent) => {
        onFocus();
        originalOnFocus && originalOnFocus(e);
      },
    }
  );
}
