import React, { useState, useCallback, useRef, useEffect } from "react";
import classnames from "classnames";
import debounce from "debounce";

import useDidMountEffect from "./useDidMountEffect";

import { Error } from "../../store/types";

import Pop from "./Pop";
import Calendar, { CalendarView, CalendarWeeks } from "./InputDateTimeCalendar";
export { CalendarWeeks } from "./InputDateTimeCalendar";

import InputStyles from "./Input.module.css";
import Styles from "./InputDateTime.module.css";
import { DateTime } from "luxon";

type ValidateFunction = (value: DateTime) => boolean;
type FormateFunction = (value: DateTime) => string;
type ParseFunction = (value: string) => DateTime | null;

interface InputDateTimeProps {
  value?: DateTime | null;
  validate?: ValidateFunction;
  format: FormateFunction;
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
}

export default function InputDateTime(props: InputDateTimeProps): JSX.Element {
  const [value, setValue] = useState<DateTime>(
    !props.value ? DateTime.utc() : props.value
  );
  const [active, setActive] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(Boolean(props.error));

  useEffect(() => setError(Boolean(props.error)), [props.error]);
  useEffect(() => {
    if (!active) {
      !props.error && setError(false);
    }
  }, [active, props.error]);

  const debouncedParseAndSetValue = useCallback(
    debounce((inputValue: string) => {
      const date = props.parse(inputValue);
      if (date === null) {
        setError(true);
        return;
      }

      if (props.validate && !props.validate(date)) {
        setError(true);
        return;
      }

      !props.error && setError(false);
      setValue(date);
    }, 300),
    [props.validate]
  );

  const handleOnChange = useCallback(
    (value: DateTime, view: CalendarView) => {
      setValue(value);
      if (
        props.autoHide &&
        view === CalendarView.Day &&
        !props.error &&
        !error
      ) {
        setActive(false);
      }
    },
    [props.autoHide, props.error, error]
  );

  const inputRef = useRef<HTMLInputElement>(null);
  useDidMountEffect(() => {
    updateInputValueAndKeepCarretPosition(
      inputRef.current,
      props.format(value),
      active
    );
    props.onChange(value);
  }, [value.valueOf()]);

  return (
    <Pop
      active={[active, setActive]}
      className={classnames(Styles.Container, props.containerClassName, {
        [props.errorClassName || Styles.Error]: error,
      })}
      target={
        <input
          ref={inputRef}
          className={classnames(InputStyles.Input, props.inputClassName)}
          type="text"
          defaultValue={props.format(value)}
          onChange={(e) => debouncedParseAndSetValue(e.target.value)}
          disabled={props.disabled}
        />
      }
    >
      <Calendar
        value={value}
        onChange={handleOnChange}
        showWeeks={props.showWeeks}
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
