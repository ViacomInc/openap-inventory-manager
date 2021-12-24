import React, { useState } from "react";
import classnames from "classnames";

import { withoutKey } from "../../../lib/helpers";

import { Icons } from "./";
import Button from "./Button";
import Select, { getOption, Option, isMultiOptions } from "./Select";
import Input, { InputType } from "./Input";

import Styles from "./MultiSelect.module.css";

interface MuliSelectProps {
  disabled?: boolean;
  placeholder?: string;
  value: { [key: string]: string | number };
  options: Option[];
  title?: string;
  addButtonTitle?: string;
  onChange: (value: { [key: string]: string | number }) => void;
}

export default function MuliSelect({
  disabled,
  value,
  options,
  title,
  onChange,
  addButtonTitle,
}: MuliSelectProps): JSX.Element {
  const [error, setError] = useState<string>("");
  const addValue = () => {
    const newValueKey = options.find((o) => value[o.value] === undefined);
    if (!newValueKey) {
      return;
    }

    onChange({
      ...value,
      [newValueKey.value]: 0,
    });
  };

  const updateKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) {
      setError("");
      return;
    }

    if (value[newKey] !== undefined) {
      setError(oldKey);
      return;
    }

    setError("");
    const oldValue = value[oldKey];
    onChange({
      ...withoutKey(value, oldKey),
      [newKey]: oldValue,
    });
  };

  const deleteKey = (key: string) => {
    if (key === error) {
      setError("");
    }
    onChange(withoutKey(value, key));
  };

  return (
    <table className={Styles.Container}>
      {title && (
        <thead className={Styles.Head}>
          <tr>
            <th colSpan={2}>{title}</th>
            <th></th>
          </tr>
        </thead>
      )}
      <tbody>
        {Object.entries(value).map(([key, val], i, all) => (
          <tr key={key}>
            <td>
              <Select
                isDisabled={disabled || (Boolean(error) && error !== key)}
                className={classnames(Styles.Select, {
                  [Styles.Error]: key === error,
                })}
                defaultValue={getOption(options, { value: key })}
                options={options}
                onChange={(selected) =>
                  selected &&
                  !isMultiOptions(selected) &&
                  updateKey(key, String(selected.value))
                }
              />
            </td>
            <td>
              <Input
                disabled={disabled || Boolean(error)}
                className={Styles.Value}
                type={InputType.Float}
                defaultValue={val}
                onChange={(newVal) =>
                  onChange({
                    ...value,
                    [key]: newVal,
                  })
                }
              />
            </td>
            <td>
              <Button
                borderless
                disabled={all.length <= 1}
                className={Styles.Delete}
                icon={Icons.Delete}
                onClick={() => deleteKey(key)}
              />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot className={Styles.Foot}>
        <tr>
          <td colSpan={2}>
            <Button
              secondary
              disabled={disabled || Boolean(error)}
              icon={Icons.Add}
              onClick={addValue}
            >
              {addButtonTitle}
            </Button>
          </td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  );
}
