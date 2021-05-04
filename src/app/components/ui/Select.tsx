import React from "react";
import ReactSelect, {
  NamedProps,
  OptionTypeBase,
  GroupTypeBase,
  OptionsType,
  components,
} from "react-select";

export interface Option extends OptionTypeBase {
  label: string;
  value: string | number;
  type?: string;
}
export type GroupedOption = GroupTypeBase<Option>;

// with piece of shit styling
export default function Select(
  props: NamedProps<Option, boolean, GroupedOption>
): JSX.Element {
  return (
    <ReactSelect
      {...props}
      styles={{
        control: (styles) => ({
          ...styles,
          border: "1px solid #e3e7e8",
          "&:hover": { borderColor: "#e3e7e8" },
          borderRadius: "4px",
          background: "#fff",
          outline: "none",
          padding: "0.5em 1em 0.4em",
          boxShadow: "none",
          minHeight: "auto",
        }),
        container: (styles, state) => ({
          ...styles,
          opacity: state.isDisabled ? 0.5 : 1,
        }),
        input: (styles) => ({
          ...styles,
          margin: 0,
          padding: "0 0 0 0.5em",
          fontSize: "inherit",
          color: "#151c1e",
        }),
        placeholder: (styles) => ({
          ...styles,
          marginTop: "0.05em",
          paddingLeft: "0.5em",
        }),
        multiValue: (styles) => ({
          ...styles,
          backgroundColor: "transparent",
          color: "#006AD2",
          borderRadius: "3px",
          border: "#006AD2 solid 1px;",
        }),
        multiValueLabel: (styles) => ({
          ...styles,
          color: "inherit",
          fontSize: "100%",
          borderRadius: "0",
          padding: "0.2em 0.1em 0.1em 0.5em",
        }),
        multiValueRemove: (styles) => ({
          ...styles,
          backgroundColor: "transparent !important",
        }),
        valueContainer: (styles) => ({
          ...styles,
          padding: 0,
        }),
        indicatorsContainer: (styles) => ({
          ...styles,
          marginRight: "-0.5em",
        }),
        indicatorSeparator: (styles, { selectProps }) => ({
          ...styles,
          marginTop: "1em",
          marginBottom: "1em",
          display: selectProps.isClearable ? "block" : "none",
        }),
        clearIndicator: (styles) => ({
          ...styles,
          padding: "0 0 0 0.5em",
          transform: "scale(0.75)",
        }),
        dropdownIndicator: (styles) => ({
          ...styles,
          padding: "0 0.25em",
        }),
        menu: (styles) => ({
          ...styles,
          borderRadius: "4px",
        }),
        option: (styles, state) => ({
          ...styles,
          backgroundColor: state.isSelected
            ? "#006AD2"
            : state.isFocused
            ? "#EEEEEE"
            : "transparent",
          "&:active": { backgroundColor: "transparent" },
        }),
      }}
      components={{
        DropdownIndicator: (props) => (
          <components.DropdownIndicator {...props}>
            <>▾</>
          </components.DropdownIndicator>
        ),
      }}
    />
  );
}

export function toOption(item: { id: number | string; name: string }): Option {
  return {
    value: item.id,
    label: item.name,
  };
}

export function isMultiOptions<O extends Option>(
  values: O | OptionsType<O> | null
): values is OptionsType<O> {
  if (!values || !Array.isArray(values)) {
    return false;
  }

  return true;
}

export function getOption(
  options: Option[],
  value: number | string
): Option | undefined {
  return options.find((o) => o.value === value);
}
