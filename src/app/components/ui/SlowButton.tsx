import React from "react";

import Button, { ButtonProps } from "./Button";
import LoaderIcon, { LoaderSize } from "../Icons/Loader";

import Styles from "./SlowButton.module.css";

interface SlowButtonProps extends ButtonProps {
  title: string;
  isLoading: boolean;
}

export default function SlowButton({
  title,
  isLoading,
  icon,
  ...buttonProps
}: SlowButtonProps): JSX.Element {
  return (
    <Button {...buttonProps} icon={isLoading ? undefined : icon}>
      {title}
      {isLoading ? (
        <LoaderIcon
          color={buttonProps.destructive ? "#DB241A" : undefined}
          size={LoaderSize.S}
          className={Styles.Loader}
        />
      ) : null}
    </Button>
  );
}
