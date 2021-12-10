import React, { useState, useCallback, useRef, useEffect } from "react";
import classnames from "classnames";
import debounce from "debounce";
import { DateTime } from "luxon";

import useDidMountEffect from "./useDidMountEffect";

import Pop from "./Pop";
import Calendar, {
  CalendarView,
  CalendarWeeks,
  CalendarSelect,
} from "./Calendar";

import InputStyles from "./Input.module.css";
import Styles from "./InputDateTime.module.css";

type ValidateFunction = (value: DateTime) => boolean;
type FormatFunction = (value: DateTime) => string;
type ParseFunction = (value: string, timezone?: string) => DateTime | null;

export interface InputDateTimeProps {
  value?: DateTime | null;
  validate?: ValidateFunction;
  format: FormatFunction;
  parse: ParseFunction;
  containerClassName?: string;
  inputClassName?: string;
  popClassName?: string;
  errorClassName?: string;
  disabled?: boolean;
  onChange: (date: DateTime) => void;
  error?: boolean | Error;
  autoHide?: boolean;
  showWeeks?: CalendarWeeks;
  select?: CalendarSelect;
  timezone?: string;
}

export default function InputDateTime({
  value,
  validate,
  format,
  parse,
  containerClassName,
  inputClassName,
  errorClassName,
  disabled,
  onChange,
  error,
  autoHide,
  showWeeks,
  select = CalendarSelect.Day,
  timezone,
}: InputDateTimeProps): JSX.Element {
  const [internalValue, setInternalValue] = useState<DateTime>(
    !value ? DateTime.utc() : value
  );
  const [active, setActive] = useState<boolean>(false);
  const [internalError, setInternalError] = useState<boolean>(Boolean(error));

  useEffect(() => setInternalError(Boolean(error)), [error]);
  useEffect(() => {
    if (!active) {
      !error && setInternalError(false);
    }
  }, [active, error]);

  const debouncedParseAndSetValue = useCallback(
    debounce((inputValue: string) => {
      const date = parse(inputValue, timezone);
      if (date === null) {
        setInternalError(true);
        return;
      }

      if (validate && !validate(date)) {
        setInternalError(true);
        return;
      }

      !error && setInternalError(false);
      setInternalValue(date);
    }, 300),
    [validate]
  );

  const handleOnChange = useCallback(
    (newValue: DateTime, view: CalendarView) => {
      setInternalValue(newValue);
      if (autoHide && view === CalendarView.Day && !error && !internalError) {
        setActive(false);
      }
    },
    [autoHide, error, internalError]
  );

  const inputRef = useRef<HTMLInputElement>(null);
  useDidMountEffect(() => {
    updateInputValueAndKeepCarretPosition(
      inputRef.current,
      format(internalValue),
      active
    );
    onChange(internalValue);
  }, [internalValue.valueOf()]);

  return (
    <Pop
      active={[active, setActive]}
      className={classnames(Styles.Container, containerClassName, {
        [errorClassName || Styles.Error]: internalError,
      })}
      target={
        <input
          ref={inputRef}
          className={classnames(InputStyles.Input, inputClassName)}
          type="text"
          defaultValue={format(internalValue)}
          onChange={(e) => debouncedParseAndSetValue(e.target.value)}
          disabled={disabled}
        />
      }
    >
      <Calendar
        value={internalValue}
        onChange={handleOnChange}
        showWeeks={showWeeks}
        select={select}
      />
    </Pop>
  );
}

function updateInputValueAndKeepCarretPosition(
  el: HTMLInputElement | null,
  value: string,
  keepCursor: boolean
): void {
  if (!el) {
    return;
  }

  const pos = el.selectionEnd || 0;
  el.value = value;
  keepCursor && el.setSelectionRange(pos, pos);
}
