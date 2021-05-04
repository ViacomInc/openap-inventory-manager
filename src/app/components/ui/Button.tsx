import React from "react";
import classnames from "classnames";

import { Icon, Icons } from "./";

import Styles from "./Button.module.css";

type AsyncMouseEventHandler = (
  event: React.MouseEvent<HTMLButtonElement>
) => Promise<void>;
type MouseEventHandler =
  | React.MouseEventHandler<HTMLButtonElement>
  | AsyncMouseEventHandler;

interface Props {
  className?: string;
  title?: string;
  name?: string;
  value?: string;
  icon?: Icons;
  disabled?: boolean;
  onClick?: MouseEventHandler;
  children?: React.ReactNode;
}

interface VisualStyles {
  primary?: boolean;
  secondary?: boolean;
  destructive?: boolean;
  borderless?: boolean;
  glyphed?: boolean;
}

export type ButtonProps = Props & VisualStyles;

export default function Button({
  className,
  name,
  title,
  value,
  icon,
  disabled,
  onClick,
  children,
  ...styles
}: ButtonProps): JSX.Element {
  // apply default styles
  if (!Object.keys(styles).length) {
    if (!children && icon) {
      styles.glyphed = true;
    } else {
      styles.primary = true;
    }
  }

  return (
    <button
      className={classnames(Styles.Button, className, getVisualClasses(styles))}
      title={title}
      name={name}
      value={value}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      {icon && <Icon icon={icon} />}
    </button>
  );
}

function getVisualClasses({
  primary,
  secondary,
  destructive,
  borderless,
  glyphed,
}: VisualStyles) {
  return {
    [Styles.Primary]: primary,
    [Styles.Secondary]: secondary,
    [Styles.Destructive]: destructive,
    [Styles.Borderless]: borderless,
    [Styles.Glyphed]: glyphed,
  };
}
