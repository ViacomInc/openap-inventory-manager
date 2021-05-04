import React from "react";

import Button, { ButtonProps } from "./Button";
import LoaderIcon, { LoaderSize } from "../Icons/Loader";

import { useSelector, State } from "../../store";

import Styles from "./SlowButton.module.css";

interface SlowButtonProps extends ButtonProps {
  title: string;
  isLoadingSelector: (state: State) => boolean;
}

export default function SlowButton({
  title,
  isLoadingSelector,
  icon,
  ...buttonProps
}: SlowButtonProps): JSX.Element {
  const isLoading = useSelector(isLoadingSelector);

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
