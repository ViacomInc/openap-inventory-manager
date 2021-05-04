import React, { useCallback, useRef, useEffect } from "react";
import debounceWrapper from "debounce";
import classnames from "classnames";

import Styles from "./Input.module.css";

export enum InputType {
  Int,
  Float,
  String,
}

const InputTypeStyle = {
  [InputType.Int]: Styles.InputInt,
  [InputType.Float]: Styles.InputFloat,
  [InputType.String]: Styles.InputString,
};

interface InputProps {
  type: InputType;
  defaultValue?: string | number;
  value?: string | number;
  disabled?: boolean;
  className?: string;
  onChange: (value: string | number) => void;
  debounce?: number;
}

export default function Input({
  type,
  disabled,
  defaultValue,
  value,
  className,
  onChange,
  debounce = 500,
}: InputProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!inputRef.current || value === undefined) {
      return;
    }

    inputRef.current.value = String(value);
  }, [value]);

  const debouncedParse = useCallback(
    debounceWrapper((inputValue: string) => {
      const newValue = parseInput(defaultValue, inputValue, type);
      if (newValue === null) {
        return;
      }

      onChange(newValue);
    }, debounce),
    [onChange]
  );
  useEffect(() => () => debouncedParse.flush(), [debouncedParse]);

  return (
    <input
      ref={inputRef}
      className={classnames(className, Styles.Input, InputTypeStyle[type])}
      disabled={disabled}
      defaultValue={
        defaultValue === undefined ? undefined : String(defaultValue)
      }
      onChange={({ target }) => debouncedParse(target.value)}
    />
  );
}

function parseInput(
  oldValue: undefined | string | number,
  inputValue: string,
  valueType: InputType
): null | string | number {
  let parsedValue;
  switch (valueType) {
    case InputType.Float:
      parsedValue = parseFloat(inputValue);
      if (isNaN(parsedValue)) {
        return null;
      }
      break;

    case InputType.Int:
      parsedValue = parseInt(inputValue, 10);
      if (isNaN(parsedValue)) {
        return null;
      }
      break;

    default:
      parsedValue = inputValue.trim();
      break;
  }

  if (oldValue === parsedValue) {
    return null;
  }

  return parsedValue;
}
